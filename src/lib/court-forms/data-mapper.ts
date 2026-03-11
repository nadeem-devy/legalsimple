// Data mapper to normalize intake data for PDF generation
// Handles both chat-based and form-based intake formats

import type { DivorceChatData, HomeProperty, RetirementInfo, VehicleInfo } from '@/lib/divorce-chat/types';
import type { DivorceWithChildrenChatData, ChildInfo, HolidaySchedule, BreakSchedule } from '@/lib/divorce-with-children-chat/types';
import type { PaternityChatData, PriorCourtCase, CustodyClaimant } from '@/lib/paternity-chat/types';
import type { ModificationChatData, OrderContentBlock } from '@/lib/modification-chat/types';

// Normalized PDF data structure
export interface NormalizedPDFData {
  // Case type
  caseType: 'divorce_no_children' | 'divorce_with_children' | 'establish_paternity' | 'modification';

  // Petitioner (You)
  petitioner: {
    name: string;
    dateOfBirth: string;
    address: string;
    county: string;
    ssn4: string;
    phone: string;
    email: string;
    gender: 'male' | 'female';
  };

  // Respondent (Spouse)
  respondent: {
    name: string;
    dateOfBirth: string;
    address: string;
    ssn4: string;
    phone: string;
    email: string;
    gender?: 'male' | 'female';
  };

  // Marriage
  marriage: {
    date: string;
    separationDate?: string;
    meetsResidency: boolean;
    isPregnant: boolean;
    pregnancyDueDate?: string;
    isBiologicalFather?: boolean;
    pregnantParty?: 'petitioner' | 'respondent';
    isCovenantMarriage?: boolean;
    isBrokenBeyondRepair?: boolean;
    wantsConciliation?: boolean;
  };

  // Military
  military?: {
    isMilitary: boolean;
    isDeployed?: boolean;
    deploymentLocation?: string;
  };

  // Name restoration
  nameRestoration?: {
    petitionerWants: boolean;
    petitionerName?: string;
    respondentWants?: boolean;
    respondentName?: string;
  };

  // Children (only for divorce with children)
  children?: {
    list: ChildInfo[];
    meetResidency: boolean;
    resideWith: 'petitioner' | 'respondent' | 'both';
    bornBeforeMarriage: boolean;
    bornBeforeMarriageNames?: string;
    areBothBiologicalParents?: boolean;
    petitionerBiologicalRole?: 'mother' | 'father';
    otherBioParentName?: string;
    otherBioParentAddress?: string;
  };

  // Domestic violence & drug conviction
  safetyIssues?: {
    hasDomesticViolence: boolean;
    domesticViolenceCommittedBy?: string;
    domesticViolenceOption?: string;
    domesticViolenceExplanation?: string;
    hasDrugConviction: boolean;
    drugConvictionUnaware?: boolean;
    drugConvictionParty?: string;
  };

  // Child support
  childSupport?: {
    seeking: boolean;
    hasVoluntaryPayments?: boolean;
    voluntaryPaymentsDetails?: string;
    voluntaryPaymentWho?: string;
    voluntaryPaymentAmount?: string;
    voluntaryPaymentStartDate?: string;
    pastSupportPeriod?: string;
    healthInsuranceProvider?: 'petitioner' | 'respondent' | 'both';
  };

  // Custody (legal decision making)
  custody?: {
    legalDecisionMaking: string;
    finalSayParty?: string;
  };

  // Parenting time
  parentingTime?: {
    schedule: string;
    customDetails?: string;
    isSupervised?: boolean;
    holidaySchedule?: HolidaySchedule;
    breakSchedule?: BreakSchedule;
    summerDeviation?: boolean;
    summerDeviationDetails?: string;
    exchangeMethod: string;
    phoneContact: string;
    phoneContactCustom?: string;
  };

  // Vacation & travel
  vacationTravel?: {
    hasVacationTime: boolean;
    vacationDuration?: string;
    vacationNotice?: string;
    vacationPriority?: string;
    bothCanTravel: boolean;
    restrictedParty?: string;
    maxTravelDays?: string;
    itineraryNotice?: string;
  };

  // Extracurricular
  extracurricular?: {
    option: string;
    limit?: string;
    otherDetails?: string;
  };

  // Right of first refusal
  rightOfFirstRefusal?: boolean;

