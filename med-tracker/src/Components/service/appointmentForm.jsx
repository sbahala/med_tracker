import React, { useState } from 'react';

const AppointmentForm = ({ onSaveAppointment }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [departmentName, setDepartmentName] = useState('');
    const [doctorName, setDoctorName] = useState('');


    const handleSubmit = (e) => {
        e.preventDefault();
        onSaveAppointment({
            date,
            time,
            departmentName,
            doctorName,
            status: 'Pending'
        });
        setDate('');
        setTime('');
        setDepartmentName('');
        setDoctorName('');
    };

    return (
        <form onSubmit={handleSubmit}>

            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
            <input type="text" value={departmentName} onChange={e => setDepartmentName(e.target.value)} placeholder="Department Name" required />
            <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Doctor Name" required />
            <button type="submit">Create Appointment</button>
        </form>
    );
};

export default AppointmentForm;