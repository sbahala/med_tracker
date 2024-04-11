import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import { db } from "../../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import {convertTo12HourFormat} from "../service/appointmentService";
import 'react-datepicker/dist/react-datepicker.css';
import '../../style.css';
function PatientDetailsModal({ isOpen, onClose, appointmentDetails }) {
    if (!isOpen) return null;

    return (
        isOpen && (
            <div className="modal">
                <div className="modalContent">
                    <button className="close" onClick={onClose}>&times;</button>
                    <h2>Patient Details</h2>
                    <div className="appointmentDetails">
                        <p>Doctor Attended: {appointmentDetails.doctorName}</p>
                        <p>Height: {appointmentDetails.height}</p>
                        <p>Weight: {appointmentDetails.weight}</p>
                        <p>Allergies: {appointmentDetails.allergies}</p>
                        <p>Blood Pressure: {appointmentDetails.bloodPressure}</p>
                        <p>Family Medical History: {appointmentDetails.familyMedicalHistory}</p>
                        <p>Diagnosis: {appointmentDetails.diagnosis}</p>
                        <p>Treatment Plan: {appointmentDetails.treatmentPlan}</p>
                    </div>
                </div>
            </div>
        )
    );
}

const DoctorCompletedAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isPatientDetailsModalOpen, setIsPatientDetailsModalOpen] = useState(false);
    const [currentAppointmentDetails, setCurrentAppointmentDetails] = useState({});


    const fetchCompletedAppointments = useCallback(async () => {
        const q = query(
            collection(db, "appointments"),
            where("status", "==", "Finished")
        );
        const querySnapshot = await getDocs(q);
        let enrichedAppointments = [];
        for (const docSnapshot of querySnapshot.docs) {
            let appointmentData = docSnapshot.data();
            const userRef = doc(db, "users", appointmentData.patientId);
            
            try {
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    appointmentData.patientName = `${userData.firstName} ${userData.lastName}`;
                } else {
                    appointmentData.patientName = 'Unknown';
                }
            } catch (error) {
                console.error("Error fetching patient data:", error);
                appointmentData.patientName = 'Error fetching name';
            }
    
            enrichedAppointments.push({
                serial: enrichedAppointments.length + 1,
                id: docSnapshot.id,
                ...appointmentData,
            });
        }
        if (selectedDate) {
            enrichedAppointments = enrichedAppointments.filter(appointment => appointment.date === selectedDate);
        }
        if (startTime ) {
            enrichedAppointments = enrichedAppointments.filter(appointment => {
                const appointmentTime = appointment.time;
                return appointmentTime >= startTime;
            });
        }
        if (endTime ) {
            enrichedAppointments = enrichedAppointments.filter(appointment => {
                const appointmentTime = appointment.time;
                return appointmentTime <= endTime;
            });
        }
        if (startTime && endTime) {
            enrichedAppointments = enrichedAppointments.filter(appointment => {
                const appointmentTime = appointment.time;
                return appointmentTime >= startTime && appointmentTime <= endTime;
            });
        }
        setAppointments(enrichedAppointments);
    }, [selectedDate, startTime, endTime]);

    useEffect(() => {
        fetchCompletedAppointments();
    }, [fetchCompletedAppointments]);

    const handleDateChange = useCallback((event) => {
        setSelectedDate(event.target.value);
    }, []);
   const handleStartTimeChange = useCallback((event) => {
       setStartTime(event.target.value);
   }, []);

   const handleEndTimeChange = useCallback((event) => {
       setEndTime(event.target.value);
   }, []);
    const backDoctorDashboard = () => {
        navigate("/doctorDashboard");
    };

    const viewPatientDetails = useCallback((appointment) => {
        setCurrentAppointmentDetails(appointment);
        setIsPatientDetailsModalOpen(true);
    }, []);

    const columns = useMemo(() => [
        {
            Header: 'S/N',
            accessor: 'serial',
        },
        {
            Header: 'Patient Name',
            accessor: 'patientName',
        },
        {
            Header: 'Date',
            accessor: 'date',
        },{
            Header: 'Time',
            accessor: 'time',
            Cell: ({ value }) => convertTo12HourFormat(value),
            },
        {
            Header: 'Doctor',
            accessor: 'doctorName',
        },
        {
            Header: 'Department Name',
            accessor: 'departmentName',
        },{
            Header: 'View Details',
            id: 'viewDetails',
            accessor: 'id',
            Cell: ({ row }) => (
                <button onClick={() => viewPatientDetails(row.original)}>
                    Patient Details
                </button>
            ),
        }
    ], [viewPatientDetails]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: appointments });
    const resetFilters = () => {
        setSelectedDate('');
        setStartTime('');
        setEndTime('');
    };
    return (
        <div className="appointmentsContainer">
            <header className="fixed-header">
                <h1>View Completed Appointments</h1>
            </header>
            <main className="content">
            <div className="filters">
                <label htmlFor="dateFilter" className="filterLabel">Date :</label>
                <input id="dateFilter" type="date" value={selectedDate} onChange={handleDateChange} className="dateFilterInput" />
                
                <label htmlFor="startTimeFilter" className="filterLabel">From :</label>
                <input id="startTimeFilter" type="time" value={startTime} onChange={handleStartTimeChange} className="timeFilterInput"/>
                
                <label htmlFor="endTimeFilter" className="filterLabel">To :</label>
                <input id="endTimeFilter" type="time" value={endTime} onChange={handleEndTimeChange} className="timeFilterInput"/>
                <button onClick={resetFilters} className="resetButton">Reset Filters</button>
            </div>
                <table {...getTableProps()} className="appointmentsTable">
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map(cell => (
                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <PatientDetailsModal
                isOpen={isPatientDetailsModalOpen}
                onClose={() => setIsPatientDetailsModalOpen(false)}
                appointmentDetails={currentAppointmentDetails}
            />
            </main>
            <footer className="footer">
                <button className="dashboardButton" onClick={backDoctorDashboard}>Doctor Dashboard</button>
            </footer>
        </div>
    );
};

export default DoctorCompletedAppointments;
