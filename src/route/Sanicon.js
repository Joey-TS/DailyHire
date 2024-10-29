import React, { useState } from 'react';


function Sanicon() {
  const [isChanged, setIsChanged] = useState(false);

  const toggleChange = () => {
    setIsChanged(!isChanged);
  };

  return (
    <div className={`container ${isChanged ? 'change' : ''}`} onClick={toggleChange}>
      <div className="bar1"></div>
      <div className="bar2"></div>
      <div className="bar3"></div>
    </div>
  );
}

export default Sanicon;
