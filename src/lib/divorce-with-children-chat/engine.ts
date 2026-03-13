import { ChatMessage, ChatQuestion, DivorceWithChildrenChatData, initialDivorceWithChildrenChatData, ChildInfo } from './types';
import { DIVORCE_WITH_CHILDREN_QUESTIONS, getQuestionById, getNextQuestion } from './questions';

export interface ChatState {
  messages: ChatMessage[];
  currentQuestionId: string | null;
  data: DivorceWithChildrenChatData;
  isComplete: boolean;
  isStopped: boolean;
  stopReason?: string;
  // For repeatable items
  currentItemIndex: Record<string, number>;
  tempItemData: Record<string, unknown>;
}

export const initialChatState: ChatState = {
  messages: [],
  currentQuestionId: 'welcome',
  data: initialDivorceWithChildrenChatData,
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
 * Process the current question and return a message
 */
export function processCurrentQuestion(state: ChatState): ChatState {
  if (!state.currentQuestionId) return state;

  const question = getQuestionById(state.currentQuestionId);
  if (!question) return state;

  // Replace placeholders in question text
  let questionText = question.question;
  questionText = questionText.replace('{county}', state.data.county || 'your');

  // Add description if present
  const fullText = question.description
    ? `${questionText}\n\n${question.description}`
    : questionText;

  // Create assistant message with question
  const assistantMessage = createMessage(
    'assistant',
    fullText,
    question.id,
    question.options,
    question.type
  );

  // Handle stop questions — set isStopped and clear currentQuestionId
  if (question.type === 'stop') {
    return {
      ...state,
      messages: [...state.messages, assistantMessage],
      isStopped: true,
      stopReason: fullText,
      currentQuestionId: null,
    };
  }

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
        `This child appears to be 18 or older. They will not be included as a minor child in the petition. Please only add children under 18.`,
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

    // No births within days of each other unless twins (same day)
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
              currentChildGender: newChild.gender,
            },
          };
        }
      }
    }
  }

  // Marriage date validation - petitioner must have been at least 18 on the marriage date
  if (question.id === 'date_of_marriage' && newData.dateOfBirth) {
    const marriageDate = new Date(answer);
    const petitionerDob = new Date(newData.dateOfBirth);
    const ageAtMarriage = (marriageDate.getTime() - petitionerDob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (ageAtMarriage < 18) {
      const errorMsg = createMessage(
        'assistant',
        `Based on your date of birth and the marriage date entered, you would have been ${Math.floor(ageAtMarriage)} years old at the time of marriage. You must have been at least 18 years old on the date of marriage. Please re-enter the correct date of marriage.`,
        'marriage_date_age_validation'
      );
      return {
        ...state,
        messages: [...newMessages, errorMsg],
        data: { ...newData, dateOfMarriage: '' },
        currentQuestionId: 'date_of_marriage',
      };
    }
  }

  // Spouse DOB validation - spouse must have been at least 18 on the marriage date
  if (question.id === 'spouse_date_of_birth' && newData.dateOfMarriage) {
    const marriageDate = new Date(newData.dateOfMarriage);
    const spouseDob = new Date(answer);
    const ageAtMarriage = (marriageDate.getTime() - spouseDob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (ageAtMarriage < 18) {
      const errorMsg = createMessage(
        'assistant',
        `Based on the marriage date and the date of birth entered, your spouse would have been ${Math.floor(ageAtMarriage)} years old at the time of marriage. Your spouse must have been at least 18 years old on the date of marriage. Please re-enter the correct date of birth for your spouse.`,
        'spouse_dob_age_validation'
      );
      return {
        ...state,
        messages: [...newMessages, errorMsg],
        data: { ...newData, spouseDateOfBirth: '' },
        currentQuestionId: 'spouse_date_of_birth',
      };
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

  // Auto-detect children born before marriage (Fix #1)
  // When we're about to show children_born_before_marriage, check if we already know from DOB vs marriage date
  if (nextQuestionId === 'children_born_before_marriage') {
    const marriageDate = newData.dateOfMarriage ? new Date(newData.dateOfMarriage) : null;
    if (marriageDate) {
      const childrenBornBefore = newData.children.filter(c => {
        const dob = new Date(c.dateOfBirth);
        return dob < marriageDate;
      });

      if (childrenBornBefore.length > 0) {
        // Auto-set the data
        newData.hasChildrenBornBeforeMarriage = true;
        newData.childrenBornBeforeMarriageNames = childrenBornBefore.map(c => c.name).join(', ');
        childrenBornBefore.forEach(c => c.bornBeforeMarriage = true);

        // Add info message and skip to biological_parents_check
        const infoMsg = createMessage(
          'assistant',
          `Based on the dates you provided, the following child(ren) were born prior to the marriage: ${childrenBornBefore.map(c => c.name).join(', ')}.`,
          'auto_born_before_detection'
        );

        return {
          ...state,
          messages: [...newMessages, infoMsg],
          data: newData,
          currentQuestionId: 'biological_parents_check',
          tempItemData: newTempData,
        };
      } else {
        // No children born before marriage - auto-set and skip to domestic_violence_check
        newData.hasChildrenBornBeforeMarriage = false;
        nextQuestionId = 'domestic_violence_check';
      }
    }
  }

  // Skip legal_decision_making if DV + no_joint_decision was already selected
  if (nextQuestionId === 'legal_decision_making' && newData.hasDomesticViolence && newData.domesticViolenceOption === 'no_joint_decision') {
    // Already determined: no joint legal decision making for the violent party
    // Set the appropriate value based on who committed violence
    if (newData.domesticViolenceCommittedBy === 'respondent') {
      newData.legalDecisionMaking = 'petitioner_sole';
    } else {
      newData.legalDecisionMaking = 'respondent_sole';
    }
    nextQuestionId = 'parenting_time_schedule';
  }

  // Route maiden name correctly (Fix #7)
  // When petitioner enters maiden name and spouse also wants restoration, go to spouse_maiden_name next
  if (question.id === 'my_maiden_name' && newData.spouseWantsMaidenName) {
    nextQuestionId = 'spouse_maiden_name';
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
  currentData: DivorceWithChildrenChatData,
  questionId: string,
  answer: string,
  tempData: Record<string, unknown>
): { data: DivorceWithChildrenChatData; tempItemData: Record<string, unknown> } {
  const data = { ...currentData };
  let newTempData = { ...tempData };

  switch (questionId) {
    // Initial Check
    case 'has_minor_children':
      data.hasMinorChildren = answer.toLowerCase() === 'yes';
      break;

    // Personal Information
    case 'full_name':
      data.fullName = answer;
      break;
    case 'gender':
      data.gender = answer as 'male' | 'female';
      break;
    case 'date_of_birth':
      data.dateOfBirth = answer;
      break;
    case 'mailing_address':
      data.mailingAddress = answer;
      break;
    case 'county':
      data.county = answer;
      break;
    case 'ssn4':
      data.ssn4 = answer;
      break;
    case 'phone':
      data.phone = answer;
      break;
    case 'email':
      data.email = answer;
      break;
    case 'date_of_marriage':
      data.dateOfMarriage = answer;
      break;
    case 'marriage_county_state':
      data.marriageCountyState = answer;
      break;

    // Spouse Information
    case 'spouse_full_name':
      data.spouseFullName = answer;
      break;
    case 'spouse_date_of_birth':
      data.spouseDateOfBirth = answer;
      break;
    case 'spouse_address_known':
      data.spouseAddressKnown = answer.toLowerCase() === 'yes';
      if (answer.toLowerCase() === 'no') {
        data.spouseMailingAddress = 'Unknown';
      }
      break;
    case 'spouse_mailing_address':
      data.spouseMailingAddress = answer;
      break;
    case 'spouse_ssn4':
      data.spouseSsn4 = answer;
      break;
    case 'spouse_phone':
      data.spousePhone = answer;
      break;
    case 'spouse_email_known':
      data.spouseEmailKnown = answer.toLowerCase() === 'yes';
      if (answer.toLowerCase() === 'no') {
        data.spouseEmail = '';
      }
      break;
    case 'spouse_email':
      data.spouseEmail = answer;
      break;
    case 'spouse_gender':
      data.spouseGender = answer as 'male' | 'female';
      break;

    // Residency & Status
    case 'residency_check':
      data.meetsResidencyRequirement = answer.toLowerCase() === 'yes';
      break;
    case 'pregnancy_check':
      data.isPregnant = answer.toLowerCase() === 'yes';
      break;
    case 'pregnancy_who':
      data.pregnantParty = answer as 'petitioner' | 'respondent';
      break;
    case 'pregnancy_due_date':
      data.pregnancyDueDate = answer;
      break;
    case 'pregnancy_biological_father':
      data.isBiologicalFather = answer.toLowerCase() === 'yes';
      break;
    case 'military_check':
      data.isMilitary = answer.toLowerCase() === 'yes';
      break;
    case 'military_deployed':
      data.isCurrentlyDeployed = answer.toLowerCase() === 'yes';
      break;
    case 'military_deploy_location':
      data.deploymentLocation = answer;
      break;
    case 'covenant_marriage':
      data.hasCovenantMarriage = answer.toLowerCase() === 'yes';
      break;
    case 'marriage_broken':
      data.marriageBrokenBeyondRepair = answer.toLowerCase() === 'yes';
      break;
    case 'conciliation_check':
      data.wantsConciliation = answer.toLowerCase() === 'yes';
      break;

    // Children Information
    case 'child_name':
      newTempData.currentChildName = answer;
      break;
    case 'child_gender':
      newTempData.currentChildGender = answer;
      break;
    case 'child_dob': {
      // Create child entry with collected data
      // Auto-detect if child was born before marriage
      const childDobDate = new Date(answer);
      const marriageDateForChild = data.dateOfMarriage ? new Date(data.dateOfMarriage) : null;
      const bornBeforeMarriage = marriageDateForChild ? childDobDate < marriageDateForChild : false;

      const newChild: ChildInfo = {
        id: `child-${Date.now()}`,
        name: (newTempData.currentChildName as string) || '',
        gender: (newTempData.currentChildGender as 'male' | 'female') || 'male',
        dateOfBirth: answer,
        bornBeforeMarriage,
      };
      data.children = [...data.children, newChild];
      // Clear temp data for next child
      newTempData = {};
      break;
    }
    case 'children_residency':
      data.childrenMeetResidency = answer.toLowerCase() === 'yes';
      break;
    case 'children_reside_with':
      data.childrenResideWith = answer as 'petitioner' | 'respondent' | 'both';
      break;
    case 'children_born_before_marriage':
      data.hasChildrenBornBeforeMarriage = answer.toLowerCase() === 'yes';
      break;
    case 'children_born_before_names':
      data.childrenBornBeforeMarriageNames = answer;
      break;
    case 'biological_parents_check':
      data.areBothBiologicalParents = answer.toLowerCase() === 'yes';
      break;
    case 'biological_role':
      data.petitionerBiologicalRole = answer as 'mother' | 'father';
      break;
    case 'other_bio_parent_name':
      data.otherBioParentName = answer;
      break;
    case 'other_bio_parent_address':
      data.otherBioParentAddress = answer;
      break;

    // Domestic Violence
    case 'domestic_violence_check':
      data.hasDomesticViolence = answer.toLowerCase() === 'yes';
      break;
    case 'domestic_violence_who':
      data.domesticViolenceCommittedBy = answer as 'petitioner' | 'respondent';
      break;
    case 'domestic_violence_option':
      data.domesticViolenceOption = answer as 'no_joint_decision' | 'joint_despite_violence';
      break;
    case 'domestic_violence_explanation':
      data.domesticViolenceExplanation = answer;
      break;

    // Parent Information Program
    case 'parent_info_program_check':
      data.hasAttendedParentInfoProgram = answer.toLowerCase() === 'yes';
      break;

    // Drug/DUI Conviction
    case 'drug_conviction_check':
      data.hasDrugConviction = answer === 'yes';
      data.drugConvictionUnaware = answer === 'unaware';
      break;
    case 'drug_conviction_who':
      data.drugConvictionParty = answer as 'me' | 'spouse';
      break;

    // Child Support
    case 'child_support_check':
      data.seekingChildSupport = answer.toLowerCase() === 'yes';
      break;
    case 'health_insurance_provider':
      data.healthInsuranceProvider = answer as 'petitioner' | 'respondent' | 'both';
      break;
    case 'voluntary_support_check':
      data.hasVoluntaryChildSupport = answer.toLowerCase() === 'yes';
      break;
    case 'voluntary_support_who':
      data.voluntaryPaymentWho = answer as 'petitioner' | 'respondent';
      break;
    case 'voluntary_support_amount':
      data.voluntaryPaymentAmount = answer;
      break;
    case 'voluntary_support_start_date': {
      data.voluntaryPaymentStartDate = answer;
      const payerLabel = data.voluntaryPaymentWho === 'respondent' ? 'Respondent' : 'Petitioner';
      data.voluntaryChildSupportDetails = `${payerLabel} has made a total of $${data.voluntaryPaymentAmount || '0'} in voluntary child support payments beginning on ${answer} which should be accounted for.`;
      break;
    }
    case 'past_support_period':
      data.pastSupportPeriod = answer as 'from_filing' | 'from_separation';
      break;

    // Legal Decision Making
    case 'legal_decision_making':
      data.legalDecisionMaking = answer as 'petitioner_sole' | 'respondent_sole' | 'joint' | 'joint_with_final_say';
      break;
    case 'final_say_party':
      data.finalSayParty = answer as 'petitioner' | 'respondent';
      break;

    // Parenting Time
    case 'parenting_time_schedule':
      data.parentingTimeSchedule = answer as '3-2-2-3' | '5-2-2-5' | 'custom';
      break;
    case 'custom_schedule_details':
      data.customScheduleDetails = answer;
      break;
    case 'supervised_check':
      data.isParentingTimeSupervised = answer === 'supervised';
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
        petitioner_even: 'Petitioner in even years',
        respondent_even: 'Respondent in even years',
        petitioner_every: 'Petitioner every year',
        respondent_every: 'Respondent every year',
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

    // Summer Break
    case 'summer_deviation_check':
      data.hasSummerDeviation = answer.toLowerCase() === 'yes';
      break;
    case 'summer_deviation_details':
      data.summerDeviationDetails = answer;
      break;

    // Exchange
    case 'exchange_method':
      data.exchangeMethod = answer as 'pickup' | 'dropoff' | 'midway';
      break;

    // Phone Contact
    case 'phone_contact':
      data.phoneContactOption = answer as 'normal_hours' | 'custom';
      break;
    case 'phone_contact_custom_details':
      data.phoneContactCustomSchedule = answer;
      break;
    // Vacation
    case 'vacation_time_check':
      data.hasVacationTime = answer.toLowerCase() === 'yes';
      break;
    case 'vacation_duration':
      data.vacationDuration = answer;
      break;
    case 'vacation_notice':
      data.vacationNoticeRequired = answer;
      break;
    case 'vacation_priority':
      data.vacationPriorityYears = answer as 'even' | 'odd';
      break;

    // Travel
    case 'travel_permission_check':
      data.bothCanTravelOutsideAZ = answer.toLowerCase() === 'yes';
      break;
    case 'travel_restricted_party':
      data.restrictedTravelParty = answer as 'petitioner' | 'respondent' | 'neither';
      break;
    case 'travel_max_days':
      data.maxTravelDays = answer;
      break;
    case 'travel_itinerary_notice':
      data.itineraryNoticeDays = answer;
      break;

    // Extracurricular
    case 'extracurricular_activities':
      data.extracurricularOption = answer as 'both_agree_split' | 'each_selects_pays' | 'each_selects_limit_split' | 'other';
      break;
    case 'extracurricular_limit':
      data.extracurricularLimit = answer;
      break;
    case 'extracurricular_other_details':
      data.extracurricularOtherDetails = answer;
      break;

    // Right of First Refusal
    case 'right_of_first_refusal':
      data.hasRightOfFirstRefusal = answer.toLowerCase() === 'yes';
      break;

    // Name Change
    case 'maiden_name_check':
      data.wantsMaidenName = answer.toLowerCase() === 'yes';
      break;
    case 'maiden_name_who':
      if (answer === 'me' || answer === 'both') {
        data.wantsMaidenName = true;
      }
      if (answer === 'spouse' || answer === 'both') {
        data.spouseWantsMaidenName = true;
      }
      break;
    case 'my_maiden_name':
      data.maidenName = answer;
      break;
    case 'spouse_maiden_name':
      data.spouseMaidenName = answer;
      break;

    // Property Agreement
    case 'property_agreement_check':
      data.hasPropertyAgreement = answer.toLowerCase() === 'yes';
      break;
    case 'property_agreement_details':
      data.propertyAgreementDetails = answer;
      break;
    case 'property_agreement_complete':
      data.allPropertyCovered = answer.toLowerCase() === 'yes';
      break;
    case 'property_division_preference':
      data.propertyDivisionPreference = answer as 'court_decides' | 'specify_myself';
      break;

    // Real Estate
    case 'home_check':
      data.hasHome = answer.toLowerCase() === 'yes';
      break;
    case 'home_address':
      const newHome = {
        id: `home-${Date.now()}`,
        address: answer,
        hasDisclaimerDeed: false,
        divisionOption: 'sell_split' as const,
      };
      data.homes = [...data.homes, newHome];
      break;
    case 'disclaimer_deed_check':
      if (data.homes.length > 0) {
        const lastHome = data.homes[data.homes.length - 1];
        lastHome.hasDisclaimerDeed = answer.toLowerCase() === 'yes';
      }
      break;
    case 'community_funds_check':
      if (data.homes.length > 0) {
        const lastHome = data.homes[data.homes.length - 1];
        lastHome.usedCommunityFunds = answer.toLowerCase() === 'yes';
      }
      break;
    case 'equitable_lien_request':
      if (data.homes.length > 0) {
        const lastHome = data.homes[data.homes.length - 1];
        lastHome.requestEquitableLien = answer.toLowerCase() === 'yes';
      }
      break;
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

    // Bank Accounts (Structured per-account)
    case 'bank_accounts_during_marriage_check':
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

    // Community Debts (Structured)
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

    // Tax Filing
    case 'tax_filing':
      data.currentYearTaxFiling = answer as 'jointly' | 'separately';
      break;
    case 'previous_tax_check':
      data.hasPreviousUnfiledTaxes = answer.toLowerCase() === 'yes';
      break;
    case 'previous_tax_option':
      data.previousTaxOption = answer as 'file_jointly' | 'file_separately';
      break;

    // Spousal Maintenance
    case 'maintenance_check':
      data.maintenanceEntitlement = answer as 'neither' | 'me' | 'spouse';
      break;
    case 'maintenance_reasons_me':
    case 'maintenance_reasons_spouse':
      data.maintenanceReasons = answer.split(',').map(s => s.trim());
      break;

    // Other Orders
    case 'other_orders':
      data.otherOrders = answer;
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
export function getChatDataSummary(data: DivorceWithChildrenChatData): string {
  const lines: string[] = [];

  lines.push(`**Petitioner:** ${data.fullName}`);
  lines.push(`**Respondent:** ${data.spouseFullName}`);
  lines.push(`**County:** ${data.county}`);
  lines.push(`**Date of Marriage:** ${data.dateOfMarriage}`);
  lines.push(`**Number of Children:** ${data.children.length}`);

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
