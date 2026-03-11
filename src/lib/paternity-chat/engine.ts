import { ChatMessage, ChatQuestion, PaternityChatData, initialPaternityChatData, ChildInfo, PriorCourtCase, CustodyClaimant } from './types';
import { PATERNITY_QUESTIONS, getQuestionById, getNextQuestion } from './questions';

export interface ChatState {
  messages: ChatMessage[];
  currentQuestionId: string | null;
  data: PaternityChatData;
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
  data: initialPaternityChatData,
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

  // Dynamic text based on biological father answer
  const isBioFatherMe = state.data.biologicalFather === 'me';
  questionText = questionText.replace(
    '{bioFatherText}',
    isBioFatherMe ? 'you are' : 'your significant other is'
  );
  questionText = questionText.replace(
    '{bioFatherShort}',
    isBioFatherMe ? 'I am' : 'My significant other is'
  );

  // Also replace placeholders in option descriptions
  let processedOptions = question.options;
  if (processedOptions) {
    processedOptions = processedOptions.map(opt => ({
      ...opt,
      description: opt.description
        ?.replace(/{bioFatherShort}/g, isBioFatherMe ? 'I am' : 'My significant other is')
        ?.replace(/{bioFatherText}/g, isBioFatherMe ? 'you are' : 'your significant other is'),
    }));
  }

  // Add description if present
  const fullText = question.description
    ? `${questionText}\n\n${question.description}`
    : questionText;

  // Create assistant message with question
  const assistantMessage = createMessage(
    'assistant',
    fullText,
    question.id,
    processedOptions,
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

  // Petitioner DOB validation - must be at least 18
  if (question.id === 'date_of_birth') {
    const dob = new Date(answer);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      const errorMsg = createMessage(
        'assistant',
        `Based on the date of birth entered, you would be ${age} years old. You must be at least 18 years old to file a petition. Please re-enter your date of birth.`,
        'petitioner_dob_age_validation'
      );
      return {
        ...state,
        messages: [...newMessages, errorMsg],
        data: { ...newData, dateOfBirth: '' },
        currentQuestionId: 'date_of_birth',
        tempItemData: newTempData,
      };
    }
  }