  // Property
  property: {
    hasAgreement: boolean;
    agreementDetails?: string;
    allCovered: boolean;
    divisionPreference?: string;

    // Real estate
    hasRealEstate: boolean;
    realEstate: HomeProperty[];

    // Furniture & appliances
    hasFurniture: boolean;
    furnitureDivision?: string;
    hasAppliances: boolean;
    applianceDivision?: string;

    // Personal property
    personalPropertyPreference?: 'keep_in_possession' | 'itemize';
    personalPropertyMine?: string;
    personalPropertySpouse?: string;

    // Bank accounts
    bankAccountsDuringMarriage?: string;
    bankAccountsDivision?: string;
    bankAccountsBeforeMarriage?: string;
    bankAccountsStructured?: Array<{ id: string; description: string; division: 'i_keep' | 'spouse_keeps' | 'split_50_50' }>;

    // Retirement
    hasRetirement: boolean;
    retirement: RetirementInfo[];

    // Vehicles
    hasVehicles: boolean;
    vehicles: VehicleInfo[];

    // Separate property
    hasSeparateProperty: boolean;
    petitionerSeparateProperty?: string;
    respondentSeparateProperty?: string;
    courtDecidesSeparateProperty?: string;
  };

  // Debts
  debts: {
    hasCommunityDebt: boolean;
    communityDebtList?: string;
    communityDebtDivision?: string;
    communityDebtPreference?: 'keep_in_name' | 'itemize';
    creditCards?: Array<{ id: string; description: string; awardedTo: 'me' | 'spouse' | 'split' | 'other'; otherDetails?: string }>;
    hasStudentLoanDebt?: boolean;
    studentLoanDivision?: 'me' | 'spouse' | 'split' | 'other';
    studentLoanOtherDetails?: string;
    hasMedicalDebt?: boolean;
    medicalDebtDivision?: 'me' | 'spouse' | 'split' | 'other';
    medicalDebtOtherDetails?: string;
    hasOtherCommunityDebt?: boolean;
    otherCommunityDebtDescription?: string;
    otherCommunityDebtDivision?: 'me' | 'spouse' | 'split' | 'other';
    otherCommunityDebtOtherDetails?: string;

    hasSeparateDebt: boolean;
    petitionerSeparateDebt?: string;
    respondentSeparateDebt?: string;
  };

  // Tax filing
  taxFiling: {
    currentYear: 'jointly' | 'separately';
    hasPreviousUnfiled: boolean;
    previousYearOption?: string;
  };

  // Spousal maintenance
  maintenance: {
    entitlement: 'neither' | 'me' | 'spouse';
    reasons?: string[];
  };

  // Paternity-specific fields
  paternity?: {
    biologicalFather: 'me' | 'significant_other';
    jurisdictionReasons: string[];
    childrenCurrentAddress: string;
    paternityReason: string;
    paternityReasonOther?: string;
    wantsPreliminaryInjunction: boolean;
    injunctionDocumentType?: string;
    hasAttendedParentInfoProgram: boolean;
    healthInsuranceProvider?: 'petitioner' | 'respondent' | 'both';
    hasExistingChildSupportOrder: boolean;
    existingOrderCourt?: string;
    existingOrderDate?: string;
    existingOrderNeedsModification?: boolean;
    owesPastChildSupport: boolean;
    pastSupportOwedBy?: string;
    pastSupportPeriod?: string;
    hasPriorCustodyCases: boolean;
    priorCustodyCases: PriorCourtCase[];
    hasAffectingCourtActions: boolean;
    affectingCourtActions: PriorCourtCase[];
    hasOtherCustodyClaimants: boolean;
    otherCustodyClaimants: CustodyClaimant[];
  };

  // Modification-specific fields
  modification?: {
    caseNumber: string;
    role: 'petitioner' | 'respondent';
    children: Array<{ name: string; dateOfBirth: string }>;
    modificationsSelected: string[];
    orderDate?: string;
    orderTitle?: string;
    judgeName?: string;
    uploadedOrderPath?: string;
    fullOrderContent?: OrderContentBlock[];
    // Legal Decision Making
    ldm?: {
      orderDate: string;
      courtName: string;
      pageNumber: string;
      paragraphNumber: string;
      whyChange: string;
      modificationType: string;
      currentOrderText: string;
    };
    // Parenting Time
    pt?: {
      orderDate: string;
      courtName: string;
      pageNumber: string;
      paragraphNumber: string;
      whyChange: string;
      newSchedule: string;
      customScheduleDetails: string;
      supervised: boolean;
      supervisedReason: string;
      currentOrderText: string;
      modifyHolidays: boolean;
      holidayNotInOrders: boolean;
      holidayPageNumber: string;
      holidayParagraphNumber: string;
      holidayChanges: string;
      modifyBreaks: boolean;
      breakNotInOrders: boolean;
      breakPageNumber: string;
      breakParagraphNumber: string;
      breakChanges: string;
    };
    // Child Support
    cs?: {
      orderDate: string;
      courtName: string;
      pageNumber: string;
      paragraphNumber: string;
      whyChange: string;
      currentOrderText: string;
    };
  };

  // Other orders
  otherOrders?: string;
}

