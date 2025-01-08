// GoogleAuth.js
import React, { useContext } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom"
import app from '../../firebase-config'
import GoogleIcon from '../../assets/images/google.svg'
import { UserContext } from "../Contexts/UserContext"

const GoogleAuth = () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            // Store user data in context
            setUser({
                name: user.displayName,
                photoURL: user.photoURL,
            });
            navigate("/dashboard");
            console.log("User Info:", user);

        } catch (error) {
            alert(`"Error during Google sign-in:", error.message ${error.message}`)
            console.error("Error during Google sign-in:", error.message);
        }
    };

    return (
        <div className="mt-[30px]">
            <button className="rounded-[20px] bg-[#292929] px-[50px] py-[10px] text-[#fff] flex gap-[5px] justify-center items-center" onClick={handleGoogleSignIn}><img src={GoogleIcon} alt="Google Icon" className="w-[30px]" /> Sign in with Google</button>
        </div>
    );
};

export default GoogleAuth;
