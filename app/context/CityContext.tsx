"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CityContextType {
  city: string;
  country: string;
  cityName: string;
  forceNew: boolean;
  setLocation: (city: string, country: string, cityName?: string, forceNew?: boolean) => void;
  clearLocation: () => void;
  isLoaded: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [cityName, setCityName] = useState('');
  const [forceNew, setForceNew] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only access localStorage on the client
    if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('selectedCity');
      const savedCountry = localStorage.getItem('selectedCountry');
      const savedCityName = localStorage.getItem('selectedCityName');
      const savedForceNew = localStorage.getItem('forceNew');
      
      if (savedCity) setCity(savedCity);
      if (savedCountry) setCountry(savedCountry);
      if (savedCityName) setCityName(savedCityName);
      if (savedForceNew) setForceNew(savedForceNew === 'true');
      
      setIsLoaded(true);
    }
  }, []);

  const setLocation = (newCity: string, newCountry: string, newCityName?: string, newForceNew: boolean = false) => {
    setCity(newCity);
    setCountry(newCountry);
    setCityName(newCityName || newCity);
    setForceNew(newForceNew);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCity', newCity);
      localStorage.setItem('selectedCountry', newCountry);
      localStorage.setItem('selectedCityName', newCityName || newCity);
      localStorage.setItem('forceNew', newForceNew.toString());
    }
  };

  const clearLocation = () => {
    setCity('');
    setCountry('');
    setCityName('');
    setForceNew(false);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedCity');
      localStorage.removeItem('selectedCountry');
      localStorage.removeItem('selectedCityName');
      localStorage.removeItem('forceNew');
    }
  };

  return (
    <CityContext.Provider value={{ city, country, cityName, forceNew, setLocation, clearLocation, isLoaded }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
