import React, { useEffect, useState, useRef } from 'react';
import './UserJobList.css';
import { getFirestore, doc, collection, getDocs, updateDoc } from 'firebase/firestore';
import closeIcon from '../components/closewhite round.png';
import { StandaloneSearchBox, LoadScript } from "@react-google-maps/api";
import blackClose from '../components/blackclose.png';
import { GoogleMapsProvider, useGoogleMaps } from './GoogleMapsProvider';

const firestore = getFirestore();

function Popup({ message, onClose }) {
  return (
    <div className="popup-backdrop">
      <div className="popup">
        <p>{message}</p>
        <button onClick={onClose} className="ok-button">OK</button>
      </div>
    </div>
  );
}

function UserJobList() {
  const [jobs, setJobs] = useState([]);
  const [showJobFrame, setShowJobFrame] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobStartTime: '',
    jobEndTime: '',
    jobDate: '',
    jobLocation: '',
    salary: '',
    genderRequired: 'male',
    workersRequired: '',
    dressCode: '',
    workDescription: ''
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const inputRef = useRef(null);

  const convertTo12HourFormat = (time) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const adjustedHour = hourNum % 12 || 12;
    return `${adjustedHour}:${minute} ${period}`;
  };

  useEffect(() => {
    const fetchJobs = async () => {
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

        const jobsData = jobDocs.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(job => job.status === null);

        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  const handleEdit = (jobId) => {
    const job = jobs.find(job => job.id === jobId);
    if (job) {
      setFormData({
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        jobStartTime: job.jobStartTime,
        jobEndTime: job.jobEndTime,
        jobDate: job.jobDate,
        jobLocation: job.jobLocation,
        salary: job.salary,
        genderRequired: job.genderRequired,
        workersRequired: job.workersRequired,
        dressCode: job.dressCode,
        workDescription: job.workDescription
      });
      setJobToDelete(jobId); 
      setShowEditForm(true);
      setShowJobFrame(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePlaceChanged = () => {
    const [place] = inputRef.current.getPlaces();
    if (place) {
      const location = place.formatted_address;
      setFormData(prevState => ({
        ...prevState,
        jobLocation: location
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const userType = localStorage.getItem('usertype');
      const phoneNumber = localStorage.getItem('simphon');
      const collectionName = userType === 'Worker' ? 'workers' : 'employer';
      const userDocRef = doc(firestore, collectionName, phoneNumber);
      const jobDocRef = doc(userDocRef, 'jobsposted', jobToDelete);

      await updateDoc(jobDocRef, {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        jobStartTime: formData.jobStartTime,
        jobEndTime: formData.jobEndTime,
        jobDate: formData.jobDate,
        jobLocation: formData.jobLocation,
        salary: formData.salary,
        genderRequired: formData.genderRequired,
        workersRequired: formData.workersRequired,
        dressCode: formData.dressCode,
        workDescription: formData.workDescription
      });

      // Update local state with the new job data
      setJobs(prevJobs => prevJobs.map(job =>
        job.id === jobToDelete ? { id: jobToDelete, ...formData } : job
      ));

      // Show success popup
      setPopupMessage(`${formData.jobTitle} Job updated successfully`);
      setShowPopup(true);

      console.log(`Updated job with ID: ${jobToDelete}`);
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setShowEditForm(false);
      setFormData({
        jobTitle: '',
        companyName: '',
        jobStartTime: '',
        jobEndTime: '',
        jobDate: '',
        jobLocation: '',
        salary: '',
        genderRequired: 'male',
        workersRequired: '',
        dressCode: '',
        workDescription: ''
      });
      setJobToDelete(null);
    }
  };

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const userType = localStorage.getItem('usertype');
      const phoneNumber = localStorage.getItem('simphon');
      const collectionName = userType === 'Worker' ? 'workers' : 'employer';
      const userDocRef = doc(firestore, collectionName, phoneNumber);
      const jobDocRef = doc(userDocRef, 'jobsposted', jobToDelete);

      await updateDoc(jobDocRef, { status: 'inactive' });

      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobToDelete));

      console.log(`Deleted job with ID: ${jobToDelete}`);
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setShowModal(false);
      setJobToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setJobToDelete(null);
  };

  const startPulling = () => {
    setIsPulling(true);
  };

  const endPulling = () => {
    if (isPulling) {
      setShowJobFrame(true);
    }
    setIsPulling(false);
  };

  return (
    <div>
      {!(showJobFrame || showEditForm) && (
        <div
          className={`slide-button ${showEditForm ? 'hidden' : ''}`}
          onMouseDown={startPulling}
          onMouseUp={endPulling}
        >
          <span>&gt;&gt;</span>
        </div>
      )}
      {!showEditForm && (
        <div className={`job-frame ${showJobFrame ? 'loaded' : ''}`}>
          <h2 className="frame-title">
            <button className="close-button" onClick={() => setShowJobFrame(false)}>
              <img src={closeIcon} alt="Close Icon" />
            </button>
            Jobs from you...
          </h2>
          <div className="job-list">
            {jobs.length === 0 ? (
              <p className="no-jobs-message">No jobs posted yet</p>
            ) : (
              jobs.map(job => (
                <div className="job-card" key={job.id}>
                  <h3 className="job-title">{job.jobTitle}</h3>
                  <p className="job-detail">
                    <strong>Job Date:</strong> {job.jobDate}
                  </p>
                  <p className="job-detail">
                    <strong>Start Time:</strong> {convertTo12HourFormat(job.jobStartTime)}
                  </p>
                  <p className="job-detail">
                    <strong>End Time:</strong> {convertTo12HourFormat(job.jobEndTime)}
                  </p>
                  <p className="job-detail">
                    <strong>Location:</strong> {job.jobLocation}
                  </p>
                  <p className="job-detail">
                    <strong>Required Workers :</strong> {/* */}
                  </p>
                  <p className="job-detail">
                    <strong>Number of booking :</strong>{/* */}
                  </p>
                  <div className="button-container">
                    <button className="edit-button" onClick={() => handleEdit(job.id)}></button>
                    <button className="delete-button" onClick={() => handleDeleteClick(job.id)}></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <p className="modal-message">Are you sure, do you want to delete this job from your feed?</p>
            <div className="modal-buttons">
              <button className="modal-button confirm-button" onClick={handleConfirmDelete}>Confirm</button>
              <button className="modal-button cancel-button" onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showEditForm && (
        <>
          <div className="form-backdrop"></div>
          <form onSubmit={handleFormSubmit} className="custom-job-form">
            <div className="form-header">
              Edit Job...
              <div className="close-button" onClick={() => setShowEditForm(false)}>
                <img src={blackClose} alt="Close Icon" />
              </div>
            </div>
            <div className="custom-form-group">
              <label>Job Title:</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} required />
            </div>
            <div className="custom-form-group">
              <label>Company Name:</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
            </div>
            <div className="custom-form-group">
              <label>Job Start Time:</label>
              <input type="time" name="jobStartTime" value={formData.jobStartTime} onChange={handleInputChange} required />
            </div>
            <div className="custom-form-group">
              <label>Job End Time:</label>
              <input type="time" name="jobEndTime" value={formData.jobEndTime} onChange={handleInputChange} required />
            </div>
            <div className="custom-form-group">
              <label>Job Date:</label>
              <input type="date" name="jobDate" value={formData.jobDate} onChange={handleInputChange} required />
            </div>
            <div className="custom-form-group">
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
            <div className="custom-form-group">
              <label>Salary:</label>
              <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} required />
            </div>
            <div className="custom-form-group">
              <label>Gender Required:</label>
              <select name="genderRequired" value={formData.genderRequired} onChange={handleInputChange} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="either">Either</option>
              </select>
            </div>
            <div className="custom-form-group">
              <label>No of Workers Required:</label>
              <input type="number" name="workersRequired" value={formData.workersRequired} onChange={handleInputChange} required />
            </div>
            <div className="custom-form-group">
              <label>Dress Code:</label>
              <input type="text" name="dressCode" value={formData.dressCode} onChange={handleInputChange} required />
            </div>
            <div className="custom-form-group">
              <label>Work Description:</label>
              <textarea name="workDescription" value={formData.workDescription} onChange={handleInputChange} required></textarea>
            </div>
            <button type="submit" className="submit-button">Submit</button>
          </form>
        </>
      )}
      {showPopup && (
        <Popup message={popupMessage} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default UserJobList;
