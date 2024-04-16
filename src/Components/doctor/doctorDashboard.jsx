import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from "firebase/auth";

const DoctorDashboard = () => {
    const navigate = useNavigate();

    const handlePendingAppointments=()=>{
        navigate('/doctorPendingAppointmentsView');
    }
    const handleOntimeAppointments=()=>{
        navigate('/doctorOntimeAppointments');
    }
    const handleCompletedAppointments=()=>{
        navigate('/doctorCompletedAppointments');
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
            <header className="fixed-header"><h1>Welcome to Doctor Dashboard</h1></header>
            <main className="content">
                <div className="appointmentSelectionContainer">
                    <button onClick={handlePendingAppointments} className="selectionButton">Pending Appointments</button>
                    <button onClick={handleOntimeAppointments} className="selectionButton">OnTime Appointments</button>
                    <button onClick={handleCompletedAppointments} className="selectionButton">Completed Appointments</button>
                </div>      
            
            </main>
            <footer className = "footer">
                <button className="Logout" onClick={handleSignOut}>Log Out</button>
            </footer>
        </div>
    );
};

export default DoctorDashboard;