// Map divorce without children chat data
function mapDivorceNoChildrenData(data: DivorceChatData): NormalizedPDFData {
  return {
    caseType: 'divorce_no_children',

    petitioner: {
      name: data.fullName || '',
      dateOfBirth: data.dateOfBirth || '',
      address: data.mailingAddress || '',
      county: data.county || '',
      ssn4: data.ssn4 || '',
      phone: data.phone || '',
      email: data.email || '',
      gender: data.gender || 'male',
    },

    respondent: {
      name: data.spouseFullName || '',
      dateOfBirth: data.spouseDateOfBirth || '',
      address: data.spouseMailingAddress || '',
      ssn4: data.spouseSsn4 || '',
      phone: data.spousePhone || '',
      email: data.spouseEmail || '',
      gender: data.spouseGender,
    },

    marriage: {
      date: data.dateOfMarriage || '',
      meetsResidency: data.meetsResidencyRequirement || false,
      isPregnant: data.isPregnant || false,
      pregnancyDueDate: data.pregnancyDueDate,
      isBiologicalFather: data.isBiologicalFather,
      pregnantParty: data.pregnantParty,
      isCovenantMarriage: data.hasCovenantMarriage || false,
      isBrokenBeyondRepair: data.marriageBrokenBeyondRepair !== false,
      wantsConciliation: data.wantsConciliation || false,
    },

    military: {
      isMilitary: data.isMilitary || false,
      isDeployed: data.isCurrentlyDeployed,
      deploymentLocation: data.deploymentLocation,
    },

    nameRestoration: {
      petitionerWants: data.wantsMaidenName || false,
      petitionerName: data.maidenName,
    },

    property: {
      hasAgreement: data.hasPropertyAgreement || false,
      agreementDetails: data.propertyAgreementDetails,
      allCovered: data.allPropertyCovered || false,
      divisionPreference: data.propertyDivisionPreference,

      hasRealEstate: data.hasHome || false,
      realEstate: data.homes || [],

      hasFurniture: data.hasFurnitureOver200 || false,
      furnitureDivision: data.furnitureDivision,
      hasAppliances: data.hasAppliancesOver200 || false,
      applianceDivision: data.applianceDivision,

      personalPropertyPreference: data.personalPropertyPreference,
      personalPropertyMine: data.personalPropertyMine,
      personalPropertySpouse: data.personalPropertySpouse,

      bankAccountsDuringMarriage: data.bankAccountsDuringMarriage,
      bankAccountsDivision: data.bankAccountsDivision,
      bankAccountsBeforeMarriage: data.bankAccountsBeforeMarriage,
      bankAccountsStructured: data.bankAccountsStructured,

      hasRetirement: data.hasRetirement || false,
      retirement: data.retirementAccounts || [],

      hasVehicles: data.hasVehicles || false,
      vehicles: data.vehicles || [],

      hasSeparateProperty: data.hasSeparateProperty || false,
      petitionerSeparateProperty: data.mySeparatePropertyList,
      respondentSeparateProperty: data.spouseSeparatePropertyList,
      courtDecidesSeparateProperty: data.courtDecidesSeparateProperty,
    },

    debts: {
      hasCommunityDebt: data.hasCommunityDebt || false,
      communityDebtList: data.communityDebtList,
      communityDebtDivision: data.communityDebtDivision,
      communityDebtPreference: data.communityDebtPreference,
      creditCards: data.creditCards,
      hasStudentLoanDebt: data.hasStudentLoanDebt,
      studentLoanDivision: data.studentLoanDivision,
      studentLoanOtherDetails: data.studentLoanOtherDetails,
      hasMedicalDebt: data.hasMedicalDebt,
      medicalDebtDivision: data.medicalDebtDivision,
      medicalDebtOtherDetails: data.medicalDebtOtherDetails,
      hasOtherCommunityDebt: data.hasOtherCommunityDebt,
      otherCommunityDebtDescription: data.otherCommunityDebtDescription,
      otherCommunityDebtDivision: data.otherCommunityDebtDivision,
      otherCommunityDebtOtherDetails: data.otherCommunityDebtOtherDetails,

      hasSeparateDebt: data.hasSeparateDebt || false,
      petitionerSeparateDebt: data.mySeparateDebtList,
      respondentSeparateDebt: data.spouseSeparateDebtList,
    },

    taxFiling: {
      currentYear: data.currentYearTaxFiling || 'separately',
      hasPreviousUnfiled: data.hasPreviousUnfiledTaxes || false,
      previousYearOption: data.previousTaxOption,
    },

    maintenance: {
      entitlement: data.maintenanceEntitlement || 'neither',
      reasons: data.maintenanceReasons,
    },

    otherOrders: data.otherOrders,
  };
}

