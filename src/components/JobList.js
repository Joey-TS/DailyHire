import React, { useState, useEffect } from 'react';
import './joblist.css';
import { getFirestore, collectionGroup, getDocs, doc, setDoc, collection, updateDoc, getDoc } from 'firebase/firestore';
import { getDistance } from 'geolib';
import { getDatabase, ref, onValue, get as getDatabaseData, update as updateDatabaseData } from 'firebase/database';
import arrowIcon from '../components/arrow-icon.png'; // Update the path as needed
import checkMarkGif from '../components/check-mark.gif'; // Add the path to your check mark GIF

const firestore = getFirestore();
const database = getDatabase();

function formatTime(timeString) {
  try {
    const timeParts = timeString.split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];

    let ampm = 'AM';
    if (hours >= 12) {
      ampm = 'PM';
    }
    if (hours > 12) {
      hours -= 12;
    }

    return `${hours}:${minutes} ${ampm}`;
  } catch (error) {
    console.error(`Error parsing time: ${timeString}`, error);
    return timeString; // Return original string on error
  }
}

function calculateWorkDuration(startTime, endTime) {
  try {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} hours ${minutes} minutes`;
  } catch (error) {
    console.error(`Error calculating work duration`, error);
    return ''; // Return empty string on error
  }
}

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [isSelect, setIsSelect] = useState(localStorage.getItem('isSelect') === 'true');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedJobs, setBookedJobs] = useState(new Set());
  const [isCancelPopup, setIsCancelPopup] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const userLat = parseFloat(localStorage.getItem('mylat'));
      const userLong = parseFloat(localStorage.getItem('mylong'));

      if (!userLat || !userLong) {
        alert('Location is not set. Please set your location first.');
        return;
      }

      setLoading(true);
      setJobs([]);

      const jobCollection = collectionGroup(firestore, 'jobsposted');
      const jobSnapshot = await getDocs(jobCollection);

      const jobList = [];
      const fetchedBookedJobs = new Set();

      for (const docRef of jobSnapshot.docs) {
        const jobData = docRef.data();
        const distance = getDistance(
          { latitude: userLat, longitude: userLong },
          { latitude: jobData.latitude, longitude: jobData.longitude }
        );

        const employerId = jobData.postedby;
        const jobId = docRef.id;
        const jobDataRef = ref(database, `simphon/${employerId}/${jobId}`);

        const jobDataSnapshot = await getDatabaseData(jobDataRef);
        const jobDataRealtime = jobDataSnapshot.val();
        const workersRequired = jobDataRealtime.workersRequired;
        const booked = jobDataRealtime.booked;

        const slotsLeft = workersRequired - booked;

        const workDuration = calculateWorkDuration(jobData.jobStartTime, jobData.jobEndTime);

        jobList.push({
          ...jobData,
          id: docRef.id,
          distance: distance / 1000,
          workDuration: workDuration,
          slotsLeft: slotsLeft // Include slotsLeft in job data
        });

        // Check if job is booked
        const bookedUsersRef = collection(docRef.ref, 'bookedusersdetails');
        const userId = localStorage.getItem('simphon');
        const bookingStatusSnapshot = await getDoc(doc(bookedUsersRef, userId));

        if (bookingStatusSnapshot.exists() && bookingStatusSnapshot.data().bookingstatus === 'booked') {
          fetchedBookedJobs.add(jobId);
        }
      }

      jobList.sort((a, b) => a.distance - b.distance);
      setJobs(jobList);
      setBookedJobs(fetchedBookedJobs);
      setLoading(false);

      // Add real-time listeners for each job
      jobList.forEach(job => {
        const jobDataRef = ref(database, `simphon/${job.postedby}/${job.id}`);

        // Add listener to update the slotsLeft in real-time
        onValue(jobDataRef, (snapshot) => {
          const jobDataRealtime = snapshot.val();
          const workersRequired = jobDataRealtime.workersRequired;
          const booked = jobDataRealtime.booked;
          const slotsLeft = workersRequired - booked;

          setJobs(prevJobs =>
            prevJobs.map(j => j.id === job.id ? { ...j, slotsLeft } : j)
          );
        });
      });
    };

    fetchJobs();

    const handleCustomEvent = () => {
      fetchJobs();
      setIsSelect(localStorage.getItem('isSelect') === 'true');
    };

    window.addEventListener('isSelectChange', handleCustomEvent);

    return () => {
      window.removeEventListener('isSelectChange', handleCustomEvent);
    };
  }, []);

  const handleExpand = (jobId) => {
    setExpandedJobId(jobId === expandedJobId ? null : jobId);
  };

  const handleBookJob = (jobId) => {
    setSelectedJobId(jobId);
    setShowPopup(true);
    setIsCancelPopup(false);
  };

  const handleCancelJob = (jobId) => {
    setSelectedJobId(jobId);
    setShowPopup(true);
    setIsCancelPopup(true);
  };

  const confirmBooking = async () => {
    try {
      const job = jobs.find(job => job.id === selectedJobId);
      if (job) {
        const employerId = job.postedby;
        const jobId = job.id;

        const employerDocRef = doc(firestore, `employer/${employerId}`);
        const jobDocRef = doc(employerDocRef, `jobsposted/${jobId}`);

        const bookedUsersRef = collection(jobDocRef, 'bookedusersdetails');
        const userId = localStorage.getItem('simphon');

        await setDoc(doc(bookedUsersRef, userId), {
          userId: userId,
          bookedAt: new Date(),
          bookingstatus: 'booked' // Initial booking status
        });

        setBookedJobs(prev => new Set(prev.add(selectedJobId)));

        // Increment 'booked' count in Realtime Database
        const jobDataRef = ref(database, `simphon/${employerId}/${jobId}`);
        const jobDataSnapshot = await getDatabaseData(jobDataRef);
        const jobData = jobDataSnapshot.val();
        const newBookedCount = jobData.booked + 1;

        await updateDatabaseData(jobDataRef, { booked: newBookedCount });

        setBookingSuccess(true);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to book the job. Please try again.');
    }
  };

  const cancelBooking = () => {
    setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
    setBookingSuccess(false);
  };

  const confirmCancellation = async () => {
    try {
      const job = jobs.find(job => job.id === selectedJobId);
      if (job) {
        const employerId = job.postedby;
        const jobId = job.id;

        const employerDocRef = doc(firestore, `employer/${employerId}`);
        const jobDocRef = doc(employerDocRef, `jobsposted/${jobId}`);

        const bookedUsersRef = collection(jobDocRef, 'bookedusersdetails');
        const userId = localStorage.getItem('simphon');

        // Update the booking status field instead of deleting the entire document
        await updateDoc(doc(bookedUsersRef, userId), {
          bookingstatus: 'booking cancelled'
        });

        setBookedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedJobId);
          return newSet;
        });

        // Decrement 'booked' count in Realtime Database
        const jobDataRef = ref(database, `simphon/${employerId}/${jobId}`);
        const jobDataSnapshot = await getDatabaseData(jobDataRef);
        const jobData = jobDataSnapshot.val();
        const newBookedCount = jobData.booked > 0 ? jobData.booked - 1 : 0;

        await updateDatabaseData(jobDataRef, { booked: newBookedCount });

        setBookingSuccess(true);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel the booking. Please try again.');
    }
  };

  return (
    <div className="jobsgrouped">
      <div className="jobsshown">
        {loading ? (
          <p>Loading jobs...</p>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="jobblock">
              <h3>{job.jobTitle}</h3>
              <p>Start Time: {formatTime(job.jobStartTime)}</p>
              <p>End Time: {formatTime(job.jobEndTime)}</p>
              <p className="highlight">Work Duration: {job.workDuration}</p>
              <p className="highlight">Salary: ₹ {job.salary}</p>
              <p>Distance: {job.distance.toFixed(2)} Km</p>
              <p className="slots-left">Slots Left: {job.slotsLeft}</p>
              <div className="button-container">
                <button
                  onClick={() => handleExpand(job.id)}
                  className={`expand-button ${expandedJobId === job.id ? 'expanded' : ''}`}
                >
                  <img src={arrowIcon} alt="Toggle details" className="button-icon" />
                </button>
                {bookedJobs.has(job.id) ? (
                  <button
                    onClick={() => handleCancelJob(job.id)}
                    className="book-button"
                  >
                    Cancel Booking
                  </button>
                ) : (
                  <button
                    onClick={() => handleBookJob(job.id)}
                    className="book-button"
                  >
                    Book Now
                  </button>
                )}
              </div>
              {expandedJobId === job.id && (
                <div className="job-details">
                  <p>Company Name: {job.companyName}</p>
                  <p>Job Date: {job.jobDate}</p>
                  <p>Location: {job.jobLocation}</p>
                  <p>Gender Required: {job.genderRequired}</p>
                  <p>Workers Required: {job.workersRequired}</p>
                  <p>Dress Code: {job.dressCode}</p>
                  <p>Work Description: {job.workDescription}</p>
                  {/* Keep 'postedby' for future use */}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            {bookingSuccess ? (
              <div className="success-content">
                <img src={checkMarkGif} alt="Check Mark" className="check-mark" />
                <h2>{isCancelPopup ? 'Your booking has been cancelled.' : 'Congrats! Your job booking is confirmed.'}</h2>
                <button onClick={closePopup} className="close-popup-button">OK</button>
              </div>
            ) : (
              <div className="confirm-content">
                <h2>{isCancelPopup ? 'Confirm Cancellation?' : 'Confirm Booking?'}</h2>
                <p>{isCancelPopup ? '₹25 will be deducted from your future booking as a cancellation fee. Are you sure you want to cancel the booking?' : 'Do you want to book this job?'}</p>
                <div className="popup-buttons">
                  {isCancelPopup ? (
                    <>
                      <button onClick={confirmCancellation} className="confirm-button">Yes</button>
                      <button onClick={cancelBooking} className="cancel-button">No</button>
                    </>
                  ) : (
                    <>
                      <button onClick={confirmBooking} className="confirm-button">Confirm</button>
                      <button onClick={cancelBooking} className="cancel-button">Cancel</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobList;
