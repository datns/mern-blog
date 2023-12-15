// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup}  from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyBhdpUpbapCT8rhqck0AJjq089QiOeFb2I",
	authDomain: "mern-blog-ee830.firebaseapp.com",
	projectId: "mern-blog-ee830",
	storageBucket: "mern-blog-ee830.appspot.com",
	messagingSenderId: "182266096093",
	appId: "1:182266096093:web:1e3cb3a051953a47942e34",
	measurementId: "G-T4JFLV0N15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider()

const auth = getAuth(app);

export const authWithGoogle = () => {
	try {
		return signInWithPopup(auth, provider)
	} catch (err) {
		console.log(err);
	}
}

