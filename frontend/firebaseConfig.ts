// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { vacationResponseSchema } from "./schema/vacationResponse";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// if (!firebaseConfig.apiKey) {
//   throw new Error(
//     "VITE_API_KEY is missing. Check your .env file in the frontend project root."
//   );
// }

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize the Gemini Developer API backend service
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
export const model = getGenerativeModel(ai, { model: "gemini-2.5-flash", generationConfig: {
    responseMimeType: "application/json",
    responseSchema: vacationResponseSchema,
  },});

// Wrap in an async function so you can use await