// Map divorce with children chat data
function mapDivorceWithChildrenData(data: DivorceWithChildrenChatData): NormalizedPDFData {
  return {
    caseType: 'divorce_with_children',

    petitioner: {
      name: data.fullName || '',
      dateOfBirth: data.dateOfBirth || '',
      address: data.mailingAddress || '',
      county: data.county || '',
      ssn4: data.ssn4 || '',
      phone: data.phone || '',
      email: data.email || '',
      gender: data.gender || 'male',
    },

    respondent: {
      name: data.spouseFullName || '',
      dateOfBirth: data.spouseDateOfBirth || '',
      address: data.spouseMailingAddress || '',
      ssn4: data.spouseSsn4 || '',
      phone: data.spousePhone || '',
      email: data.spouseEmail || '',
      gender: data.spouseGender,
    },

    marriage: {
      date: data.dateOfMarriage || '',
      meetsResidency: data.meetsResidencyRequirement || false,
      isPregnant: data.isPregnant || false,
      pregnancyDueDate: data.pregnancyDueDate,
      isBiologicalFather: data.isBiologicalFather,
      pregnantParty: data.pregnantParty,
      isCovenantMarriage: data.hasCovenantMarriage || false,
      isBrokenBeyondRepair: data.marriageBrokenBeyondRepair !== false,
      wantsConciliation: data.wantsConciliation || false,
    },

    military: {
      isMilitary: data.isMilitary || false,
      isDeployed: data.isCurrentlyDeployed,
      deploymentLocation: data.deploymentLocation,
    },

    nameRestoration: {
      petitionerWants: data.wantsMaidenName || false,
      petitionerName: data.maidenName,
      respondentWants: data.spouseWantsMaidenName || false,
      respondentName: data.spouseMaidenName,
    },

    children: {
      list: data.children || [],
      meetResidency: data.childrenMeetResidency || false,
      resideWith: data.childrenResideWith || 'both',
      bornBeforeMarriage: data.hasChildrenBornBeforeMarriage || false,
      bornBeforeMarriageNames: data.childrenBornBeforeMarriageNames,
      areBothBiologicalParents: data.areBothBiologicalParents,
      petitionerBiologicalRole: data.petitionerBiologicalRole,
      otherBioParentName: data.otherBioParentName,
      otherBioParentAddress: data.otherBioParentAddress,
    },

    safetyIssues: {
      hasDomesticViolence: data.hasDomesticViolence || false,
      domesticViolenceOption: data.domesticViolenceOption,
      domesticViolenceExplanation: data.domesticViolenceExplanation,
      hasDrugConviction: data.hasDrugConviction || false,
      drugConvictionUnaware: data.drugConvictionUnaware || false,
      drugConvictionParty: data.drugConvictionParty,
    },

    childSupport: {
      seeking: data.seekingChildSupport || false,
      hasVoluntaryPayments: data.hasVoluntaryChildSupport,
      voluntaryPaymentsDetails: data.voluntaryChildSupportDetails,
      pastSupportPeriod: data.pastSupportPeriod,
      healthInsuranceProvider: data.healthInsuranceProvider,
    },

    custody: {
      legalDecisionMaking: data.legalDecisionMaking || 'joint',
      finalSayParty: data.finalSayParty,
    },

    parentingTime: {
      schedule: data.parentingTimeSchedule || '3-2-2-3',
      customDetails: data.customScheduleDetails,
      isSupervised: data.isParentingTimeSupervised,
      holidaySchedule: data.holidaySchedule,
      breakSchedule: data.breakSchedule,
      summerDeviation: data.hasSummerDeviation,
      summerDeviationDetails: data.summerDeviationDetails,
      exchangeMethod: data.exchangeMethod || 'pickup',
      phoneContact: data.phoneContactOption || 'normal_hours',
      phoneContactCustom: data.phoneContactCustomSchedule,
    },

    vacationTravel: {
      hasVacationTime: data.hasVacationTime || false,
      vacationDuration: data.vacationDuration,
      vacationNotice: data.vacationNoticeRequired,
      vacationPriority: data.vacationPriorityYears,
      bothCanTravel: data.bothCanTravelOutsideAZ !== false,
      restrictedParty: data.restrictedTravelParty,
      maxTravelDays: data.maxTravelDays,
      itineraryNotice: data.itineraryNoticeDays,
    },

    extracurricular: {
      option: data.extracurricularOption || 'both_agree_split',
      limit: data.extracurricularLimit,
      otherDetails: data.extracurricularOtherDetails,
    },

    rightOfFirstRefusal: data.hasRightOfFirstRefusal,

    property: {
      hasAgreement: data.hasPropertyAgreement || false,
      agreementDetails: data.propertyAgreementDetails,
      allCovered: data.allPropertyCovered || false,
      divisionPreference: data.propertyDivisionPreference,

      hasRealEstate: data.hasHome || false,
      realEstate: data.homes || [],

      hasFurniture: data.hasFurnitureOver200 || false,
      furnitureDivision: data.furnitureDivision,
      hasAppliances: data.hasAppliancesOver200 || false,
      applianceDivision: data.applianceDivision,

      personalPropertyPreference: data.personalPropertyPreference,
      personalPropertyMine: data.personalPropertyMine,
      personalPropertySpouse: data.personalPropertySpouse,

      bankAccountsDuringMarriage: data.bankAccountsDuringMarriage,
      bankAccountsDivision: data.bankAccountsDivision,
      bankAccountsStructured: data.bankAccountsStructured,

      hasRetirement: data.hasRetirement || false,
      retirement: data.retirementAccounts || [],

      hasVehicles: data.hasVehicles || false,
      vehicles: data.vehicles || [],

      hasSeparateProperty: data.hasSeparateProperty || false,
      petitionerSeparateProperty: data.mySeparatePropertyList,
      respondentSeparateProperty: data.spouseSeparatePropertyList,
      courtDecidesSeparateProperty: data.courtDecidesSeparateProperty,
    },

    debts: {
      hasCommunityDebt: data.hasCommunityDebt || false,
      communityDebtList: data.communityDebtList,
      communityDebtDivision: data.communityDebtDivision,
      communityDebtPreference: data.communityDebtPreference,
      creditCards: data.creditCards,
      hasStudentLoanDebt: data.hasStudentLoanDebt,
      studentLoanDivision: data.studentLoanDivision,
      studentLoanOtherDetails: data.studentLoanOtherDetails,
      hasMedicalDebt: data.hasMedicalDebt,
      medicalDebtDivision: data.medicalDebtDivision,
      medicalDebtOtherDetails: data.medicalDebtOtherDetails,
      hasOtherCommunityDebt: data.hasOtherCommunityDebt,
      otherCommunityDebtDescription: data.otherCommunityDebtDescription,
      otherCommunityDebtDivision: data.otherCommunityDebtDivision,
      otherCommunityDebtOtherDetails: data.otherCommunityDebtOtherDetails,

      hasSeparateDebt: data.hasSeparateDebt || false,
      petitionerSeparateDebt: data.mySeparateDebtList,
      respondentSeparateDebt: data.spouseSeparateDebtList,
    },

    taxFiling: {
      currentYear: data.currentYearTaxFiling || 'separately',
      hasPreviousUnfiled: data.hasPreviousUnfiledTaxes || false,
      previousYearOption: data.previousTaxOption,
    },

    maintenance: {
      entitlement: data.maintenanceEntitlement || 'neither',
      reasons: data.maintenanceReasons,
    },

    otherOrders: data.otherOrders,
  };
}

