let apiKey = "AIzaSyAdtdCtO2Y8uNmhI7kMJG6zLxAAEDAY7G8";

import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({apiKey});

// async function run(prompt) {
//   const model = genAI.getGenerativeModel({
//     model: "gemini-pro", // You can replace with your version if needed
//   });

//   const result = await model.generateContentStream({
//     contents: [{ role: "user", parts: [{ text: prompt }] }],
//   });

//   for await (const chunk of result.stream) {
//     process.stdout.write(chunk.text()); // use console.log(chunk.text()) if not streaming
//   }
// }

async function run_(prompt) {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash", // You can replace with your version if needed
      contents: `You are Ray, a helpful AI assistant. Keep your response very brief (1-2 sentences maximum). Question: ${prompt}`,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

window.run = run_ ;
export default run;
