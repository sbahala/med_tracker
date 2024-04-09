import React, { useState, useEffect, useMemo,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import { db } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc ,getDoc} from "firebase/firestore";
import {convertTo12HourFormat} from "../service/appointmentService";
import '../../style.css';

const DoctorPendingAppointmentsView =()=>{
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [patientNames, setPatientNames] = useState({});
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [filterDate, setFilterDate] = useState('');

    
    const fetchPendingAppointments = useCallback(async () => {
        const q = query(
            collection(db, "appointments"),
            where("status", "==", "Pending")
        );
        const querySnapshot = await getDocs(q);
        let fetchedDoctorPendingAppt = querySnapshot.docs.map((doc, index) => ({
            serial: index + 1,
            id: doc.id,
            ...doc.data()
        }));
        if (filterDate) {
            fetchedDoctorPendingAppt = fetchedDoctorPendingAppt.filter(appointment => appointment.date === filterDate);
        }
        
        if (startTime && endTime) {
            fetchedDoctorPendingAppt = fetchedDoctorPendingAppt.filter(appointment => {
                const appointmentTime = appointment.time;
                return appointmentTime >= startTime && appointmentTime <= endTime;
            });
        }
        const names = {};
        for (const appointment of fetchedDoctorPendingAppt) {
            const userRef = doc(db, "users", appointment.patientId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                names[appointment.patientId] = `${userData.firstName} ${userData.lastName}`;
            }
        }
        setPatientNames(names);
        setAppointments(fetchedDoctorPendingAppt);
    }, [filterDate, startTime, endTime]);

    useEffect(() => {
        fetchPendingAppointments();
    }, [fetchPendingAppointments]);

    const updateAppointmentStatus = useCallback(async (id, status) => {
        const appointmentRef = doc(db, "appointments", id);
    try {
        await updateDoc(appointmentRef, { status });
        alert(`Appointment has been ${status.toLowerCase()} successfully.`);
        setAppointments(prevAppointments =>
            prevAppointments.filter(appointment => appointment.id !== id)
        );
    } catch (error) {
        console.error("Error updating appointment: ", error);
        alert("There was an error updating the appointment.");
    }
}, []);
    const backDoctorDashboard=()=>{
        navigate("/doctorDashboard");
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
            Cell: ({ value }) => convertTo12HourFormat(value),
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
    const resetFilters = () => {
        setFilterDate('');
        setStartTime('');
        setEndTime('');
    };  

    return (
        <div className="appointmentsContainer">
            <header className="fixed-header">
                <h1>View Pending Appointments </h1>
            </header>
            <main className="content">
            <div className="filters">
                <label htmlFor="dateFilter" className="filterLabel">Date :</label>
                <input id="dateFilter" type="date" value={filterDate} onChange={handleDateChange} className="dateFilterInput" />
                
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
                    <button className="dashboardButton" onClick={backDoctorDashboard}>Doctor Dashboard</button>
                </footer>         
        </div>
    );

}
export default DoctorPendingAppointmentsView;
