import '../style.css';
import React from "react";
import { useNavigate } from "react-router-dom"
//import {signOut} from "firebase/auth";
//import {auth} from "../firebase";

const Home = () => {
    const navigate = useNavigate();

    /*const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };*/

    return (
        <div className="formContainer">
            <div className="formWrapper">
                <span className="logo">Welcome to Med Tracker</span>
                <span className="title">Your Health, Our Priority</span>
                <p>
                    This is Med Tracker, your go-to app for tracking your medical history and appointments. Stay healthy and informed with us.
                </p>
                <div className="buttonsContainer">
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
                
            </div>
        </div>
    );
}

export default Home;