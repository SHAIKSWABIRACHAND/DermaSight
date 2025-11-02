
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { DermaSightResponse, Role } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface AnalyzeParams {
  imageBase64: string;
  mimeType: string;
  role: Role;
  patientName: string;
  notes: string;
}

export const analyzeSkinCondition = async ({
  imageBase64,
  mimeType,
  role,
  patientName,
  notes,
}: AnalyzeParams): Promise<DermaSightResponse> => {
  try {
    const requestData = {
      role: role,
      patient_name: patientName || 'Anonymous',
      notes: notes,
    };

    const fullPromptText = `${SYSTEM_PROMPT}\n\nHere is the user's request:\n${JSON.stringify(requestData, null, 2)}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: fullPromptText }
        ]
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const resultText = response.text.trim();
    // Sometimes the model wraps the JSON in markdown backticks
    const cleanedJsonText = resultText.replace(/^```json\n|```$/g, '');
    const resultJson = JSON.parse(cleanedJsonText);

    return resultJson as DermaSightResponse;

  } catch (error) {
    console.error("Error analyzing skin condition:", error);
    let errorMessage = "An unknown error occurred during analysis.";
    if (error instanceof Error) {
        errorMessage = `Failed to analyze image: ${error.message}. Please check the console for more details.`;
    }
    throw new Error(errorMessage);
  }
};
