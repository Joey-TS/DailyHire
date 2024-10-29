import React, { useState } from 'react';
import Navbar from './Navbar';
import SlidingWindow from './SlidingWindow';

function ParentComponent() {
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const toggleWindow = () => {
    setIsWindowOpen(prevState => !prevState);
  };

  return (
    <div>
      <Navbar toggleWindow={toggleWindow} />
      <SlidingWindow isWindowOpen={isWindowOpen} />
    </div>
  );
}

export default ParentComponent;