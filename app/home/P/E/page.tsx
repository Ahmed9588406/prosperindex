"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import Image from "next/image";

function CardSlider() {
  const router = useRouter();

  const handleCardClick = (id: number) => {
    // Navigation based on the card clicked
    if (id === 1) {
      router.push("/home/P/E/Unemployment_Rate");
    } else if (id === 2) {
      router.push("/home/P/E/Employment_to_Population_Ratio");
    } else if (id === 3) {
      router.push("/home/P/E/Informal_Employment");
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
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Image 
                  src="/assets/pngtree-unemployment-rate-rgb-color-icon-element-logotype-lineart-vector-png-image_10385249.png"
                  alt="Unemployment Rate Icon"
                  className="w-full h-full object-cover rounded-full shadow-lg"
                />
                </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Unemployment Rate</h4>
            </div>
          </div>

          {/* Waste Water Treatment */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(2)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Image 
                src="/assets/businessmen-on-top-of-columns-of-chart-EK842J.jpg"
                alt="Employment Population Ratio Icon"
                className="w-full h-full object-cover rounded-full shadow-lg"
                />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Employment to Population Ratio</h4>
            </div>
          </div>

          {/* Solid Waste Recycling Share */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(3)}
          >
            <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Image 
                  src="/assets/png-clipart-career-development-job-application-for-employment-business-career-miscellaneous-trademark.png"
                  alt="Informal Employment Icon"
                  className="w-full h-full object-cover rounded-full shadow-lg"
                />
                </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Informal Employment</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSlider;