import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { vacationResponseSchema } from "./schema/vacationResponse";
import { VacationPackage } from "types/vacation";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID,
}; 

let packages: VacationPackage[] = [];
let loading = false;
let error = null;

// if (!firebaseConfig.apiKey) {
//   throw new Error(
//     "VITE_API_KEY is missing. Check your .env file in the frontend project root."
//   );
// }

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize the Gemini Developer API backend service
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
export const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: vacationResponseSchema,
  },
});

export async function handleGenerate(response) {
    try {
      const prompt = `
      You are a vacation package planner. 
      User details:
      •⁠  ⁠Number of people: ${2}
      •⁠  ⁠Total budget in USD: ${6000}

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

      const result = await model.generateContent(prompt);

      // When using responseSchema, Firebase AI Logic returns structured data
      // in result.response
      // Adjust this depending on the exact SDK shape; some builds use result.response.candidates[0].content...
      // Here we assume result.response already matches the schema:
      // result.response.text() will be a JSON string that matches your schema.
      const jsonText = result.response.text();
      const data = JSON.parse(jsonText) as {
        vacationPackages?: VacationPackage[];
      };

      console.log("AI response ->", data);

      if (!data || !data.vacationPackages) {
        throw new Error("No vacationPackages field returned from model.");
      }

      packages = data.vacationPackages;
    } catch (err: any) {
      console.error(err);
      error = err.message || "Something went wrong while generating packages.";
    } finally {
      loading = false;
    }
  }