// Map paternity chat data
function mapPaternityData(data: PaternityChatData): NormalizedPDFData {
  return {
    caseType: 'establish_paternity',

    petitioner: {
      name: data.fullName || '',
      dateOfBirth: data.dateOfBirth || '',
      address: data.mailingAddress || '',
      county: data.county || '',
      ssn4: data.ssn4 || '',
      phone: data.phone || '',
      email: data.email || '',
      gender: data.gender || 'male',
    },

    respondent: {
      name: data.otherPartyFullName || '',
      dateOfBirth: data.otherPartyDateOfBirth || '',
      address: data.otherPartyMailingAddress || '',
      ssn4: data.otherPartySsn4 || '',
      phone: data.otherPartyPhone || '',
      email: data.otherPartyEmail || '',
      gender: data.otherPartyGender,
    },

    // Not applicable for paternity - use empty defaults
    marriage: {
      date: '',
      meetsResidency: false,
      isPregnant: false,
    },

    children: {
      list: data.children || [],
      meetResidency: data.childrenMeetResidency || false,
      resideWith: data.childrenResideWith || 'both',
      bornBeforeMarriage: false,
    },

    safetyIssues: {
      hasDomesticViolence: data.hasDomesticViolence || false,
      domesticViolenceCommittedBy: data.domesticViolenceCommittedBy,
      domesticViolenceOption: data.domesticViolenceOption,
      domesticViolenceExplanation: data.domesticViolenceExplanation,
      hasDrugConviction: data.hasDrugConviction || false,
      drugConvictionUnaware: data.drugConvictionUnaware || false,
      drugConvictionParty: data.drugConvictionParty,
    },

    childSupport: {
      seeking: data.seekingChildSupport || false,
      hasVoluntaryPayments: data.hasVoluntaryChildSupport,
      voluntaryPaymentsDetails: data.voluntaryChildSupportDetails,
      voluntaryPaymentWho: data.voluntaryPaymentWho,
      voluntaryPaymentAmount: data.voluntaryPaymentAmount,
      voluntaryPaymentStartDate: data.voluntaryPaymentStartDate,
      pastSupportPeriod: data.pastSupportPeriod,
      healthInsuranceProvider: data.healthInsuranceProvider,
    },

    custody: {
      legalDecisionMaking: data.legalDecisionMaking || 'joint',
      finalSayParty: data.finalSayParty,
    },

    parentingTime: {
      schedule: data.parentingTimeSchedule || '3-2-2-3',
      customDetails: data.customScheduleDetails,
      isSupervised: data.isParentingTimeSupervised,
      holidaySchedule: data.holidaySchedule,
      breakSchedule: data.breakSchedule,
      summerDeviation: data.hasSummerDeviation,
      summerDeviationDetails: data.summerDeviationDetails,
      exchangeMethod: data.exchangeMethod || 'pickup',
      phoneContact: data.phoneContactOption || 'normal_hours',
      phoneContactCustom: data.phoneContactCustomSchedule,
    },

    vacationTravel: {
      hasVacationTime: data.hasVacationTime || false,
      vacationDuration: data.vacationDuration,
      vacationNotice: data.vacationNoticeRequired,
      vacationPriority: data.vacationPriorityYears,
      bothCanTravel: data.bothCanTravelOutsideAZ !== false,
      restrictedParty: data.restrictedTravelParty,
      maxTravelDays: data.maxTravelDays,
      itineraryNotice: data.itineraryNoticeDays,
    },

    extracurricular: {
      option: data.extracurricularOption || 'both_agree_split',
      limit: data.extracurricularLimit,
      otherDetails: data.extracurricularOtherDetails,
    },

    rightOfFirstRefusal: data.hasRightOfFirstRefusal,

    // Not applicable for paternity
    property: {
      hasAgreement: false,
      allCovered: false,
      hasRealEstate: false,
      realEstate: [],
      hasFurniture: false,
      hasAppliances: false,
      hasRetirement: false,
      retirement: [],
      hasVehicles: false,
      vehicles: [],
      hasSeparateProperty: false,
    },

    debts: {
      hasCommunityDebt: false,
      hasSeparateDebt: false,
    },

    taxFiling: {
      currentYear: 'separately',
      hasPreviousUnfiled: false,
    },

    maintenance: {
      entitlement: 'neither',
    },

    paternity: {
      biologicalFather: data.biologicalFather || 'me',
      jurisdictionReasons: data.jurisdictionReasons || [],
      childrenCurrentAddress: data.childrenCurrentAddress || '',
      paternityReason: data.paternityReason || '',
      paternityReasonOther: data.paternityReasonOther,
      wantsPreliminaryInjunction: data.wantsPreliminaryInjunction || false,
      injunctionDocumentType: data.injunctionDocumentType,
      hasAttendedParentInfoProgram: data.hasAttendedParentInfoProgram || false,
      healthInsuranceProvider: data.healthInsuranceProvider || 'petitioner',
      hasExistingChildSupportOrder: data.hasExistingChildSupportOrder || false,
      existingOrderCourt: data.existingOrderCourt,
      existingOrderDate: data.existingOrderDate,
      existingOrderNeedsModification: data.existingOrderNeedsModification,
      owesPastChildSupport: data.owesPastChildSupport || false,
      pastSupportOwedBy: data.pastSupportOwedBy,
      pastSupportPeriod: data.pastSupportPeriod,
      hasPriorCustodyCases: data.hasPriorCustodyCases || false,
      priorCustodyCases: data.priorCustodyCases || [],
      hasAffectingCourtActions: data.hasAffectingCourtActions || false,
      affectingCourtActions: data.affectingCourtActions || [],
      hasOtherCustodyClaimants: data.hasOtherCustodyClaimants || false,
      otherCustodyClaimants: data.otherCustodyClaimants || [],
    },

    otherOrders: data.otherOrders,
  };
}

