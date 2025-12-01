import React, { useState } from "react";
import { model } from "../../../firebaseConfig";
import { VacationPackage} from "../../../types/vacation";
const DummyPage = () => {
const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPeople, setNumPeople] = useState(2);
  const [budget, setBudget] = useState(2000);
  const [numNights, setNumNights] = useState(4);
  const [packages, setPackages] = useState<VacationPackage[]>([]);

  const searchParams = new URLSearchParams({
    originAirport: "JFK",
    destinationAirport: "CDG",
    people: "2",
    city: "Paris (and vicinity), France",
    startDate: "2025-12-20",
    endDate: "2026-01-02",
    rooms: "1",
  });
 
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/search?${searchParams.toString()}`
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

async function handleGenerate() {
     try {
    const prompt = `
You are a vacation package planner. 
User details:
•⁠  ⁠Number of people: ${2}
•⁠  ⁠Total budget in USD: ${6000}
•⁠  ⁠Desired number of nights from 2025-12-20 to 2026-01-02,

You are given:
•⁠  ⁠A list of hotels (with city, price per night, maxGuests)
•⁠  ⁠A list of flights (from Toronto to destination city, price per person)
•⁠  ⁠A list of attractions (with city and price per person)

Goal:
Create 3-5 vacation packages that fit within the user's total budget.
For each package:
•⁠  ⁠Choose ONE flight route and city.
•⁠  ⁠Choose ONE hotel in that city.
•⁠  ⁠Choose a reasonable number of attractions in that city.
•⁠  ⁠Ensure total cost (flights + hotel + attractions) for all people is <= budget.
•⁠  ⁠Prefer options that balance value and experience.

Assume:
•⁠  ⁠Hotel cost = pricePerNight * numberOfNights.
•⁠  ⁠Total hotel cost = hotel cost for the stay (not per person), but you still need to check overall budget.
•⁠  ⁠Flight cost = pricePerPerson * numPeople.
•⁠  ⁠Attraction cost = pricePerPerson * numPeople for each attraction selected.

Return only structured JSON following the schema, no extra commentary.
Here is the data you MUST base your decision on:

JSON:
${JSON.stringify(response)}
`;

const result = await model.generateContent(
        prompt, 
      );

      // When using responseSchema, Firebase AI Logic returns structured data
      // in result.response
      // Adjust this depending on the exact SDK shape; some builds use result.response.candidates[0].content...
      // Here we assume result.response already matches the schema:
      // result.response.text() will be a JSON string that matches your schema.
      const jsonText = result.response.text();
      const data = JSON.parse(jsonText) as { vacationPackages?: VacationPackage[] };

      console.log(data);

      if (!data || !data.vacationPackages) {
        throw new Error("No vacationPackages field returned from model.");
      }

      setPackages(data.vacationPackages);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while generating packages.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      DummyPage
      <button onClick={fetchData}>Click me</button>
      <br></br>
      <button className="border-black" onClick={handleGenerate}>
        AI Recommendation
      </button>
    </div>
    
  );
};

export default DummyPage;
