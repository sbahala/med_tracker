import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';


const AdminDashboard = () => {
    const navigate = useNavigate();
    const handleCreateAppointments=()=>{
        navigate('/appointmentCreate');
    }

    const handleViewAppointments=()=>{
        navigate('/appointmentView');
    }
    const handleExistingAccounts=()=>{
        navigate('/editExistingAccounts');
    }


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
            <header className="fixed-header"><h1>Welcome to Admin Dashboard</h1></header>
            <main className="content">
                <div className="appointmentSelectionContainer">
                <button onClick={handleViewAppointments} className="selectionButton">View Appointments</button>
                <button onClick={handleCreateAppointments} className="selectionButton">Create Appointments</button>
                <button onClick={handleExistingAccounts} className="selectionButton">Edit User Accounts</button>
                </div>
            </main>
            <footer className="footer">
                <button className="Logout" onClick={handleSignOut}>
                Sign Out
                </button>
            </footer>
        </div>
    );
};

export default AdminDashboard;