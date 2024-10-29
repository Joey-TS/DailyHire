// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "Enter API key",
  authDomain: "Enter AuthDomain",
  databaseURL: "Enter databaseURL",
  projectId: "Enter project ID",
  storageBucket: "Enter storage Bucket",
  messagingSenderId: "messagingSenderId",
  appId: "appId",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
