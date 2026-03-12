import {
  ChatMessage,
  ChatQuestion,
  NvDivorceWithChildrenChatData,
  initialNvDivorceWithChildrenChatData,
  ChildInfo,
  PriorCustodyCase,
  AffectingCase,
  OtherCustodyClaimant,
  ChildResidenceHistory,
  ChildSupportFactor,
} from './types';
import { NV_DIVORCE_WITH_CHILDREN_QUESTIONS, getQuestionById, getNextQuestion } from './questions';

export interface ChatState {
  messages: ChatMessage[];
  currentQuestionId: string | null;
  data: NvDivorceWithChildrenChatData;
  isComplete: boolean;
  isStopped: boolean;
  stopReason?: string;
  currentItemIndex: Record<string, number>;
  tempItemData: Record<string, unknown>;
}

export const initialChatState: ChatState = {
  messages: [],
  currentQuestionId: 'welcome',
  data: initialNvDivorceWithChildrenChatData,
  isComplete: false,
  isStopped: false,
  currentItemIndex: {},
  tempItemData: {},
};

/**
 * Create a new chat message
 */
export function createMessage(
  type: 'assistant' | 'user' | 'system',
  content: string,
  questionId?: string,
  options?: ChatQuestion['options'],
  inputType?: ChatQuestion['type']
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    timestamp: new Date(),
    questionId,
    options,
    inputType,
  };
}

/**
 * Helper: compute monthly income from frequency, raw amount, and hours
 */
function computeMonthlyIncome(
  frequency: string,
  rawAmount: string,
  hoursPerWeek?: string
): number {
  const amount = parseFloat(rawAmount) || 0;
  switch (frequency) {
    case 'hourly': {
      const hours = parseFloat(hoursPerWeek || '40') || 40;
      return amount * hours * 52 / 12;
    }
    case 'weekly':
      return amount * 52 / 12;
    case 'biweekly':
      return amount * 26 / 12;
    case 'monthly':
      return amount;
    case 'annually':
      return amount / 12;
    default:
      return 0;
  }
}

/**
 * Helper: parse duration string to months (approximate)
 */
function parseDurationToMonths(duration: string): number {
  const lower = duration.toLowerCase().trim();

  // "since birth" = 0 (handled specially)
  if (lower.includes('birth')) return 0;

  let totalMonths = 0;

  // Match years (year, years, yr, yrs)
  const yearsMatch = lower.match(/(\d+)\s*(?:year|yr)s?/);
  if (yearsMatch) totalMonths += parseInt(yearsMatch[1]) * 12;

  // Match months (month, months, mo, mos)
  const monthsMatch = lower.match(/(\d+)\s*(?:month|mo)s?/);
  if (monthsMatch) totalMonths += parseInt(monthsMatch[1]);

  // If just a bare number with no unit, assume years (residence history is typically in years)
  if (totalMonths === 0) {
    const numMatch = lower.match(/^(\d+)$/);
    if (numMatch) totalMonths = parseInt(numMatch[1]) * 12;
  }

  return totalMonths;
}

/**
 * Process the current question and return a message
 */
export function processCurrentQuestion(state: ChatState): ChatState {
  if (!state.currentQuestionId) return state;

  const question = getQuestionById(state.currentQuestionId);
  if (!question) return state;

  // Replace placeholders in question text
  let questionText = question.question;
  questionText = questionText.replace('{county}', state.data.county || 'your');
  questionText = questionText.replace('{plaintiffPayFrequency}', state.data.plaintiffPayFrequency || 'monthly');
  questionText = questionText.replace('{defendantPayFrequency}', state.data.defendantPayFrequency || 'monthly');

  const fullText = question.description
    ? `${questionText}\n\n${question.description}`
    : questionText;

  const assistantMessage = createMessage(
    'assistant',
    fullText,
    question.id,
    question.options,
    question.type
  );

  return {
    ...state,
    messages: [...state.messages, assistantMessage],
  };
}

/**
 * Process user answer and determine next question
 */