// Main mapping function - detects format and normalizes
// Map modification chat data
function mapModificationData(data: ModificationChatData): NormalizedPDFData {
  const isRespondent = data.role === 'respondent';

  // For modification: the filing party may be the original petitioner or respondent
  // Map names accordingly based on role
  const petitionerName = isRespondent ? (data.otherPartyName || '') : (data.fullName || '');
  const petitionerAddress = isRespondent ? (data.otherPartyAddress || '') : (data.mailingAddress || '');
  const respondentName = isRespondent ? (data.fullName || '') : (data.otherPartyName || '');
  const respondentAddress = isRespondent ? (data.mailingAddress || '') : (data.otherPartyAddress || '');

  const modificationsSelected = data.modificationsSelected || [];

  return {
    caseType: 'modification',

    petitioner: {
      name: petitionerName,
      dateOfBirth: '',
      address: petitionerAddress,
      county: '',
      ssn4: '',
      phone: isRespondent ? '' : (data.phone || ''),
      email: isRespondent ? '' : (data.email || ''),
      gender: 'male',
    },

    respondent: {
      name: respondentName,
      dateOfBirth: '',
      address: respondentAddress,
      ssn4: '',
      phone: isRespondent ? (data.phone || '') : '',
      email: isRespondent ? (data.email || '') : '',
    },

    marriage: {
      date: '',
      meetsResidency: true,
      isPregnant: false,
    },

    property: {
      hasAgreement: false,
      allCovered: false,
      hasRealEstate: false,
      realEstate: [],
      hasFurniture: false,
      hasAppliances: false,
      hasRetirement: false,
      retirement: [],
      hasVehicles: false,
      vehicles: [],
      hasSeparateProperty: false,
    },

    debts: {
      hasCommunityDebt: false,
      hasSeparateDebt: false,
    },

    taxFiling: {
      currentYear: 'separately',
      hasPreviousUnfiled: false,
    },

    maintenance: {
      entitlement: 'neither',
    },

    modification: {
      caseNumber: data.caseNumber || '',
      role: data.role || 'petitioner',
      children: (data.children || []).map(c => ({ name: c.name, dateOfBirth: c.dateOfBirth })),
      modificationsSelected,
      orderDate: data.extractedOrderData?.orderDate,
      orderTitle: data.extractedOrderData?.orderTitle,
      judgeName: data.extractedOrderData?.judgeName,
      uploadedOrderPath: data.uploadedOrderPath,
      fullOrderContent: data.extractedOrderData?.fullOrderContent,

      ldm: modificationsSelected.includes('legal_decision_making') ? {
        orderDate: data.ldm_orderDate || '',
        courtName: data.ldm_courtName || '',
        pageNumber: data.ldm_pageNumber || '',
        paragraphNumber: data.ldm_paragraphNumber || '',
        whyChange: data.ldm_whyChange || '',
        modificationType: data.ldm_modificationType || '',
        currentOrderText: data.ldm_currentOrderText || '',
      } : undefined,

      pt: modificationsSelected.includes('parenting_time') ? {
        orderDate: data.pt_orderDate || '',
        courtName: data.pt_courtName || '',
        pageNumber: data.pt_pageNumber || '',
        paragraphNumber: data.pt_paragraphNumber || '',
        whyChange: data.pt_whyChange || '',
        newSchedule: data.pt_newSchedule || '',
        customScheduleDetails: data.pt_customScheduleDetails || '',
        supervised: data.pt_supervised || false,
        supervisedReason: data.pt_supervisedReason || '',
        currentOrderText: data.pt_currentOrderText || '',
        modifyHolidays: data.pt_modifyHolidays || false,
        holidayNotInOrders: data.pt_holidayNotInOrders || false,
        holidayPageNumber: data.pt_holidayPageNumber || '',
        holidayParagraphNumber: data.pt_holidayParagraphNumber || '',
        holidayChanges: data.pt_holidayChanges || '',
        modifyBreaks: data.pt_modifyBreaks || false,
        breakNotInOrders: data.pt_breakNotInOrders || false,
        breakPageNumber: data.pt_breakPageNumber || '',
        breakParagraphNumber: data.pt_breakParagraphNumber || '',
        breakChanges: data.pt_breakChanges || '',
      } : undefined,

      cs: modificationsSelected.includes('child_support') ? {
        orderDate: data.cs_orderDate || '',
        courtName: data.cs_courtName || '',
        pageNumber: data.cs_pageNumber || '',
        paragraphNumber: data.cs_paragraphNumber || '',
        whyChange: data.cs_whyChange || '',
        currentOrderText: data.cs_currentOrderText || '',
      } : undefined,
    },
  };
}