  // Other party DOB validation - must be at least 18
  if (question.id === 'other_party_date_of_birth') {
    const dob = new Date(answer);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      const errorMsg = createMessage(
        'assistant',
        `Based on the date of birth entered, your significant other would be ${age} years old. Both parties must be at least 18 years old. Please re-enter the correct date of birth for your significant other.`,
        'other_party_dob_age_validation'
      );
      return {
        ...state,
        messages: [...newMessages, errorMsg],
        data: { ...newData, otherPartyDateOfBirth: '' },
        currentQuestionId: 'other_party_date_of_birth',
        tempItemData: newTempData,
      };
    }
  }

  // Existing order date validation - can't be before earliest child's DOB (Issue 1)
  if (question.id === 'existing_order_date' && newData.children.length > 0) {
    const orderDate = new Date(answer);
    const earliestChildDob = newData.children.reduce((earliest, child) => {
      const dob = new Date(child.dateOfBirth);
      return dob < earliest ? dob : earliest;
    }, new Date(newData.children[0].dateOfBirth));

    if (orderDate < earliestChildDob) {
      const errorMsg = createMessage(
        'assistant',
        `The date of the prior child support order cannot be before the birth of your earliest minor child (${earliestChildDob.toLocaleDateString()}). Please re-enter the correct date.`,
        'existing_order_date_validation'
      );
      return {
        ...state,
        messages: [...newMessages, errorMsg],
        data: { ...newData, existingOrderDate: '' },
        currentQuestionId: 'existing_order_date',
        tempItemData: newTempData,
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

  // DV + LDM redundancy fix: When domestic violence option is 'no_joint_decision',
  // auto-set legal decision making to sole for the non-DV party and skip the LDM question
  if (nextQuestionId === 'legal_decision_making' && newData.hasDomesticViolence && newData.domesticViolenceOption === 'no_joint_decision') {
    // Award sole LDM to the non-violent party
    if (newData.domesticViolenceCommittedBy === 'petitioner') {
      newData.legalDecisionMaking = 'respondent_sole';
    } else {
      newData.legalDecisionMaking = 'petitioner_sole';
    }
    nextQuestionId = 'parenting_time_schedule';

    // Add system message explaining the auto-decision
    const dvParty = newData.domesticViolenceCommittedBy === 'petitioner' ? 'Petitioner' : 'Respondent';
    const nonDvParty = newData.domesticViolenceCommittedBy === 'petitioner' ? 'Respondent' : 'Petitioner';
    const systemMsg = createMessage(
      'system',
      `Based on your domestic violence disclosure, joint legal decision-making cannot be awarded to ${dvParty} pursuant to A.R.S. §25-403.03. Sole legal decision-making has been automatically assigned to ${nonDvParty}.`
    );
    newMessages.push(systemMsg);
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
  currentData: PaternityChatData,
  questionId: string,
  answer: string,
  tempData: Record<string, unknown>
): { data: PaternityChatData; tempItemData: Record<string, unknown> } {
  const data = { ...currentData };
  let newTempData = { ...tempData };

  switch (questionId) {
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

    // Preliminary Injunction
    case 'preliminary_injunction_check':
      data.wantsPreliminaryInjunction = answer.toLowerCase() === 'yes';
      break;
    case 'injunction_document_type':
      data.injunctionDocumentType = answer as PaternityChatData['injunctionDocumentType'];
      break;

    // Biological Father
    case 'biological_father':
      data.biologicalFather = answer as 'me' | 'significant_other';
      break;

    // Other Party Information
    case 'other_party_full_name':
      data.otherPartyFullName = answer;
      break;
    case 'other_party_date_of_birth':
      data.otherPartyDateOfBirth = answer;
      break;
    case 'other_party_address_known':
      data.otherPartyAddressKnown = answer.toLowerCase() === 'yes';
      if (answer.toLowerCase() === 'no') {
        data.otherPartyMailingAddress = 'Unknown';
      }
      break;
    case 'other_party_mailing_address':
      data.otherPartyMailingAddress = answer;
      break;
    case 'other_party_ssn4_known':
      data.otherPartySsn4Known = answer.toLowerCase() === 'yes';
      if (answer.toLowerCase() === 'no') {
        data.otherPartySsn4 = 'Unknown';
      }
      break;
    case 'other_party_ssn4':
      data.otherPartySsn4 = answer;
      break;
    case 'other_party_phone_known':
      data.otherPartyPhoneKnown = answer.toLowerCase() === 'yes';
      if (answer.toLowerCase() === 'no') {
        data.otherPartyPhone = 'Unknown';
      }
      break;
    case 'other_party_phone':
      data.otherPartyPhone = answer;
      break;
    case 'other_party_email_known':
      data.otherPartyEmailKnown = answer.toLowerCase() === 'yes';
      if (answer.toLowerCase() === 'no') {
        data.otherPartyEmail = 'Unknown';
      }
      break;
    case 'other_party_email':
      data.otherPartyEmail = answer;
      break;
    case 'other_party_gender':
      data.otherPartyGender = answer as 'male' | 'female';
      break;

    // Arizona Jurisdiction
    case 'jurisdiction_reasons':
      data.jurisdictionReasons = answer.split(',').map(s => s.trim());
      break;

    // Children Information
    case 'child_name':
      newTempData.currentChildName = answer;
      break;
    case 'child_gender':
      newTempData.currentChildGender = answer;
      break;
    case 'child_dob': {
      const newChild: ChildInfo = {
        id: `child-${Date.now()}`,
        name: (newTempData.currentChildName as string) || '',
        gender: (newTempData.currentChildGender as 'male' | 'female') || 'male',
        dateOfBirth: answer,
      };
      data.children = [...data.children, newChild];
      newTempData = {};
      break;
    }
    case 'children_residency':
      data.childrenMeetResidency = answer.toLowerCase() === 'yes';
      break;
    case 'children_reside_with':
      data.childrenResideWith = answer as 'petitioner' | 'respondent' | 'both';
      break;
    case 'children_address':
      data.childrenCurrentAddress = answer;
      break;

    // Paternity Reason
    case 'paternity_reason':
      data.paternityReason = answer;
      break;
    case 'paternity_reason_other':
      data.paternityReasonOther = answer;
      break;

    // Existing Child Support Order
    case 'existing_child_support_order':
      data.hasExistingChildSupportOrder = answer.toLowerCase() === 'yes';
      break;
    case 'existing_order_court':
      data.existingOrderCourt = answer;
      break;
    case 'existing_order_date':
      data.existingOrderDate = answer;
      break;
    case 'existing_order_modification':
      data.existingOrderNeedsModification = answer.toLowerCase() === 'yes';
      break;
    case 'existing_order_modify_how':
      data.existingOrderModifyHow = answer;
      break;

    // Past Child Support
    case 'past_child_support_check':
      data.owesPastChildSupport = answer.toLowerCase() === 'yes';
      break;
    case 'past_support_who':
      data.pastSupportOwedBy = answer as 'me' | 'significant_other';
      break;
    case 'past_support_period':
      data.pastSupportPeriod = answer as 'from_filing' | 'from_living_apart';
      break;

    // Seeking Child Support
    case 'child_support_check':
      data.seekingChildSupport = answer.toLowerCase() === 'yes';
      break;
    case 'child_support_waiver':
      data.wantsChildSupportWaiver = answer.toLowerCase() === 'yes';
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
      // Compose details string from structured data
      const payerLabel = data.voluntaryPaymentWho === 'respondent' ? 'Respondent' : 'Petitioner';
      data.voluntaryChildSupportDetails = `${payerLabel} has made a total of $${data.voluntaryPaymentAmount || '0'} in voluntary child support payments beginning on ${answer} which should be accounted for.`;
      break;
    }

    // Prior Custody Cases (Q10)
    case 'prior_custody_cases_check':
      data.hasPriorCustodyCases = answer.toLowerCase() === 'yes';
      break;
    case 'prior_case_child_name':
      newTempData.priorCaseChildName = answer;
      break;
    case 'prior_case_state':
      newTempData.priorCaseState = answer;
      break;
    case 'prior_case_county':
    case 'prior_case_county_text':
      newTempData.priorCaseCounty = answer;
      break;
    case 'prior_case_number_known':
      if (answer.toLowerCase() === 'no') {
        newTempData.priorCaseNumber = 'Unknown';
      }
      break;
    case 'prior_case_number':
      newTempData.priorCaseNumber = answer;
      break;
    case 'prior_case_type':
      newTempData.priorCaseType = answer;
      break;
    case 'prior_case_summary': {
      const priorState = (newTempData.priorCaseState as string) || '';
      const priorCounty = (newTempData.priorCaseCounty as string) || '';
      const newCase: PriorCourtCase = {
        id: `prior-${Date.now()}`,
        childName: (newTempData.priorCaseChildName as string) || '',
        stateCounty: priorCounty ? `${priorState}, ${priorCounty} County` : priorState,
        caseNumber: (newTempData.priorCaseNumber as string) || '',
        proceedingType: (newTempData.priorCaseType as string) || '',
        courtOrderSummary: answer,
      };
      data.priorCustodyCases = [...data.priorCustodyCases, newCase];
      newTempData = {};
      break;
    }

    // Affecting Court Actions (Q11)
    case 'affecting_court_actions_check':
      data.hasAffectingCourtActions = answer.toLowerCase() === 'yes';
      break;
    case 'affecting_case_child_name':
      newTempData.affectingCaseChildName = answer;
      break;
    case 'affecting_case_state':
      newTempData.affectingCaseState = answer;
      break;
    case 'affecting_case_county':
    case 'affecting_case_county_text':
      newTempData.affectingCaseCounty = answer;
      break;
    case 'affecting_case_number_known':
      if (answer.toLowerCase() === 'no') {
        newTempData.affectingCaseNumber = 'Unknown';
      }
      break;
    case 'affecting_case_number':
      newTempData.affectingCaseNumber = answer;
      break;
    case 'affecting_case_type':
      newTempData.affectingCaseType = answer;
      break;
    case 'affecting_case_summary': {
      const affState = (newTempData.affectingCaseState as string) || '';
      const affCounty = (newTempData.affectingCaseCounty as string) || '';
      const newAction: PriorCourtCase = {
        id: `affecting-${Date.now()}`,
        childName: (newTempData.affectingCaseChildName as string) || '',
        stateCounty: affCounty ? `${affState}, ${affCounty} County` : affState,
        caseNumber: (newTempData.affectingCaseNumber as string) || '',
        proceedingType: (newTempData.affectingCaseType as string) || '',
        courtOrderSummary: answer,
      };
      data.affectingCourtActions = [...data.affectingCourtActions, newAction];
      newTempData = {};
      break;
    }

    // Other Custody Claimants (Q12)
    case 'other_custody_claimants_check':
      data.hasOtherCustodyClaimants = answer.toLowerCase() === 'yes';
      break;
    case 'claimant_child_name':
      newTempData.claimantChildName = answer;
      break;
    case 'claimant_person_name':
      newTempData.claimantPersonName = answer;
      break;
    case 'claimant_person_address':
      newTempData.claimantPersonAddress = answer;
      break;
    case 'claimant_claim_nature': {
      const newClaimant: CustodyClaimant = {
        id: `claimant-${Date.now()}`,
        childName: (newTempData.claimantChildName as string) || '',
        personName: (newTempData.claimantPersonName as string) || '',
        personAddress: (newTempData.claimantPersonAddress as string) || '',
        claimNature: answer,
      };
      data.otherCustodyClaimants = [...data.otherCustodyClaimants, newClaimant];
      newTempData = {};
      break;
    }

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

    // Drug/DUI Conviction
    case 'drug_conviction_check':
      data.hasDrugConviction = answer === 'yes';
      data.drugConvictionUnaware = answer === 'unaware';
      break;
    case 'drug_conviction_who':
      data.drugConvictionParty = answer as 'me' | 'significant_other';
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
      data.parentingTimeSchedule = answer as '3-2-2-3' | '5-2-2-5' | 'alternating_weeks' | 'custom' | 'no_parenting_time';
      break;
    case 'custom_schedule_details':
      data.customScheduleDetails = answer;
      break;
    case 'supervised_check':
      data.isParentingTimeSupervised = answer === 'supervised';
      break;

    // Holiday Schedule
    case 'holiday_new_years_eve':
      data.holidaySchedule = { ...data.holidaySchedule, newYearsEve: answer as any };
      break;
    case 'holiday_new_years_day':
      data.holidaySchedule = { ...data.holidaySchedule, newYearsDay: answer as any };
      break;
    case 'holiday_easter':
      data.holidaySchedule = { ...data.holidaySchedule, easter: answer as any };
      break;
    case 'holiday_fourth_july':
      data.holidaySchedule = { ...data.holidaySchedule, fourthOfJuly: answer as any };
      break;
    case 'holiday_halloween':
      data.holidaySchedule = { ...data.holidaySchedule, halloween: answer as any };
      break;
    case 'holiday_thanksgiving':
      data.holidaySchedule = { ...data.holidaySchedule, thanksgiving: answer as any };
      break;
    case 'holiday_hanukkah':
      data.holidaySchedule = { ...data.holidaySchedule, hanukkah: answer as any };
      break;
    case 'holiday_christmas_eve':
      data.holidaySchedule = { ...data.holidaySchedule, christmasEve: answer as any };
      break;
    case 'holiday_christmas_day':
      data.holidaySchedule = { ...data.holidaySchedule, christmasDay: answer as any };
      break;
    case 'holiday_child_birthday':
      data.holidaySchedule = { ...data.holidaySchedule, childBirthday: answer as any };
      break;
    case 'holiday_father_birthday':
      data.holidaySchedule = { ...data.holidaySchedule, fatherBirthday: answer as any };
      break;
    case 'holiday_mother_birthday':
      data.holidaySchedule = { ...data.holidaySchedule, motherBirthday: answer as any };
      break;
    case 'holiday_mothers_day':
      data.holidaySchedule = { ...data.holidaySchedule, mothersDay: answer as any };
      break;
    case 'holiday_fathers_day':
      data.holidaySchedule = { ...data.holidaySchedule, fathersDay: answer as any };
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
      data.holidaySchedule = {
        ...data.holidaySchedule,
        otherHolidays: data.holidaySchedule.otherHolidays
          ? `${data.holidaySchedule.otherHolidays}; ${entry}`
          : entry,
      };
      newTempData = {};
      break;
    }

    // Break Schedule
    case 'break_spring':
      data.breakSchedule = { ...data.breakSchedule, springBreak: answer as any };
      break;
    case 'break_fall':
      data.breakSchedule = { ...data.breakSchedule, fallBreak: answer as any };
      break;
    case 'break_winter':
      data.breakSchedule = { ...data.breakSchedule, winterBreak: answer as any };
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
      data.extracurricularOption = answer as 'none' | 'both_agree_split' | 'each_selects_pays' | 'each_selects_limit_split' | 'other';
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

    // Health Insurance
    case 'health_insurance_provider':
      data.healthInsuranceProvider = answer as 'petitioner' | 'respondent' | 'both';
      break;

    // Parent Information Program
    case 'parent_info_program':
      data.hasAttendedParentInfoProgram = answer.toLowerCase() === 'yes';
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
export function getChatDataSummary(data: PaternityChatData): string {
  const lines: string[] = [];

  lines.push(`**Petitioner:** ${data.fullName}`);
  lines.push(`**Respondent:** ${data.otherPartyFullName}`);
  lines.push(`**County:** ${data.county}`);
  lines.push(`**Number of Children:** ${data.children.length}`);
  lines.push(`**Biological Father:** ${data.biologicalFather === 'me' ? 'Petitioner' : 'Respondent'}`);

  if (data.wantsPreliminaryInjunction) {
    lines.push(`\n**Preliminary Injunction:** Requested`);
  }

  return lines.join('\n');
}
