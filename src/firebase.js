// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getFirestore } from "firebase/firestore";

/*const firebaseConfig = {
    apiKey: "AIzaSyArL8xR4WsE1KroHleIqU4OdFpCo0d1Z5A",
    authDomain: "med-tracker-13568.firebaseapp.com",
    projectId: "med-tracker-13568",
    storageBucket: "med-tracker-13568.appspot.com",
    messagingSenderId: "497399430338",
    appId: "1:497399430338:web:e9e0255948fd76dbc88f5b"
};*/
//new details
const firebaseConfig = {
    apiKey: "AIzaSyDTKksuUeE8S6tkg_vhgiyaMYickmkUbLs",
    authDomain: "medtracknew.firebaseapp.com",
    projectId: "medtracknew",
    storageBucket: "medtracknew.firebasestorage.app",
    messagingSenderId: "3613783426",
    appId: "1:3613783426:web:08ae90046ffb2274440b9b"
  };

window.firebaseConfig = firebaseConfig;
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore(app);

