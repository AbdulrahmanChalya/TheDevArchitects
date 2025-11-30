import React, { useState } from "react";
import { model } from "../../../firebaseConfig";

const DummyPage = () => {
  const [prompt, setPrompt] = useState("Write a short poem about stars.");
  const [response, setResponse] = useState("");

  async function handleGenerate() {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(text);
      setResponse(text);
    } catch (error) {
      console.error("Gemini Error:", error);
    }
  }
  return (
    <div>
      DummyPage
      <button onClick={handleGenerate}>Click me</button>
    </div>
  );
};

export default DummyPage;
