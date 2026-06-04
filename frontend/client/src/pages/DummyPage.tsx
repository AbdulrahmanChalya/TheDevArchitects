// DummyPage (/dummy) - a developer test page. The button calls the backend
// search API with hardcoded params and logs the result. Not part of the real
// user flow.
import React, { useState } from "react";
import { model } from "../../../firebaseConfig";
import { VacationPackage } from "../../../types/vacation";
// Dev-only page: one button hits GET /api/search on the Nest backend.
const DummyPage = () => {
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams({
    originAirport: "JFK",
    destinationAirport: "CDG",
    people: "2",
    city: "Paris (and vicinity), France",
    startDate: "2026-06-10",
    endDate: "2026-06-30",
    rooms: "1",
  });

  // Call the backend search endpoint and log whatever comes back.
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/search?${searchParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("RESULT ->", result);
      setResponse(result);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="p-5 text-2xl">Test Page</div>
      <div className="flex justify-evenly items-center">
        {/* GET /api/search with fixed Paris params */}
        <button
          className="rounded-2xl border-2 px-4 py-2 text-white bg-violet-500 hover:bg-violet-600 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700"
          onClick={fetchData}
        >
          Click me
        </button>
        <br />
      </div>
    </div>
  );
};

export default DummyPage;
