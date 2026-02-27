import {
  ChatMessage,
  ChatQuestion,
  ModificationChatData,
  initialModificationChatData,
  ChildInfo,
  ExtractedOrderData,
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

// Questions that should be auto-submitted when pre-fill data is available
const AUTO_SUBMIT_PREFILL_IDS = new Set([
  'case_number',
  'full_name',
  'other_party_name',
  'ldm_order_date', 'ldm_court_name', 'ldm_page_number', 'ldm_paragraph_number',
  'pt_order_date', 'pt_court_name', 'pt_page_number', 'pt_paragraph_number',
  'cs_order_date', 'cs_court_name', 'cs_page_number', 'cs_paragraph_number',
]);

/**
 * Create a new chat message
 */
export function createMessage(
  type: 'assistant' | 'user' | 'system',
  content: string,
  questionId?: string,
  options?: ChatQuestion['options'],
  inputType?: ChatQuestion['type'],
  autoFilled?: boolean
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    timestamp: new Date(),
    questionId,
    options,
    inputType,
    autoFilled,
  };
}

/**
 * Process the current question and return a message.
 * When uploaded order data is available, auto-advances through questions
 * that have pre-fill values (showing Q&A pairs in the chat automatically).
 */
export function processCurrentQuestion(state: ChatState): ChatState {
  if (!state.currentQuestionId) return state;

  let currentState = state;
  let iterations = 0;
  const MAX_ITERATIONS = 25;

  while (
    currentState.currentQuestionId &&
    currentState.currentQuestionId !== 'complete' &&
    !currentState.isComplete &&
    !currentState.isStopped &&
    iterations < MAX_ITERATIONS
  ) {
    iterations++;
    const questionId = currentState.currentQuestionId;
    const question = getQuestionById(questionId);
    if (!question) break;

    // --- Children pre-fill: show extracted children and skip to more_children ---
    if (
      questionId === 'children_intro' &&
      currentState.data.hasUploadedOrders &&
      currentState.data.children.length > 0
    ) {
      const childrenList = currentState.data.children
        .map((c) => `• ${c.name}${c.dateOfBirth ? ` (DOB: ${c.dateOfBirth})` : ''}`)
        .join('\n');
      const text = `We found ${currentState.data.children.length} child${
        currentState.data.children.length > 1 ? 'ren' : ''
      } in your uploaded orders:\n\n${childrenList}\n\nWe'll ask if you need to add more children next.`;
      currentState = {
        ...currentState,
        messages: [
          ...currentState.messages,
          createMessage('assistant', text, 'children_intro', undefined, 'info'),
        ],
        currentQuestionId: 'more_children',
      };
      continue;
    }

    // --- Build question text ---
    let questionText = question.question;
    const roleLabel =
      currentState.data.role === 'petitioner' ? 'Petitioner' : 'Respondent';
    questionText = questionText.replace(/\{roleLabel\}/g, roleLabel);

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
      questionId === 'ldm_intro' &&
      currentState.data.modificationsSelected.length > 0
    ) {
      const firstSelected = getNextSelectedIssue(
        null,
        currentState.data.modificationsSelected
      );
      if (firstSelected !== 'legal_decision_making') {
        questionText = questionText.replace('first', 'next');
      }
    }

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

    currentState = {
      ...currentState,
      messages: [...currentState.messages, assistantMessage],
    };

    // --- Check for auto-submit with pre-fill data ---
    if (
      currentState.data.hasUploadedOrders &&
      AUTO_SUBMIT_PREFILL_IDS.has(questionId)
    ) {
      let prefillValue = getPrefillValue(questionId, currentState.data);
      if (prefillValue) {
        // For select questions, validate the value matches an option (case-insensitive)
        if (question.type === 'select' && question.options) {
          const normalizedPrefill = prefillValue.toLowerCase().trim();
          const matchingOption = question.options.find(
            (o) =>
              o.value.toLowerCase().trim() === normalizedPrefill ||
              o.label.toLowerCase().trim() === normalizedPrefill
          );
          if (matchingOption) {
            prefillValue = matchingOption.value;
          } else {
            // No match found, let user select manually
            break;
          }
        }

        // Create auto-filled user message
        const userMessage = createMessage(
          'user',
          prefillValue,
          questionId,
          undefined,
          undefined,
          true
        );

        currentState = {
          ...currentState,
          messages: [...currentState.messages, userMessage],
        };

        // Update data
        const { data: newData, tempItemData: newTempData } =
          updateDataFromAnswer(
            currentState.data,
            question.id,
            prefillValue,
            currentState.tempItemData
          );

        // Get next question
        let nextQuestionId = getNextQuestion(question, prefillValue);
        if (nextQuestionId) {
          nextQuestionId = resolveSentinel(
            nextQuestionId,
            questionId,
            newData
          );
        }

        if (!nextQuestionId || nextQuestionId === 'complete') {
          return {
            ...currentState,
            data: newData,
            currentQuestionId: 'complete',
            isComplete: true,
            tempItemData: {},
          };
        }

        currentState = {
          ...currentState,
          data: newData,
          currentQuestionId: nextQuestionId,
          tempItemData: newTempData,
        };
        continue; // Loop to process next question
      }
    }

    // No auto-submit available, return for manual input
    break;
  }

  return currentState;
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
    // Upload Orders
    case 'upload_orders': {
      if (answer && answer !== 'skip') {
        try {
          const parsed = JSON.parse(answer);
          const { _storagePath, ...rest } = parsed;
          const extracted = rest as ExtractedOrderData;
          data.hasUploadedOrders = true;
          data.extractedOrderData = extracted;
          if (_storagePath) data.uploadedOrderPath = _storagePath;
          // Pre-fill case number
          if (extracted.caseNumber) data.caseNumber = extracted.caseNumber;
          // Pre-fill court name across all blocks
          if (extracted.courtName) {
            data.ldm_courtName = extracted.courtName;
            data.pt_courtName = extracted.courtName;
            data.cs_courtName = extracted.courtName;
          }
          // Pre-fill children
          if (extracted.children && extracted.children.length > 0) {
            data.children = extracted.children.map((c) => ({
              id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: c.name,
              dateOfBirth: c.dateOfBirth || '',
            }));
          }
          // Pre-fill section-specific fields from extracted sections
          if (extracted.sections) {
            for (const section of extracted.sections) {
              if (section.type === 'legal_decision_making') {
                if (section.orderDate) data.ldm_orderDate = section.orderDate;
                if (section.pageNumber) data.ldm_pageNumber = `Pg. ${section.pageNumber}`;
                if (section.paragraphNumber) data.ldm_paragraphNumber = section.paragraphNumber;
                if (section.verbatimText) data.ldm_currentOrderText = section.verbatimText;
              } else if (section.type === 'parenting_time') {
                if (section.orderDate) data.pt_orderDate = section.orderDate;
                if (section.pageNumber) data.pt_pageNumber = `Pg. ${section.pageNumber}`;
                if (section.paragraphNumber) data.pt_paragraphNumber = section.paragraphNumber;
                if (section.verbatimText) data.pt_currentOrderText = section.verbatimText;
              } else if (section.type === 'child_support') {
                if (section.orderDate) data.cs_orderDate = section.orderDate;
                if (section.pageNumber) data.cs_pageNumber = `Pg. ${section.pageNumber}`;
                if (section.paragraphNumber) data.cs_paragraphNumber = section.paragraphNumber;
                if (section.verbatimText) data.cs_currentOrderText = section.verbatimText;
              }
            }
          }
        } catch {
          // If JSON parse fails, skip extraction — user proceeds manually
        }
      }
      break;
    }

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
      // If "other" is selected, the next question will capture the actual court name
      if (answer !== 'other') {
        data.ldm_courtName = answer;
      }
      break;
    case 'ldm_court_name_other':
      data.ldm_courtName = answer;
      break;
    case 'ldm_page_number':
      data.ldm_pageNumber = answer;
      break;
    case 'ldm_paragraph_number':
      data.ldm_paragraphNumber = answer;
      break;
    case 'ldm_why_change':
      data.ldm_whyChange = answer;
      break;
    case 'ldm_modification_type':
      data.ldm_modificationType = answer;
      break;

    // Parenting Time fields
    case 'pt_order_date':
      data.pt_orderDate = answer;
      break;
    case 'pt_court_name':
      if (answer !== 'other') {
        data.pt_courtName = answer;
      }
      break;
    case 'pt_court_name_other':
      data.pt_courtName = answer;
      break;
    case 'pt_page_number':
      data.pt_pageNumber = answer;
      break;
    case 'pt_paragraph_number':
      data.pt_paragraphNumber = answer;
      break;
    case 'pt_why_change':
      data.pt_whyChange = answer;
      break;
    case 'pt_new_schedule':
      data.pt_newSchedule = answer;
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
      if (answer !== 'other') {
        data.cs_courtName = answer;
      }
      break;
    case 'cs_court_name_other':
      data.cs_courtName = answer;
      break;
    case 'cs_page_number':
      data.cs_pageNumber = answer;
      break;
    case 'cs_paragraph_number':
      data.cs_paragraphNumber = answer;
      break;
    case 'cs_why_change':
      data.cs_whyChange = answer;
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
 * Get a pre-fill value for a question based on extracted order data.
 * Returns undefined if no pre-fill is available.
 */
export function getPrefillValue(
  questionId: string,
  data: ModificationChatData
): string | undefined {
  const extracted = data.extractedOrderData;
  if (!extracted) return undefined;

  switch (questionId) {
    case 'case_number':
      return extracted.caseNumber || undefined;
    case 'full_name': {
      if (data.role === 'petitioner') return extracted.petitionerName || undefined;
      return extracted.respondentName || undefined;
    }
    case 'other_party_name': {
      if (data.role === 'petitioner') return extracted.respondentName || undefined;
      return extracted.petitionerName || undefined;
    }

    // LDM fields
    case 'ldm_order_date': {
      const s = extracted.sections?.find((x) => x.type === 'legal_decision_making');
      return s?.orderDate || undefined;
    }
    case 'ldm_court_name':
      return extracted.courtName || undefined;
    case 'ldm_page_number': {
      const s = extracted.sections?.find((x) => x.type === 'legal_decision_making');
      return s?.pageNumber ? `Pg. ${s.pageNumber}` : undefined;
    }
    case 'ldm_paragraph_number': {
      const s = extracted.sections?.find((x) => x.type === 'legal_decision_making');
      return s?.paragraphNumber || undefined;
    }

    // PT fields
    case 'pt_order_date': {
      const s = extracted.sections?.find((x) => x.type === 'parenting_time');
      return s?.orderDate || undefined;
    }
    case 'pt_court_name':
      return extracted.courtName || undefined;
    case 'pt_page_number': {
      const s = extracted.sections?.find((x) => x.type === 'parenting_time');
      return s?.pageNumber ? `Pg. ${s.pageNumber}` : undefined;
    }
    case 'pt_paragraph_number': {
      const s = extracted.sections?.find((x) => x.type === 'parenting_time');
      return s?.paragraphNumber || undefined;
    }

    // CS fields
    case 'cs_order_date': {
      const s = extracted.sections?.find((x) => x.type === 'child_support');
      return s?.orderDate || undefined;
    }
    case 'cs_court_name':
      return extracted.courtName || undefined;
    case 'cs_page_number': {
      const s = extracted.sections?.find((x) => x.type === 'child_support');
      return s?.pageNumber ? `Pg. ${s.pageNumber}` : undefined;
    }
    case 'cs_paragraph_number': {
      const s = extracted.sections?.find((x) => x.type === 'child_support');
      return s?.paragraphNumber || undefined;
    }

    default:
      return undefined;
  }
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
