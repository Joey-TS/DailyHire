import React from 'react';
import './SlidingWindow.css';

function SlidingWindow({ isWindowOpen }) {
  return (
    <div className={`window ${isWindowOpen ? 'open' : 'closed'}`}>
     
    </div>
  );
}

export default SlidingWindow;