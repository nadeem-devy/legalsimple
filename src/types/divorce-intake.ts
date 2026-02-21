// Types for Divorce Intake Form (No Children)

export interface PersonalInfo {
  fullLegalName: string;
  dateOfBirth: string;
  currentAddress: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  phoneNumber: string;
  email: string;
  isCurrentlyEmployed: boolean | null;
  employer?: string;
  occupation?: string;
}

export interface SpouseInfo {
  fullLegalName: string;
  dateOfBirth: string;
  currentAddress: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  phoneNumber?: string;
  email?: string;
  isCurrentlyEmployed: boolean | null;
  employer?: string;
  occupation?: string;
}

export interface MarriageInfo {
  dateOfMarriage: string;
  cityOfMarriage: string;
  stateOfMarriage: string;
  dateOfSeparation: string;
  meetsResidencyRequirement: boolean | null;
}

export interface RealEstateProperty {
  id: string;
  address: string;
  estimatedValue: number;
  mortgageBalance: number;
  equity: number;
  whoGetsProperty: 'petitioner' | 'respondent' | 'sell_split';
  splitPercentagePetitioner?: number;
  splitPercentageRespondent?: number;
}

export interface BankAccount {
  id: string;
  institution: string;
  accountType: 'checking' | 'savings' | 'money_market' | 'cd' | 'other';
  approximateBalance: number;
  whoGetsAccount: 'petitioner' | 'respondent' | 'split';
  splitPercentagePetitioner?: number;
  splitPercentageRespondent?: number;
}

export interface RetirementAccount {
  id: string;
  institution: string;
  accountType: '401k' | 'ira' | 'pension' | 'roth_ira' | '403b' | 'other';
  owner: 'petitioner' | 'respondent';
  approximateValue: number;
  whoGetsAccount: 'owner_keeps' | 'split';
  splitPercentagePetitioner?: number;
  splitPercentageRespondent?: number;
}

export interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  estimatedValue: number;
  loanBalance: number;
  equity: number;
  whoGetsVehicle: 'petitioner' | 'respondent';
}

export interface Furniture {
  divisionMethod: 'already_divided' | 'petitioner_keeps_all' | 'respondent_keeps_all' | 'will_divide_later';
  specialItems?: string;
}

export interface SeparateProperty {
  hasSeparateProperty: boolean | null;
  items?: SeparatePropertyItem[];
}

export interface SeparatePropertyItem {
  id: string;
  description: string;
  owner: 'petitioner' | 'respondent';
  estimatedValue: number;
  howAcquired: 'before_marriage' | 'gift' | 'inheritance';
}

export interface Debt {
  id: string;
  creditor: string;
  debtType: 'credit_card' | 'personal_loan' | 'medical' | 'student_loan' | 'other';
  approximateBalance: number;
  whoIsResponsible: 'petitioner' | 'respondent' | 'split';
  splitPercentagePetitioner?: number;
  splitPercentageRespondent?: number;
}

export interface SpousalMaintenance {
  isRequesting: boolean | null;
  requestingParty?: 'petitioner' | 'respondent';
  reason?: 'lack_earning_capacity' | 'supported_spouse_education' | 'long_marriage' | 'age_health' | 'reduced_income';
  requestedAmount?: number;
  requestedDuration?: 'months' | 'years' | 'indefinite';
  durationValue?: number;
}

export interface TaxFiling {
  filingPreference: 'file_separately' | 'file_jointly_final_year' | 'undecided';
  whoClaimsDeductions?: 'petitioner' | 'respondent' | 'split';
}

export interface DivorceIntakeData {
  // Step tracking
  currentStep: number;
  hasChildren: boolean | null;

  // Personal Information
  personalInfo: PersonalInfo;

  // Spouse Information
  spouseInfo: SpouseInfo;

  // Marriage Information
  marriageInfo: MarriageInfo;

  // Community Property
  hasRealEstate: boolean | null;
  realEstateProperties: RealEstateProperty[];

  hasFurniture: boolean | null;
  furniture: Furniture;

  hasBankAccounts: boolean | null;
  bankAccounts: BankAccount[];

  hasRetirementAccounts: boolean | null;
  retirementAccounts: RetirementAccount[];

  hasVehicles: boolean | null;
  vehicles: Vehicle[];

  // Separate Property
  separateProperty: SeparateProperty;

  // Debts
  hasDebts: boolean | null;
  debts: Debt[];

  // Spousal Maintenance
  spousalMaintenance: SpousalMaintenance;

  // Tax Filing
  taxFiling: TaxFiling;

  // Additional Information
  additionalComments?: string;
}

// Initial empty state
export const initialDivorceIntakeData: DivorceIntakeData = {
  currentStep: 0,
  hasChildren: null,

  personalInfo: {
    fullLegalName: '',
    dateOfBirth: '',
    currentAddress: '',
    city: '',
    state: '',
    zipCode: '',
    county: '',
    phoneNumber: '',
    email: '',
    isCurrentlyEmployed: null,
  },

  spouseInfo: {
    fullLegalName: '',
    dateOfBirth: '',
    currentAddress: '',
    city: '',
    state: '',
    zipCode: '',
    county: '',
    phoneNumber: '',
    email: '',
    isCurrentlyEmployed: null,
  },

  marriageInfo: {
    dateOfMarriage: '',
    cityOfMarriage: '',
    stateOfMarriage: '',
    dateOfSeparation: '',
    meetsResidencyRequirement: null,
  },

  hasRealEstate: null,
  realEstateProperties: [],

  hasFurniture: null,
  furniture: {
    divisionMethod: 'already_divided',
  },

  hasBankAccounts: null,
  bankAccounts: [],

  hasRetirementAccounts: null,
  retirementAccounts: [],

  hasVehicles: null,
  vehicles: [],

  separateProperty: {
    hasSeparateProperty: null,
    items: [],
  },

  hasDebts: null,
  debts: [],

  spousalMaintenance: {
    isRequesting: null,
  },

  taxFiling: {
    filingPreference: 'file_separately',
  },
};

// Step definitions
export const DIVORCE_INTAKE_STEPS = [
  { id: 'children-check', title: 'Children', description: 'Do you have children?' },
  { id: 'personal-info', title: 'Your Information', description: 'Tell us about yourself' },
  { id: 'spouse-info', title: 'Spouse Information', description: 'Information about your spouse' },
  { id: 'marriage-info', title: 'Marriage Details', description: 'About your marriage' },
  { id: 'residency', title: 'Residency', description: 'Verify residency requirement' },
  { id: 'real-estate', title: 'Real Estate', description: 'Property and homes' },
  { id: 'furniture', title: 'Furniture', description: 'Household items' },
  { id: 'bank-accounts', title: 'Bank Accounts', description: 'Financial accounts' },
  { id: 'retirement', title: 'Retirement', description: 'Retirement accounts' },
  { id: 'vehicles', title: 'Vehicles', description: 'Cars and vehicles' },
  { id: 'separate-property', title: 'Separate Property', description: 'Non-marital assets' },
  { id: 'debts', title: 'Debts', description: 'Shared debts' },
  { id: 'spousal-maintenance', title: 'Spousal Maintenance', description: 'Alimony/support' },
  { id: 'tax-filing', title: 'Tax Filing', description: 'Tax preferences' },
  { id: 'review', title: 'Review', description: 'Review your answers' },
] as const;

// Arizona counties for dropdown
export const ARIZONA_COUNTIES = [
  'Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee',
  'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal',
  'Santa Cruz', 'Yavapai', 'Yuma'
];

// US States for dropdown
export const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];
