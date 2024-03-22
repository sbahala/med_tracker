import React from 'react';
import {useNavigate} from 'react-router-dom';
import { auth } from '../../firebase';
import {signOut} from "firebase/auth";


const PatientDashboard = () => {
    const navigate = useNavigate();
    const handleSetupAccount=()=>{
        navigate('/editPatientAccount');
    }
    const handleViewAppointments=()=>{
        navigate('/appointmentRecords');
    }

    const handleCreateAppointments=()=>{
        navigate('/appointmentCreate');
    }

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    return(
        <div >
            <header className="fixed-header"><h1>Welcome to Patient Dashboard</h1></header>
            
            <main className="content">
                <button onClick={handleSetupAccount}>Edit Account</button>
                <button onClick={handleViewAppointments}>View Appointments Records</button>
                <button onClick={handleCreateAppointments}>Create Appointments</button>

            </main>

    
            <footer className = "footer">
            <button className="Logout" onClick={handleSignOut}>
                Log Out
            </button>
            </footer>
            
        </div>
    )
    
};

export default PatientDashboard;