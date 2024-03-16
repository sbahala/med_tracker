import { auth, db } from '../../firebase';
import {collection, addDoc, getDocs, doc, updateDoc} from 'firebase/firestore';

export const addAppointment = async (appointmentData) => {
    if (auth.currentUser) {
        const patientId = auth.currentUser.uid;
        const appointmentWithUserUid = { ...appointmentData, patientId };
        const docRef = await addDoc(collection(db, "appointments"), appointmentWithUserUid);

        const appointmentDoc = doc(db, "appointments", docRef.id);
        await updateDoc(appointmentDoc, { appointmentId: docRef.id });

        // return { ...appointmentWithUserUid, uid: docRef.id }; // 返回包含预约uid的完整预约对象
    } else {
        throw new Error("No user is currently signed in.");
    }
};

export const getAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, "appointments"));
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
};