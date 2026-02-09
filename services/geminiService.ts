import { GoogleGenAI, Schema, Type } from "@google/genai";
import { Question, QuizConfig } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema strictly to ensure reliable JSON
const quizSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "The question text, clear and concise.",
      },
      options: {
        type: Type.ARRAY,
        description: "A list of 4 options. The FIRST option (index 0) MUST be the correct answer.",
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The option text." },
            rationale: { type: Type.STRING, description: "Explanation why this option is correct or incorrect." }
          },
          required: ["text", "rationale"]
        }
      }
    },
    required: ["question", "options"]
  }
};

export const generateQuiz = async (config: QuizConfig): Promise<Question[]> => {
  const modelName = "gemini-2.5-flash"; // Fast and reliable for JSON tasks

  const systemPrompt = `
    ROLE: Expert Educational Technologist & Cognitive Psychologist.
    TASK: Create a multiple-choice quiz based on the provided topic/context.
    GOAL: Maximize retention and engagement. Questions should be challenging but fair.
    
    RULES:
    1. Output strictly as a JSON Array.
    2. The FIRST option (Index 0) in the 'options' array MUST be the CORRECT ANSWER. (The UI will shuffle them).
    3. The other 3 options MUST be plausible distractors.
    4. Provide a 'rationale' for EVERY option (Why it's right or wrong).
    5. Language: Indonesian (Formal but engaging).
    6. Difficulty: ${config.difficulty}.
  `;

  const userPrompt = `
    TOPIC: ${config.topic}
    CONTEXT MATERIAL:
    ${config.content.slice(0, 20000)} -- (Truncated for safety)
    
    Generate ${config.questionCount} questions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.3, // Lower temperature for factual accuracy
      }
    });

    if (response.text) {
      const questions = JSON.parse(response.text) as Question[];
      
      // Post-process: Tag the correct answer before the UI shuffles them
      return questions.map(q => ({
        ...q,
        options: q.options.map((opt, idx) => ({
          ...opt,
          isCorrect: idx === 0 // Based on our prompt rule
        }))
      }));
    }
    
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};