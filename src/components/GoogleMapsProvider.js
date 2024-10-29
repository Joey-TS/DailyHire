import React, { createContext, useContext } from "react";
import { LoadScriptNext } from "@react-google-maps/api";
import "./Maps.css";

const GoogleMapsContext = createContext();

export const GoogleMapsProvider = ({ children }) => {
  return (
    <LoadScriptNext googleMapsApiKey="googleMapsApiKey" libraries={["places"]}>
      <GoogleMapsContext.Provider value={{ loaded: true }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScriptNext>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
