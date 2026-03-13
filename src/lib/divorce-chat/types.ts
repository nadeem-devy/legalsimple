// Types for Chat-based Divorce Intake Flow

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
  | 'ssn4' // Last 4 digits of SSN
  | 'textarea'
  | 'info' // Just display info, no input needed
  | 'stop'; // Stop the flow

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
  tooltip?: string; // Explains why we're asking this question
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  // Conditional logic
  showIf?: {
    questionId: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'exists';
    value: string | string[] | boolean;
  };
  // For repeatable questions (e.g., add more properties)
  repeatable?: boolean;
  repeatPrompt?: string;
  // Next question override (for branching)
  nextQuestionId?: string;
  // Dynamic next based on answer
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

export interface DivorceChatData {
  // Personal Information
  fullName: string;
  email: string;
  ssn4: string;
  county: string;
  gender: 'male' | 'female';
  mailingAddress: string;
  phone: string;
  dateOfBirth: string;
  dateOfMarriage: string;
  marriageCounty?: string;
  marriageState?: string;

  // Spouse Information
  spouseFullName: string;
  spouseGender: 'male' | 'female';
  spouseDateOfBirth: string;
  spouseAddressKnown: boolean;
  spouseMailingAddress: string;
  spouseSsnKnown: boolean;
  spouseSsn4: string;
  spousePhoneKnown: boolean;
  spousePhone: string;
  spouseEmailKnown: boolean;
  spouseEmail: string;

  // Residency & Status
  meetsResidencyRequirement: boolean;
  isPregnant: boolean;
  pregnantParty?: 'petitioner' | 'respondent';
  pregnancyDueDate?: string;
  isBiologicalFather?: boolean;
  hasCovenantMarriage: boolean;
  marriageBrokenBeyondRepair: boolean;
  wantsConciliation: boolean;
  wantsMaidenName: boolean;
  maidenName?: string;

  // Military
  isMilitary: boolean;
  militaryWho?: 'me' | 'spouse';
  isCurrentlyDeployed?: boolean;
  deploymentLocation?: string;

  // Property Agreement
  hasPropertyAgreement: boolean;
  propertyAgreementDetails?: string;
  allPropertyCovered: boolean;
  propertyDivisionPreference?: 'court_decides' | 'specify_myself';
  courtDecidesSeparateProperty?: string; // For when court decides but they list separate property

  // Real Estate
  hasHome: boolean;
  homes: HomeProperty[];

  // Personal Property (Furniture, Appliances, etc.)
  personalPropertyPreference?: 'keep_in_possession' | 'itemize';
  personalPropertyMine?: string;
  personalPropertySpouse?: string;
  // Legacy fields
  hasFurnitureOver200: boolean;
  furnitureDivision?: string;
  hasAppliancesOver200: boolean;
  applianceDivision?: string;

  // Bank Accounts (Structured format)
  hasBankAccountsDuringMarriage: boolean;
  bankAccountsStructured: BankAccountStructured[];
  // Legacy fields
  bankAccountsDuringMarriage?: string;
  bankAccountsDivision?: string;
  bankAccountsBeforeMarriage?: string;
  bankAccounts: BankAccountInfo[];

  // Retirement
  hasRetirement: boolean;
  retirementAccounts: RetirementInfo[];

  // Vehicles
  hasVehicles: boolean;
  vehicles: VehicleInfo[];

  // Separate Property (Consolidated format)
  hasSeparateProperty: boolean;
  mySeparatePropertyList?: string; // "antique lamp, diamond ring, coin collection"
  spouseSeparatePropertyList?: string;
  separateProperty: SeparatePropertyInfo[]; // Legacy support

  // Community Debts (Structured format)
  hasCommunityDebt: boolean;
  communityDebtPreference?: 'keep_in_name' | 'itemize';
  creditCards: CreditCardDebt[];
  hasStudentLoanDebt: boolean;
  studentLoanDivision?: 'me' | 'spouse' | 'split' | 'other';
  studentLoanOtherDetails?: string;
  hasMedicalDebt: boolean;
  medicalDebtDivision?: 'me' | 'spouse' | 'split' | 'other';
  medicalDebtOtherDetails?: string;
  hasOtherCommunityDebt: boolean;
  otherCommunityDebtDescription?: string;
  otherCommunityDebtDivision?: 'me' | 'spouse' | 'split' | 'other';
  otherCommunityDebtOtherDetails?: string;
  // Legacy fields
  communityDebtList?: string;
  communityDebtDivision?: string;
  communityDebts: DebtInfo[];

