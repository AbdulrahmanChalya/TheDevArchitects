import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import type { GenerativeModel } from "firebase/ai";
import { vacationResponseSchema } from "./schema/vacationResponse";
import { VacationPackage } from "types/vacation";

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.VITE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID || process.env.FIREBASE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
};

let packages: VacationPackage[] = [];
let loading = false;
let error: string | null = null;

let model: GenerativeModel | null = null;

function getModel(): GenerativeModel | null {
  if (!firebaseConfig.apiKey) {
    return null;
  }

  if (!model) {
    const firebaseApp = initializeApp(firebaseConfig);
    const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
    model = getGenerativeModel(ai, {
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: vacationResponseSchema,
      },
    });
  }

  return model;
}

export async function handleGenerate(response: unknown) {
  const generativeModel = getModel();
  if (!generativeModel) {
    console.warn("Skipping AI package generation: Firebase API key is not configured.");
    return;
  }

  loading = true;
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

    const result = await generativeModel.generateContent(prompt);
    const jsonText = result.response.text();
    const data = JSON.parse(jsonText) as {
      vacationPackages?: VacationPackage[];
    };

    console.log("AI response ->", data);

    if (!data?.vacationPackages) {
      throw new Error("No vacationPackages field returned from model.");
    }

    packages = data.vacationPackages;
  } catch (err: unknown) {
    console.error(err);
    error =
      err instanceof Error
        ? err.message
        : "Something went wrong while generating packages.";
  } finally {
    loading = false;
  }
}
