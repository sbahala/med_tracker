import React, {useState} from "react";
import '../style.css';
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase";

const Signup = () => {
    const [error, setErr] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password)
        } catch (e) {
            setErr(true);
        }


    }
    return (
        <div className="formContainer">
            <div className="formWrapper">
                <span className="logo">Med Tracker</span>
                <span className="title">Sign Up</span>
                <form onSubmit={handleSubmit}>
                    <input required type="email" placeholder="email" />
                    <input required type="password" placeholder="password" />

                    <button>Sign up</button>
                    {error && <span>Something went wrong</span>}
                </form>
                <p>
                    You do have an account? Login
                </p>
            </div>
        </div>
    );
}

export default Signup;