  // Separate Debts
  hasSeparateDebt: boolean;
  mySeparateDebtList?: string;
  spouseSeparateDebtList?: string;
  separateDebts: DebtInfo[]; // Legacy support

  // Tax Filing
  currentYearTaxFiling: 'jointly' | 'separately';
  hasPreviousUnfiledTaxes: boolean;
  previousTaxOption?: string;

  // Spousal Maintenance
  maintenanceEntitlement: 'neither' | 'me' | 'spouse';
  maintenanceReasons?: string[];

  // Other Orders
  hasOtherOrders: boolean;
  otherOrders?: string;

  // Children check
  hasChildren: boolean;
}

export interface HomeProperty {
  id: string;
  address: string;
  hasDisclaimerDeed: boolean;
  usedCommunityFunds?: boolean;
  requestEquitableLien?: boolean;
  divisionOption: 'i_keep' | 'spouse_keeps' | 'sell_split';
}

export interface BankAccountInfo {
  id: string;
  bankName: string;
  last4Digits: string;
  proposedDivision: string;
}

export interface RetirementInfo {
  id: string;
  accountType: string;
  accountTypeOther?: string; // For "other" type specification
  ownerName: 'me' | 'spouse';
  administrator: string;
  proposedDivision: string;
}

export interface VehicleInfo {
  id: string;
  year: string;
  make: string;
  model: string;
  titledTo: 'me' | 'spouse' | 'both';
  hasLoan: boolean;
  loanBalance?: number;
  divisionOption: 'i_keep' | 'spouse_keeps' | 'sell_split';
}

export interface SeparatePropertyInfo {
  id: string;
  description: string;
  value: number;
  awardedTo: 'me' | 'spouse';
}

export interface DebtInfo {
  id: string;
  description: string;
  amountOwed: number;
  responsibleParty: 'me' | 'spouse';
}

export interface BankAccountStructured {
  id: string;
  description: string; // "Bank of America 4564"
  division: 'i_keep' | 'spouse_keeps' | 'split_50_50';
}

export interface CreditCardDebt {
  id: string;
  description: string; // "Mastercard 8743"
  awardedTo: 'me' | 'spouse' | 'split' | 'other';
  otherDetails?: string;
}

// Initial empty state
export const initialDivorceChatData: DivorceChatData = {
  fullName: '',
  email: '',
  ssn4: '',
  county: '',
  gender: 'male',
  mailingAddress: '',
  phone: '',
  dateOfBirth: '',
  dateOfMarriage: '',

  spouseFullName: '',
  spouseGender: 'male',
  spouseDateOfBirth: '',
  spouseAddressKnown: true,
  spouseMailingAddress: '',
  spouseSsnKnown: true,
  spouseSsn4: '',
  spousePhoneKnown: true,
  spousePhone: '',
  spouseEmailKnown: true,
  spouseEmail: '',

  meetsResidencyRequirement: false,
  isPregnant: false,
  isMilitary: false,
  hasCovenantMarriage: false,
  marriageBrokenBeyondRepair: true,
  wantsConciliation: false,
  wantsMaidenName: false,

  hasOtherOrders: false,

  hasPropertyAgreement: false,
  allPropertyCovered: false,
  propertyDivisionPreference: undefined,
  courtDecidesSeparateProperty: undefined,

  hasHome: false,
  homes: [],

  hasFurnitureOver200: false,
  hasAppliancesOver200: false,

  hasBankAccountsDuringMarriage: false,
  bankAccountsStructured: [],
  bankAccounts: [],

  hasRetirement: false,
  retirementAccounts: [],

  hasVehicles: false,
  vehicles: [],

  hasSeparateProperty: false,
  separateProperty: [],

  hasCommunityDebt: false,
  creditCards: [],
  hasStudentLoanDebt: false,
  hasMedicalDebt: false,
  hasOtherCommunityDebt: false,
  communityDebts: [],
  hasSeparateDebt: false,
  separateDebts: [],

  currentYearTaxFiling: 'separately',
  hasPreviousUnfiledTaxes: false,

  maintenanceEntitlement: 'neither',

  hasChildren: false,
};
