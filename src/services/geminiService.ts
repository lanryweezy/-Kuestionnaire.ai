import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeneratedFormResponse, QuestionType, AnalysisReport } from "../types";

// Initialize the Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
// Use gemini-1.5-flash as the primary model
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

// Smart form generation templates based on common use cases (Fallback)
const FORM_TEMPLATES = {
  survey: {
    title: "Customer Satisfaction Survey",
    description: "Help us improve our services with your feedback",
    questions: [
      { label: "Overall Experience", type: "RATING", required: true },
      { label: "What did you like most?", type: "LONG_TEXT", required: false },
      { label: "Areas for improvement", type: "CHECKBOXES", required: false, options: ["Speed", "Quality", "Support", "Pricing", "Features"] }
    ]
  },
  feedback: {
    title: "Product Feedback Form",
    description: "Share your thoughts about our product",
    questions: [
      { label: "Product Category", type: "DROPDOWN", required: true, options: ["Software", "Hardware", "Service", "Other"] },
      { label: "Rating", type: "RATING", required: true },
      { label: "Comments", type: "LONG_TEXT", required: false }
    ]
  },
  registration: {
    title: "Event Registration",
    description: "Register for our upcoming event",
    questions: [
      { label: "Full Name", type: "SHORT_TEXT", required: true },
      { label: "Email Address", type: "SHORT_TEXT", required: true },
      { label: "Dietary Restrictions", type: "CHECKBOXES", required: false, options: ["Vegetarian", "Vegan", "Gluten-free", "None"] },
      { label: "Event Date", type: "DATE", required: true }
    ]
  },
  contact: {
    title: "Contact Us",
    description: "Get in touch with our team",
    questions: [
      { label: "Name", type: "SHORT_TEXT", required: true },
      { label: "Email", type: "SHORT_TEXT", required: true },
      { label: "Subject", type: "DROPDOWN", required: true, options: ["General Inquiry", "Support", "Sales", "Partnership"] },
      { label: "Message", type: "LONG_TEXT", required: true }
    ]
  },
  jobApplication: {
    title: "Job Application",
    description: "Apply for a position with our company",
    questions: [
      { label: "Full Name", type: "SHORT_TEXT", required: true },
      { label: "Email Address", type: "SHORT_TEXT", required: true },
      { label: "Phone Number", type: "SHORT_TEXT", required: true },
      { label: "Position Applied For", type: "SHORT_TEXT", required: true },
      { label: "Years of Experience", type: "SHORT_TEXT", required: false },
      { label: "Why do you want to join us?", type: "LONG_TEXT", required: true }
    ]
  }
};

export const generateFormStructure = async (prompt: string): Promise<GeneratedFormResponse> => {
  if (!model) {
    console.warn("Gemini API key not found, using template fallback");
    return generateFallbackForm(prompt);
  }

  try {
    const aiPrompt = `
      Create a form structure based on this prompt: "${prompt}".
      Return ONLY a JSON object with this exact structure:
      {
        "title": "Short Form Title",
        "description": "Brief description",
        "questions": [
          {
            "label": "Question Label",
            "type": "SHORT_TEXT" | "LONG_TEXT" | "MULTIPLE_CHOICE" | "CHECKBOXES" | "DROPDOWN" | "RATING" | "DATE",
            "required": boolean,
            "options": ["Option 1", "Option 2"] (only for choice types)
          }
        ]
      }
    `;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean potential markdown code blocks
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return generateFallbackForm(prompt);
  }
};

const generateFallbackForm = (prompt: string): GeneratedFormResponse => {
  const lowerPrompt = prompt.toLowerCase();
  let templateKey: keyof typeof FORM_TEMPLATES = 'feedback';

  if (lowerPrompt.includes('survey') || lowerPrompt.includes('satisfaction')) templateKey = 'survey';
  else if (lowerPrompt.includes('register') || lowerPrompt.includes('event')) templateKey = 'registration';
  else if (lowerPrompt.includes('contact')) templateKey = 'contact';
  else if (lowerPrompt.includes('job') || lowerPrompt.includes('application')) templateKey = 'jobApplication';

  const template = FORM_TEMPLATES[templateKey];
  return {
    title: template.title,
    description: template.description,
    questions: template.questions.map(q => ({
      label: q.label,
      type: q.type,
      required: q.required,
      options: q.options || undefined
    }))
  };
};

export const refineQuestionText = async (currentText: string): Promise<string> => {
  if (!model) return currentText;

  try {
    const prompt = `Refine this form question for clarity and professionalism. Return ONLY the refined text: "${currentText}"`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return currentText;
  }
};

export const validateAnswer = async (question: string, answer: string): Promise<{ isValid: boolean, message: string }> => {
  // Simple validation for basic types
  if (!answer || answer.trim().length === 0) {
    return { isValid: false, message: "This field is required" };
  }

  if (question.toLowerCase().includes('email')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(answer)) return { isValid: false, message: "Invalid email format" };
  }

  return { isValid: true, message: "Valid" };
};

export const generateOptions = async (topic: string): Promise<string[]> => {
  if (!model) return [`${topic} Option 1`, `${topic} Option 2`, "Other"];

  try {
    const prompt = `Generate 5 relevant options for a form question about "${topic}". Return ONLY a comma-separated list.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.split(',').map(s => s.trim());
  } catch {
    return [`${topic} Option 1`, `${topic} Option 2`, "Other"];
  }
};

export const generateAnalysisReport = async (form: any, submissions: any[]): Promise<AnalysisReport> => {
  if (submissions.length === 0) throw new Error("No data");

  if (!model) return generateHeuristicReport(form, submissions);

  try {
    const dataSummary = submissions.map(s => JSON.stringify(s.answers)).join("\n");
    const prompt = `
      Analyze these ${submissions.length} responses for the form "${form.title}".
      Data: ${dataSummary}
      
      Return ONLY a JSON object:
      {
        "summary": "Brief executive summary",
        "insights": [
          {"type": "positive" | "negative" | "trend", "text": "Insight description"}
        ],
        "recommendations": ["Action item 1", "Action item 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return generateHeuristicReport(form, submissions);
  }
};

const generateHeuristicReport = (form: any, submissions: any[]): AnalysisReport => {
  return {
    summary: `Heuristic analysis of ${submissions.length} responses for "${form.title}".`,
    insights: [{ type: 'trend', text: "Data shows consistent engagement across all modules." }],
    recommendations: ["Continue collecting data to reach statistical significance."]
  };
};
