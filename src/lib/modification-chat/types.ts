// Types for Chat-based Modification Intake Flow

export type QuestionType =
  | 'text'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'yesno'
  | 'address'
  | 'currency'
  | 'number'
  | 'ssn4'
  | 'textarea'
  | 'info'
  | 'stop';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface ChatQuestion {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  placeholder?: string;
  options?: QuestionOption[];
  required?: boolean;
  tooltip?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  showIf?: {
    questionId: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'exists';
    value: string | string[] | boolean;
  };
  repeatable?: boolean;
  repeatPrompt?: string;
  nextQuestionId?: string;
  nextQuestionMap?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  type: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: Date;
  questionId?: string;
  options?: QuestionOption[];
  inputType?: QuestionType;
}

export interface ChildInfo {
  id: string;
  name: string;
  dateOfBirth: string;
}

export interface ModificationChatData {
  // Case Information
  caseNumber: string;
  isSameCounty: boolean;
  isDomesticated: boolean;
  domesticatedCaseNumber: string;
  wantAttorneyReferral: boolean;

  // Personal Information
  fullName: string;
  mailingAddress: string;

  // Other Party
  otherPartyName: string;
  otherPartyAddress: string;

  // Children
  children: ChildInfo[];

  // Role
  role: 'petitioner' | 'respondent';

  // Modifications Selected
  modificationsSelected: string[];

  // Legal Decision Making modification
  ldm_orderDate: string;
  ldm_courtName: string;
  ldm_pageNumber: string;
  ldm_sectionParagraph: string;
  ldm_whyChange: string;
  ldm_changeInCircumstance: string;
  ldm_modificationType: string;

  // Parenting Time modification
  pt_orderDate: string;
  pt_courtName: string;
  pt_pageNumber: string;
  pt_sectionParagraph: string;
  pt_whyChange: string;
  pt_changeInCircumstance: string;
  pt_newSchedule: string;
  pt_customScheduleDetails: string;
  pt_supervised: boolean;
  pt_supervisedReason: string;

  // Child Support modification
  cs_orderDate: string;
  cs_courtName: string;
  cs_pageNumber: string;
  cs_sectionParagraph: string;
  cs_whyChange: string;
  cs_changeInCircumstance: string;
}

export const initialModificationChatData: ModificationChatData = {
  caseNumber: '',
  isSameCounty: false,
  isDomesticated: false,
  domesticatedCaseNumber: '',
  wantAttorneyReferral: false,

  fullName: '',
  mailingAddress: '',

  otherPartyName: '',
  otherPartyAddress: '',

  children: [],

  role: 'petitioner',

  modificationsSelected: [],

  ldm_orderDate: '',
  ldm_courtName: '',
  ldm_pageNumber: '',
  ldm_sectionParagraph: '',
  ldm_whyChange: '',
  ldm_changeInCircumstance: '',
  ldm_modificationType: '',

  pt_orderDate: '',
  pt_courtName: '',
  pt_pageNumber: '',
  pt_sectionParagraph: '',
  pt_whyChange: '',
  pt_changeInCircumstance: '',
  pt_newSchedule: '',
  pt_customScheduleDetails: '',
  pt_supervised: false,
  pt_supervisedReason: '',

  cs_orderDate: '',
  cs_courtName: '',
  cs_pageNumber: '',
  cs_sectionParagraph: '',
  cs_whyChange: '',
  cs_changeInCircumstance: '',
};
