import React, { useState } from "react";

const LocationFetcher = () => {
  const [locationData, setLocationData] = useState(null);

  const handleClick = () => {
    // Google Geolocation API endpoint
    const apiUrl = "Enter API key";

    // Request body for geolocation API
    const requestBody = {
      considerIp: true,
    };

    // Fetch location using Google Geolocation API
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Geolocation data:", data);
        setLocationData(data.location);
      })
      .catch((error) => {
        console.error("Error fetching location:", error);
      });
  };

  return (
    <div>
      <h2>Fetch Current Location</h2>
      <button onClick={handleClick}>Get Location</button>
      {locationData && (
        <div>
          <h3>Latitude: {locationData.lat}</h3>
          <h3>Longitude: {locationData.lng}</h3>
        </div>
      )}
    </div>
  );
};

export default LocationFetcher;
