import React from 'react';
import { db } from "../../firebase";
import {collection, addDoc, updateDoc, doc} from "firebase/firestore";
import EquipmentForm from './equipmentForm';

const EquipmentCreate = ({ onEquipmentCreated }) => {
    const saveEquipment = async (equipmentData) => {
        try {
            const docRef = await addDoc(collection(db, "equipment"), equipmentData);
            await updateDoc(doc(db, "equipment", docRef.id), {
                id: docRef.id
            });
            alert("Equipment created successfully");
            onEquipmentCreated();
        } catch (error) {
            console.error("Error adding equipment:", error);
        }
    };

    return (
        <div>
            <h2>Create New Equipment</h2>
            <EquipmentForm onSaveEquipment={saveEquipment} />
        </div>
    );
};

export default EquipmentCreate;