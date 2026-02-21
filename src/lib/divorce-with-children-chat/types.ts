// Types for Chat-based Divorce with Children Intake Flow

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
  // For repeatable questions (e.g., add more children)
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

// Child information
export interface ChildInfo {
  id: string;
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  bornBeforeMarriage?: boolean;
}

// Home property
export interface HomeProperty {
  id: string;
  address: string;
  hasDisclaimerDeed: boolean;
  usedCommunityFunds?: boolean;
  requestEquitableLien?: boolean;
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

// Bank account (structured)
export interface BankAccountStructured {
  id: string;
  description: string; // "Bank of America 4564"
  division: 'i_keep' | 'spouse_keeps' | 'split_50_50';
}

// Credit card debt
export interface CreditCardDebt {
  id: string;
  description: string; // "Mastercard 8743"
  awardedTo: 'me' | 'spouse' | 'split' | 'other';
  otherDetails?: string;
}

// Holiday schedule option
export type HolidayOption =
  | 'petitioner_even'
  | 'respondent_even'
  | 'petitioner_every'
  | 'respondent_every'
  | 'regular_schedule';

// Holiday schedules
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

// Break schedules
export interface BreakSchedule {
  springBreak: HolidayOption;
  fallBreak: HolidayOption;
  winterBreak: HolidayOption;
}

export interface DivorceWithChildrenChatData {
  // Initial Check
  hasMinorChildren: boolean;

  // Personal Information (Petitioner)
  fullName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  mailingAddress: string;
  county: string;
  ssn4: string;
  phone: string;
  email: string;
  dateOfMarriage: string;

  // Spouse Information (Respondent)
  spouseFullName: string;
  spouseGender: 'male' | 'female';
  spouseDateOfBirth: string;
  spouseMailingAddress: string;
  spouseSsn4: string;
  spousePhone: string;
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

  // Military
  isMilitary: boolean;
  isCurrentlyDeployed?: boolean;
  deploymentLocation?: string;

  // Children Information
  children: ChildInfo[];
  childrenMeetResidency: boolean; // 6 months in AZ
  childrenResideWith: 'petitioner' | 'respondent' | 'both';
  hasChildrenBornBeforeMarriage: boolean;
  childrenBornBeforeMarriageNames?: string;
  areBothBiologicalParents?: boolean;
  petitionerBiologicalRole?: 'mother' | 'father';
  otherBioParentName?: string;
  otherBioParentAddress?: string;

  // Domestic Violence
  hasDomesticViolence: boolean;
  domesticViolenceOption?: 'no_joint_decision' | 'joint_despite_violence';
  domesticViolenceExplanation?: string;

  // Drug/DUI Conviction
  hasDrugConviction: boolean;
  drugConvictionParty?: 'me' | 'spouse';

  // Child Support
  seekingChildSupport: boolean;
  hasVoluntaryChildSupport?: boolean;
  voluntaryChildSupportDetails?: string;
  pastSupportPeriod?: 'from_filing' | 'from_separation';

  // Legal Decision Making
  legalDecisionMaking: 'petitioner_sole' | 'respondent_sole' | 'joint' | 'joint_with_final_say';
  finalSayParty?: 'petitioner' | 'respondent';

  // Parenting Time
  parentingTimeSchedule: '3-2-2-3' | '5-2-2-5' | 'alternating_weeks' | 'custom';
  customScheduleDetails?: string;
  isParentingTimeSupervised?: boolean;

  // Holiday Schedule
  holidaySchedule: HolidaySchedule;
  breakSchedule: BreakSchedule;

  // Summer Break
  hasSummerDeviation: boolean;
  summerDeviationDetails?: string;

  // Exchange of Children
  exchangeMethod: 'pickup' | 'dropoff' | 'midway';

  // Phone/Video Contact
  phoneContactOption: 'normal_hours' | 'custom';
  phoneContactCustomSchedule?: string;

  // Vacation Time
  hasVacationTime: boolean;
  vacationDuration?: string;
  vacationNoticeRequired?: string;
  vacationPriorityYears?: 'even' | 'odd';

  // Travel Outside Arizona
  bothCanTravelOutsideAZ: boolean;
  restrictedTravelParty?: 'petitioner' | 'respondent' | 'neither';
  maxTravelDays?: string;
  itineraryNoticeDays?: string;

  // Extracurricular Activities
  extracurricularOption: 'both_agree_split' | 'each_selects_pays' | 'each_selects_limit_split' | 'other';
  extracurricularLimit?: string;
  extracurricularOtherDetails?: string;

