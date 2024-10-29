import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./Userwindow.css";

const firestore = getFirestore();

function Userwindow() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem('simphon');
    const storedUserType = localStorage.getItem('usertype');
    const cachedName = localStorage.getItem('userName'); 

    if (storedPhoneNumber && storedUserType) {
      setPhoneNumber(storedPhoneNumber);

      if (cachedName) {
        
        setUserName(cachedName);
        setIsLoading(false);
      } else {
        
        const fetchUserName = async () => {
          try {
            const collectionName = storedUserType === 'Worker' ? 'workers' : 'employer';
            const userRef = doc(firestore, collectionName, storedPhoneNumber);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const name = userData.name || 'No name found';
              setUserName(name);
              localStorage.setItem('userName', name); 
            } else {
              setUserName('User not found');
            }
          } catch (error) {
            console.error('Error fetching user name from Firestore:', error);
            setUserName('Error retrieving name');
          } finally {
            setIsLoading(false);
          }
        };

        fetchUserName();
      }
    } else {
      setUserName('No user type or phone number available');
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="header">
      <h1>DailyHire.</h1>
      {isLoading ? (
        <h2>Hi...</h2>
      ) : (
        <div className="user-profile">
          <h2 className="slide-in">{userName}</h2>
          <div className="profile-frame">
            <div className="profile-initial">{userName.charAt(0)}</div>
          </div>
        </div>
        
      )}
    </div>
  );
  
}
export default Userwindow;
