// Types for Chat-based Paternity Intake Flow
// Petition to Establish Paternity, Legal Decision Making, Parenting Time and Child Support

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

// Child information
export interface ChildInfo {
  id: string;
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
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

// Prior court case (for Q10, Q11)
export interface PriorCourtCase {
  id: string;
  childName: string;
  stateCounty: string;
  caseNumber: string;
  proceedingType: string;
  courtOrderSummary: string;
}

// Other custody claimant (for Q12)
export interface CustodyClaimant {
  id: string;
  childName: string;
  personName: string;
  personAddress: string;
  claimNature: string;
}

export interface PaternityChatData {
  // === PERSONAL INFORMATION (Petitioner) ===
  fullName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  mailingAddress: string;
  county: string;
  ssn4: string;
  phone: string;
  email: string;

  // === PRELIMINARY INJUNCTION ===
  wantsPreliminaryInjunction: boolean;
  injunctionDocumentType?: 'birth_certificate' | 'affidavit_paternity' | 'adoption_order' | 'court_order_paternity';

  // === BIOLOGICAL FATHER ===
  biologicalFather: 'me' | 'significant_other';

  // === OTHER PARTY INFORMATION (Respondent / Significant Other) ===
  otherPartyFullName: string;
  otherPartyGender: 'male' | 'female';
  otherPartyDateOfBirth: string;
  otherPartyAddressKnown: boolean;
  otherPartyMailingAddress: string;
  otherPartySsn4: string;
  otherPartyPhone: string;
  otherPartyEmail: string;

  // === ARIZONA JURISDICTION ===
  jurisdictionReasons: string[];

  // === CHILDREN INFORMATION ===
  children: ChildInfo[];
  childrenMeetResidency: boolean;
  childrenResideWith: 'petitioner' | 'respondent' | 'both';
  // Per-child current residence
  childrenCurrentAddress: string;
  childrenAddressStreet?: string;
  childrenAddressCity?: string;
  childrenAddressState?: string;
  childrenAddressZip?: string;

  // === PATERNITY REASON ===
  paternityReason: string;
  paternityReasonOther?: string;

  // === CHILD SUPPORT ORDER (existing) ===
  hasExistingChildSupportOrder: boolean;
  existingOrderCourt?: string;
  existingOrderDate?: string;
  existingOrderNeedsModification?: boolean;

  // === PAST CHILD SUPPORT ===
  owesPastChildSupport: boolean;
  pastSupportOwedBy?: 'me' | 'significant_other';
  pastSupportPeriod?: 'from_filing' | 'from_living_apart';

  // === SEEKING CHILD SUPPORT ===
  seekingChildSupport: boolean;
  hasVoluntaryChildSupport?: boolean;
  voluntaryChildSupportDetails?: string;
  voluntaryPaymentWho?: 'petitioner' | 'respondent';
  voluntaryPaymentAmount?: string;
  voluntaryPaymentStartDate?: string;

  // === OTHER COURT CASES ===
  // Q10: Prior custody/parenting time cases
  hasPriorCustodyCases: boolean;
  priorCustodyCases: PriorCourtCase[];

  // Q11: Court actions affecting this case (DV, protective orders, termination, adoption)
  hasAffectingCourtActions: boolean;
  affectingCourtActions: PriorCourtCase[];

  // Q12: Other persons with custody claims
  hasOtherCustodyClaimants: boolean;
  otherCustodyClaimants: CustodyClaimant[];

  // === DOMESTIC VIOLENCE ===
  hasDomesticViolence: boolean;
  domesticViolenceCommittedBy?: 'petitioner' | 'respondent';
  domesticViolenceOption?: 'no_joint_decision' | 'joint_despite_violence';
  domesticViolenceExplanation?: string;

  // === DRUG/DUI CONVICTION ===
  hasDrugConviction: boolean;
  drugConvictionParty?: 'me' | 'significant_other';

  // === LEGAL DECISION MAKING ===
  legalDecisionMaking: 'petitioner_sole' | 'respondent_sole' | 'joint' | 'joint_with_final_say';
  finalSayParty?: 'petitioner' | 'respondent';

  // === PARENTING TIME ===
  parentingTimeSchedule: '3-2-2-3' | '5-2-2-5' | 'alternating_weeks' | 'custom' | 'no_parenting_time';
  customScheduleDetails?: string;
  isParentingTimeSupervised?: boolean;

  // === HOLIDAY SCHEDULE ===
  holidaySchedule: HolidaySchedule;
  breakSchedule: BreakSchedule;

  // === SUMMER BREAK ===
  hasSummerDeviation: boolean;
  summerDeviationDetails?: string;

  // === EXCHANGE OF CHILDREN ===
  exchangeMethod: 'pickup' | 'dropoff' | 'midway';

  // === PHONE/VIDEO CONTACT ===
  phoneContactOption: 'normal_hours' | 'custom';
  phoneContactCustomSchedule?: string;

  // === VACATION TIME ===
  hasVacationTime: boolean;
  vacationDuration?: string;
  vacationNoticeRequired?: string;
  vacationPriorityYears?: 'even' | 'odd';

  // === TRAVEL OUTSIDE ARIZONA ===
  bothCanTravelOutsideAZ: boolean;
  restrictedTravelParty?: 'petitioner' | 'respondent' | 'neither';
  maxTravelDays?: string;
  itineraryNoticeDays?: string;

  // === EXTRACURRICULAR ACTIVITIES ===
  extracurricularOption: 'both_agree_split' | 'each_selects_pays' | 'each_selects_limit_split' | 'other';
  extracurricularLimit?: string;
  extracurricularOtherDetails?: string;

  // === RIGHT OF FIRST REFUSAL ===
  hasRightOfFirstRefusal: boolean;

  // === HEALTH INSURANCE ===
  healthInsuranceProvider: 'petitioner' | 'respondent';

  // === PARENT INFORMATION PROGRAM ===
  hasAttendedParentInfoProgram: boolean;

  // === OTHER ORDERS ===
  otherOrders?: string;
}

// Initial empty state
export const initialPaternityChatData: PaternityChatData = {
  fullName: '',
  gender: 'male',
  dateOfBirth: '',
  mailingAddress: '',
  county: '',
  ssn4: '',
  phone: '',
  email: '',

  wantsPreliminaryInjunction: false,

  biologicalFather: 'me',

  otherPartyFullName: '',
  otherPartyGender: 'male',
  otherPartyDateOfBirth: '',
  otherPartyAddressKnown: true,
  otherPartyMailingAddress: '',
  otherPartySsn4: '',
  otherPartyPhone: '',
  otherPartyEmail: '',

  jurisdictionReasons: [],

  children: [],
  childrenMeetResidency: false,
  childrenResideWith: 'both',
  childrenCurrentAddress: '',

  paternityReason: '',

  hasExistingChildSupportOrder: false,

  owesPastChildSupport: false,

  seekingChildSupport: false,

  hasPriorCustodyCases: false,
  priorCustodyCases: [],

  hasAffectingCourtActions: false,
  affectingCourtActions: [],

  hasOtherCustodyClaimants: false,
  otherCustodyClaimants: [],

  hasDomesticViolence: false,
  hasDrugConviction: false,

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

  healthInsuranceProvider: 'petitioner',

  hasAttendedParentInfoProgram: false,
};
