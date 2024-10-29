import React, { useState } from 'react';
import './ActionSelect.css';
import closeIcon from './close-icon.png';
import AttendanceQRScanner from './AttendanceQRScanner';
import AttendanceSummary from './AttendanceSummary';

function ActionSelect({ onClose, onTakeAttendance }) {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAttendanceSummary, setShowAttendanceSummary] = useState(false);

  const handleTakeAttendance = () => {
    setShowQRScanner(true);
    onTakeAttendance();
  };

  const handleViewAttendanceSummary = () => {
    setShowAttendanceSummary(true);
  };

  return (
    <div className="action-select-container">
      <button className="close-button" onClick={onClose}>
        <img src={closeIcon} alt="Close Icon" />
      </button>
      <button className="action-button" onClick={handleViewAttendanceSummary}>
        View attendance summary
      </button>
      <button className="action-button" onClick={handleTakeAttendance}>
        Take attendance
      </button>

      {showQRScanner && <AttendanceQRScanner onClose={() => setShowQRScanner(false)} />}
      {showAttendanceSummary && (
        <AttendanceSummary onClose={() => setShowAttendanceSummary(false)} />
      )}
    </div>
  );
}

export default ActionSelect;
