import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import '../style.css';

const Login = () => {
    const [error, setErr] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;

        try {

            await signInWithEmailAndPassword(auth, email, password);

        } catch (e) {
            setErr(true);
        }
    };

    return (
        <div className="formContainer">
            <div className="formWrapper">
                <span className="logo">Med Tracker</span>
                <span className="title">Login</span>
                <form onSubmit={handleSubmit}>
                    <input required type="email" placeholder="email" />
                    <input required type="password" placeholder="password" />

                    <button>Login</button>
                    {error && <span>Something went wrong</span>}
                </form>
                <p>
                    Don't have an account?
                    <button onClick={() => navigate('/signup')}>Sign Up</button>
                </p>
            </div>
        </div>
    );
};

export default Login;
