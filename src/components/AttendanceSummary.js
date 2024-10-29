import React, { useState, useEffect } from 'react';
import { getFirestore, doc, collection, getDocs } from 'firebase/firestore';
import './AttendanceSummary.css'; // Create this CSS file for styling

function AttendanceSummary({ onClose }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const simphon = localStorage.getItem('simphon');
      if (!simphon) {
        console.error('simphon value is not found in local storage');
        return;
      }

      try {
        const attendanceDocRef = doc(db, 'Attendance', simphon);
        const presentCollectionRef = collection(attendanceDocRef, 'present');
        const querySnapshot = await getDocs(presentCollectionRef);

        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendanceData(data);
      } catch (error) {
        console.error('Error fetching attendance data: ', error);
      }
    };

    fetchAttendanceData();
  }, [db]);

  return (
    <div className="attendance-summary-container">
      <h2>Attendance Summary</h2>
      <h3>Present Now 🙋</h3>
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Number</th>
            <th>Time & Date</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.contactnumber}</td>
              <td>{item.Time}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="summary-close" onClick={onClose}>
        Ok
      </button>
    </div>
  );
}

export default AttendanceSummary;
