import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { db } from '../../firebase-config'; // Ensure you configure Firebase and export 'db'
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const AddTaskModal = ({ setShowTaskPopup }) => {

    const auth = getAuth(); // Get the authenticated user
    const user = auth.currentUser; // Get the currently logged-in user

    const [taskData, setTaskData] = useState({})

    const formik = useFormik({
        initialValues: {
            taskTitle: '',
            taskDescription: '',
            taskCategory: '', // Added task category
            dueDate: '', // Added due date
            taskStatus: '', // Added task status
            attachment: null, // Added attachment
        },
        validationSchema: Yup.object({
            taskTitle: Yup.string()
                .required('Full Name is required'),
            taskDescription: Yup.string()
                .max(300, 'Description cannot exceed 300 characters'),
            taskCategory: Yup.string()
                .required('Task Category is required'),
            dueDate: Yup.date()
                .required('Due Date is required')
                .typeError('Invalid date'),
            taskStatus: Yup.string()
                .required('Task Status is required'),
            attachment: Yup.mixed()
                .nullable()
                .test('fileSize', 'File size should be less than 5MB', (value) =>
                    value ? value.size <= 5242880 : true
                )
                .test('fileType', 'Unsupported file format', (value) =>
                    value ? ['image/jpeg', 'image/png', 'application/pdf'].includes(value.type) : true
                ),
        }),
        onSubmit: async values => {
            try {
                if (user) {
                    const taskRef = collection(db, 'users', user.uid, 'tasks'); // Store tasks under the logged-in user's collection
                    const newTask = {
                        ...values,
                        createdAt: new Date().toISOString(),
                    };
                    if (values.attachment) {
                        newTask.attachmentName = values.attachment.name;
                        newTask.attachmentType = values.attachment.type;
                    }
                    await addDoc(taskRef, newTask); // Add the task data to Firestore
                    setTaskData(values); // Optional: Set task data in state
                    console.log('Task added successfully:', newTask);
                } else {
                    console.error('User not logged in');
                }
            } catch (error) {
                console.error('Error adding task:', error);
            }
            // setTaskData(values);
            // console.log(values);

            setShowTaskPopup(false);
        }
    });

    return (
        <div className="relative w-[674px] h-[696px] bg-white rounded-[20px] flex flex-col">
            <div className="w-full flex justify-between items-center p-[20px]">
                <h1 className="text-[24px]">Create Task</h1>
                <span>X</span>
            </div>
            <hr className="!px-[0px]" />
            <div className='flex-1 flex flex-col overflow-hidden'>
                <form onSubmit={formik.handleSubmit} className='w-full !h-full p-[10px] rounded-br-[20px] rounded-bl-[20px] flex flex-col'>
                    <input type="text" placeholder='Task Title' className='px-[10px] py-[5px] bg-[#F1F1F1]/35 border border-[#000000]/13 w-full rounded-[8px]'
                        onChange={formik.handleChange}
                        name="taskTitle"
                        value={formik.values.taskTitle}
                    />
                    <div className="rounded-lg border border-gray-200 mt-[20px]">
                        {/* Label and character count */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-gray-500"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-gray-400">Description</span>
                            </div>
                        </div>
                        {/* Textarea */}
                        <textarea
                            className="w-full px-3 py-2 focus:outline-none resize-none bg-[#F1F1F1]/35"
                            rows="4"
                            placeholder="Enter description"
                            maxLength={300}
                            name="taskDescription"
                            value={formik.values.taskDescription}
                            onChange={formik.handleChange}
                        />
                        {/* Toolbar */}
                        <div className="flex items-center gap-2 px-3 py-1 border-b border-gray-200 bg-[#F1F1F1]/35">
                            <button type="button" className="p-1 hover:bg-gray-100 rounded">
                                <span className="font-bold">B</span>
                            </button>
                            <button type="button" className="p-1 hover:bg-gray-100 rounded">
                                <span className="italic">I</span>
                            </button>
                            <button type="button" className="p-1 hover:bg-gray-100 rounded">
                                <span className="line-through">S</span>
                            </button>
                            <div className="w-px h-5 bg-gray-200 mx-1"></div>
                            <button type="button" className="p-1 hover:bg-gray-100 rounded">
                                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button type="button" className="p-1 hover:bg-gray-100 rounded">
                                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <span className="text-sm text-gray-400">{formik.values.taskDescription.length}/300 characters</span>
                        </div>
                    </div>

                    <div className='mt-[20px] text-gray-500 flex justify-between items-center'>
                        <div className='flex flex-col gap-[5px]'>
                            <span className='text-[12px] mb-[5px]'>Task Category*</span>
                            {/* <div className='flex gap-[5px] text-[12px]'>
                                <span className='px-[15px] py-[5px] rounded-full border border-grey-300'>Work</span>
                                <span className='px-[15px] py-[5px] rounded-full border border-grey-300'>Personal</span>
                            </div> */}
                            <div className="flex gap-[5px] text-[12px]">
                                <label>
                                    <input
                                        type="radio"
                                        name="taskCategory"
                                        value="Work"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        checked={formik.values.taskCategory === 'Work'}
                                        className='appearance-none'
                                    />
                                    <span className={`px-[15px] py-[5px] rounded-full border border-gray-300 ${formik.values.taskCategory === 'Work' ? 'bg-gray-300' : ''}`}>Work</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="taskCategory"
                                        value="Personal"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        checked={formik.values.taskCategory === 'Personal'}
                                        className='appearance-none'
                                    />
                                    <span className={`px-[15px] py-[5px] rounded-full border border-gray-300 ${formik.values.taskCategory === 'Personal' ? 'bg-gray-300' : ''}`}>Personal</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <span className='text-[12px]'>Due on*</span>
                            {/* <input type="date" className='px-[10px] py-[5px] bg-[#F1F1F1]/35 border border-[#000000]/13 w-full rounded-[8px]' /> */}
                            <input
                                type="date"
                                className="px-[10px] py-[5px] bg-[#F1F1F1]/35 border border-[#000000]/13 w-full rounded-[8px]"
                                name="dueDate"
                                value={formik.values.dueDate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        <div>
                            <span className='text-[12px]'>Task Status*</span>
                            <select
                                className="px-[10px] py-[7px] bg-[#F1F1F1]/35 border border-[#000000]/13 w-full rounded-[8px]"
                                name="taskStatus"
                                value={formik.values.taskStatus}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="">Select Status</option>
                                <option value="ToDo">ToDo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className='text-[12px] mt-[20px] text-gray-500'>
                        <span>Attachment</span>
                        <div className="mt-[10px]">
                            <input
                                type="file"
                                className="hidden"
                                id="file-upload"
                                onChange={(event) => {
                                    const file = event.currentTarget.files[0];
                                    formik.setFieldValue('attachment', file);
                                }}
                            />
                            <label
                                htmlFor="file-upload"
                                className="w-full flex flex-col items-center px-4 py-6 bg-[#F1F1F1]/35 text-blue rounded-lg border border-blue cursor-pointer"
                            >
                                <span className="mt-2 leading-normal text-[12px]">
                                    Drop your files here or <span className="underline text-blue-500 hover:font-bold">Update</span>
                                </span>
                            </label>
                        </div>
                    </div>
                    <div className='bg-[#F1F1F1] w-full self-stretch mt-auto py-[10px] rounded-br-[20px] rounded-bl-[20px] flex justify-end items-center gap-[10px]'>
                        <button type="reset" className='mt-[20px] px-[25px] py-[10px] bg-[#fff] text-[#000] rounded-full uppercase' onClick={() => setShowTaskPopup(false)}>Cancel</button>
                        <button type="submit" className='mt-[20px] px-[25px] py-[10px] bg-[#7B1984] text-[#fff] rounded-full uppercase'
                            onClick={formik.handleSubmit}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


// company name - vareli technologies
// hr name - mishel

export default AddTaskModal