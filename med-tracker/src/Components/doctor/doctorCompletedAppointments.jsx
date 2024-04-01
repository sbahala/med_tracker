import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import { db } from "../../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../style.css';
import { FiCalendar } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';


function PatientDetailsModal({ isOpen, onClose, appointmentDetails }) {
    if (!isOpen) return null;

    return (
        isOpen && (
            <div className="modal">
                <div className="modalContent">
                    <span className="close" onClick={onClose}>&times;</span>
                    <h2>Patient Details</h2>
                    {/* Render the appointment details here */}
                    <div className="appointmentDetails">
                        <p>Doctor Attended: {appointmentDetails.doctorName}</p>
                        <p>Height: {appointmentDetails.height}</p>
                        <p>Weight: {appointmentDetails.weight}</p>
                        <p>Allergies: {appointmentDetails.allergies}</p>
                        <p>Blood Pressure: {appointmentDetails.bloodPressure}</p>
                        <p>Family Medical History: {appointmentDetails.familyMedicalHistory}</p>
                        <p>Diagnosis: {appointmentDetails.diagnosis}</p>
                        <p>Treatment Plan: {appointmentDetails.treatmentPlan}</p>
                        {/* Add more details as needed */}
                    </div>
                </div>
            </div>
        )
    );
}
const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <button className="calendar-button" onClick={onClick} ref={ref}>
      <FiCalendar />
      {value}
    </button>
  ));

const DoctorCompletedAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [patientNames, setPatientNames] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isPatientDetailsModalOpen, setIsPatientDetailsModalOpen] = useState(false);
    const [currentAppointmentDetails, setCurrentAppointmentDetails] = useState({});


    const fetchAppointments = useCallback(async () => {
        const selectedDateString = format(selectedDate, "yyyy-MM-dd");
        const q = query(
            collection(db, "appointments"),
            where("status", "==", "Finished"),
            where("date", "==", selectedDateString)
        );
        const querySnapshot = await getDocs(q);
        let newAppointments = [];
        let newPatientNames = {};

        for (const docSnapshot of querySnapshot.docs) {
            const appointmentData = docSnapshot.data();
            const userRef = doc(db, "users", appointmentData.patientId);
            const userSnap = await getDoc(userRef);

            newAppointments.push({
                serial: newAppointments.length + 1,
                id: docSnapshot.id,
                ...appointmentData,
                patientName: userSnap.exists() ? `${userSnap.data().firstName} ${userSnap.data().lastName}` : 'Unknown'
            });

            if (userSnap.exists()) {
                newPatientNames[appointmentData.patientId] = `${userSnap.data().firstName} ${userSnap.data().lastName}`;
            }
        }

        setPatientNames(newPatientNames);
        setAppointments(newAppointments);
    }, [selectedDate]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);


    const backDoctorDashboard = () => {
        navigate("/doctorDashboard");
    };

    const viewPatientDetails = useCallback((appointment) => {
        setCurrentAppointmentDetails(appointment);
        setIsPatientDetailsModalOpen(true);
    }, []);
    
    const data = useMemo(() => appointments, [appointments]);

    const columns = useMemo(() => [
        {
            Header: 'S/N',
            accessor: 'serial',
        },
        {
            Header: 'Patient Name',
            accessor: 'patientName',
        },
        /*{
            Header: 'Date',
            accessor: 'date',
        },*/
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
        },
        {
            Header: () => (
                <div >
                    Select Date
                    <DatePicker
                        selected={selectedDate}
                        onChange={date => setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                        customInput={<CustomInput />}
                    />
                </div>
            ),
            id: 'dateFilter',
            disableSortBy: true,
            accessor: 'filterDate',
            Cell: ({ row }) => {
                const dateString = row.original.date;
                if (typeof dateString === 'string') {
                  return format(parseISO(dateString), "yyyy-MM-dd");
                }
                return null; // or a placeholder if the dateString is not available
              }
        }
    ], [selectedDate,viewPatientDetails]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: appointments });

    return (
        <div className="appointmentsContainer">
            <header className="fixed-header">
                <h1>View Completed Appointments</h1>
            </header>
            <main className="content">
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
