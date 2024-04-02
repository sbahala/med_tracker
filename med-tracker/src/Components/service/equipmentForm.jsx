// EquipmentForm.jsx
import React, { useState } from 'react';

const EquipmentForm = ({ onSaveEquipment }) => {
    const [name, setName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSaveEquipment({ name, roomNumber, status });

        setName('');
        setRoomNumber('');
        setStatus('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Equipment Name"
                required
            />
            <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Room Number"
                required
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="inUse">In Use</option>
                <option value="maintenance">Maintenance</option>
            </select>
            <button type="submit">Create Equipment</button>
        </form>
    );
};

export default EquipmentForm;
