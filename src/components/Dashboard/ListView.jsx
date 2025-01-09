import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase-config";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend"; // Import the backend
import dragicon from '../../assets/images/drag_icon.svg'
import checkicon from '../../assets/images/checkmark.svg'

const ListView = () => {
    const [tasks, setTasks] = useState({
        'todo': [],
        'in-progress': [],
        'completed': []
    });

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            const taskRef = collection(db, "users", user.uid, "tasks");

            const unsubscribe = onSnapshot(taskRef, (snapshot) => {
                const tasksData = {
                    'todo': [],
                    'in-progress': [],
                    'completed': []
                };

                snapshot.forEach((doc) => {
                    const task = doc.data();
                    const taskStatus = task.taskStatus;

                    // Add the userId to the task data
                    const taskWithUserId = { id: doc.id, userId: user.uid, ...task }; // Ensure userId is included

                    if (taskStatus === "ToDo") {
                        tasksData['todo'].push(taskWithUserId);
                    } else if (taskStatus === "In Progress") {
                        tasksData['in-progress'].push(taskWithUserId);
                    } else if (taskStatus === "Completed") {
                        tasksData['completed'].push(taskWithUserId);
                    }
                });

                setTasks(tasksData);
            });

            return () => unsubscribe();
        }
    }, [user]);


    const moveTask = (draggedTaskId, sourceSection, destinationSection) => {
        // Get the source and destination task arrays
        const sourceTasks = tasks[sourceSection];
        const destinationTasks = tasks[destinationSection];

        // Find the task in the source section
        const taskIndex = sourceTasks.findIndex((task) => task.id === draggedTaskId);
        if (taskIndex === -1) return; // If task not found, exit

        // Remove the task from the source section
        const [removedTask] = sourceTasks.splice(taskIndex, 1);

        // Add the task to the destination section if it was removed
        if (removedTask) {
            // Create a new task array for the destination section (to maintain immutability)
            const updatedDestinationTasks = [...destinationTasks, removedTask];

            // Update the state with the new task arrays (source and destination)
            setTasks((prev) => ({
                ...prev, // Spread the rest of the state to retain other sections
                [sourceSection]: [...sourceTasks],  // Updated source section after task removal
                [destinationSection]: updatedDestinationTasks, // Updated destination section after task addition
            }));
        }
    };



    const deleteTask = async (taskId, taskStatus) => {
        try {
            const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
            await deleteDoc(taskDoc);

            setTasks((prev) => ({
                ...prev,
                [taskStatus]: prev[taskStatus].filter((task) => task.id !== taskId)
            }));
        } catch (error) {
            console.error("Error deleting task: ", error);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="w-full rounded-[12px] mt-[10px] overflow-y-auto max-h-[calc(100vh-300px)]">
                <Section
                    title="Todo"
                    id="todo"
                    count={tasks['todo'].length}
                    tasks={tasks['todo']}
                    bgColor="#FAC3FF"
                    deleteTask={deleteTask}
                    moveTask={moveTask}
                />

                <Section
                    title="In-Progress"
                    id="in-progress"
                    count={tasks['in-progress'].length}
                    tasks={tasks['in-progress']}
                    bgColor="#85D9F1"
                    deleteTask={deleteTask}
                    moveTask={moveTask}
                />

                <Section
                    title="Completed"
                    id="completed"
                    count={tasks['completed'].length}
                    tasks={tasks['completed']}
                    bgColor="#CEFFCC"
                    deleteTask={deleteTask}
                    moveTask={moveTask}
                />
            </div>
        </DndProvider>
    );
};

const Section = ({ title, id, count, tasks, bgColor, deleteTask, moveTask }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: "TASK",
        drop: (item) => moveTask(item.id, item.section, id),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    console.log("Tasks: ", tasks)

    return (
        <div className="relative w-full h-[250px] bg-[#F1F1F1] rounded-[12px] mt-[20px]" ref={drop}>
            <div
                className={`py-[5px] px-[15px] rounded-tr-[12px] rounded-tl-[12px] flex justify-between items-center`}
                style={{ backgroundColor: bgColor }}
            >
                <span className="text-gray-600">{title} ({count})</span>
                <span>^</span>
            </div>

            <div
                className="w-full h-[calc(100%-40px)] p-[15px] overflow-y-auto"
                style={{ minHeight: "100px" }}
            >
                {tasks.length === 0 ? (
                    <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-gray-500 text-[12px]">
                        No Tasks in {title}
                    </span>
                ) : (
                    <ul className="space-y-2">
                        {tasks.map((task, index) => (
                            <Task
                                key={task.id}
                                task={task}
                                index={index}
                                section={id}
                                deleteTask={deleteTask}
                                moveTask={moveTask}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const Task = ({ task, section, deleteTask, moveTask }) => {
    const [{ isDragging }, drag] = useDrag({
        type: "TASK",
        item: { id: task.id, section },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const handleCheckboxClick = async () => {
        // Ensure that userId exists in task data before moving or updating it
        if (!task.userId) {
            console.error("Task does not have a userId");
            return;
        }

        // Move the task to the "Completed" section and apply strikethrough
        await moveTask(task.id, section, "completed");

        try {
            // Update the task's status in the database to "Completed"
            const taskDoc = doc(db, "users", task.userId, "tasks", task.id);
            await updateDoc(taskDoc, { taskStatus: "Completed" });
        } catch (error) {
            console.error("Error updating task status in Firestore: ", error);
        }
    };


    return (
        <li
            ref={drag}
            className={`bg-white rounded-lg p-3 shadow-sm ${isDragging ? "opacity-50" : ""}`}
        >
            <div className="flex items-center text-[14px] text-gray-500">
                {/* Checkbox to mark task as completed */}
                <input
                    type="checkbox"
                    className="mr-[10px]"
                    onChange={handleCheckboxClick}
                />
                <img src={dragicon} alt="move icon" className="mr-[3px]" />
                <img src={checkicon} alt="check icon" className="mr-[3px]" />
                <div
                    className={`w-[40%] ${task.taskStatus === "Completed" ? "line-through text-gray-500" : ""}`}
                >
                    {task.taskTitle}
                </div>
                <div
                    className={`w-[20%] ${task.taskStatus === "Completed" ? "line-through text-gray-500" : ""}`}
                >
                    {task.dueDate}
                </div>
                <div
                    className={`w-[20%]  ${task.taskStatus === "Completed" ? "line-through text-gray-500" : ""}`}
                >
                    <span className="bg-gray-200 px-[10px] py-[5px] rounded-[6px]">{task.taskStatus}</span>
                </div>
                <div
                    className={`w-[20%] ${task.taskStatus === "Completed" ? "line-through text-gray-500" : ""}`}
                >
                    {task.taskCategory}
                </div>
                <button
                    onClick={() => deleteTask(task.id, section)}
                    className="text-red-500"
                >
                    Delete
                </button>
            </div>
        </li>
    );
};


export default ListView;