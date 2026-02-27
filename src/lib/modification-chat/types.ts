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
  | 'stop'
  | 'file_upload';

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
  autoFilled?: boolean;
}

export interface ChildInfo {
  id: string;
  name: string;
  dateOfBirth: string;
}

// A single paragraph/section from the full court order (mechanically extracted)
export interface OrderContentBlock {
  paragraphId: string;
  heading?: string | null;
  text: string;
  sectionGroup?: 'findings' | 'orders' | 'declarations' | 'other';
  type: 'legal_decision_making' | 'parenting_time' | 'child_support' | 'property' | 'spousal_maintenance' | 'other';
}

// Data extracted from uploaded court orders via AI
export interface ExtractedOrderData {
  caseNumber?: string;
  petitionerName?: string;
  respondentName?: string;
  courtName?: string;
  orderDate?: string;
  orderTitle?: string;
  judgeName?: string;
  children?: Array<{ name: string; dateOfBirth?: string }>;
  sections?: Array<{
    type: 'legal_decision_making' | 'parenting_time' | 'child_support' | 'other';
    pageNumber?: string;
    paragraphNumber?: string;
    orderDate?: string;
    summary?: string;
    verbatimText?: string;
  }>;
  fullOrderContent?: OrderContentBlock[];
  confidence: 'high' | 'medium' | 'low';
}

export interface ModificationChatData {
  // Uploaded Orders
  hasUploadedOrders: boolean;
  extractedOrderData?: ExtractedOrderData;
  uploadedOrderPath?: string;

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
  ldm_paragraphNumber: string;
  ldm_whyChange: string;
  ldm_modificationType: string;
  ldm_currentOrderText: string;

  // Parenting Time modification
  pt_orderDate: string;
  pt_courtName: string;
  pt_pageNumber: string;
  pt_paragraphNumber: string;
  pt_whyChange: string;
  pt_newSchedule: string;
  pt_supervised: boolean;
  pt_supervisedReason: string;
  pt_currentOrderText: string;

  // Child Support modification
  cs_orderDate: string;
  cs_courtName: string;
  cs_pageNumber: string;
  cs_paragraphNumber: string;
  cs_whyChange: string;
  cs_currentOrderText: string;
}

export const initialModificationChatData: ModificationChatData = {
  hasUploadedOrders: false,

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
  ldm_paragraphNumber: '',
  ldm_whyChange: '',
  ldm_modificationType: '',
  ldm_currentOrderText: '',

  pt_orderDate: '',
  pt_courtName: '',
  pt_pageNumber: '',
  pt_paragraphNumber: '',
  pt_whyChange: '',
  pt_newSchedule: '',
  pt_supervised: false,
  pt_supervisedReason: '',
  pt_currentOrderText: '',

  cs_orderDate: '',
  cs_courtName: '',
  cs_pageNumber: '',
  cs_paragraphNumber: '',
  cs_whyChange: '',
  cs_currentOrderText: '',
};
