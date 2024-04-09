import React, { useState, useEffect, useMemo,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import { db } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc ,getDoc} from "firebase/firestore";
import {convertTo12HourFormat} from "../service/appointmentService";
import '../../style.css';
import { differenceInYears } from 'date-fns';



function PatientVitalsModal({ isOpen, onClose, patientVitals,patientAge }) {
    if (!isOpen) return null;

  return (
    isOpen && (
      <div className="modal">
        <div className="modalContent">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>View Patient Vitals</h2>
          <div className="vitalsInfo">
            <p>Height: {patientVitals.height}</p>
            <p>Weight: {patientVitals.weight}</p>
            <p>Age: {patientAge} years</p>
            <p>Blood Pressure: {patientVitals.bloodPressure}</p>
            <p>Allergies: {patientVitals.allergies}</p>
            <p>Family Medical History: {patientVitals.familyMedicalHistory}</p>
          </div>
        </div>
      </div>
    )
  );
      
  }


function VitalsModal({ isOpen, onClose, onSave, appointmentId,currentVitals }) {
    const [vitals, setVitals] = useState({
      diagnosis: '',
      treatmentPlan: ''
    });
    const [validationErrors, setValidationErrors] = useState({}); 
    useEffect(() => {
        if (currentVitals) {
          setVitals(currentVitals);
        }
      }, [currentVitals]);
  
    const handleChange = (e) => {
      setVitals({ ...vitals, [e.target.name]: e.target.value });
      setValidationErrors({ ...validationErrors, [e.target.name]: false });
    };
      
      function validateText(input) {
        const isEmpty = input.trim().length === 0;
        const isTooLong = input.length > 200;
        return !isEmpty && !isTooLong;
      }
      const validateForm = () => {
        const newErrors = {};
        if (!validateText(vitals.diagnosis)) {
            newErrors.diagnosis = vitals.diagnosis.trim().length === 0 ? 'Enter diagnosis' : 'Text too long';
        } else {
            newErrors.diagnosis = '';
        }
        if (!validateText(vitals.treatmentPlan)) {
            newErrors.treatmentPlan = vitals.treatmentPlan.trim().length === 0 ? 'Enter Treatment Plan' : 'Text too long';
        } else {
            newErrors.treatmentPlan = '';
        }

        setValidationErrors(newErrors);
        return Object.values(newErrors).every(err => !err);
    };
    const handleSubmit = () => {
        if (typeof appointmentId === 'undefined' || appointmentId === null) {
            console.error('No appointmentId is set');
            alert('No appointment selected to update vitals.');
            return;
          }
          if (!validateForm()) {
            alert('Please check your inputs for errors.');
            return;
        }
        
      onSave(appointmentId, vitals);
      onClose();
    };
  
    if (!isOpen) return null;
  
    return (
        isOpen && (
          <div className="modal">
            <div className="modalContent">
              <span className="close" onClick={onClose}>&times;</span>
              <h2>Enter Patient Diagnosis & Treatment Plan</h2>
              <div className="formRow"><div className="formGroup"><label for="diagnosis">Diagnosis</label><textarea className={`textareaField ${validationErrors.diagnosis ? 'inputError' : ''}`} name="diagnosis" placeholder="Diagnosis" value={vitals.diagnosis} onChange={handleChange}></textarea>
                  {validationErrors.diagnosis && <div className="error">{validationErrors.diagnosis}</div>}</div></div>
              <div className="formRow"><div className="formGroup"><label htmlFor="treatmentPlan">Treatment Plan</label>
                  <textarea className={`textareaField ${validationErrors.treatmentPlan ? 'inputError' : ''}`} name="treatmentPlan" placeholder="Enter Treatment Plan" value={vitals.treatmentPlan} onChange={handleChange}></textarea>
                  {validationErrors.treatmentPlan && <div className="error">{validationErrors.treatmentPlan}</div>}</div></div>
              <button onClick={handleSubmit}>Submit Diagnosis</button>
            </div>
          </div>
        )
      );
      
  }

  
