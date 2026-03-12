// Types for Chat-based Nevada Divorce with Children Intake Flow
// Nevada uses Plaintiff/Defendant terminology (not Petitioner/Respondent)
// Filed as "Complaint for Divorce and UCCJEA Declaration (With Children)"

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

// Child information
export interface ChildInfo {
  id: string;
  name: string;
  dateOfBirth: string;
}

// Child residence history (UCCJEA requirement - 5 years)
export interface ChildResidenceHistory {
  id: string;
  address: string;
  durationMonths: number; // in months
}

// Prior custody case (UCCJEA)
export interface PriorCustodyCase {
  id: string;
  state: string;
  childrenInvolved: string;
  caseNumber: string;
  hasChildCustodyOrder: boolean;
  custodyOrderDate?: string;
}

// Affecting case (UCCJEA)
export interface AffectingCase {
  id: string;
  state: string;
  partiesInvolved: string;
  caseNumber: string;
  caseType: string;
}

// Other custody claimant
export interface OtherCustodyClaimant {
  id: string;
  fullName: string;
  address: string;
}

// Home property
export interface HomeProperty {
  id: string;
  address: string;
  divisionOption: 'i_keep' | 'spouse_keeps' | 'sell_split';
}

// Retirement account
export interface RetirementInfo {
  id: string;
  accountType: string;
  accountTypeOther?: string;
  ownerName: 'me' | 'spouse';
  administrator: string;
  proposedDivision: string;
}

// Vehicle
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

// Bank account
export interface BankAccountStructured {
  id: string;
  description: string;
  division: 'i_keep' | 'spouse_keeps' | 'split_50_50';
}

// Credit card / community debt
export interface CreditCardDebt {
  id: string;
  description: string;
  awardedTo: 'me' | 'spouse' | 'split' | 'other';
  otherDetails?: string;
}

// Holiday schedule - using Plaintiff/Defendant for NV
export type HolidayOption =
  | 'plaintiff_even'
  | 'defendant_even'
  | 'plaintiff_every'
  | 'defendant_every'
  | 'regular_schedule';

export interface HolidaySchedule {
  newYearsEve: HolidayOption;
  newYearsDay: HolidayOption;
  easter: HolidayOption;
  fourthOfJuly: HolidayOption;
  halloween: HolidayOption;
  thanksgiving: HolidayOption;
  hanukkah: HolidayOption;
  christmasEve: HolidayOption;
  christmasDay: HolidayOption;
  childBirthday: HolidayOption;
  fatherBirthday: HolidayOption;
  motherBirthday: HolidayOption;
  mothersDay: HolidayOption;
  fathersDay: HolidayOption;
  otherHolidays?: string;
}

export interface BreakSchedule {
  springBreak: HolidayOption;
  fallBreak: HolidayOption;
  winterBreak: HolidayOption;
}

// Child support special factors
export type ChildSupportFactor =
  | 'special_education_needs'
  | 'legal_responsibility_others'
  | 'public_support_services'
  | 'transportation_costs'
  | 'significantly_higher_income'
  | 'other_necessary_expenses'
  | 'ability_to_pay';

export interface NvDivorceWithChildrenChatData {
  // Personal Information (Plaintiff)
  fullName: string;
  mailingAddress: string;
  county: string;
  phone: string;
  email: string;

  // Defendant Information
  defendantFullName: string;

  // Marriage Information
  dateOfMarriage: string;
  marriageLocation: string; // City, State

  // Residency
  residencyWho: 'plaintiff' | 'defendant' | 'both';

  // Pregnancy
  isPregnant: 'yes' | 'no' | 'unknown';
  pregnantParty?: 'plaintiff' | 'defendant';
  pregnancyDueDate?: string;

  // Children Information
  children: ChildInfo[];

  // UCCJEA - Child Residence
  childrenLivedInNevada6Months: boolean;
  childResidenceAddress: string;
  childResidenceDuration: string; // e.g., "3 years"
  childResidenceHistory: ChildResidenceHistory[]; // if less than 5 years, prior addresses

  // UCCJEA - Prior Custody Cases
  hasPriorCustodyCases: boolean;
  priorCustodyCases: PriorCustodyCase[];

  // UCCJEA - Affecting Cases
  hasAffectingCases: boolean;
  affectingCases: AffectingCase[];

  // UCCJEA - Other Custody Claimants
  hasOtherCustodyClaimants: boolean;
  otherCustodyClaimants: OtherCustodyClaimant[];

  // Legal Custody
  legalCustody: 'joint' | 'plaintiff_sole' | 'defendant_sole' | 'no_home_state';

  // Physical Custody
  physicalCustody: 'joint' | 'plaintiff_primary' | 'defendant_primary' | 'no_home_state';

  // Parenting Time Schedule
  regularScheduleDetails: string; // Free text, specific days/times
  summerSameAsRegular: boolean;
  summerScheduleDetails?: string;

  // Holiday Schedule
  holidaySchedule: HolidaySchedule;
  breakSchedule: BreakSchedule;

  // Child Support - Plaintiff Income
  plaintiffPayFrequency: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'annually';
  plaintiffIncome: string; // raw amount in their pay frequency
  plaintiffHoursPerWeek?: string; // only if hourly
  plaintiffMonthlyIncome?: number; // computed
  plaintiffBelowMinimum?: boolean; // below $1,995/mo

  // Child Support - Defendant Income
  defendantPayFrequency: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'annually' | 'unknown';
  defendantIncome?: string;
  defendantHoursPerWeek?: string;
  defendantMonthlyIncome?: number;
  defendantBelowMinimum?: boolean;

