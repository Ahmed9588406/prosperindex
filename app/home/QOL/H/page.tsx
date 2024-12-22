"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

function CardSlider() {
  const router = useRouter();

  const handleCardClick = (id: number) => {
    // Navigation based on the card clicked
    if (id === 1) {
      router.push("/home/QOL/H/Life_Expectancy_at_Birth");
    } else if (id === 2) {
      router.push("/home/QOL/H/Under_Five_Mortality_Rate");
    } else if (id === 3) {
      router.push("/home/QOL/H/Vaccination_Coverage");
    } else if (id === 4) {
      router.push("/home/QOL/H/Maternal_Mortality");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-4/5 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {/* Life Expectancy at Birth */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(1)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-blue-500 text-white text-2xl flex items-center justify-center rounded-full mb-4 shadow-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Life Expectancy at Birth</h4>
            </div>
          </div>

          {/* Under-Five Mortality Rate */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(2)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-blue-500 text-white text-2xl flex items-center justify-center rounded-full mb-4 shadow-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Under-Five Mortality Rate</h4>
            </div>
          </div>

          {/* Vaccination Coverage */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(3)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-blue-500 text-white text-2xl flex items-center justify-center rounded-full mb-4 shadow-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Vaccination Coverage</h4>
            </div>
          </div>

          {/* Maternal Mortality */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(4)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-blue-500 text-white text-2xl flex items-center justify-center rounded-full mb-4 shadow-lg">
                4
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Maternal Mortality</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSlider;