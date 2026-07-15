// DummyPage (/dummy) - a developer test page. The button calls the backend
// search API with hardcoded params and logs the result. Not part of the real
// user flow.
import React, { useState } from "react";
import { backendUrl } from "@/lib/backendUrl";

// Dev-only page: one button hits GET /api/search on the Nest backend.
const DummyPage = () => {
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams({
    originAirport: "JFK",
    destinationAirport: "CDG",
    people: "1",
    city: "Paris",
    countryCode: "FR",
    startDate: "2026-07-05",
    endDate: "2026-07-10",
    rooms: "1",
    budgetCad: "6000",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const scrapeResponse = await fetch(backendUrl(`/api/search?${searchParams.toString()}`));

      if (!scrapeResponse.ok) {
        throw new Error(`Scrape request failed: ${scrapeResponse.status}`);
      }

      const scrapedResponse = await scrapeResponse.json();
      console.log("SCRAPED RESULT ->", scrapedResponse);

      const aiResponse = await fetch(backendUrl("/api/ai/vacation-packages"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scrapedResponse,
          query: Object.fromEntries(searchParams.entries()),
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI request failed: ${aiResponse.status}`);
      }

      const result = await aiResponse.json();
      console.log("AI RESULT ->", result);
      setResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setError(error?.message || "Something went wrong.");
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
      {loading && <pre className="mt-5">Loading...</pre>}
      {error && <pre className="mt-5 whitespace-pre-wrap text-red-600">{error}</pre>}
      {response && <pre className="mt-5 whitespace-pre-wrap">{response}</pre>}
    </div>
  );
};

export default DummyPage;
