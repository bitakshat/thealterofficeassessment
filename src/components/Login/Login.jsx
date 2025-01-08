
import loginimage from '../../assets/images/Task list view 3.png'
import GoogleAuth from '../GoogleAuth/GoogleAuth'
import taskicon from '../../assets/images/task.png'

const Login = () => {
    return (
        <section className="w-full h-screen bg-[#FFF9F9] flex">
            <div className="w-1/2 h-full flex flex-col justify-center items-start px-[100px]">
                <div className="text-[26px] font-bold text-[#7B1984] flex justify-center items-center ml-[-5px]"><img src={taskicon} alt="taskicon" />TaskBuddy</div>
                <p className="text-[12px] w-[300px]">Streamline your workflow and track progress effortlessly with our all-in-one task management app.</p>

                <GoogleAuth />
            </div>
            <div className="w-1/2">
                <img src={loginimage} alt="loginimage" className='w-full h-full' />
            </div>
        </section>
    )
}

export default Login