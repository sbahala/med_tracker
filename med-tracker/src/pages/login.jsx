import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth,db } from '../firebase';
import {doc, getDoc} from 'firebase/firestore';
import '../style.css';

const Login = () => {
    const [error, setErr] = useState(false);
    const navigate = useNavigate();
    const areAccountDetailsComplete = (userData) =>{
        return userData.firstName && userData.lastName && userData.dob && userData.gender && userData.phoneNumber && userData.email && userData.address;
    } 

    const checkAndSetAccountCompletion = async (userId) =>{
        const userDocRef = doc(db,"users",userId);
        const userSnapshot = await getDoc(userDocRef);
        if(userSnapshot.exists() && areAccountDetailsComplete(userSnapshot.data())){
            localStorage.setItem('accountSetupComplete','true');
        }else{
            localStorage.setItem('accountSetupComplete','false');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;

        try {

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('userId',userCredential.user.uid);
            await checkAndSetAccountCompletion(userCredential.user.uid);
            //localStorage.setItem('userId',userCredential.user.uid);
            navigate('/patient-dashboard');

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
