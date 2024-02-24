import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const AdminDashboard = () => {
    const navigate = useNavigate();


    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
};

export default AdminDashboard;