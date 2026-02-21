import { ChatMessage, ChatQuestion, DivorceChatData, initialDivorceChatData } from './types';
import { DIVORCE_CHAT_QUESTIONS, getQuestionById, getNextQuestion } from './questions';

export interface ChatState {
  messages: ChatMessage[];
  currentQuestionId: string | null;
  data: DivorceChatData;
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
  data: initialDivorceChatData,
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
 * All questions are shown as assistant messages on the LEFT side
 * User answers appear on the RIGHT side
 */
export function processCurrentQuestion(state: ChatState): ChatState {
  if (!state.currentQuestionId) return state;

  const question = getQuestionById(state.currentQuestionId);
  if (!question) return state;

  // Replace placeholders in question text
  let questionText = question.question;
  questionText = questionText.replace('{county}', state.data.county || 'your');

  // Add description if present to provide more context
  const fullText = question.description
    ? `${questionText}\n\n${question.description}`
    : questionText;

  // Create assistant message with question (appears on LEFT)
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
  const newData = updateDataFromAnswer(state.data, question.id, answer, state.tempItemData);

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

  // Check if this is a repeatable question and handle accordingly
  if (question.repeatable && answer && answer.toLowerCase() !== 'no') {
    // Stay on same question for next item
    nextQuestionId = question.id;
  }

  // Check for completion
  if (nextQuestionId === 'complete' || !nextQuestionId) {
    return {
      ...state,
      messages: newMessages,
      data: newData,
      currentQuestionId: 'complete',
      isComplete: true,
    };
  }

  return {
    ...state,
    messages: newMessages,
    data: newData,
    currentQuestionId: nextQuestionId,
    tempItemData: {},
  };
}

/**
 * Update collected data based on the answered question
 */
function updateDataFromAnswer(
  currentData: DivorceChatData,
  questionId: string,
  answer: string,
  tempData: Record<string, unknown>
): DivorceChatData {
  const data = { ...currentData };

  switch (questionId) {
    // Personal Information
    case 'has_children':
      data.hasChildren = answer.toLowerCase() === 'yes';
      break;
    case 'full_name':
      data.fullName = answer;
      break;
    case 'email':
      data.email = answer;
      break;
    case 'ssn4':
      data.ssn4 = answer;
      break;
    case 'county':
      data.county = answer;
      break;
    case 'gender':
      data.gender = answer as 'male' | 'female';
      break;
    case 'mailing_address':
      data.mailingAddress = answer;
      break;
    case 'phone':
      data.phone = answer;
      break;
    case 'date_of_birth':
      data.dateOfBirth = answer;
      break;
    case 'date_of_marriage':
      data.dateOfMarriage = answer;
      break;

    // Spouse Information
    case 'spouse_full_name':
      data.spouseFullName = answer;
      break;
    case 'spouse_date_of_birth':
      data.spouseDateOfBirth = answer;
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
    case 'conciliation':
      data.wantsConciliation = answer.toLowerCase() === 'yes';
      break;
    case 'maiden_name_check':
      data.wantsMaidenName = answer.toLowerCase() === 'yes';
      break;
    case 'maiden_name_input':
      data.maidenName = answer;
      break;

    // Property Agreement
    case 'property_agreement_check':
      data.hasPropertyAgreement = answer.toLowerCase() === 'yes';
      break;
    case 'property_division_preference':
      data.propertyDivisionPreference = answer as 'court_decides' | 'specify_myself';
      break;
    case 'separate_property_preference':
      if (answer.toLowerCase() === 'yes') {
        data.hasSeparateProperty = true;
      }
      break;
    case 'separate_property_court_text':
      data.courtDecidesSeparateProperty = answer;
      break;
    case 'property_agreement_details':
      data.propertyAgreementDetails = answer;
      break;
    case 'property_agreement_complete':
      data.allPropertyCovered = answer.toLowerCase() === 'yes';
      break;

    // Real Estate
    case 'home_check':
      data.hasHome = answer.toLowerCase() === 'yes';
      break;
    case 'home_address':
      // Add new home or update temp data
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
      tempData.currentBankAccountName = answer;
      break;
    case 'bank_account_division':
      if (tempData.currentBankAccountName) {
        data.bankAccountsStructured = [...data.bankAccountsStructured, {
          id: `bank-${Date.now()}`,
          description: tempData.currentBankAccountName as string,
          division: answer as 'i_keep' | 'spouse_keeps' | 'split_50_50',
        }];
      }
      break;

    // Retirement Accounts
    case 'retirement_check':
      data.hasRetirement = answer.toLowerCase() === 'yes';
      break;
    case 'retirement_type':
      tempData.currentRetirementType = answer;
      break;
    case 'retirement_type_other':
      tempData.currentRetirementTypeOther = answer;
      break;
    case 'retirement_owner':
      tempData.currentRetirementOwner = answer;
      break;
    case 'retirement_administrator':
      tempData.currentRetirementAdmin = answer;
      break;
    case 'retirement_division':
      if (tempData.currentRetirementType) {
        const accountType = tempData.currentRetirementType === 'other'
          ? (tempData.currentRetirementTypeOther as string) || 'Other'
          : tempData.currentRetirementType as string;
        data.retirementAccounts = [...data.retirementAccounts, {
          id: `retirement-${Date.now()}`,
          accountType,
          accountTypeOther: tempData.currentRetirementTypeOther as string | undefined,
          ownerName: (tempData.currentRetirementOwner as 'me' | 'spouse') || 'me',
          administrator: (tempData.currentRetirementAdmin as string) || '',
          proposedDivision: answer,
        }];
      }
      break;

    // Vehicles (loan amount removed)
    case 'vehicle_check':
      data.hasVehicles = answer.toLowerCase() === 'yes';
      break;
    case 'vehicle_info':
      tempData.currentVehicleInfo = answer;
      break;
    case 'vehicle_title':
      tempData.currentVehicleTitle = answer;
      break;
    case 'vehicle_division':
      if (tempData.currentVehicleInfo) {
        const [year, make, ...modelParts] = (tempData.currentVehicleInfo as string).split(' ');
        data.vehicles = [...data.vehicles, {
          id: `vehicle-${Date.now()}`,
          year: year || '',
          make: make || '',
          model: modelParts.join(' ') || '',
          titledTo: (tempData.currentVehicleTitle as 'me' | 'spouse' | 'both') || 'me',
          hasLoan: false,
          loanBalance: 0,
          divisionOption: answer as 'i_keep' | 'spouse_keeps' | 'sell_split',
        }];
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
      tempData.currentCreditCardInfo = answer;
      break;
    case 'credit_card_division':
      if (tempData.currentCreditCardInfo) {
        data.creditCards = [...data.creditCards, {
          id: `cc-${Date.now()}`,
          description: tempData.currentCreditCardInfo as string,
          awardedTo: answer as 'me' | 'spouse' | 'split' | 'other',
        }];
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
      data.previousTaxOption = answer;
      break;

    // Spousal Maintenance
    case 'maintenance_check':
      data.maintenanceEntitlement = answer as 'neither' | 'me' | 'spouse';
      break;
    case 'maintenance_reasons_me':
    case 'maintenance_reasons_spouse':
      // Handle multiselect - answer might be comma-separated
      data.maintenanceReasons = answer.split(',').map(s => s.trim());
      break;

    // Other Orders
    case 'other_orders':
      data.otherOrders = answer;
      break;
  }

  return data;
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
export function getChatDataSummary(data: DivorceChatData): string {
  const lines: string[] = [];

  lines.push(`**Petitioner:** ${data.fullName}`);
  lines.push(`**Respondent:** ${data.spouseFullName}`);
  lines.push(`**County:** ${data.county}`);
  lines.push(`**Date of Marriage:** ${data.dateOfMarriage}`);

  if (data.homes.length > 0) {
    lines.push(`\n**Real Estate:** ${data.homes.length} properties`);
  }
  if (data.bankAccounts.length > 0) {
    lines.push(`**Bank Accounts:** ${data.bankAccounts.length} accounts`);
  }
  if (data.retirementAccounts.length > 0) {
    lines.push(`**Retirement Accounts:** ${data.retirementAccounts.length} accounts`);
  }
  if (data.vehicles.length > 0) {
    lines.push(`**Vehicles:** ${data.vehicles.length} vehicles`);
  }
  if (data.communityDebts.length > 0) {
    lines.push(`**Community Debts:** ${data.communityDebts.length} debts`);
  }

  return lines.join('\n');
}
