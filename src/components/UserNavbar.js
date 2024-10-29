import React, { useState } from 'react';
import './UserNavbar.css';
import wattc from '../components/icons8-attendance-50.png'; 
import wset from '../components/set.png'; 
import jobsearch from '../components/jobsearch.png'; 
import QRCode from "react-qr-code";

const UserNavbar = ({ onSearchClick }) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');

  const handleLogout = () => {
    // Change isLoggedIn to "false" in localStorage
    localStorage.setItem('isLoggedIn', 'false');
    
    // Reload the page
    window.location.reload();
  };

  const handleStayLoggedInClick = () => {
    setShowLogoutPopup(false); // Close the logout popup
  };

  const handleGenerateQR = () => {
    const simphonValue = localStorage.getItem('simphon');
    setQrCodeValue(simphonValue);
  };

  const handleOkClick = () => {
    // Handle "Ok" button click if needed
    // For example, close a modal or perform another action
    setQrCodeValue(''); // Clear QR code value after clicking Ok
  };

  return (
    <div className="user-navbar">
      <div className="nav-item">
        <img
          src={wattc}
          alt="Attendance"
          className="nav-icon_attc"
          onClick={handleGenerateQR} // Generate QR code on click
        />
        {qrCodeValue && (
          <div className="qr-code-container">
            <p>Scan this QR code to mark your attendence. </p>
            <QRCode value={qrCodeValue} className="qr-code" />
            <button className="ok-button" onClick={handleOkClick}>Ok</button>
          </div>
        )}
      </div>
      <div className="nav-item">
        <img 
          src={jobsearch} 
          alt="Search" 
          className="nav-icon_search" 
          onClick={onSearchClick} // Call the handler on click
        />
      </div>
      <div className="nav-item" onClick={() => setShowLogoutPopup(true)}>
        <img src={wset} alt="Settings" className="nav-icon_set" />
      </div>

      {showLogoutPopup && (
        <div className="logout-popupworker">
          <div className="popup-contentworker">
            <h3>Do you want to logout?</h3>
            <div className="button-containerworker">
              <button className="logout-buttonworker" onClick={handleLogout}>Logout</button>
              <button className="stay-logged-in-buttonworker" onClick={handleStayLoggedInClick}>Stay Logged in</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNavbar;
