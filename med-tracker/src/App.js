import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom"
import {ProtectedRoute} from "./context/protectedRoute";

import Signup from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";
import AdminDashboard from "./Components/admin/adminDashboard";
import PatientDashboard from './Components/Patients/PatientDashboard';
import EditAccountDetails from './Components/Patients/editAccountDetails';
import NurseDashboard from "./Components/nurse/nurseDashboard";
import DoctorDashboard from "./Components/doctor/doctorDashboard";
import AppointmentRecords from "./Components/Patients/appointmentRecords";
import AppointmentCreate from "./Components/service/appointmentCreate";
import ViewAllAppointments from "./Components/admin/viewAllAppointments";
import EditExistingAccounts from "./Components/admin/editExistingAccounts";
import NurseAppointmentsView from "./Components/nurse/nurseAppointmentsView";
import NurseAcceptedAppointmentsView from "./Components/nurse/nurseAcceptedAppointmentsView";
import DoctorPendingAppointmentsView from "./Components/doctor/doctorPendingAppointmentsView";
import DoctorCompletedAppointments from "./Components/doctor/doctorCompletedAppointments";
import DoctorEquipmentView from "./Components/doctor/doctorEquipmentView";
import DoctorOntimeAppointments from "./Components/doctor/doctorOntimeAppointments";
import ViewAllEquipments from "./Components/admin/viewAllEquipments";
import DoctorBookEquipment from "./Components/doctor/doctorBookEquipment";
import NurseEditEquipmentBookings from "./Components/nurse/nurseEditEquipmentBookings";

//import {useContext} from "react";
//import {AuthContext} from "./context/authContext";

function App() {

  return (
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />


            <Route path="adminDashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="patientDashboard" element={
                <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                </ProtectedRoute>
            } />
            <Route path="editPatientAccount" element={
                <ProtectedRoute allowedRoles={['patient']}>
                    <EditAccountDetails />
                </ProtectedRoute>
            } />
            <Route path="nurseDashboard" element={
                <ProtectedRoute allowedRoles={['nurse']}>
                    <NurseDashboard />
                </ProtectedRoute>
            } />
            <Route path="doctorDashboard" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                </ProtectedRoute>
            } />
            <Route path="appointmentRecords" element={
                <ProtectedRoute allowedRoles={['patient']}>
                    <AppointmentRecords />
                </ProtectedRoute>
            } />
            <Route path="appointmentCreate" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                    <AppointmentCreate />
                </ProtectedRoute>
            } />
            <Route path="appointmentView" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <ViewAllAppointments />
                </ProtectedRoute>
            } />
            <Route path="editExistingAccounts" element={
                <ProtectedRoute allowedRoles={['admin']}>
                     <EditExistingAccounts/>
                </ProtectedRoute>
            } />
            <Route path="nurseAppointmentsView" element={
                <ProtectedRoute allowedRoles={['nurse']}>
                     <NurseAppointmentsView/>
                </ProtectedRoute>
            } />
            <Route path="nurseAcceptedAppointmentsView" element={
                <ProtectedRoute allowedRoles={['nurse']}>
                     <NurseAcceptedAppointmentsView/>
                </ProtectedRoute>
            } />
            <Route path="doctorPendingAppointmentsView" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                     <DoctorPendingAppointmentsView/>
                </ProtectedRoute>
            } />
            <Route path="doctorOntimeAppointments" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                     <DoctorOntimeAppointments/>
                </ProtectedRoute>
            } />
            <Route path="doctorCompletedAppointments" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                     <DoctorCompletedAppointments/>
                </ProtectedRoute>
            } />
            <Route path="doctorEquipmentView" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorEquipmentView/>
                </ProtectedRoute>
            } />

            <Route path="viewEquipments" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <ViewAllEquipments/>
                </ProtectedRoute>
            } />
             <Route path="doctorBookEquipment/:appointmentId" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorBookEquipment/>
                </ProtectedRoute>
            } />
             <Route path="nurseEditEquipmentBookings" element={
                <ProtectedRoute allowedRoles={['nurse']}>
                    <NurseEditEquipmentBookings/>
                </ProtectedRoute>
            } />
        </Routes>
      </BrowserRouter>

  );
}



export default App;
