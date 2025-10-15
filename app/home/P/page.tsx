"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import Image from "next/image";

function CardSlider() {
  const router = useRouter();

  const handleCardClick = (id: number) => {
    // Navigation based on the card clicked
    if (id === 1) {
      router.push("/home/P/EG");
    } else if (id === 2) {
      router.push("/home/P/EA");
    } else if (id === 3) {
      router.push("/home/P/E");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-4/5 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Solid Waste Collection */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(1)}
          >
            <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full p-3 mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:bg-blue-200">
                  <Image 
                  src="/assets/economic_strength.png" 
                  alt="Economic Strength" 
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Economic Strength</h4>
            </div>
          </div>

          {/* Waste Water Treatment */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(2)}
          >
            <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full p-3 mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:bg-blue-200">
                <Image 
                src="/assets/economic_aggregation.png" 
                alt="Economic Agglomeration" 
                className="w-full h-full object-contain rounded-full filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                />
                </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Economic Agglomeration</h4>
            </div>
          </div>

          {/* Solid Waste Recycling Share */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(3)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full p-3 mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:bg-blue-200">
                <Image 
                src="/assets/Employment-Logo-PNG-HD-Quality.png" 
                alt="Employment" 
                className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Employment</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSlider;
