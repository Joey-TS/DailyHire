import React, { useEffect, useRef } from 'react';
import './locationbox.css';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { StandaloneSearchBox } from '@react-google-maps/api';

function Locationbox({ highlight, inputRef }) {
  const searchBoxRef = useRef();

  useEffect(() => {
    // Initialize isSelect in local storage if not already set
    if (localStorage.getItem('isSelect') === null) {
      localStorage.setItem('isSelect', 'false');
    }

    if (highlight && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight, inputRef]);

  const handlePlaceChanged = () => {
    const [place] = searchBoxRef.current.getPlaces();
    if (place) {
      const location = place.formatted_address;
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      console.log('Selected location:', location, latitude, longitude);

      // Store latitude and longitude in local storage
      localStorage.setItem('mylat', latitude);
      localStorage.setItem('mylong', longitude);

      // Toggle isSelect value
      const isSelect = localStorage.getItem('isSelect') === 'true' ? 'false' : 'true';
      localStorage.setItem('isSelect', isSelect);

      // Dispatch custom event
      const event = new CustomEvent('locationUpdated', {
        detail: { latitude, longitude },
      });
      window.dispatchEvent(event);
    }
  };

  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          console.log('Current coordinates:', latitude, longitude);

          // Store or replace latitude and longitude in local storage
          localStorage.setItem('mylat', latitude);
          localStorage.setItem('mylong', longitude);

          // Toggle isSelect value
          const isSelect = localStorage.getItem('isSelect') === 'true' ? 'false' : 'true';
          localStorage.setItem('isSelect', isSelect);

          // Dispatch custom event
          const event = new CustomEvent('locationUpdated', {
            detail: { latitude, longitude },
          });
          window.dispatchEvent(event);
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <GoogleMapsProvider>
      <div className={`locationbox ${highlight ? 'highlight' : ''}`}>
        <h2 className='prebox'>Search jobs nearby,</h2>
        <div className='tbb'>
          <StandaloneSearchBox
            onLoad={(ref) => (searchBoxRef.current = ref)}
            onPlacesChanged={handlePlaceChanged}
          >
            <input
              ref={inputRef}
              type='text'
              placeholder='Enter your location'
              className='textbox'
            />
          </StandaloneSearchBox>
          <button className='fetchlocation' onClick={handleFetchLocation}></button>
        </div>
      </div>
      {/* Scrollable frame for JobList */}
     
    </GoogleMapsProvider>
  );
}

export default Locationbox;
