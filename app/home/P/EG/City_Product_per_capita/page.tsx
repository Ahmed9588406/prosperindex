"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const CityProductPerCapitaPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [nationalProduct, setNationalProduct] = useState<number[]>(Array(7).fill(0));
  const [nationalEmployment, setNationalEmployment] = useState<number[]>(Array(7).fill(0));
  const [cityEmployment, setCityEmployment] = useState<number[]>(Array(7).fill(0));
  const [cityPopulation, setCityPopulation] = useState<number>(0);
  const [pppExchangeRate, setPppExchangeRate] = useState<number>(1);
  const [cityProductPerCapita, setCityProductPerCapita] = useState<number | null>(null);
  const [standardizedValue, setStandardizedValue] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const sectors = [
    'Agriculture and mining',
    'Manufacturing, utilities, construction',
    'Wholesale and retail trade, transport and communication',
    'Finance, insurance, real estate and business services',
    'Community, personal and other services',
    'Government',
    'Other',
  ];

  // Add getComment function for evaluation
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNationalProduct = localStorage.getItem("nationalProduct");
      const savedNationalEmployment = localStorage.getItem("nationalEmployment");
      const savedCityEmployment = localStorage.getItem("cityEmployment");
      const savedCityPopulation = localStorage.getItem("cityPopulation");
      const savedPppExchangeRate = localStorage.getItem("pppExchangeRate");

      if (savedNationalProduct) setNationalProduct(JSON.parse(savedNationalProduct));
      if (savedNationalEmployment) setNationalEmployment(JSON.parse(savedNationalEmployment));
      if (savedCityEmployment) setCityEmployment(JSON.parse(savedCityEmployment));
      if (savedCityPopulation) setCityPopulation(parseFloat(savedCityPopulation));
      if (savedPppExchangeRate) setPppExchangeRate(parseFloat(savedPppExchangeRate));
    }
  }, []);

  const calculateAndSave = async () => {
    if (!isLoaded || !user) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    if (cityPopulation <= 0) {
      toast.error("City population must be greater than zero.");
      return;
    }
    let totalCityProduct = 0;
    for (let i = 0; i < sectors.length; i++) {
      if (nationalEmployment[i] <= 0) {
        toast.error(`National employment for sector "${sectors[i]}" must be greater than zero.`);
        return;
      }
      const employmentRatio = cityEmployment[i] / nationalEmployment[i];
      const citySectorProduct = nationalProduct[i] * employmentRatio;
      totalCityProduct += citySectorProduct;
    }
    const cityProductPerCapitaValue = (totalCityProduct / cityPopulation) * pppExchangeRate;
    setCityProductPerCapita(cityProductPerCapitaValue);

    // Standardization
    const min = 714.64;
    const max = 108818.96;
    const lnCityProduct = Math.log(cityProductPerCapitaValue);
    const lnMin = Math.log(min);
    const lnMax = Math.log(max);
    let standardizedValue = 0;
    if (lnCityProduct >= 11.60) {
      standardizedValue = 100;
    } else if (lnCityProduct > 6.57 && lnCityProduct < 11.60) {
      standardizedValue = ((lnCityProduct - lnMin) / (lnMax - lnMin)) * 100;
    } else if (lnCityProduct <= 6.57) {
      standardizedValue = 0;
    }
    setStandardizedValue(standardizedValue);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedValue);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      city_product_per_capita: cityProductPerCapitaValue,
      city_product_per_capita_comment: evaluationComment,
      userId: user.id,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/calculation-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Result:', result);
      toast.success("Data calculated and saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving data:', errorMessage);
      toast.error("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">City Product Per Capita Calculator</h1>

      {/* Display selected city and country */}
      {city && country && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">Calculating for:</p>
          <p className="text-lg font-semibold text-blue-800">
            {cityName || `${city}, ${country}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            City: {city} | Country: {country}
          </p>
        </div>
      )}

      {!city || (!country && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select a city from the cities page first
          </p>
        </div>
      ))}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Input Data</h2>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Sector</th>
              <th className="border border-gray-300 p-2">National Product</th>
              <th className="border border-gray-300 p-2">National Employment</th>
              <th className="border border-gray-300 p-2">City Employment</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map((sector, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{sector}</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={nationalProduct[index]}
                    onChange={(e) => {
                      const newNationalProduct = [...nationalProduct];
                      newNationalProduct[index] = parseFloat(e.target.value);
                      setNationalProduct(newNationalProduct);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("nationalProduct", JSON.stringify(newNationalProduct));
                      }
                    }}
                    className="border rounded w-full p-1"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={nationalEmployment[index]}
                    onChange={(e) => {
                      const newNationalEmployment = [...nationalEmployment];
                      newNationalEmployment[index] = parseFloat(e.target.value);
                      setNationalEmployment(newNationalEmployment);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("nationalEmployment", JSON.stringify(newNationalEmployment));
                      }
                    }}
                    className="border rounded w-full p-1"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={cityEmployment[index]}
                    onChange={(e) => {
                      const newCityEmployment = [...cityEmployment];
                      newCityEmployment[index] = parseFloat(e.target.value);
                      setCityEmployment(newCityEmployment);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("cityEmployment", JSON.stringify(newCityEmployment));
                      }
                    }}
                    className="border rounded w-full p-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-semibold">
          City Population:
          <input
            type="number"
            value={cityPopulation}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setCityPopulation(value);
              if (typeof window !== "undefined") {
                localStorage.setItem("cityPopulation", value.toString());
              }
            }}
            className="border rounded p-2 w-full"
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-semibold">
          PPP Exchange Rate:
          <input
            type="number"
            value={pppExchangeRate}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setPppExchangeRate(value);
              if (typeof window !== "undefined") {
                localStorage.setItem("pppExchangeRate", value.toString());
              }
            }}
            className="border rounded p-2 w-full"
          />
        </label>
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate City Product Per Capita'}
      </button>
      {cityProductPerCapita !== null && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Results</h2>
          <p className="text-lg">
            <strong>City Product Per Capita:</strong> {cityProductPerCapita.toFixed(2)} US$ (2011 PPP)
          </p>
          <p className="text-lg">
            <strong>Standardized Value:</strong> {standardizedValue?.toFixed(2)}
          </p>
          {decision && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                decision === "VERY SOLID"
                  ? "bg-green-500"
                  : decision === "SOLID"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {decision}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CityProductPerCapitaPage;