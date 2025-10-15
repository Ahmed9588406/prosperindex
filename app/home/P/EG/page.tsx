"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import Image from "next/image";

function CardSlider() {
  const router = useRouter();

  const handleCardClick = (id: number) => {
    // Navigation based on the card clicked
    if (id === 1) {
      router.push("/home/P/EG/City_Product_per_capita");
    } else if (id === 2) {
      router.push("/home/P/EG/Old_Age_Dependency_Ratio");
    } else if (id === 3) {
      router.push("/home/P/EG/Mean_Household_Income");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-4/5 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Internet Access */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(1)}
          >
            <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Image 
                  src="/assets/1999149.png"
                  alt="City Product Icon"
                  className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                />
                </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">City Product per capita</h4>
            </div>
          </div>

          {/* Home Computer Access */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(2)}
          >
            <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Image 
                src="/assets/pensions_policy.webp"
                alt="Pensions Policy Icon"
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 rounded-full"
                />
                </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Old Age Dependency Ratio </h4>
            </div>
          </div>

          {/* Average Broadband Speed */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(3)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Image 
                src="/assets/family-at-house-icon-isolated-illustration-free-vector.jpg"
                alt="Mean Household Income Icon"
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 rounded-full"
                />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Mean Household Income</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSlider;
