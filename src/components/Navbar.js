import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Sanicon from "../route/Sanicon";
import "./NavbarStyle.css";
import { auth } from "./firebase";
import { getFirestore, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firestore = getFirestore();

function Navbar() {
  const [showWindow, setShowWindow] = useState(null);
  const [showTextBox, setShowTextBox] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupClass, setPopupClass] = useState('');
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [otp, setOtp] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [userExistsClass, setUserExistsClass] = useState('');
  const [loginType, setLoginType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);
  const storePhoneNumber = (phoneNumber) => {
    localStorage.setItem('simphon', phoneNumber);
  }
  
  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };


  const sendOtpForLogin = async () => {
    try {
      const collectionName = loginType === 'Worker' ? 'workers' : 'employer';
      const userRef = doc(firestore, collectionName, phone);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        setPopupMessage("User doesn't exist");
        setPopupError(true);
        setShowPopup(true);
        return;
      }

      let recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
      let confirmation = await signInWithPhoneNumber(auth, "+91" + phone, recaptchaVerifier);
      setUser(confirmation);
      setPopupMessage("OTP sent successfully");
      setPopupError(false);
    } catch (err) {
      setPopupMessage("Invalid phone number");
      setPopupError(true);
    }
    setShowOTPField(true);
    setShowPopup(true);
  };


  const sendOtpForSignup = async () => {
    try {
      const collectionName = loginType === 'Worker' ? 'workers' : 'employer';
      const userRef = doc(firestore, collectionName, phone);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().status === 'active') {
        setPopupMessage("User already exists");
        setPopupError(true);
        setShowPopup(true);
        return;
      }

      let recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
      let confirmation = await signInWithPhoneNumber(auth, "+91" + phone, recaptchaVerifier);
      setUser(confirmation);
      setPopupMessage("OTP sent successfully");
      setPopupError(false);
      await addPhoneNumberToFirestore(phone, 'inactive');
    } catch (err) {
      setPopupMessage("Invalid phone number");
      setPopupError(true);
    }
    setShowOTPField(true);
    setShowPopup(true);
  };


  const addPhoneNumberToFirestore = async (phoneNumber, status) => {
    try {
      const collectionName = loginType === 'Worker' ? 'workers' : 'employer';
      const userRef = doc(firestore, collectionName, phoneNumber);
      await setDoc(userRef, { mobile_number: phoneNumber, status: status });
    } catch (error) {
      console.error('Error adding phone number to Firestore:', error);
    }
  };

  const verifyOtpForLogin = async () => {
    try {
      await user.confirm(otp);
      setPopupError(false);
      setShowPopup(true);
      setShowTextBox(false);
      setShowOTPField(false);
      setShowWindow(null);
      handleLogin();
      storePhoneNumber(phone);
      localStorage.setItem('usertype', loginType);
      window.location.reload();
     
    } catch (error) {
      setPopupMessage('Invalid OTP');
      setPopupError(true);
      setShowPopup(true);
    }
  };


  const verifyOtpForSignup = async () => {
    try {
      await user.confirm(otp);
      setPopupMessage('OTP verified successfully');
      setPopupError(false);
      await updatePhoneNumberStatus(phone, 'active');
      setShowTextBox(false);
      setShowOTPField(false);
      setShowPopup(false);
      setShowWindow('verifyName');
      handleLogin();
      localStorage.setItem('usertype', loginType);
      storePhoneNumber(phone);
    } catch (error) {
      setPopupMessage('Invalid OTP');
      setPopupError(true);
      await updatePhoneNumberStatus(phone, 'inactive');
      setShowPopup(true);
    }
  };


  const updatePhoneNumberStatus = async (phoneNumber, status) => {
    try {
      const collectionName = loginType === 'Worker' ? 'workers' : 'employer';
      const userRef = doc(firestore, collectionName, phoneNumber);
      await updateDoc(userRef, { status: status });
    } catch (error) {
      console.error('Error updating phone number status in Firestore:', error);
    }
  };


  const handlePhoneChange = (e) => {
    const input = e.target.value;
    e.target.value = input.replace(/\D/g, '').slice(0, 10);
    setPhone(e.target.value);
  };


  const handleSubmit = async () => {
    const name = document.querySelector('.readname').value;
    if (name) {
      try {
        const collectionName = loginType === 'Worker' ? 'workers' : 'employer';
        const userRef = doc(firestore, collectionName, phone);
        await updateDoc(userRef, { name: name });
        setPopupMessage('Name updated successfully');
        setPopupError(false);
        setShowPopup(true);
        setShowTextBox(false);
        setShowOTPField(false);
        setShowWindow(null);
        handleLogin();
        window.location.reload();
      } catch (error) {
        setPopupMessage('Error updating name');
        setPopupError(true);
        setShowPopup(true);
      }
    }
  };

  return (
    <div className="header">
      <Link to="/"><h1>DailyHire.</h1></Link>
      <ul className="nav-menu">
        <li id="loginbtn" onClick={() => setShowWindow('login')}>
          <Link to="/">Login</Link>
        </li>
        <li>
          <Link id='signupbtn' onClick={() => setShowWindow('signup')}>Sign up</Link>
        </li>
        <li to="/"><Sanicon /></li>
      </ul>

      <div className={`sliding-window ${showWindow ? 'active' : ''} ${showWindow === 'slideOut' ? 'slide-out' : ''}`}>
        <div className="sliding-window-content">
          {showWindow && (
            <button className="close-button" onClick={() => setShowWindow(null)}>
              <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/multiply.png" alt="multiply" />
            </button>
          )}
          {showWindow === 'verifyName' && (
            <div className="sliding-window-content">
              <h3>Signup</h3>
              <input
                className='readname'
                type="text"
                placeholder="Enter your name..."
              />
              <button onClick={handleSubmit} className='otp-button'>Submit</button>
            </div>
          )}
          {showWindow === 'login' ? (
            <>
              <h3>Login</h3>
              {showTextBox ? null : (
                <>
                  <span className='ur'><h5>You are a, </h5></span>
                  <div className='loginselection'>
                    <a onClick={() => { setLoginType('Worker'); setShowTextBox(true); }}>
                      <span className="material-symbols-outlined">badge</span>
                      Worker
                    </a>
                    <br />
                    <a onClick={() => { setLoginType('Employer'); setShowTextBox(true); }}>
                      <span className="material-symbols-outlined">person_apron</span>
                      Employer
                    </a>
                  </div>
                </>
              )}
            </>
          ) : showWindow === 'signup' ? (
            <>
              <h3>Sign up</h3>
              {showTextBox ? null : (
                <>
                  <span className='ur'><h5>You are a, </h5></span>
                  <div className='loginselection'>
                    <a onClick={() => { setLoginType('Worker'); setShowTextBox(true); }}>
                      <span className="material-symbols-outlined">badge</span>
                      Worker
                    </a>
                    <br />
                    <a onClick={() => { setLoginType('Employer'); setShowTextBox(true); }}>
                      <span className="material-symbols-outlined">person_apron</span>
                      Employer
                    </a>
                  </div>
                </>
              )}
            </>
          ) : null}
          {showTextBox && !showOTPField && (
            <div className='vry'>
              <span className='vry-span'>Verify Your Mobile Number , </span>
              <input 
                className='readmono' 
                value={phone} 
                onInput={handlePhoneChange}
                type="text"
                placeholder="Enter your mobile number..."
              />
              <div id='recaptcha-container'></div>
              {showWindow === 'login' ? (
                <button className="otp-button" onClick={sendOtpForLogin}>Send OTP</button>
              ) : (
                <button className="otp-button" onClick={sendOtpForSignup}>Send OTP</button>
              )}
            </div>
          )}
          {showOTPField && (
            <div className='vry'>
              <input 
                className='readotp' 
                onChange={(e) => setOtp(e.target.value)}
                onInput={(e) => {
                  const value = e.target.value;
                  e.target.value = value.replace(/\D/g, '').slice(0, 6);
                }}
                type="text"
                placeholder="Enter OTP..."
              />
              {showWindow === 'login' ? (
                <button className="verify-button" value={otp} onClick={verifyOtpForLogin}>Verify OTP</button>
              ) : (
                <button className="verify-button" value={otp} onClick={verifyOtpForSignup}>Verify OTP</button>
              )}
            </div>
          )}
          {showPopup && (
            <div className={`popup-message ${popupError ? 'error' : 'success'} ${userExistsClass}`}>
              {popupMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;