import { useContext } from 'react';
import taskicon from '../../assets/images/task.png'
import { UserContext } from '../Contexts/UserContext';

const DefaultDashboardLayout = ({ children }) => {

    const { user } = useContext(UserContext);

    return (
        <div className="p-[40px]">
            <div className='flex justify-between items-center'>
                <div className="text-[26px] font-bold text-[#7B1984] flex justify-center items-center ml-[-5px]"><img src={taskicon} alt="taskicon" />TaskBuddy</div>
                <div className='flex justify-center items-center gap-[2px]'>
                    {/* profile image and icon here  */}
                    <img src={user?.photoURL} alt="profile" className="w-[30px] rounded-full" />
                    <span className="ml-[10px]">{user?.name}</span>
                </div>
            </div>
            {children}
        </div>
    );
}

export default DefaultDashboardLayout