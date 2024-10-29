import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import './AttendanceQRScanner.css';
import closeIcon from '../components/closewhite round scanner.png';
import { getFirestore, collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

function AttendanceQRScanner({ onClose }) {
  const [scannedData, setScannedData] = useState(null);
  const [scanTimestamp, setScanTimestamp] = useState(null);
  const [workerName, setWorkerName] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Initialize Firestore
  const db = getFirestore();

  // Fetch the 'simphon' value from local storage
  const simphon = localStorage.getItem('simphon');

  useEffect(() => {
    const fetchWorkerName = async () => {
      if (scannedData) {
        try {
          const docRef = doc(db, 'workers', scannedData);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setWorkerName(docSnap.data().name);
            setShowPopup(true);
            // Save attendance details in Firestore
            await saveAttendanceDetails(scannedData, docSnap.data().name, scanTimestamp);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching document: ', error);
        }
      }
    };

    fetchWorkerName();
  }, [scannedData, db, scanTimestamp]);

  const handleScan = async (data) => {
    if (data) {
      setScannedData(data);
      setScanTimestamp(new Date());
    }
  };

  const handleError = (err) => {
    console.error('Error scanning QR Code:', err);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Intl.DateTimeFormat('en-US', options).format(timestamp);
  };

  const handleOkButtonClick = () => {
    setShowPopup(false);
  };

  // Function to save attendance details in Firestore
  const saveAttendanceDetails = async (scannedData, workerName, timestamp) => {
    if (!simphon) {
      console.error('simphon value is not found in local storage');
      return;
    }

    try {
      const docRef = doc(db, 'Attendance', simphon);
      const presentCollection = collection(docRef, 'present');
      await setDoc(doc(presentCollection, scannedData), {
        contactnumber: scannedData,
        name: workerName,
        Time: formatDateTime(timestamp)
      });
      console.log('Attendance details saved successfully!');
    } catch (error) {
      console.error('Error saving attendance details: ', error);
    }
  };

  return (
    <div className="qr-scanner-container">
      <h2>Please scan the QR code right now 🤳 </h2>
      
      <div className="qr-reader-wrapper">
        <QrReader
          onResult={(result, error) => {
            if (result) {
              handleScan(result?.text);
            }
            if (error) {
              handleError(error);
            }
          }}
          constraints={{ facingMode: 'environment' }}
          style={{ width: '100%' }}
        />
      </div>

      {scannedData && (
        <div className="scanned-data">
          {/* Intentionally left empty */}
        </div>
      )}

      {workerName && showPopup && (
        <div className="popupattendance">
          <div className="popup-contentattendance">
            <h2>Attendance Marked 😊</h2>
            <p><strong>Name:</strong> {workerName}</p>
            <p><strong>Contact No :</strong> {scannedData}</p>
            <p><strong>Time:</strong> {formatDateTime(scanTimestamp)}</p>
            <button className="ok-buttonattendance" onClick={handleOkButtonClick}>Ok</button>
          </div>
        </div>
      )}

      <div className="close-qr-code-scanner" onClick={onClose}>
        <img src={closeIcon} alt="Close Icon" />
      </div>
    </div>
  );
}

export default AttendanceQRScanner;