export function processAnswer(state: ChatState, answer: string): ChatState {
  if (!state.currentQuestionId) return state;

  const question = getQuestionById(state.currentQuestionId);
  if (!question) return state;

  // Create user message
  const userMessage = createMessage('user', answer, state.currentQuestionId);
  const newMessages = [...state.messages, userMessage];

  // Update data based on question ID and answer
  const { data: newData, tempItemData: newTempData } = updateDataFromAnswer(
    state.data,
    question.id,
    answer,
    state.tempItemData
  );

  // DOB validation for children - must be under 18
  if (question.id === 'child_dob' && newData.children.length > 0) {
    const newChild = newData.children[newData.children.length - 1];
    const newDob = new Date(newChild.dateOfBirth);
    const today = new Date();
    const ageInYears = (today.getTime() - newDob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (ageInYears >= 18) {
      const correctedData = {
        ...newData,
        children: newData.children.slice(0, -1),
      };
      const errorMsg = createMessage(
        'assistant',
        'This child appears to be 18 or older. They will not be included as a minor child in the complaint. Please only add children under 18.',
        'child_dob_age_validation'
      );
      return {
        ...state,
        messages: [...newMessages, errorMsg],
        data: correctedData,
        currentQuestionId: 'more_children',
        tempItemData: {},
      };
    }

    // No births within days of each other unless twins
    if (newData.children.length > 1) {
      for (let i = 0; i < newData.children.length - 1; i++) {
        const existingDob = new Date(newData.children[i].dateOfBirth);
        const daysDiff = Math.abs(
          (newDob.getTime() - existingDob.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 0 && daysDiff <= 7) {
          const correctedData = {
            ...newData,
            children: newData.children.slice(0, -1),
          };
          const errorMsg = createMessage(
            'assistant',
            `This date of birth is within ${Math.round(daysDiff)} day(s) of ${newData.children[i].name}'s birthday. Siblings cannot be born within a few days of each other unless they are twins (born on the same day). Please re-enter this child's date of birth.`,
            'child_dob_validation'
          );
          return {
            ...state,
            messages: [...newMessages, errorMsg],
            data: correctedData,
            currentQuestionId: 'child_dob',
            tempItemData: {
              currentChildName: newChild.name,
            },
          };
        }
      }
    }
  }

  // Pregnancy due date validation - must be in the future
  if (question.id === 'pregnancy_due_date') {
    const dueDate = new Date(answer);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate <= today) {
      const errorMsg = createMessage(
        'assistant',
        'The due date must be a date in the future. Please enter a valid future date.',
        'pregnancy_due_date_validation'
      );
      return {
        ...state,
        messages: [...newMessages, errorMsg],
        data: newData,
        currentQuestionId: 'pregnancy_due_date',
      };
    }
  }

  // Handle stop questions
  if (question.type === 'stop') {
    return {
      ...state,
      messages: newMessages,
      data: newData,
      isStopped: true,
      stopReason: question.question,
      currentQuestionId: null,
    };
  }

  // Determine next question
  let nextQuestionId = getNextQuestion(question, answer);

  // === CUSTOM ROUTING LOGIC ===

  // Child residence duration check: if < 5 years total, need prior addresses
  if (question.id === 'child_residence_duration_check' || question.id === 'child_prior_residence_duration') {
    const currentDuration = parseDurationToMonths(newData.childResidenceDuration);
    const historyDuration = newData.childResidenceHistory.reduce(
      (sum, h) => sum + h.durationMonths, 0
    );
    const totalMonths = currentDuration + historyDuration;

    if (totalMonths < 60) {
      // Less than 5 years, need more addresses
      nextQuestionId = 'child_prior_residence';
    } else {
      nextQuestionId = 'prior_custody_case_check';
    }
  }

  // Plaintiff income: if hourly, ask hours per week
  if (question.id === 'plaintiff_hours_check') {
    if (newData.plaintiffPayFrequency === 'hourly') {
      nextQuestionId = 'plaintiff_hours_per_week';
    } else {
      // Compute monthly income
      newData.plaintiffMonthlyIncome = computeMonthlyIncome(
        newData.plaintiffPayFrequency,
        newData.plaintiffIncome
      );
      newData.plaintiffBelowMinimum = (newData.plaintiffMonthlyIncome || 0) < 1995;
      nextQuestionId = 'defendant_pay_frequency';
    }
  }

  // After plaintiff hours per week, compute monthly income
  if (question.id === 'plaintiff_hours_per_week') {
    newData.plaintiffMonthlyIncome = computeMonthlyIncome(
      newData.plaintiffPayFrequency,
      newData.plaintiffIncome,
      newData.plaintiffHoursPerWeek
    );
    newData.plaintiffBelowMinimum = (newData.plaintiffMonthlyIncome || 0) < 1995;
  }

  // Defendant income: if hourly, ask hours per week
  if (question.id === 'defendant_hours_check') {
    if (newData.defendantPayFrequency === 'hourly') {
      nextQuestionId = 'defendant_hours_per_week';
    } else {
      newData.defendantMonthlyIncome = computeMonthlyIncome(
        newData.defendantPayFrequency,
        newData.defendantIncome || '0'
      );
      newData.defendantBelowMinimum = (newData.defendantMonthlyIncome || 0) < 1995;
      nextQuestionId = 'existing_cse_order_check';
    }
  }

  // After defendant hours per week, compute monthly income
  if (question.id === 'defendant_hours_per_week') {
    newData.defendantMonthlyIncome = computeMonthlyIncome(
      newData.defendantPayFrequency,
      newData.defendantIncome || '0',
      newData.defendantHoursPerWeek
    );
    newData.defendantBelowMinimum = (newData.defendantMonthlyIncome || 0) < 1995;
  }

  // Child support factors: if any selected (not 'none'), route to deviation amount
  if (question.id === 'child_support_factors_check') {
    if (newData.childSupportFactors.length > 0 && !newData.childSupportFactors.includes('none' as ChildSupportFactor)) {
      nextQuestionId = 'deviation_amount';
    } else {
      nextQuestionId = 'tax_deduction';
    }
  }

  // Tax deduction routing: if split, need defendant children after plaintiff children
  if (question.id === 'tax_deduction_route_check') {
    if (newData.taxDeductionOption === 'split') {
      nextQuestionId = 'tax_deduction_defendant_children';
    } else {
      nextQuestionId = 'community_property_intro';
    }
  }

  // Check for completion
  if (nextQuestionId === 'complete' || !nextQuestionId) {
    return {
      ...state,
      messages: newMessages,
      data: newData,
      currentQuestionId: 'complete',
      isComplete: true,
      tempItemData: {},
    };
  }

  return {
    ...state,
    messages: newMessages,
    data: newData,
    currentQuestionId: nextQuestionId,
    tempItemData: newTempData,
  };
}

/**
 * Update collected data based on the answered question
 */
function updateDataFromAnswer(
  currentData: NvDivorceWithChildrenChatData,
  questionId: string,
  answer: string,
  tempData: Record<string, unknown>
): { data: NvDivorceWithChildrenChatData; tempItemData: Record<string, unknown> } {
  const data = { ...currentData };
  let newTempData = { ...tempData };

  switch (questionId) {
    // Initial check
    case 'has_minor_children':
      break;

    // Personal Information (Plaintiff)
    case 'full_name':
      data.fullName = answer;
      break;
    case 'mailing_address':
      data.mailingAddress = answer;
      break;
    case 'county':
      data.county = answer;
      break;
    case 'phone':
      data.phone = answer;
      break;
    case 'email':
      data.email = answer;
      break;

    // Defendant
    case 'defendant_full_name':
      data.defendantFullName = answer;
      break;

    // Marriage
    case 'date_of_marriage':
      data.dateOfMarriage = answer;
      break;
    case 'marriage_location':
      data.marriageLocation = answer;
      break;

    // Residency
    case 'residency_check':
      data.residencyWho = answer as 'plaintiff' | 'defendant' | 'both';
      break;

    // Pregnancy
    case 'pregnancy_check':
      data.isPregnant = answer as 'yes' | 'no' | 'unknown';
      break;
    case 'pregnancy_who':
      data.pregnantParty = answer as 'plaintiff' | 'defendant';
      break;
    case 'pregnancy_due_date':
      data.pregnancyDueDate = answer;
      break;

    // Children
    case 'child_name':
      newTempData.currentChildName = answer;
      break;
    case 'child_dob': {
      const newChild: ChildInfo = {
        id: `child-${Date.now()}`,
        name: (newTempData.currentChildName as string) || '',
        dateOfBirth: answer,
      };
      data.children = [...data.children, newChild];
      newTempData = {};
      break;
    }

    // UCCJEA - Child Residence
    case 'children_residency_nevada':
      data.childrenLivedInNevada6Months = answer.toLowerCase() === 'yes';
      break;
    case 'child_current_residence':
      data.childResidenceAddress = answer;
      break;
    case 'child_residence_duration':
      data.childResidenceDuration = answer;
      break;
    case 'child_prior_residence':
      newTempData.currentPriorAddress = answer;
      break;
    case 'child_prior_residence_duration': {
      const priorEntry: ChildResidenceHistory = {
        id: `res-${Date.now()}`,
        address: (newTempData.currentPriorAddress as string) || '',
        durationMonths: parseDurationToMonths(answer),
      };
      data.childResidenceHistory = [...data.childResidenceHistory, priorEntry];
      newTempData = {};
      break;
    }

    // Prior Custody Cases
    case 'prior_custody_case_check':
      data.hasPriorCustodyCases = answer.toLowerCase() === 'yes';
      break;
    case 'prior_case_state':
      newTempData.priorCaseState = answer;
      break;
    case 'prior_case_children':
      newTempData.priorCaseChildren = answer;
      break;
    case 'prior_case_number':
      newTempData.priorCaseNumber = answer;
      break;
    case 'prior_case_custody_order':
      newTempData.priorCaseCustodyOrder = answer.toLowerCase() === 'yes';
      break;
    case 'prior_case_custody_order_date': {
      const priorCase: PriorCustodyCase = {
        id: `prior-${Date.now()}`,
        state: (newTempData.priorCaseState as string) || '',
        childrenInvolved: (newTempData.priorCaseChildren as string) || '',
        caseNumber: (newTempData.priorCaseNumber as string) || '',
        hasChildCustodyOrder: (newTempData.priorCaseCustodyOrder as boolean) || false,
        custodyOrderDate: answer,
      };
      data.priorCustodyCases = [...data.priorCustodyCases, priorCase];
      newTempData = {};
      break;
    }
    case 'more_prior_cases': {
      // If "no" to custody order, we still need to save the prior case
      if (newTempData.priorCaseState) {
        const priorCaseNoOrder: PriorCustodyCase = {
          id: `prior-${Date.now()}`,
          state: (newTempData.priorCaseState as string) || '',
          childrenInvolved: (newTempData.priorCaseChildren as string) || '',
          caseNumber: (newTempData.priorCaseNumber as string) || '',
          hasChildCustodyOrder: false,
        };
        data.priorCustodyCases = [...data.priorCustodyCases, priorCaseNoOrder];
        newTempData = {};
      }
      break;
    }

    // Affecting Cases
    case 'affecting_case_check':
      data.hasAffectingCases = answer.toLowerCase() === 'yes';
      break;
    case 'affecting_case_state':
      newTempData.affectingCaseState = answer;
      break;
    case 'affecting_case_parties':
      newTempData.affectingCaseParties = answer;
      break;
    case 'affecting_case_number':
      newTempData.affectingCaseNumber = answer;
      break;
    case 'affecting_case_type': {
      const affCase: AffectingCase = {
        id: `aff-${Date.now()}`,
        state: (newTempData.affectingCaseState as string) || '',
        partiesInvolved: (newTempData.affectingCaseParties as string) || '',
        caseNumber: (newTempData.affectingCaseNumber as string) || '',
        caseType: answer,
      };
      data.affectingCases = [...data.affectingCases, affCase];
      newTempData = {};
      break;
    }

    // Other Custody Claimants
    case 'other_custody_claimant_check':
      data.hasOtherCustodyClaimants = answer.toLowerCase() === 'yes';
      break;
    case 'claimant_name':
      newTempData.claimantName = answer;
      break;
    case 'claimant_address': {
      const claimant: OtherCustodyClaimant = {
        id: `claimant-${Date.now()}`,
        fullName: (newTempData.claimantName as string) || '',
        address: answer,
      };
      data.otherCustodyClaimants = [...data.otherCustodyClaimants, claimant];
      newTempData = {};
      break;
    }

    // Legal & Physical Custody
    case 'legal_custody':
      data.legalCustody = answer as 'joint' | 'plaintiff_sole' | 'defendant_sole' | 'no_home_state';
      break;
    case 'physical_custody':
      data.physicalCustody = answer as 'joint' | 'plaintiff_primary' | 'defendant_primary' | 'no_home_state';
      break;

    // Parenting Schedule
    case 'regular_schedule':
      data.regularScheduleDetails = answer;
      break;
    case 'summer_same_as_regular':
      data.summerSameAsRegular = answer.toLowerCase() === 'yes';
      break;
    case 'summer_schedule':
      data.summerScheduleDetails = answer;
      break;

    // Holiday Schedule
    case 'holiday_new_years_eve':
      data.holidaySchedule.newYearsEve = answer as any;
      break;
    case 'holiday_new_years_day':
      data.holidaySchedule.newYearsDay = answer as any;
      break;
    case 'holiday_easter':
      data.holidaySchedule.easter = answer as any;
      break;
    case 'holiday_fourth_july':
      data.holidaySchedule.fourthOfJuly = answer as any;
      break;
    case 'holiday_halloween':
      data.holidaySchedule.halloween = answer as any;
      break;
    case 'holiday_thanksgiving':
      data.holidaySchedule.thanksgiving = answer as any;
      break;
    case 'holiday_hanukkah':
      data.holidaySchedule.hanukkah = answer as any;
      break;
    case 'holiday_christmas_eve':
      data.holidaySchedule.christmasEve = answer as any;
      break;
    case 'holiday_christmas_day':
      data.holidaySchedule.christmasDay = answer as any;
      break;
    case 'holiday_child_birthday':
      data.holidaySchedule.childBirthday = answer as any;
      break;
    case 'holiday_father_birthday':
      data.holidaySchedule.fatherBirthday = answer as any;
      break;
    case 'holiday_mother_birthday':
      data.holidaySchedule.motherBirthday = answer as any;
      break;
    case 'holiday_mothers_day':
      data.holidaySchedule.mothersDay = answer as any;
      break;
    case 'holiday_fathers_day':
      data.holidaySchedule.fathersDay = answer as any;
      break;
    case 'holiday_other_name':
      newTempData.currentHolidayName = answer;
      break;
    case 'holiday_other_division': {
      const holidayName = (newTempData.currentHolidayName as string) || '';
      const divisionLabel = {
        plaintiff_even: 'Plaintiff in even years',
        defendant_even: 'Defendant in even years',
        plaintiff_every: 'Plaintiff every year',
        defendant_every: 'Defendant every year',
        regular_schedule: 'Regular schedule applies',
      }[answer] || answer;
      const entry = `${holidayName} - ${divisionLabel}`;
      data.holidaySchedule.otherHolidays = data.holidaySchedule.otherHolidays
        ? `${data.holidaySchedule.otherHolidays}; ${entry}`
        : entry;
      newTempData = {};
      break;
    }

    // Break Schedule
    case 'break_spring':
      data.breakSchedule.springBreak = answer as any;
      break;
    case 'break_fall':
      data.breakSchedule.fallBreak = answer as any;
      break;
    case 'break_winter':
      data.breakSchedule.winterBreak = answer as any;
      break;

    // Child Support - Plaintiff Income
    case 'plaintiff_pay_frequency':
      data.plaintiffPayFrequency = answer as any;
      break;
    case 'plaintiff_income':
      data.plaintiffIncome = answer;
      break;
    case 'plaintiff_hours_per_week':
      data.plaintiffHoursPerWeek = answer;
      break;

    // Child Support - Defendant Income
    case 'defendant_pay_frequency':
      data.defendantPayFrequency = answer as any;
      break;
    case 'defendant_income':
      data.defendantIncome = answer;
      break;
    case 'defendant_hours_per_week':
      data.defendantHoursPerWeek = answer;
      break;

    // Existing CSE Order
    case 'existing_cse_order_check':
      data.hasExistingCseOrder = answer.toLowerCase() === 'yes';
      break;
    case 'cse_case_number':
      data.cseCaseNumber = answer;
      break;
    case 'cse_paying_parent':
      data.csePayingParent = answer as 'plaintiff' | 'defendant';
      break;
    case 'cse_monthly_amount':
      data.cseMonthlyAmount = answer;
      break;

    // Seeking Child Support
    case 'seeking_child_support':
      data.seekingChildSupport = answer.toLowerCase() === 'yes';
      break;

    // Public Assistance
    case 'public_assistance_check':
      data.hasPublicAssistance = answer.toLowerCase() === 'yes';
      break;

    // Back Child Support
    case 'back_child_support_check':
      data.seekingBackChildSupport = answer.toLowerCase() === 'yes';
      break;
    case 'back_cs_da_handling':
      data.backCsDaHandling = answer.toLowerCase() === 'yes';
      break;
    case 'back_cs_da_case_number':
      data.backCsDaCaseNumber = answer;
      break;
    case 'back_cs_paying_parent':
      data.backCsPayingParent = answer as 'plaintiff' | 'defendant';
      break;
    case 'back_cs_start_date':
      data.backCsStartDate = answer;
      break;

    // Child Care
    case 'child_care_check':
      data.hasChildCareExpenses = answer.toLowerCase() === 'yes';
      break;
    case 'child_care_amount':
      data.childCareMonthlyAmount = answer;
      break;
    case 'child_care_paid_by':
      data.childCarePaidBy = answer as 'me' | 'defendant' | 'both';
      break;

    // Medical Insurance
    case 'medical_insurance_type':
      data.medicalInsuranceType = answer as 'medicaid' | 'private';
      break;
    case 'medical_premium_amount':
      data.medicalPremiumAmount = answer;
      break;
    case 'medical_premium_paid_by':
      data.medicalPremiumPaidBy = answer as 'me' | 'defendant' | 'both';
      break;

    // Child Support Factors
    case 'child_support_factors': {
      const selected = answer.split(',').map(s => s.trim()).filter(s => s && s !== 'none');
      data.childSupportFactors = selected as ChildSupportFactor[];
      break;
    }
    case 'deviation_amount':
      data.deviationAmount = answer;
      break;

    // Tax Deductions
    case 'tax_deduction':
      data.taxDeductionOption = answer as any;
      break;
    case 'tax_deduction_plaintiff_children':
      data.taxDeductionPlaintiffChildren = answer;
      break;
    case 'tax_deduction_defendant_children':
      data.taxDeductionDefendantChildren = answer;
      break;
    case 'tax_deduction_plaintiff_years':
      data.taxDeductionPlaintiffYears = answer as 'even' | 'odd';
      break;

    // Community Property
    case 'community_property_check':
      data.hasCommunityProperty = answer.toLowerCase() === 'yes';
      break;

    // Real Estate
    case 'home_check':
      data.hasHome = answer.toLowerCase() === 'yes';
      break;
    case 'home_address': {
      const newHome = {
        id: `home-${Date.now()}`,
        address: answer,
        divisionOption: 'sell_split' as const,
      };
      data.homes = [...data.homes, newHome];
      break;
    }
    case 'home_division':
      if (data.homes.length > 0) {
        const lastHome = data.homes[data.homes.length - 1];
        lastHome.divisionOption = answer as 'i_keep' | 'spouse_keeps' | 'sell_split';
      }
      break;

    // Personal Property
    case 'personal_property_preference':
      data.personalPropertyPreference = answer as 'keep_in_possession' | 'itemize';
      break;
    case 'personal_property_mine':
      data.personalPropertyMine = answer;
      break;
    case 'personal_property_spouse':
      data.personalPropertySpouse = answer;
      break;

    // Bank Accounts
    case 'bank_accounts_check':
      data.hasBankAccountsDuringMarriage = answer.toLowerCase() === 'yes';
      break;
    case 'bank_account_name':
      newTempData.currentBankAccountName = answer;
      break;
    case 'bank_account_division':
      if (newTempData.currentBankAccountName) {
        data.bankAccountsStructured = [...data.bankAccountsStructured, {
          id: `bank-${Date.now()}`,
          description: newTempData.currentBankAccountName as string,
          division: answer as 'i_keep' | 'spouse_keeps' | 'split_50_50',
        }];
        newTempData = {};
      }
      break;

    // Retirement
    case 'retirement_check':
      data.hasRetirement = answer.toLowerCase() === 'yes';
      break;
    case 'retirement_account_type':
      newTempData.currentRetirementType = answer;
      break;
    case 'retirement_type_other':
      newTempData.currentRetirementTypeOther = answer;
      break;
    case 'retirement_owner':
      newTempData.currentRetirementOwner = answer;
      break;
    case 'retirement_administrator':
      newTempData.currentRetirementAdmin = answer;
      break;
    case 'retirement_division':
      if (newTempData.currentRetirementType) {
        const accountType = newTempData.currentRetirementType === 'other'
          ? (newTempData.currentRetirementTypeOther as string) || 'Other'
          : newTempData.currentRetirementType as string;
        data.retirementAccounts = [...data.retirementAccounts, {
          id: `retirement-${Date.now()}`,
          accountType,
          accountTypeOther: newTempData.currentRetirementTypeOther as string | undefined,
          ownerName: (newTempData.currentRetirementOwner as 'me' | 'spouse') || 'me',
          administrator: (newTempData.currentRetirementAdmin as string) || '',
          proposedDivision: answer,
        }];
        newTempData = {};
      }
      break;

    // Vehicles
    case 'vehicle_check':
      data.hasVehicles = answer.toLowerCase() === 'yes';
      break;
    case 'vehicle_info':
      newTempData.currentVehicleInfo = answer;
      break;
    case 'vehicle_title':
      newTempData.currentVehicleTitle = answer;
      break;
    case 'vehicle_loan_check':
      newTempData.currentVehicleHasLoan = answer.toLowerCase() === 'yes';
      break;
    case 'vehicle_division':
      if (newTempData.currentVehicleInfo) {
        const [year, make, ...modelParts] = (newTempData.currentVehicleInfo as string).split(' ');
        data.vehicles = [...data.vehicles, {
          id: `vehicle-${Date.now()}`,
          year: year || '',
          make: make || '',
          model: modelParts.join(' ') || '',
          titledTo: (newTempData.currentVehicleTitle as 'me' | 'spouse' | 'both') || 'me',
          hasLoan: (newTempData.currentVehicleHasLoan as boolean) || false,
          divisionOption: answer as 'i_keep' | 'spouse_keeps' | 'sell_split',
        }];
        newTempData = {};
      }
      break;

    // Community Debts
    case 'community_debt_check':
      data.hasCommunityDebt = answer.toLowerCase() === 'yes';
      break;
    case 'community_debt_preference':
      data.communityDebtPreference = answer as 'keep_in_name' | 'itemize';
      break;
    case 'credit_card_info':
      newTempData.currentCreditCardInfo = answer;
      break;
    case 'credit_card_division':
      if (newTempData.currentCreditCardInfo) {
        data.creditCards = [...data.creditCards, {
          id: `cc-${Date.now()}`,
          description: newTempData.currentCreditCardInfo as string,
          awardedTo: answer as 'me' | 'spouse' | 'split' | 'other',
        }];
        newTempData = {};
      }
      break;
    case 'credit_card_other_details':
      if (data.creditCards.length > 0) {
        const lastCard = data.creditCards[data.creditCards.length - 1];
        lastCard.otherDetails = answer;
      }
      break;
    case 'student_loan_check':
      data.hasStudentLoanDebt = answer.toLowerCase() === 'yes';
      break;
    case 'student_loan_division':
      data.studentLoanDivision = answer as 'me' | 'spouse' | 'split' | 'other';
      break;
    case 'student_loan_other_details':
      data.studentLoanOtherDetails = answer;
      break;
    case 'medical_debt_check':
      data.hasMedicalDebt = answer.toLowerCase() === 'yes';
      break;
    case 'medical_debt_division':
      data.medicalDebtDivision = answer as 'me' | 'spouse' | 'split' | 'other';
      break;
    case 'medical_debt_other_details':
      data.medicalDebtOtherDetails = answer;
      break;
    case 'other_community_debt_check':
      data.hasOtherCommunityDebt = answer.toLowerCase() === 'yes';
      break;
    case 'other_community_debt_description':
      data.otherCommunityDebtDescription = answer;
      break;
    case 'other_community_debt_division':
      data.otherCommunityDebtDivision = answer as 'me' | 'spouse' | 'split' | 'other';
      break;
    case 'other_community_debt_other_details':
      data.otherCommunityDebtOtherDetails = answer;
      break;

    // Separate Property
    case 'separate_property_check':
      data.hasSeparateProperty = answer.toLowerCase() === 'yes';
      break;
    case 'my_separate_property_list':
      data.mySeparatePropertyList = answer;
      break;
    case 'spouse_separate_property_list':
      data.spouseSeparatePropertyList = answer;
      break;

    // Separate Debts
    case 'separate_debt_check':
      data.hasSeparateDebt = answer.toLowerCase() === 'yes';
      break;
    case 'my_separate_debt_list':
      data.mySeparateDebtList = answer;
      break;
    case 'spouse_separate_debt_list':
      data.spouseSeparateDebtList = answer;
      break;

    // Spousal Support
    case 'spousal_support_check':
      data.seekingSpousalSupport = answer.toLowerCase() === 'yes';
      break;
    case 'spousal_support_payer':
      data.spousalSupportPayer = answer as 'me' | 'defendant';
      break;
    case 'spousal_support_amount':
      data.spousalSupportAmount = answer;
      break;

    // Name Restoration
    case 'name_restoration_check':
      data.wantsNameRestoration = answer.toLowerCase() === 'yes';
      break;
    case 'former_name':
      data.formerName = answer;
      break;
  }

  return { data, tempItemData: newTempData };
}

/**
 * Start a new chat session
 */
export function startChat(): ChatState {
  const state = { ...initialChatState };
  return processCurrentQuestion(state);
}

/**
 * Get a display-friendly summary of collected data
 */
export function getChatDataSummary(data: NvDivorceWithChildrenChatData): string {
  const lines: string[] = [];

  lines.push(`**Plaintiff:** ${data.fullName}`);
  lines.push(`**Defendant:** ${data.defendantFullName}`);
  lines.push(`**County:** ${data.county}`);
  lines.push(`**Date of Marriage:** ${data.dateOfMarriage}`);
  lines.push(`**Number of Children:** ${data.children.length}`);

  if (data.legalCustody) {
    const custodyLabels: Record<string, string> = {
      'joint': 'Joint Legal Custody',
      'plaintiff_sole': 'Plaintiff Sole Legal Custody',
      'defendant_sole': 'Defendant Sole Legal Custody',
      'no_home_state': 'Nevada is not home state',
    };
    lines.push(`**Legal Custody:** ${custodyLabels[data.legalCustody] || data.legalCustody}`);
  }

  if (data.homes.length > 0) {
    lines.push(`\n**Real Estate:** ${data.homes.length} properties`);
  }
  if (data.retirementAccounts.length > 0) {
    lines.push(`**Retirement Accounts:** ${data.retirementAccounts.length} accounts`);
  }
  if (data.vehicles.length > 0) {
    lines.push(`**Vehicles:** ${data.vehicles.length} vehicles`);
  }

  return lines.join('\n');
}
