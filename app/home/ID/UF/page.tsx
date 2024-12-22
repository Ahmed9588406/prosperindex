"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

function CardSlider() {
  const router = useRouter();

  const handleCardClick = (id: number) => {
    // Navigation based on the card clicked
    if (id === 1) {
      router.push("/home/ID/UF/Street_Intersection_Density");
    } else if (id === 2) {
      router.push("/home/ID/UF/Street_Density");
    } else if (id === 3) {
      router.push("/home/ID/UF/Land_Allocated_to_Streets");
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
              <div className="w-16 h-16 bg-blue-500 text-white text-2xl flex items-center justify-center rounded-full mb-4 shadow-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Street Intersection Density</h4>
            </div>
          </div>

          {/* Home Computer Access */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(2)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-blue-500 text-white text-2xl flex items-center justify-center rounded-full mb-4 shadow-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Street Density</h4>
            </div>
          </div>

          {/* Average Broadband Speed */}
          <div
            className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleCardClick(3)}
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-blue-500 text-white text-2xl flex items-center justify-center rounded-full mb-4 shadow-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Land Allocated to Streets</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSlider;