import {
  ChatMessage,
  ChatQuestion,
  ModificationChatData,
  initialModificationChatData,
  ChildInfo,
} from './types';
import {
  MODIFICATION_QUESTIONS,
  getQuestionById,
  getNextQuestion,
} from './questions';

export interface ChatState {
  messages: ChatMessage[];
  currentQuestionId: string | null;
  data: ModificationChatData;
  isComplete: boolean;
  isStopped: boolean;
  stopReason?: string;
  currentItemIndex: Record<string, number>;
  tempItemData: Record<string, unknown>;
}

export const initialChatState: ChatState = {
  messages: [],
  currentQuestionId: 'welcome',
  data: initialModificationChatData,
  isComplete: false,
  isStopped: false,
  currentItemIndex: {},
  tempItemData: {},
};

// Issue block routing: maps modification type to its intro question ID
const ISSUE_BLOCKS: Record<string, string> = {
  legal_decision_making: 'ldm_intro',
  parenting_time: 'pt_intro',
  child_support: 'cs_intro',
};

// Fixed ordering of issues
const ISSUE_ORDER = ['legal_decision_making', 'parenting_time', 'child_support'];

/**
 * Determine which issue block a question belongs to based on its ID prefix.
 */
function getCurrentIssueBlock(questionId: string): string | null {
  if (questionId.startsWith('ldm_')) return 'legal_decision_making';
  if (questionId.startsWith('pt_')) return 'parenting_time';
  if (questionId.startsWith('cs_')) return 'child_support';
  return null;
}

/**
 * Find the next selected issue after the current one.
 * If currentIssue is null, returns the first selected issue.
 */
function getNextSelectedIssue(
  currentIssue: string | null,
  selectedMods: string[]
): string | null {
  if (!currentIssue) {
    // Return the first selected issue
    for (const issue of ISSUE_ORDER) {
      if (selectedMods.includes(issue)) return issue;
    }
    return null;
  }

  // Find the next selected issue after the current one
  const currentIdx = ISSUE_ORDER.indexOf(currentIssue);
  for (let i = currentIdx + 1; i < ISSUE_ORDER.length; i++) {
    if (selectedMods.includes(ISSUE_ORDER[i])) return ISSUE_ORDER[i];
  }
  return null;
}

/**
 * Resolve sentinel question IDs to actual question IDs based on state.
 */
