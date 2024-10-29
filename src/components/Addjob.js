import React, { useState, useRef } from 'react';
import './Addjob.css';
import atnc from '../components/icons8-attendance-50.png';
import set from '../components/set.png';
import closeIcon from '../components/close-icon.png';
import { StandaloneSearchBox } from '@react-google-maps/api';
import { getFirestore, doc, collection, getDocs, setDoc } from 'firebase/firestore';
import { getDatabase, ref, set as setDatabaseData } from 'firebase/database';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import ActionSelect from './ActionSelect'; // Import ActionSelect component
import AttendanceQRScanner from './AttendanceQRScanner';

const firestore = getFirestore();
const database = getDatabase();

function Addjob() {
  const [formVisible, setFormVisible] = useState(false);
  const [showActionSelect, setShowActionSelect] = useState(false); // State to show ActionSelect
  const [showAttendanceQRScanner, setShowAttendanceQRScanner] = useState(false); // State to show AttendanceQRScanner

  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobStartTime: '',
    jobEndTime: '',
    jobDate: '',
    jobLocation: '',
    latitude: null,
    longitude: null,
    salary: '',
    genderRequired: 'either',
    workersRequired: '',
    dressCode: '',
    workDescription: '',
    status: null,
    postedby: null
  });

  const inputRef = useRef();

  const toggleFormVisibility = () => {
    setFormVisible(!formVisible);
  };

  const handlePlaceChanged = () => {
    const [place] = inputRef.current.getPlaces();
    if (place) {
      const location = place.formatted_address;
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();
      setFormData({
        ...formData,
        jobLocation: location,
        latitude: latitude,
        longitude: longitude
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const userType = localStorage.getItem('usertype');
      const phoneNumber = localStorage.getItem('simphon');

      if (!userType || !phoneNumber) {
        alert('User type or phone number not found in local storage.');
        return;
      }

      const collectionName = userType === 'Worker' ? 'workers' : 'employer';
      const userDocRef = doc(firestore, collectionName, phoneNumber);

      const jobSubCollectionRef = collection(userDocRef, 'jobsposted');
      const jobDocs = await getDocs(jobSubCollectionRef);
      const nextJobId = `${jobDocs.size + 1}-${phoneNumber}`;

      const formDataWithPostedBy = {
        ...formData,
        postedby: phoneNumber
      };

      await setDoc(doc(jobSubCollectionRef, nextJobId.toString()), formDataWithPostedBy);

      // Update Firebase Realtime Database
      const jobData = {
        workersRequired: formData.workersRequired,
        booked: 0
      };
      await setDatabaseData(ref(database, `simphon/${phoneNumber}/${nextJobId}`), jobData);

      alert('Job posted successfully!');

      setFormData({
        jobTitle: '',
        companyName: '',
        jobStartTime: '',
        jobEndTime: '',
        jobDate: '',
        jobLocation: '',
        latitude: null,
        longitude: null,
        salary: '',
        genderRequired: 'either',
        workersRequired: '',
        dressCode: '',
        workDescription: ''
      });
      setFormVisible(false);
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post the job. Please try again.');
    }
  };

  const toggleLogoutPopup = () => {
    const popup = document.querySelector('.logout-popup');
    popup.classList.toggle('active');
  };

  const handleLogout = () => {
    // Change isLoggedIn to "false" in localStorage
    localStorage.setItem('isLoggedIn', 'false');
    
    // Reload the page
    window.location.reload();
  };

  const handleStayLoggedIn = () => {
    // Close the logout popup
    toggleLogoutPopup();
  };

  const handleAttendanceIconClick = () => {
    setShowActionSelect(true); // Show the ActionSelect component
  };

  const handleTakeAttendance = () => {
    setShowActionSelect(false); // Close the ActionSelect component
    setShowAttendanceQRScanner(true); // Show the AttendanceQRScanner component
  };

  return (
    <GoogleMapsProvider>
      <div className="navigation-bar">
        <div className="nav-item" onClick={handleAttendanceIconClick}>
          <img src={atnc} className="nav-icon lopo-image" alt="Attendance Icon" />
        </div>
        <div className="middle-button">
          <button className="addjob" onClick={toggleFormVisibility}>+</button>
        </div>
        <div className="nav-item" onClick={toggleLogoutPopup}>
          <img src={set} className="nav-icon settings-image" alt="Settings Icon" />
        </div>

        {formVisible && (
          <div className="form-container">
            <div className="fixed-header">
              <div className="close-button" onClick={toggleFormVisibility}>
                <img src={closeIcon} alt="Close Icon" />
              </div>
              <h2 className="form-heading">POST YOUR JOB</h2>
            </div>
            <form onSubmit={handleFormSubmit} className="job-form">
              <div className="form-group">
                <label>Job Title:</label>
                <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Company Name:</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Job Start Time:</label>
                <input type="time" name="jobStartTime" value={formData.jobStartTime} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Job End Time:</label>
                <input type="time" name="jobEndTime" value={formData.jobEndTime} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Job Date:</label>
                <input type="date" name="jobDate" value={formData.jobDate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Job Location:</label>
                <StandaloneSearchBox
                  onLoad={(ref) => (inputRef.current = ref)}
                  onPlacesChanged={handlePlaceChanged}
                  options={{
                    componentRestrictions: { country: 'in' }
                  }}
                >
                  <input type="text" className="form-control" placeholder="Search" required />
                </StandaloneSearchBox>
              </div>
              <div className="form-group">
                <label>Salary:</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Gender Required:</label>
                <select name="genderRequired" value={formData.genderRequired} onChange={handleInputChange} required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="either">Either</option>
                </select>
              </div>
              <div className="form-group">
                <label>No of Workers Required:</label>
                <input type="number" name="workersRequired" value={formData.workersRequired} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Dress Code:</label>
                <input type="text" name="dressCode" value={formData.dressCode} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Work Description:</label>
                <textarea name="workDescription" value={formData.workDescription} onChange={handleInputChange} required></textarea>
              </div>
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>
        )}
      </div>

      {/* Conditionally render ActionSelect */}
      {showActionSelect && (
        <ActionSelect onClose={() => setShowActionSelect(false)} onTakeAttendance={handleTakeAttendance} />
      )}

      {/* Conditionally render AttendanceQRScanner */}
      {showAttendanceQRScanner && <AttendanceQRScanner onClose={() => setShowAttendanceQRScanner(false)} />}

      {/* Logout Popup */}
      <div className="logout-popup">
        <div className="popup-content">
          <h3>Do you want to Logout ?</h3>
          <div className="button-container">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
            <button className="stay-logged-in-button" onClick={handleStayLoggedIn}>Stay Logged in</button>
          </div>
        </div>
      </div>

    </GoogleMapsProvider>
  );
}

export default Addjob;
