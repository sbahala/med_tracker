import { auth, db } from '../../firebase';
import {collection, addDoc, getDocs, doc, updateDoc,getDoc} from 'firebase/firestore';

const requiredPatientFields = [
    'address', 'dob', 'email', 'firstName', 'gender', 'lastName', 'phoneNumber', 'role', 'uid'
  ];

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

export function convertTo12HourFormat(time) {
   
    if (!time) return '';
  
    // Split the time string into hours and minutes
    const [hours24, minutes] = time.split(':');
  
    // Parse the hours and minutes to numbers
    const hours = Number(hours24);
    const suffix = hours >= 12 ? 'PM' : 'AM';
  
    // Convert hours from 24-hour to 12-hour format
    const hours12 = ((hours + 11) % 12) + 1;
  
    // Return the formatted time string
    return `${hours12}:${minutes} ${suffix}`;
  };
  

  export async function isPatientProfileComplete(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const missingFields = requiredPatientFields.filter(field => !userData[field]);
  
      if (missingFields.length === 0) {
        // All fields are present
        return { isComplete: true };
      } else {
        // Some fields are missing
        return { isComplete: false, missingFields: missingFields };
      }
    } else {
      // User document doesn't exist
      throw new Error("User document does not exist");
    }
  };
  