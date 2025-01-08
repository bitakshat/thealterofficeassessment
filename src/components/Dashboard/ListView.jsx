import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase-config";
import { collection, onSnapshot } from "firebase/firestore";

const ListView = () => {
    const [tasks, setTasks] = useState({
        todo: [],
        inProgress: [],
        completed: []
    });

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            const taskRef = collection(db, "users", user.uid, "tasks");

            // Set up a real-time listener for task data
            const unsubscribe = onSnapshot(taskRef, (snapshot) => {
                const tasksData = {
                    todo: [],
                    inProgress: [],
                    completed: []
                };

                snapshot.forEach((doc) => {
                    const task = doc.data();
                    const taskStatus = task.taskStatus;

                    // Organize tasks into categories based on their status
                    if (taskStatus === "ToDo") {
                        tasksData.todo.push({ id: doc.id, ...task });
                    } else if (taskStatus === "In Progress") {
                        tasksData.inProgress.push({ id: doc.id, ...task });
                    } else if (taskStatus === "Completed") {
                        tasksData.completed.push({ id: doc.id, ...task });
                    }
                });

                setTasks(tasksData);
            });

            // Cleanup listener on component unmount
            return () => unsubscribe();
        }
    }, [user]);

    return (
        <div className="w-full rounded-[12px] mt-[10px] overflow-y-auto max-h-[calc(100vh-300px)]">
            {/* Todo Section */}
            <Section
                title="Todo"
                count={tasks.todo.length}
                tasks={tasks.todo}
                bgColor="#FAC3FF"
            />

            {/* In-Progress Section */}
            <Section
                title="In-Progress"
                count={tasks.inProgress.length}
                tasks={tasks.inProgress}
                bgColor="#85D9F1"
            />

            {/* Completed Section */}
            <Section
                title="Completed"
                count={tasks.completed.length}
                tasks={tasks.completed}
                bgColor="#CEFFCC"
            />
        </div>
    );
};

const Section = ({ title, count, tasks, bgColor }) => {
    return (
        <div className="relative w-full h-[250px] bg-[#F1F1F1] rounded-[12px] mt-[20px]">
            <div
                className={`py-[5px] px-[15px] rounded-tr-[12px] rounded-tl-[12px] flex justify-between items-center`}
                style={{ backgroundColor: bgColor }}
            >
                <span className="text-gray-600">{title} ({count})</span>
                <span>^</span>
            </div>

            <div className="w-full h-full p-[15px]">
                {tasks.length === 0 ? (
                    <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-gray-500 text-[12px]">
                        No Tasks in {title}
                    </span>
                ) : (
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id} className="text-gray-700 text-[14px]">
                                {task.taskTitle} {/* Display task title */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ListView;