  // Right of First Refusal
  hasRightOfFirstRefusal: boolean;

  // Name Change
  wantsMaidenName: boolean;
  maidenName?: string;
  spouseWantsMaidenName: boolean;
  spouseMaidenName?: string;

  // Property Agreement
  hasPropertyAgreement: boolean;
  propertyAgreementDetails?: string;
  allPropertyCovered: boolean;
  propertyDivisionPreference?: 'court_decides' | 'specify_myself';
  courtDecidesSeparateProperty?: string;

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

  // Retirement
  hasRetirement: boolean;
  retirementAccounts: RetirementInfo[];

  // Vehicles
  hasVehicles: boolean;
  vehicles: VehicleInfo[];

  // Separate Property
  hasSeparateProperty: boolean;
  mySeparatePropertyList?: string;
  spouseSeparatePropertyList?: string;

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

  // Separate Debts
  hasSeparateDebt: boolean;
  mySeparateDebtList?: string;
  spouseSeparateDebtList?: string;

  // Tax Filing
  currentYearTaxFiling: 'jointly' | 'separately';
  hasPreviousUnfiledTaxes: boolean;
  previousTaxOption?: 'file_jointly' | 'file_separately';

  // Spousal Maintenance
  maintenanceEntitlement: 'neither' | 'me' | 'spouse';
  maintenanceReasons?: string[];

  // Other Orders
  otherOrders?: string;
}

// Initial empty state
export const initialDivorceWithChildrenChatData: DivorceWithChildrenChatData = {
  hasMinorChildren: true,

  fullName: '',
  gender: 'male',
  dateOfBirth: '',
  mailingAddress: '',
  county: '',
  ssn4: '',
  phone: '',
  email: '',
  dateOfMarriage: '',

  spouseFullName: '',
  spouseGender: 'male',
  spouseDateOfBirth: '',
  spouseMailingAddress: '',
  spouseSsn4: '',
  spousePhone: '',
  spouseEmail: '',

  meetsResidencyRequirement: false,
  isPregnant: false,
  isMilitary: false,
  hasCovenantMarriage: false,
  marriageBrokenBeyondRepair: true,
  wantsConciliation: false,

  children: [],
  childrenMeetResidency: false,
  childrenResideWith: 'both',
  hasChildrenBornBeforeMarriage: false,

  hasDomesticViolence: false,
  hasDrugConviction: false,

  seekingChildSupport: false,

  legalDecisionMaking: 'joint',

  parentingTimeSchedule: '3-2-2-3',

  holidaySchedule: {
    newYearsEve: 'petitioner_even',
    newYearsDay: 'respondent_even',
    easter: 'petitioner_even',
    fourthOfJuly: 'respondent_even',
    halloween: 'petitioner_even',
    thanksgiving: 'respondent_even',
    hanukkah: 'petitioner_even',
    christmasEve: 'respondent_even',
    christmasDay: 'petitioner_even',
    childBirthday: 'regular_schedule',
    fatherBirthday: 'respondent_every',
    motherBirthday: 'petitioner_every',
    mothersDay: 'petitioner_every',
    fathersDay: 'respondent_every',
  },

  breakSchedule: {
    springBreak: 'petitioner_even',
    fallBreak: 'respondent_even',
    winterBreak: 'petitioner_even',
  },

  hasSummerDeviation: false,

  exchangeMethod: 'pickup',

  phoneContactOption: 'normal_hours',

  hasVacationTime: false,

  bothCanTravelOutsideAZ: true,

  extracurricularOption: 'both_agree_split',

  hasRightOfFirstRefusal: false,

  wantsMaidenName: false,
  spouseWantsMaidenName: false,

  hasPropertyAgreement: false,
  allPropertyCovered: false,

  hasHome: false,
  homes: [],

  hasFurnitureOver200: false,
  hasAppliancesOver200: false,

  hasBankAccountsDuringMarriage: false,
  bankAccountsStructured: [],

  hasRetirement: false,
  retirementAccounts: [],

  hasVehicles: false,
  vehicles: [],

  hasSeparateProperty: false,

  hasCommunityDebt: false,
  creditCards: [],
  hasStudentLoanDebt: false,
  hasMedicalDebt: false,
  hasOtherCommunityDebt: false,

  hasSeparateDebt: false,

  currentYearTaxFiling: 'separately',
  hasPreviousUnfiledTaxes: false,

  maintenanceEntitlement: 'neither',
};
