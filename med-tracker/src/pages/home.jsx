import '../style.css';
import React from "react";
import { useNavigate } from "react-router-dom"

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="formContainer">
            <div className="formWrapper">
                <span className="logo">Welcome to Med Tracker</span>
                <span className="title">Your Health, Our Priority</span>
                <p>
                    This is Med Tracker, your go-to app for tracking your medical history and appointments. Stay healthy and informed with us.
                </p>
                <button onClick={() => navigate('/login')}>Login</button>
                <button onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
        </div>
    );
}

export default Home;