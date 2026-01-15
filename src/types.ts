export enum QuestionType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOXES = 'CHECKBOXES',
  DROPDOWN = 'DROPDOWN',
  RATING = 'RATING',
  DATE = 'DATE',
  SECTION = 'SECTION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SIGNATURE_PAD = 'SIGNATURE_PAD',
}

export interface QuestionOption {
  id: string;
  label: string;
}

export interface LogicRule {
  id: string;
  condition: 'equals' | 'not_equals' | 'contains';
  value: string;
  jumpToId: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options?: QuestionOption[]; // For MC, Checkbox, Dropdown
  placeholder?: string; // For Short/Long Text
  description?: string;
  logic?: LogicRule[];
  // Rating specific
  maxRating?: number;
  ratingIcon?: 'star' | 'heart' | 'zap';
  ratingMinLabel?: string;
  ratingMaxLabel?: string;
  // Date specific
  includeTime?: boolean;
  // Text specific
  inputType?: 'text' | 'email' | 'url' | 'number' | 'tel';
  // Choice specific
  randomizeOptions?: boolean;
  // File upload specific
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  // Signature pad specific
  signatureRequireDraw?: boolean;
  signatureInstructions?: string;
}

export type ThemeOption = 'nebula' | 'midnight' | 'cyberpunk' | 'sunset';

export interface FormSchema {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  theme: ThemeOption;
  thankYouTitle?: string;
  thankYouMessage?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  timestamp: string;
  answers: Record<string, any>;
}

export type ViewState = 'dashboard' | 'builder' | 'preview' | 'success' | 'results';

export interface GeneratedFormResponse {
  title: string;
  description: string;
  questions: {
    label: string;
    type: string;
    options?: string[];
    required: boolean;
  }[];
}