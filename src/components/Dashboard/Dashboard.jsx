import React, { useEffect, useState, useContext } from "react"
import DefaultDashboardLayout from "../DefaultDashboardLayout/DefaultDashboardLayout"
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import app from '../../firebase-config'
import { UserContext } from "../Contexts/UserContext";
import { Dialog, TransitionChild, Transition } from '@headlessui/react';
import AddTaskModal from "../AddTaskModal/AddTaskModal";
import ListView from "./ListView";

const Dashboard = () => {
    const [taskListView, setTaskListView] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showTaskPopup, setShowTaskPopup] = useState(true);

    const auth = getAuth(app);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await signOut(auth); // Sign out from Firebase
            setUser(null); // Clear user data from context
        } catch (error) {
            console.error("Error during sign-out:", error.message);
        }
    };

    useEffect(() => {
        // Navigate to login after user is cleared
        if (isLoggingOut) {
            navigate("/login");
        }
    }, [isLoggingOut, navigate]);

    const handleViewChange = () => {
        setTaskListView(!taskListView)
    }

    return (
        <DefaultDashboardLayout>
            <div className="flex flex-col">
                <div className="flex justify-between items-center mt-[20px]">
                    <div className="flex gap-[15px] justify-center items-center [&>span]:cursor-pointer">
                        <span className={`${taskListView ? 'underline font-bold' : 'no-underline text-grey-400'}`} onClick={() => handleViewChange()}>List</span>
                        <span className={`${!taskListView ? 'underline font-bold' : 'no-underline text-grey-400'}`} onClick={() => handleViewChange()}>Board</span>
                    </div>
                    <div>
                        {/* logout button  */}
                        <button onClick={handleLogout} className="rounded-[12px] bg-[#FFF9F9] border-[1.5px] border-[#7B1984]/15 px-[25px] py-[5px]">Logout</button>
                    </div>
                </div>
                <div className="w-full flex justify-end items-end mt-[20px]">
                    <button className="capitalize px-[30px] py-[10px] bg-[#7B1984] rounded-[41px] text-[#fff]" onClick={() => setShowTaskPopup(true)}>Add Task</button>
                </div>
            </div>

            <hr className="mt-[30px]" />

            <div className="w-full flex">
                <div className="w-full flex text-[#000000]/60 px-[10px] mt-[10px]">
                    <span className="w-[40%]">Task Name</span>
                    <span className="w-[20%]">Due On</span>
                    <span className="w-[20%]">Task Status</span>
                    <span className="w-[20%]">Task Category</span>
                </div>
            </div>
            <div>
                {taskListView ? <><ListView /></> : <></>}
            </div>

            {showTaskPopup && (<div className="w-full h-full">
                <Transition appear show={showTaskPopup} as={React.Fragment}>
                    <Dialog as="div" className="relative z-[99999] w-full overflow-y-auto flex justify-center items-center" onClose={() => { setShowTaskPopup(false) }}>
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                        </TransitionChild>

                        <div className="fixed inset-0 z-[9999] overflow-y-auto flex justify-center items-center ">
                            <div className="w-full h-full p-4 text-center md675:w-full flex justify-center items-center">
                                <TransitionChild
                                    as={React.Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                >
                                    <Dialog.Panel className="relative transform rounded-[10px] 
                                            text-left  transition-all m-4 max-h-[80vh]">
                                        <AddTaskModal setShowTaskPopup={setShowTaskPopup} />
                                    </Dialog.Panel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>)}

        </DefaultDashboardLayout>
    )
}

export default Dashboard