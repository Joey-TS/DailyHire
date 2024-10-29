import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Addjob from './components/Addjob';
import Home from './route/Home';
import Contact from './route/Contact';
import About from './route/About';
import Project from './route/Project';
import Login from './route/Login';
import Signup from './route/Signup';
import Sanicon from './route/Sanicon';
import Below from './components/Below';
import Locationbox from './components/Locationbox';
import HowItWorks from './components/HowItWorks';
import Userwindow from './components/Userwindow';
import Blurline from './components/Blurline';
import UserJobList from './components/UserJobList';
import UserNavbar from './components/UserNavbar';
import JobList from './components/JobList';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userType, setUserType] = useState(localStorage.getItem('usertype'));
  const [highlightLocationbox, setHighlightLocationbox] = useState(false);
  const locationInputRef = useRef(null); // Ref for the Locationbox input

  const handleSearchClick = () => {
    setHighlightLocationbox(true);
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
    setTimeout(() => {
      setHighlightLocationbox(false);
    }, 2000); // Adjust the duration as needed
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      setUserType(localStorage.getItem('usertype'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginChange = (newLoginStatus) => {
    setIsLoggedIn(newLoginStatus);
    localStorage.setItem('isLoggedIn', newLoginStatus ? 'true' : 'false');
  };

  return (
    <div>
      {isLoggedIn ? <Userwindow /> : null}
      <Routes>
        <Route path="/" element={isLoggedIn ? null : <Home />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/about' element={<About />} />
        <Route path='/project' element={<Project />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/sanicon' element={<Sanicon />} />
      </Routes>
      <Blurline/>
      
      {(isLoggedIn) && (userType === 'Worker') ? <Locationbox highlight={highlightLocationbox} inputRef={locationInputRef}/> : null}
      {(isLoggedIn) && (userType === 'Worker') ? <JobList/> : null}
      {(isLoggedIn) && (userType === 'Worker') ? <UserNavbar onSearchClick={handleSearchClick}/> : null}
      {(isLoggedIn) && (userType === 'Employer') ? <UserJobList/> : null}
      {!isLoggedIn ? <Below /> : null}
      {!isLoggedIn ? <Locationbox /> : null}
      {!isLoggedIn ? <HowItWorks /> : null}
      {(isLoggedIn) && (userType === 'Employer') ? <Addjob />:null}
    </div>
  );
}

export default App;
