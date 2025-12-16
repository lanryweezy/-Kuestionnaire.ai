import { GoogleGenAI, SchemaParams, Type } from "@google/genai";
import { GeneratedFormResponse, QuestionType } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing. Ensure process.env.API_KEY is set.");
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Map friendly strings to our Enum
const stringToEnum = (str: string): QuestionType => {
  switch (str.toUpperCase()) {
    case 'SHORT_TEXT': return QuestionType.SHORT_TEXT;
    case 'LONG_TEXT': return QuestionType.LONG_TEXT;
    case 'MULTIPLE_CHOICE': return QuestionType.MULTIPLE_CHOICE;
    case 'CHECKBOXES': return QuestionType.CHECKBOXES;
    case 'DROPDOWN': return QuestionType.DROPDOWN;
    case 'RATING': return QuestionType.RATING;
    case 'DATE': return QuestionType.DATE;
    case 'SECTION': return QuestionType.SECTION;
    default: return QuestionType.SHORT_TEXT;
  }
};

export const generateFormStructure = async (prompt: string): Promise<GeneratedFormResponse> => {
  try {
    const ai = getClient();
    
    const schema: SchemaParams = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The title of the form" },
        description: { type: Type.STRING, description: "A short description of the form" },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "The question text, or section title if type is SECTION." },
              type: { 
                type: Type.STRING, 
                enum: ["SHORT_TEXT", "LONG_TEXT", "MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "RATING", "DATE", "SECTION"],
                description: "The type of input. Use SECTION to group questions or add a transition slide."
              },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Options for choice-based questions (optional)" 
              },
              required: { type: Type.BOOLEAN, description: "Is this question mandatory?" }
            },
            required: ["label", "type", "required"]
          }
        }
      },
      required: ["title", "description", "questions"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a form structure for: "${prompt}". Create relevant questions and organize them with Sections if appropriate.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert UX designer creating form schemas. Ensure questions are concise and relevant."
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeneratedFormResponse;
  } catch (error) {
    console.error("Gemini API Error (generateFormStructure):", error);
    throw error;
  }
};

export const refineQuestionText = async (currentText: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite this form question to be more professional, clear, and engaging: "${currentText}". Return ONLY the new question text.`,
    });
    return response.text?.trim() || currentText;
  } catch (error) {
    console.warn("Gemini API Error (refineQuestionText):", error);
    return currentText; // Fallback to original text on error
  }
};

export const validateAnswer = async (question: string, answer: string): Promise<{isValid: boolean, message: string}> => {
  try {
    const ai = getClient();
    const schema: SchemaParams = {
      type: Type.OBJECT,
      properties: {
        isValid: { type: Type.BOOLEAN },
        message: { type: Type.STRING, description: "A short feedback message explaining why it is invalid, or 'Valid' if it is valid." }
      },
      required: ["isValid", "message"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Question: "${question}"\nAnswer: "${answer}"\n\nIs this answer semantically valid and appropriate for the question? Ignore formatting specific unless critical.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return { isValid: true, message: "Valid" };
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error (validateAnswer):", error);
    return { isValid: true, message: "Validation unavailable" };
  }
};

export const generateOptions = async (topic: string): Promise<string[]> => {
  try {
    const ai = getClient();
    
    const schema: SchemaParams = {
      type: Type.OBJECT,
      properties: {
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of relevant options for a dropdown or checkbox list."
        }
      },
      required: ["options"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 10-15 concise and relevant options for a form question regarding: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return [];
    const result = JSON.parse(text);
    return result.options || [];
  } catch (error) {
    console.error("Gemini API Error (generateOptions):", error);
    return [];
  }
};