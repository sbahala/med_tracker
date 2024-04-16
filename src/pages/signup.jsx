import React, {useState} from "react";
import { useNavigate } from "react-router-dom"
import '../style.css';
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
    const [error, setErr] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const password = formData.get('password');
        try {
            const res = await createUserWithEmailAndPassword(auth,email, password);
            await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                firstName,
                lastName,
                email,
                role: "patient"
            })
            navigate('/login');
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
                    <input className="inputField" type="text"name="firstName" placeholder="First Name" />
                    <input className="inputField" type="text"name="lastName" placeholder="Last Name"/>
                    <input required type="email" name="email"placeholder="Email" />
                    <input required type="password" name="password" placeholder="Password" />

                    <button>Sign up</button>
                    {error && <span>Something went wrong</span>}
                </form>
                <p>
                    You do have an account?
                    <button onClick={() => navigate('/login')}>Login</button>
                </p>
            </div>
        </div>
    );
}

export default Signup;