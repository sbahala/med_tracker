import React, { useState, useEffect, useMemo,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import { db } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc ,getDoc} from "firebase/firestore";
import {convertTo12HourFormat} from "../service/appointmentService";
import '../../style.css';

function VitalsModal({ isOpen, onClose, onSave, appointmentId,currentVitals }) {
    const [vitals, setVitals] = useState({
      height: '',
      weight: '',
      bloodPressure: '',
      allergies: '',
      familyMedicalHistory: ''
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
    function validateHeight(height) {
        return /^([1-9]\d*(\.\d+)?|0\.\d+)$/.test(height);
      }
      
      function validateWeight(weight) {
        return /^([1-9]\d*(\.\d+)?|0\.\d+)$/.test(weight);
      }
      
      function validateBloodPressure(bp) {
        return /^\d{2,3}\/\d{2,3}$/.test(bp);
      }
      
      function validateText(input) {
        const isEmpty = input.trim().length === 0;
        const isTooLong = input.length > 200;
        return !isEmpty && !isTooLong;
      }
      const validateForm = () => {
        const newErrors = {};
        newErrors.height = !validateHeight(vitals.height) ? 'Invalid height format' : '';
        newErrors.weight = !validateWeight(vitals.weight) ? 'Invalid weight format' : '';
        newErrors.bloodPressure = !validateBloodPressure(vitals.bloodPressure) ? 'Invalid blood pressure format' : '';
        if (!validateText(vitals.allergies)) {
            newErrors.allergies = vitals.allergies.trim().length === 0 ? 'Enter allergies' : 'Text too long';
        } else {
            newErrors.allergies = '';
        }
        if (!validateText(vitals.familyMedicalHistory)) {
            newErrors.familyMedicalHistory = vitals.familyMedicalHistory.trim().length === 0 ? 'Enter family History' : 'Text too long';
        } else {
            newErrors.familyMedicalHistory = '';
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
              <button className="close" onClick={onClose}>&times;</button>
              <h2>Update Vitals</h2>
              <div className="formRow"><div className="formGroup"><label htmlFor="height">Height (feet)</label><input name="height" placeholder="Height (6.25)"  value={vitals.height} onChange={handleChange} className={validationErrors.height ? 'inputError' : ''} />{validationErrors.height && <div className="error">{validationErrors.height}</div>}</div></div>
              <div className="formRow"><div className="formGroup"><label htmlFor="weight">Weight (Lbs)</label><input name="weight" placeholder="Weight (150)" value={vitals.weight} onChange={handleChange} className={validationErrors.weight ? 'inputError' : ''} />{validationErrors.weight && <div className="error">{validationErrors.weight}</div>}</div></div>
              <div className="formRow"><div className="formGroup"><label htmlFor="bloodPressure">Blood Pressure (mmHg)</label><input name="bloodPressure" placeholder="Blood Pressure (135/85)" value={vitals.bloodPressure} onChange={handleChange} className={validationErrors.bloodPressure ? 'inputError' : ''} />{validationErrors.bloodPressure && <div className="error">{validationErrors.bloodPressure}</div>}</div></div>
              <div className="formRow"><div className="formGroup"><label htmlFor="allergies">Allergies</label><textarea className={`textareaField ${validationErrors.allergies ? 'inputError' : ''}`} name="allergies" placeholder="Allergies" value={vitals.allergies} onChange={handleChange}></textarea>
                  {validationErrors.allergies && <div className="error">{validationErrors.allergies}</div>}</div></div>
              <div className="formRow"><div className="formGroup"><label htmlFor="familyMedicalHistory">Family Medical History</label>
                  <textarea className={`textareaField ${validationErrors.familyMedicalHistory ? 'inputError' : ''}`} name="familyMedicalHistory" placeholder="Family Medical History" value={vitals.familyMedicalHistory} onChange={handleChange}></textarea>
                  {validationErrors.familyMedicalHistory && <div className="error">{validationErrors.familyMedicalHistory}</div>}</div></div>
              <button onClick={handleSubmit}>Save Vitals</button>
            </div>
          </div>
        )
      );
      
  }

  
const NurseAcceptedAppointmentsView =()=>{
   const navigate = useNavigate();
   const [appointments, setAppointments] = useState([]);
   const [patientNames, setPatientNames] = useState({});
   const [filterDate, setFilterDate] = useState(''); 
   const [startTime, setStartTime] = useState('');
   const [endTime, setEndTime] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
   const [currentVitals, setCurrentVitals] = useState({
    height: '',
    weight: '',
    bloodPressure: '',
    allergies: '',
    familyMedicalHistory: '',
  });
 
   
   const fetchAppointments = useCallback(async () => {
       const q = query(
           collection(db, "appointments"),
           where("status", "==", "Accepted")
       );
       const querySnapshot = await getDocs(q);
       let fetchedPendingAppointments = querySnapshot.docs.map((doc, index) => ({
           serial: index + 1,
           id: doc.id,
           ...doc.data()
       }));
       if (filterDate) {
        fetchedPendingAppointments = fetchedPendingAppointments.filter(appointment => appointment.date === filterDate);
     }
     if (startTime && endTime) {
            fetchedPendingAppointments = fetchedPendingAppointments.filter(appointment => {
                const appointmentTime = appointment.time;
                return appointmentTime >= startTime && appointmentTime <= endTime;
            });
        }
       const names = {};
       for (const appointment of fetchedPendingAppointments) {
           const userRef = doc(db, "users", appointment.patientId);
           const userSnap = await getDoc(userRef);
           if (userSnap.exists()) {
               const userData = userSnap.data();
               names[appointment.patientId] = `${userData.firstName} ${userData.lastName}`;
           }
       }
       setPatientNames(names);
       setAppointments(fetchedPendingAppointments);
   }, [filterDate, startTime, endTime]);

   useEffect(() => {
       fetchAppointments();
   }, [fetchAppointments]);

   const updateAppointmentStatus = useCallback(async (id, status) => {
    const appointmentRef = doc(db, "appointments", id);
    const appointmentSnap = await getDoc(appointmentRef);

    if (!appointmentSnap.exists()) {
        console.error("Appointment does not exist");
        alert("Appointment not found.");
        return;
    }

    const appointmentData = appointmentSnap.data();
    const requiredVitals = ['height', 'weight', 'bloodPressure', 'allergies', 'familyMedicalHistory'];
    const missingVitals = requiredVitals.filter(vital => !appointmentData[vital] || appointmentData[vital].trim() === '');

    if (missingVitals.length > 0) {
        alert("Please update the missing vitals before setting the appointment to 'On Time': " + missingVitals.join(", "));
        return;
    }

    try {
        await updateDoc(appointmentRef, { status });
        alert(`Appointment has been set to ${status.toLowerCase()} successfully.`);
        fetchAppointments();
    } catch (error) {
        console.error("Error updating appointment status: ", error);
        alert("There was an error updating the appointment status.");
    }
}, [fetchAppointments]);

const updatePatientVitals = async (appointmentId, vitals) => {
    const appointmentRef = doc(db, "appointments", appointmentId);
  
    try {
        const appointmentSnap = await getDoc(appointmentRef);
            if (appointmentSnap.exists()) {
            const appointmentData = appointmentSnap.data();
            await updateDoc(appointmentRef, {
                height: vitals.height,
                weight: vitals.weight,
                bloodPressure: vitals.bloodPressure,
                allergies: vitals.allergies,
                familyMedicalHistory: vitals.familyMedicalHistory,
            });
  
            const patientName = patientNames[appointmentData.patientId] || 'Unknown Patient';
            alert(`Vitals updated successfully for ${patientName} (Patient ID: ${appointmentData.patientId}).`);
            
            fetchAppointments();
            setSelectedAppointmentId(null);
            setIsModalOpen(false);
            } else {
                alert('No appointment found for the given ID.');
                }
            }catch (error) {
                console.error('Error updating vitals: ', error);
                alert('Failed to update vitals for patient ID: ' + appointmentId+'. Error: ' + error.message);
            }
 };

  const fetchCurrentVitals = async (appointmentId) => {
    const appointmentRef = doc(db, "appointments", appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
  
    if (appointmentSnap.exists()) {
      const appointmentData = appointmentSnap.data();
      return {
        height: appointmentData.height || '',
        weight: appointmentData.weight || '',
        bloodPressure: appointmentData.bloodPressure || '',
        allergies: appointmentData.allergies || '',
        familyMedicalHistory: appointmentData.familyMedicalHistory || '',
      };
    } else {
      return {
        height: '',
        weight: '',
        bloodPressure: '',
        allergies: '',
        familyMedicalHistory: '',
      };
    }
  };
  
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
                   <button className="button updateButton" onClick={async() => {
                    const vitals = await fetchCurrentVitals(row.original.id);
                    setCurrentVitals(vitals);
                    setSelectedAppointmentId(row.original.id);
                    setIsModalOpen(true);
                }}>
                    Update Vitals
                </button>
                <button className="button onTimeButton" onClick={() => updateAppointmentStatus(row.original.id, 'OnTime')}>
                    Set On Time
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
               <h1>View Accepted Appointments </h1>
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
      />
           </main>
           <footer className="footer">
            <button className="dashboardButton" onClick={backNurseDashboard}>Nurse Dashboard</button>
        </footer>       
       </div>
   );


}
export default NurseAcceptedAppointmentsView;