const DoctorOntimeAppointments =()=>{
   const navigate = useNavigate();
   const [appointments, setAppointments] = useState([]);
   const [patientNames, setPatientNames] = useState({});
   const [startTime, setStartTime] = useState('');
   const [endTime, setEndTime] = useState('');
   const [filterDate, setFilterDate] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
   const [currentVitals, setCurrentVitals] = useState({
    diagnosis: '',
    treatmentPlan: '',
  });
  const [patientVitals, setPatientVitals] = useState({
    Height: '',
    Weight: '',
  });
  const [patientAge, setPatientAge] = useState(null);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
 
   
   const fetchOnTimeAppt = useCallback(async () => {
       const q = query(
           collection(db, "appointments"),
           where("status", "==", "OnTime")
       );
       const querySnapshot = await getDocs(q);
       let fetchOnTimeAppointments = querySnapshot.docs.map((doc, index) => ({
           serial: index + 1,
           id: doc.id,
           ...doc.data()
       }));
       if (filterDate) {
        fetchOnTimeAppointments = fetchOnTimeAppointments.filter(appointment => appointment.date === filterDate);
    }
    
    if (startTime && endTime) {
        fetchOnTimeAppointments = fetchOnTimeAppointments.filter(appointment => {
            const appointmentTime = appointment.time;
            return appointmentTime >= startTime && appointmentTime <= endTime;
        });
    }
       const names = {};
       for (const appointment of fetchOnTimeAppointments) {
           const userRef = doc(db, "users", appointment.patientId);
           const userSnap = await getDoc(userRef);
           if (userSnap.exists()) {
               const userData = userSnap.data();
               names[appointment.patientId] = `${userData.firstName} ${userData.lastName}`;
           }
       }
       setPatientNames(names);
       setAppointments(fetchOnTimeAppointments);
   }, [filterDate, startTime, endTime]);

   useEffect(() => {
    fetchOnTimeAppt();
   }, [fetchOnTimeAppt]);

   const updateAppointmentStatus = useCallback(async (id, status) => {
    const appointmentRef = doc(db, "appointments", id);
    const appointmentSnap = await getDoc(appointmentRef);

    if (!appointmentSnap.exists()) {
        console.error("Appointment does not exist");
        alert("Appointment not found.");
        return;
    }

    const appointmentData = appointmentSnap.data();
    const requiredVitals = ['diagnosis', 'treatmentPlan'];
    const missingVitals = requiredVitals.filter(vital => !appointmentData[vital] || appointmentData[vital].trim() === '');

    if (missingVitals.length > 0) {
        alert("Please update the missing vitals before setting the appointment to 'On Time': " + missingVitals.join(", "));
        return;
    }

    try {
        await updateDoc(appointmentRef, { status });
        alert(`Appointment diagnosis completed successfully.`);
        fetchOnTimeAppt();
    } catch (error) {
        console.error("Error updating appointment status: ", error);
        alert("There was an error updating the appointment status.");
    }
}, [fetchOnTimeAppt]);

const updatePatientVitals = async (appointmentId, vitals) => {
    const appointmentRef = doc(db, "appointments", appointmentId);
  
    try {
        const appointmentSnap = await getDoc(appointmentRef);
            if (appointmentSnap.exists()) {
            const appointmentData = appointmentSnap.data();
            await updateDoc(appointmentRef, {
                diagnosis: vitals.diagnosis,
                treatmentPlan: vitals.treatmentPlan,
            });
  
            const patientName = patientNames[appointmentData.patientId] || 'Unknown Patient';
            alert(`Diagnosis updated successfully for ${patientName} (Patient ID: ${appointmentData.patientId}).`);
            
            fetchOnTimeAppt();
            setSelectedAppointmentId(null);
            setIsModalOpen(false);
            } else {
                alert('No appointment found for the given ID.');
                }
            }catch (error) {
                console.error('Error updating Diagnosis: ', error);
                alert('Failed to update Diagnosis for patient ID: ' + appointmentId+'. Error: ' + error.message);
            }
 };
 const viewPatientVitals = useCallback(async (appointment) => {
    try {
        const patientRef = doc(db, "appointments", appointment);
        const patientSnap = await getDoc(patientRef);
        const patientData = patientSnap.data();
        const vitals = {
            height: patientData.height || '',
            weight: patientData.weight || '',
            bloodPressure: patientData.bloodPressure || '',
            allergies: patientData.allergies || '',
            familyMedicalHistory: patientData.familyMedicalHistory || ''
        };
        const usersData = doc(db, "users", patientData.patientId);
        const usersSnap = await getDoc(usersData);
        const userDetail = usersSnap.data();
        const birthdate = userDetail.dob;
        const age = birthdate ? differenceInYears(new Date(), new Date(birthdate)) : 'Unknown';

        setPatientVitals(vitals);
        setPatientAge(age);
        setIsVitalsModalOpen(true);
    } catch (error) {
        console.error('Error fetching vitals: ', error);
        alert('Failed to fetch vitals for patient.');
    }
}, []);
  const fetchCurrentVitals = async (appointmentId) => {
    const appointmentRef = doc(db, "appointments", appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
  
    if (appointmentSnap.exists()) {
      const appointmentData = appointmentSnap.data();
      return {
        diagnosis: appointmentData.diagnosis || '',
        treatmentPlan: appointmentData.treatmentPlan || '',
      };
    } else {
      return {
        diagnosis: '',
        treatmentPlan: '',
      };
    }
  };
  
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
       },{
        Header: 'Patient Vitals',
        id: 'viewVitals',
        accessor: (row) => row.id,
        Cell: ({ row }) => (
          <button
            onClick={() => {
              viewPatientVitals(row.original.id);
            }}
          >
            View Vitals
          </button>
        ),
      },
       {
           Header: 'Action',
           id: 'actions',
           Cell: ({ row }) => (
               <>
                   <button className="button updateButton" onClick={async() => {
                    const vitals = await fetchCurrentVitals(row.original.id);
                    setCurrentVitals(vitals);
                    setSelectedAppointmentId(row.original.id);
                    setIsModalOpen(true);
                }}>
                    Edit Diagnosis
                </button>
                <button className="button onTimeButton" onClick={() => updateAppointmentStatus(row.original.id, 'Finished')}>
                    Completed Diagnosis
                </button>
               </>
           ),
       },{
        Header: 'Book Equipment',
        id: 'bookEquipment',
        Cell: ({ row }) => (
          <button onClick={() => navigate(`/doctorBookEquipment/${row.original.id}`)}>
            Book Equipment
          </button>
        ),},
   ], [updateAppointmentStatus,viewPatientVitals,navigate]);

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
               <h1>View OnTime Appointments </h1>
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
           <VitalsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={updatePatientVitals}
        appointmentId={selectedAppointmentId}
        currentVitals={currentVitals}
        setVitals={setCurrentVitals}
      /><PatientVitalsModal
      isOpen={isVitalsModalOpen}
      onClose={() => setIsVitalsModalOpen(false)}
      patientVitals={patientVitals}
      patientAge={patientAge}
    />
           </main>
           <footer className="footer">
            <button className="dashboardButton" onClick={backDoctorDashboard}>Doctor Dashboard</button>
        </footer>       
       </div>
   );


}
export default DoctorOntimeAppointments;
