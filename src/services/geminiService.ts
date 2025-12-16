import { GeneratedFormResponse, QuestionType } from "../types";

// Smart form generation templates based on common use cases
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
  }
};

// Intelligent form generation based on prompt analysis
const analyzePrompt = (prompt: string): keyof typeof FORM_TEMPLATES => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('survey') || lowerPrompt.includes('satisfaction') || lowerPrompt.includes('feedback')) {
    return 'survey';
  }
  if (lowerPrompt.includes('register') || lowerPrompt.includes('signup') || lowerPrompt.includes('event')) {
    return 'registration';
  }
  if (lowerPrompt.includes('contact') || lowerPrompt.includes('support') || lowerPrompt.includes('help')) {
    return 'contact';
  }
  return 'feedback'; // Default fallback
};

// Generate contextual questions based on prompt keywords
const generateContextualQuestions = (prompt: string) => {
  const questions = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // Add section header if complex form
  if (prompt.length > 50) {
    questions.push({
      label: "Getting Started",
      type: "SECTION",
      required: false
    });
  }
  
  // Basic info questions
  if (lowerPrompt.includes('name') || lowerPrompt.includes('personal')) {
    questions.push({
      label: "Full Name",
      type: "SHORT_TEXT",
      required: true
    });
  }
  
  if (lowerPrompt.includes('email') || lowerPrompt.includes('contact')) {
    questions.push({
      label: "Email Address",
      type: "SHORT_TEXT",
      required: true
    });
  }
  
  // Rating questions
  if (lowerPrompt.includes('rate') || lowerPrompt.includes('score') || lowerPrompt.includes('satisfaction')) {
    questions.push({
      label: "Overall Rating",
      type: "RATING",
      required: true
    });
  }
  
  // Choice questions
  if (lowerPrompt.includes('prefer') || lowerPrompt.includes('choose') || lowerPrompt.includes('select')) {
    questions.push({
      label: "Your Preference",
      type: "MULTIPLE_CHOICE",
      required: true,
      options: ["Option A", "Option B", "Option C", "Other"]
    });
  }
  
  // Date questions
  if (lowerPrompt.includes('date') || lowerPrompt.includes('when') || lowerPrompt.includes('schedule')) {
    questions.push({
      label: "Preferred Date",
      type: "DATE",
      required: true
    });
  }
  
  // Always add a comments field
  questions.push({
    label: "Additional Comments",
    type: "LONG_TEXT",
    required: false
  });
  
  return questions;
};

export const generateFormStructure = async (prompt: string): Promise<GeneratedFormResponse> => {
  try {
    // Simulate API delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const templateKey = analyzePrompt(prompt);
    const template = FORM_TEMPLATES[templateKey];
    
    // Generate custom questions if prompt is specific
    const customQuestions = generateContextualQuestions(prompt);
    
    // Use custom questions if they're more relevant, otherwise use template
    const questions = customQuestions.length > 2 ? customQuestions : template.questions;
    
    // Customize title and description based on prompt
    let title = template.title;
    let description = template.description;
    
    if (prompt.length > 10) {
      // Extract key terms for title and avoid duplication
      const words = prompt.split(' ').filter(word => word.length > 3);
      if (words.length > 0) {
        const titleWords = words.slice(0, 3).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        
        // Avoid adding "Form" if it's already in the title or prompt
        const hasForm = titleWords.some(word => word.toLowerCase().includes('form')) || 
                       prompt.toLowerCase().includes('form');
        
        title = titleWords.join(' ') + (hasForm ? '' : ' Form');
      }
      
      description = `Please fill out this form regarding: ${prompt}`;
    }
    
    return {
      title,
      description,
      questions: questions.map(q => ({
        ...q,
        type: q.type as QuestionType
      }))
    };
  } catch (error) {
    console.error("Form generation error:", error);
    throw new Error("Failed to generate form structure");
  }
};

export const refineQuestionText = async (currentText: string): Promise<string> => {
  // Simple text refinement rules
  const refinements = [
    { pattern: /\?$/, replacement: '' }, // Remove trailing question marks
    { pattern: /^what is your/i, replacement: 'Your' },
    { pattern: /^please enter/i, replacement: '' },
    { pattern: /^input/i, replacement: '' },
  ];
  
  let refined = currentText.trim();
  
  refinements.forEach(({ pattern, replacement }) => {
    refined = refined.replace(pattern, replacement).trim();
  });
  
  // Capitalize first letter
  if (refined.length > 0) {
    refined = refined.charAt(0).toUpperCase() + refined.slice(1);
  }
  
  return refined || currentText;
};

export const validateAnswer = async (question: string, answer: string): Promise<{isValid: boolean, message: string}> => {
  // Basic validation rules
  if (!answer || answer.trim().length === 0) {
    return { isValid: false, message: "This field is required" };
  }
  
  // Email validation
  if (question.toLowerCase().includes('email')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(answer)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
  }
  
  // Name validation
  if (question.toLowerCase().includes('name')) {
    if (answer.trim().length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters long" };
    }
  }
  
  // URL validation
  if (question.toLowerCase().includes('website') || question.toLowerCase().includes('url')) {
    try {
      new URL(answer);
    } catch {
      return { isValid: false, message: "Please enter a valid URL" };
    }
  }
  
  return { isValid: true, message: "Valid" };
};

export const generateOptions = async (topic: string): Promise<string[]> => {
  // Generate contextual options based on topic
  const optionSets: Record<string, string[]> = {
    colors: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Black", "White", "Gray"],
    sizes: ["Extra Small", "Small", "Medium", "Large", "Extra Large"],
    priorities: ["Low", "Medium", "High", "Critical"],
    frequencies: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    satisfaction: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
    agreement: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    experience: ["Beginner", "Intermediate", "Advanced", "Expert"],
    departments: ["Sales", "Marketing", "Engineering", "Support", "HR", "Finance"],
    countries: ["United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "Japan"],
    industries: ["Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Other"]
  };
  
  const lowerTopic = topic.toLowerCase();
  
  // Find matching option set
  for (const [key, options] of Object.entries(optionSets)) {
    if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
      return options;
    }
  }
  
  // Generate generic options based on topic
  return [
    `${topic} Option 1`,
    `${topic} Option 2`,
    `${topic} Option 3`,
    "Other",
    "Not Applicable"
  ];
};