  // Child Support - Existing CSE Order
  hasExistingCseOrder: boolean;
  cseCaseNumber?: string;
  csePayingParent?: 'plaintiff' | 'defendant';
  cseMonthlyAmount?: string;

  // Child Support - Seeking
  seekingChildSupport: boolean;

  // Public Assistance
  hasPublicAssistance: boolean;

  // Back Child Support
  seekingBackChildSupport: boolean;
  backCsDaHandling?: boolean;
  backCsDaCaseNumber?: string;
  backCsPayingParent?: 'plaintiff' | 'defendant';
  backCsStartDate?: string;

  // Child Care Expenses
  hasChildCareExpenses: boolean;
  childCareMonthlyAmount?: string;
  childCarePaidBy?: 'me' | 'defendant' | 'both';

  // Medical Insurance
  medicalInsuranceType: 'medicaid' | 'private';
  medicalPremiumAmount?: string; // children-only portion
  medicalPremiumPaidBy?: 'me' | 'defendant' | 'both';
  medicalInsuranceOther?: string; // if other arrangement

  // Child Support Special Factors
  childSupportFactors: ChildSupportFactor[];
  deviationAmount?: string; // requested deviation amount

  // Tax Deductions
  taxDeductionOption: 'plaintiff_all' | 'defendant_all' | 'alternate' | 'per_federal_law' | 'split';
  taxDeductionPlaintiffChildren?: string; // names of children plaintiff claims
  taxDeductionDefendantChildren?: string; // names of children defendant claims
  taxDeductionPlaintiffYears?: 'even' | 'odd'; // for alternating

  // Community Property
  hasCommunityProperty: boolean;
  hasHome: boolean;
  homes: HomeProperty[];
  hasBankAccountsDuringMarriage: boolean;
  bankAccountsStructured: BankAccountStructured[];
  hasRetirement: boolean;
  retirementAccounts: RetirementInfo[];
  hasVehicles: boolean;
  vehicles: VehicleInfo[];
  personalPropertyPreference?: 'keep_in_possession' | 'itemize';
  personalPropertyMine?: string;
  personalPropertySpouse?: string;

  // Community Debts
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

  // Separate Property
  hasSeparateProperty: boolean;
  mySeparatePropertyList?: string;
  spouseSeparatePropertyList?: string;

  // Separate Debts
  hasSeparateDebt: boolean;
  mySeparateDebtList?: string;
  spouseSeparateDebtList?: string;

  // Spousal Support / Alimony
  seekingSpousalSupport: boolean;
  spousalSupportPayer?: 'me' | 'defendant';
  spousalSupportAmount?: string;

  // Name Restoration
  wantsNameRestoration: boolean;
  formerName?: string;
}

// Initial empty state
export const initialNvDivorceWithChildrenChatData: NvDivorceWithChildrenChatData = {
  fullName: '',
  mailingAddress: '',
  county: '',
  phone: '',
  email: '',

  defendantFullName: '',

  dateOfMarriage: '',
  marriageLocation: '',

  residencyWho: 'both',

  isPregnant: 'no',

  children: [],

  childrenLivedInNevada6Months: false,
  childResidenceAddress: '',
  childResidenceDuration: '',
  childResidenceHistory: [],

  hasPriorCustodyCases: false,
  priorCustodyCases: [],

  hasAffectingCases: false,
  affectingCases: [],

  hasOtherCustodyClaimants: false,
  otherCustodyClaimants: [],

  legalCustody: 'joint',
  physicalCustody: 'joint',

  regularScheduleDetails: '',
  summerSameAsRegular: true,

  holidaySchedule: {
    newYearsEve: 'plaintiff_even',
    newYearsDay: 'defendant_even',
    easter: 'plaintiff_even',
    fourthOfJuly: 'defendant_even',
    halloween: 'plaintiff_even',
    thanksgiving: 'defendant_even',
    hanukkah: 'plaintiff_even',
    christmasEve: 'defendant_even',
    christmasDay: 'plaintiff_even',
    childBirthday: 'regular_schedule',
    fatherBirthday: 'defendant_every',
    motherBirthday: 'plaintiff_every',
    mothersDay: 'plaintiff_every',
    fathersDay: 'defendant_every',
  },

  breakSchedule: {
    springBreak: 'plaintiff_even',
    fallBreak: 'defendant_even',
    winterBreak: 'plaintiff_even',
  },

  plaintiffPayFrequency: 'monthly',
  plaintiffIncome: '',

  defendantPayFrequency: 'monthly',

  hasExistingCseOrder: false,
  seekingChildSupport: false,

  hasPublicAssistance: false,

  seekingBackChildSupport: false,

  hasChildCareExpenses: false,

  medicalInsuranceType: 'medicaid',

  childSupportFactors: [],

  taxDeductionOption: 'per_federal_law',

  hasCommunityProperty: false,
  hasHome: false,
  homes: [],
  hasBankAccountsDuringMarriage: false,
  bankAccountsStructured: [],
  hasRetirement: false,
  retirementAccounts: [],
  hasVehicles: false,
  vehicles: [],

  hasCommunityDebt: false,
  creditCards: [],
  hasStudentLoanDebt: false,
  hasMedicalDebt: false,
  hasOtherCommunityDebt: false,

  hasSeparateProperty: false,
  hasSeparateDebt: false,

  seekingSpousalSupport: false,

  wantsNameRestoration: false,
};