export function mapIntakeDataToPDF(
  data: unknown,
  subType: string
): NormalizedPDFData {
  const intakeData = data as Record<string, unknown>;

  // Determine case type from sub_type
  if (subType === 'modification') {
    return mapModificationData(intakeData as unknown as ModificationChatData);
  }

  if (subType === 'establish_paternity') {
    return mapPaternityData(intakeData as unknown as PaternityChatData);
  }

  const isWithChildren = subType?.includes('with_children');

  if (isWithChildren) {
    return mapDivorceWithChildrenData(intakeData as unknown as DivorceWithChildrenChatData);
  }

  return mapDivorceNoChildrenData(intakeData as unknown as DivorceChatData);
}

// Format helpers for display
export function formatYesNo(value: boolean | undefined): string {
  if (value === undefined) return 'N/A';
  return value ? 'Yes' : 'No';
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatGender(gender: string | undefined): string {
  if (!gender) return 'N/A';
  return gender === 'male' ? 'Male' : 'Female';
}

export function formatParty(party: string | undefined, petitionerName: string, respondentName: string): string {
  if (!party) return 'N/A';
  if (party === 'me' || party === 'petitioner') return petitionerName || 'Petitioner';
  if (party === 'spouse' || party === 'respondent') return respondentName || 'Respondent';
  return party;
}

export function formatDivisionOption(option: string | undefined): string {
  switch (option) {
    case 'i_keep': return 'Awarded to Petitioner';
    case 'spouse_keeps': return 'Awarded to Respondent';
    case 'sell_split': return 'Sell and divide proceeds equally';
    default: return option || 'N/A';
  }
}

export function formatHolidayOption(option: string | undefined): string {
  switch (option) {
    case 'petitioner_even': return 'Petitioner in even years, Respondent in odd years';
    case 'respondent_even': return 'Respondent in even years, Petitioner in odd years';
    case 'petitioner_every': return 'Petitioner every year';
    case 'respondent_every': return 'Respondent every year';
    case 'regular_schedule': return 'Regular parenting schedule applies';
    default: return option || 'N/A';
  }
}

export function formatLegalDecisionMaking(option: string | undefined): string {
  switch (option) {
    case 'petitioner_sole': return 'Sole legal decision-making to Petitioner';
    case 'respondent_sole': return 'Sole legal decision-making to Respondent';
    case 'joint': return 'Joint legal decision-making';
    case 'joint_with_final_say': return 'Joint legal decision-making with final say';
    default: return option || 'N/A';
  }
}

export function formatParentingSchedule(schedule: string | undefined): string {
  switch (schedule) {
    case '3-2-2-3': return 'Equal parenting time (3-2-2-3 schedule)';
    case '5-2-2-5': return 'Equal parenting time (5-2-2-5 schedule)';
    case 'custom': return 'Custom parenting schedule';
    default: return schedule || 'N/A';
  }
}

export function formatExchangeMethod(method: string | undefined): string {
  switch (method) {
    case 'pickup': return 'Parent receiving picks up the children';
    case 'dropoff': return 'Parent ending time drops off the children';
    case 'midway': return 'Parents meet at midway location';
    default: return method || 'N/A';
  }
}

export function formatMaintenanceReason(reason: string | undefined): string {
  switch (reason) {
    case 'lack_property': return 'Lacks sufficient property to provide for reasonable needs';
    case 'lack_earning': return 'Lacks earning ability adequate to be self-sufficient';
    case 'contributed_spouse': return 'Made significant contributions to spouse\'s education/career';
    case 'contributed_me': return 'Spouse made significant contributions to education/career';
    case 'long_marriage': return 'Long duration marriage and age precludes adequate employment';
    case 'parent_child': return 'Parent of child whose age/condition precludes employment';
    default: return reason || 'Unknown';
  }
}

export function formatJurisdictionReason(reason: string): string {
  switch (reason) {
    // Divorce jurisdiction reasons
    case 'child_home_state': return 'Arizona is the child\'s home state (child lived in Arizona for at least 6 consecutive months)';
    case 'child_home_state_left': return 'Arizona was the child\'s home state within the last 6 months and a parent still lives here';
    case 'no_home_state': return 'No other state qualifies as the child\'s home state and the child has significant connections to Arizona';
    case 'other_state_declined': return 'Another state has declined jurisdiction in favor of Arizona';
    case 'no_other_court': return 'No other state court has jurisdiction';
    // Paternity jurisdiction reasons
    case 'resident_az': return 'The person is a resident of Arizona';
    case 'serve_in_az': return 'The person can be personally served in Arizona';
    case 'agrees_az': return 'The person agrees to have the case heard in Arizona and will file written papers in the court case';
    case 'lived_with_child_az': return 'The person lived with the minor child in this state at some time';
    case 'pre_birth_support_az': return 'The person lived in this state and provided pre-birth expenses or support for the minor child';
    case 'child_lives_az': return 'The minor child lives in this state as a result of acts or directions of the person';
    case 'conceived_az': return 'The person had sexual intercourse in this state as a result of which the minor child may have been conceived';
    case 'signed_affidavit_az': return 'The person signed an affidavit acknowledging paternity that is filed in this state';
    case 'other_acts_az': return 'The person did other acts that substantially connect the person with this state';
    default: return reason;
  }
}

export function formatPaternityReason(reason: string, otherReason?: string, biologicalFather?: string): string {
  const fatherParty = biologicalFather === 'significant_other' ? 'Respondent' : 'Petitioner';
  switch (reason.toLowerCase()) {
    case 'signed_affidavit': return `Both parties signed an Affidavit of Paternity acknowledging ${fatherParty} as the natural father of the minor child(ren). A copy is attached to this Petition`;
    case 'named_on_birth_cert': return `${fatherParty} is named as the natural father on the minor child(ren)'s birth certificate. A copy is attached to this Petition`;
    case 'dna_testing': return `DNA testing indicates that ${fatherParty} is the natural father of the minor child(ren). A copy of the test results is attached to this Petition`;
    case 'lived_together': return 'The parties were not married to each other at any time during the ten months before birth of the minor child(ren), however the parties lived together during the period when the minor child(ren) could have been conceived';
    case 'sexual_intercourse': return 'The parties were not living together but had sexual intercourse at the probable date of conception of the minor child(ren)';
    case 'other': return otherReason || 'Other basis for establishing paternity';
    default: return reason;
  }
}
