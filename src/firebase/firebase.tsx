// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA07_A7At-J9Mu6NMXBpoLVYcrKWR3ezy4",
    authDomain: "fcm-notify-db9b8.firebaseapp.com",
    databaseURL: "https://fcm-notify-db9b8.firebaseio.com",
    projectId: "fcm-notify-db9b8",
    storageBucket: "fcm-notify-db9b8.appspot.com",
    messagingSenderId: "77071010064",
    appId: "1:77071010064:web:e693b1fa22167a00e27d95",
    measurementId: "G-VWCS7XBQC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const getFirebase = ()=>{
    return app;
};

export const getSavedFireStore = ()=>{
    return firestore;
}