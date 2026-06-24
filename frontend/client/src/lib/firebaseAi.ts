import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { vacationResponseSchema } from "../../../schema/vacationResponse";
import { firebaseApp } from "./firebase";

const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

export const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: vacationResponseSchema,
  },
});
