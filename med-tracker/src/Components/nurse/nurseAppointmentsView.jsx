import React, { useState, useEffect, useMemo,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import { db } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc ,getDoc} from "firebase/firestore";
import {convertTo12HourFormat} from "../service/appointmentService";
import '../../style.css';

const NurseAppointmentsView =()=>{
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [patientNames, setPatientNames] = useState({});

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [filterDate, setFilterDate] = useState(''); // Default to today's date
    
    const fetchAppointments = useCallback(async () => {
        // Fetch today's pending appointments
        const q = query(
            collection(db, "appointments"),
            where("status", "==", "Pending")
        );
        const querySnapshot = await getDocs(q);
        let fetchedAppointments = querySnapshot.docs.map((doc, index) => ({
            serial: index + 1,  // To provide a serial number starting from 1
            id: doc.id,
            ...doc.data()
        }));
        if (filterDate) {
            fetchedAppointments = fetchedAppointments.filter(appointment => appointment.date === filterDate);
        }
        
        // Local filtering for start time and end time
        if (startTime && endTime) {
            fetchedAppointments = fetchedAppointments.filter(appointment => {
                const appointmentTime = appointment.time; // Assuming 'time' is stored in 'HH:MM' format
                return appointmentTime >= startTime && appointmentTime <= endTime;
            });
        }
        // Fetch patient names for each appointment
        const names = {};
        for (const appointment of fetchedAppointments) {
            const userRef = doc(db, "users", appointment.patientId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                names[appointment.patientId] = `${userData.firstName} ${userData.lastName}`;
            }
        }
        setPatientNames(names);
        setAppointments(fetchedAppointments);
    }, [filterDate, startTime, endTime]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    useEffect(() => {
        // Reset filters when the component mounts
        setFilterDate('');
        setStartTime('');
        setEndTime('');
    }, []);

    const updateAppointmentStatus = useCallback(async (id, status) => {
        const appointmentRef = doc(db, "appointments", id);
    try {
        await updateDoc(appointmentRef, { status });
        alert(`Appointment has been ${status.toLowerCase()} successfully.`);
        // Filter out the updated appointment from the appointments list
        setAppointments(prevAppointments =>
            prevAppointments.filter(appointment => appointment.id !== id)
        );
    } catch (error) {
        console.error("Error updating appointment: ", error);
        alert("There was an error updating the appointment.");
    }
}, []);
    const backNurseDashboard=()=>{
        navigate("/nurseDashboard");
    }
    const handleDateChange = useCallback((event) => {
        setFilterDate(event.target.value);
    }, []);

    const handleStartTimeChange = useCallback((event) => {
        setStartTime(event.target.value);
    }, []);

    const handleEndTimeChange = useCallback((event) => {
        setEndTime(event.target.value);
    }, []);
    const data = useMemo(() => {
        return appointments
            .filter(appointment => {
                const appointmentTime = appointment.time;
                return (!startTime || appointmentTime >= startTime) && (!endTime || appointmentTime <= endTime);
            })
            .map(appointment => ({
                ...appointment,
                name: patientNames[appointment.patientId] || 'Unknown',
            }));
    }, [appointments, startTime, endTime, patientNames]);

    const columns = useMemo(() => [
        {
            Header: 'S/N',
            accessor: 'serial',
        },
        {
            Header: 'Patient Name',
            accessor: 'name',
        },
        {
            Header: 'Date',
            accessor: 'date',
        },{
            Header: 'Time',
            accessor: 'time',
            Cell: ({ value }) => convertTo12HourFormat(value), // Convert time format here
        },
        {
            Header: 'Doctor',
            accessor: 'doctorName',
        },
        {
            Header: 'Department Name',
            accessor: 'departmentName',
        },
        {
            Header: 'Actions',
            id: 'actions',
            Cell: ({ row }) => (
                <>
                    <button className="button acceptButton" onClick={() => updateAppointmentStatus(row.original.id, 'Accepted')}>
                        Accept
                    </button>
                    <button className="button declineButton" onClick={() => updateAppointmentStatus(row.original.id, 'Declined')}>
                        Decline
                    </button>
                </>
            ),
        },
    ], [updateAppointmentStatus]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div className="appointmentsContainer">
            <header className="fixed-header">
                <h1>View Pending Appointments </h1>
            </header>
            <main className="content">
            <div className="filters">
                <label htmlFor="dateFilter" className="filterLabel">Date:</label>
                <input id="dateFilter" type="date" value={filterDate} onChange={handleDateChange} className="dateFilterInput" />
                
                <label htmlFor="startTimeFilter" className="filterLabel">Start Time:</label>
                <input id="startTimeFilter" type="time" value={startTime} onChange={handleStartTimeChange} className="timeFilterInput"/>
                
                <label htmlFor="endTimeFilter" className="filterLabel">End Time:</label>
                <input id="endTimeFilter" type="time" value={endTime} onChange={handleEndTimeChange} className="timeFilterInput"/>
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
                                {row.cells.map(cell => {
                                    return (
                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            </main>   
                <footer className="footer">
                    <button className="dashboardButton" onClick={backNurseDashboard}>Nurse Dashboard</button>
                </footer>         
        </div>
    );

}
export default NurseAppointmentsView;
