"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Globe, ChevronRight, Sparkles, Map, Building2, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCity } from '../context/CityContext';

interface ExistingCity {
  id: string;
  city: string;
  country: string;
  cityName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const router = useRouter();
  const { setLocation, isLoaded } = useCity();
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState({ country: false, city: false });
  const [existingCities, setExistingCities] = useState<ExistingCity[]>([]);
  const [showExisting, setShowExisting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoaded) {
      fetchExistingCities();
    }
  }, [mounted, isLoaded]);

  const fetchExistingCities = async () => {
    try {
      const response = await fetch('/api/calculation-history');
      if (response.ok) {
        const data = await response.json();
        setExistingCities(data);
      }
    } catch (error) {
      console.error('Error fetching existing cities:', error);
    }
  };

  const handleSubmit = (forceNew: boolean = false) => {
    const newErrors = {
      country: country.trim() === '',
      city: city.trim() === ''
    };
    
    setErrors(newErrors);
    
    if (!newErrors.country && !newErrors.city) {
      // Check if city already exists
      const existingCity = existingCities.find(
        c => c.city.toLowerCase() === city.trim().toLowerCase() && 
             c.country.toLowerCase() === country.trim().toLowerCase()
      );

      if (existingCity && !forceNew) {
        // Show confirmation dialog
        const continueExisting = window.confirm(
          `You already have calculations for ${city}, ${country}. Do you want to continue with existing data?\n\nClick OK to continue, or Cancel to start fresh.`
        );
        
        if (continueExisting) {
          setLocation(existingCity.city, existingCity.country, existingCity.cityName);
          router.push('/home');
        } else {
          handleSubmit(true); // Start fresh
        }
      } else {
        setLocation(city.trim(), country.trim(), `${city.trim()}, ${country.trim()}`, forceNew);
        router.push('/home');
      }
    }
  };

  const loadExistingCity = (existingCity: ExistingCity) => {
    const displayName = existingCity.cityName || `${existingCity.city}, ${existingCity.country}`;
    setLocation(existingCity.city, existingCity.country, displayName, false);
    router.push('/home');
  };

  const popularDestinations = [
    { country: 'Egypt', city: 'Cairo' },
    { country: 'Egypt', city: 'Alexandria' },
    { country: 'Egypt', city: 'Giza' },
    { country: 'Egypt', city: 'Sharm El Sheikh' },
    { country: 'Egypt', city: 'Luxor' },
    { country: 'Egypt', city: 'Hurghada' }
  ];

  interface Destination {
    country: string;
    city: string;
  }

  const fillDestination = (destination: Destination): void => {
    setCountry(destination.country);
    setCity(destination.city);
    setErrors({ country: false, city: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 sm:mb-6">
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Where to?
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-xl mx-auto px-4">
            Tell us your dream destination and let&apos;s start your journey
          </p>
        </div>

        {/* Existing Cities Button */}
        {existingCities.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowExisting(!showExisting)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 text-white flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-purple-400" />
                <span className="font-medium">Your Saved Cities ({existingCities.length})</span>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${showExisting ? 'rotate-90' : ''}`} />
            </button>
            
            {showExisting && (
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {existingCities.map((existingCity) => (
                  <button
                    key={existingCity.id}
                    onClick={() => loadExistingCity(existingCity)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg p-3 text-left transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium group-hover:text-purple-300 transition">
                          {existingCity.city}
                        </div>
                        <div className="text-gray-400 text-sm">{existingCity.country}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last updated: {existingCity.updatedAt ? formatDate(existingCity.updatedAt) : 'N/A'}
                        </div>
                      </div>
                      <MapPin className="w-5 h-5 text-purple-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="space-y-6">
            {/* Country Input */}
            <div>
              <label className="flex items-center text-white text-sm sm:text-base font-medium mb-3">
                <Map className="w-5 h-5 mr-2 text-purple-400" />
                Country
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setErrors({ ...errors, country: false });
                  }}
                  placeholder="e.g., France, Japan, Italy..."
                  className={`w-full bg-white/5 border ${
                    errors.country ? 'border-red-500' : 'border-white/20'
                  } rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition text-base sm:text-lg`}
                />
                {errors.country && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 ml-1">Please enter a country</p>
                )}
              </div>
            </div>

            {/* City Input */}
            <div>
              <label className="flex items-center text-white text-sm sm:text-base font-medium mb-3">
                <Building2 className="w-5 h-5 mr-2 text-pink-400" />
                City
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setErrors({ ...errors, city: false });
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit();
                    }
                  }}
                  placeholder="e.g., Paris, Tokyo, New York..."
                  className={`w-full bg-white/5 border ${
                    errors.city ? 'border-red-500' : 'border-white/20'
                  } rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition text-base sm:text-lg`}
                />
                {errors.city && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 ml-1">Please enter a city</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleSubmit()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 sm:py-5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-2xl hover:scale-105 text-base sm:text-lg"
            >
              <span>Continue Your Journey</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6 sm:my-8">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-gray-400 text-xs sm:text-sm">or choose popular</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Popular Destinations */}
          <div className="space-y-3">
            <div className="flex items-center text-white text-xs sm:text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              Popular Destinations
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popularDestinations.map((dest, index) => (
                <button
                  key={index}
                  onClick={() => fillDestination(dest)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl p-3 sm:p-4 text-left transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium text-sm sm:text-base group-hover:text-purple-300 transition">
                        {dest.city}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm mt-0.5">{dest.country}</div>
                    </div>
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-400 text-xs sm:text-sm">
            Can&apos;t decide? We&apos;ll help you discover the perfect destination
          </p>
        </div>
      </div>
    </div>
  );
}