function resolveSentinel(
  nextId: string,
  currentQuestionId: string,
  data: ModificationChatData
): string {
  if (nextId === '__route_to_first_issue__') {
    const firstIssue = getNextSelectedIssue(null, data.modificationsSelected);
    return firstIssue ? ISSUE_BLOCKS[firstIssue] : 'complete';
  }

  if (nextId === '__next_issue__') {
    const currentBlock = getCurrentIssueBlock(currentQuestionId);
    const nextIssue = getNextSelectedIssue(currentBlock, data.modificationsSelected);
    return nextIssue ? ISSUE_BLOCKS[nextIssue] : 'complete';
  }

  return nextId;
}

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
  const roleLabel =
    state.data.role === 'petitioner' ? 'Petitioner' : 'Respondent';
  questionText = questionText.replace(/\{roleLabel\}/g, roleLabel);

  // Also replace placeholders in options
  let processedOptions = question.options;
  if (processedOptions) {
    processedOptions = processedOptions.map((opt) => ({
      ...opt,
      label: opt.label.replace(/\{roleLabel\}/g, roleLabel),
      description: opt.description?.replace(/\{roleLabel\}/g, roleLabel),
    }));
  }

  // Dynamic intro text: adjust "first" to "next" if not the first issue
  if (
    state.currentQuestionId === 'ldm_intro' &&
    state.data.modificationsSelected.length > 0
  ) {
    const firstSelected = getNextSelectedIssue(
      null,
      state.data.modificationsSelected
    );
    if (firstSelected !== 'legal_decision_making') {
      questionText = questionText.replace('first', 'next');
    }
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
    const ageInYears =
      (today.getTime() - newDob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (ageInYears >= 18) {
      const correctedData = {
        ...newData,
        children: newData.children.slice(0, -1),
      };
      const errorMsg = createMessage(
        'assistant',
        'This child appears to be 18 or older. They will not be included as a minor child in the petition. Please only add children under 18.',
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

  // Resolve sentinel values for dynamic issue routing
  if (nextQuestionId) {
    nextQuestionId = resolveSentinel(
      nextQuestionId,
      state.currentQuestionId,
      newData
    );
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
  currentData: ModificationChatData,
  questionId: string,
  answer: string,
  tempData: Record<string, unknown>
): { data: ModificationChatData; tempItemData: Record<string, unknown> } {
  const data = { ...currentData };
  let newTempData = { ...tempData };

  switch (questionId) {
    // Case Information
    case 'case_number':
      data.caseNumber = answer;
      break;
    case 'same_county':
      data.isSameCounty = answer.toLowerCase() === 'yes';
      break;
    case 'domesticated':
      data.isDomesticated = answer.toLowerCase() === 'yes';
      break;
    case 'domesticated_case_number':
      data.domesticatedCaseNumber = answer;
      break;
    case 'attorney_referral':
      data.wantAttorneyReferral = answer.toLowerCase() === 'yes';
      break;

    // Personal Information
    case 'full_name':
      data.fullName = answer;
      break;
    case 'mailing_address':
      data.mailingAddress = answer;
      break;
    case 'other_party_name':
      data.otherPartyName = answer;
      break;
    case 'other_party_address':
      data.otherPartyAddress = answer;
      break;

    // Children (repeatable)
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

    // Role
    case 'role_select':
      data.role = answer as 'petitioner' | 'respondent';
      break;

    // Modification Selection
    case 'modifications_selected':
      data.modificationsSelected = answer
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      break;

    // Legal Decision Making fields
    case 'ldm_order_date':
      data.ldm_orderDate = answer;
      break;
    case 'ldm_court_name':
      data.ldm_courtName = answer;
      break;
    case 'ldm_page_number':
      data.ldm_pageNumber = /^\d+$/.test(answer.trim()) ? `Pg. ${answer.trim()}` : answer;
      break;
    case 'ldm_section_paragraph':
      data.ldm_sectionParagraph = answer;
      break;
    case 'ldm_why_change':
      data.ldm_whyChange = answer;
      break;
    case 'ldm_change_circumstance':
      data.ldm_changeInCircumstance = answer;
      break;
    case 'ldm_modification_type':
      data.ldm_modificationType = answer;
      break;

    // Parenting Time fields
    case 'pt_order_date':
      data.pt_orderDate = answer;
      break;
    case 'pt_court_name':
      data.pt_courtName = answer;
      break;
    case 'pt_page_number':
      data.pt_pageNumber = /^\d+$/.test(answer.trim()) ? `Pg. ${answer.trim()}` : answer;
      break;
    case 'pt_section_paragraph':
      data.pt_sectionParagraph = answer;
      break;
    case 'pt_why_change':
      data.pt_whyChange = answer;
      break;
    case 'pt_change_circumstance':
      data.pt_changeInCircumstance = answer;
      break;
    case 'pt_new_schedule':
      data.pt_newSchedule = answer;
      break;
    case 'pt_custom_schedule_details':
      data.pt_customScheduleDetails = answer;
      break;
    case 'pt_supervised':
      data.pt_supervised = answer.toLowerCase() === 'yes';
      break;
    case 'pt_supervised_reason':
      data.pt_supervisedReason = answer;
      break;

    // Child Support fields
    case 'cs_order_date':
      data.cs_orderDate = answer;
      break;
    case 'cs_court_name':
      data.cs_courtName = answer;
      break;
    case 'cs_page_number':
      data.cs_pageNumber = /^\d+$/.test(answer.trim()) ? `Pg. ${answer.trim()}` : answer;
      break;
    case 'cs_section_paragraph':
      data.cs_sectionParagraph = answer;
      break;
    case 'cs_why_change':
      data.cs_whyChange = answer;
      break;
    case 'cs_change_circumstance':
      data.cs_changeInCircumstance = answer;
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
export function getChatDataSummary(data: ModificationChatData): string {
  const lines: string[] = [];

  lines.push(`**Filing Party:** ${data.fullName} (${data.role === 'petitioner' ? 'Petitioner' : 'Respondent'})`);
  lines.push(`**Other Party:** ${data.otherPartyName}`);
  lines.push(`**Case Number:** ${data.caseNumber}`);

  if (data.children.length > 0) {
    lines.push(
      `\n**Children:** ${data.children.map((c) => c.name).join(', ')}`
    );
  }

  if (data.modificationsSelected.length > 0) {
    lines.push(
      `\n**Modifications Requested:** ${data.modificationsSelected
        .map((m) =>
          m
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        )
        .join(', ')}`
    );
  }

  return lines.join('\n');
}
