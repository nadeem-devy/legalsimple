import { ChatQuestion } from './types';

// Arizona Counties
const ARIZONA_COUNTIES = [
  'Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee',
  'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal',
  'Santa Cruz', 'Yavapai', 'Yuma'
];

const COURT_OPTIONS = [
  ...ARIZONA_COUNTIES.map(county => ({
    value: `${county} County Superior Court`,
    label: `${county} County Superior Court`,
  })),
  { value: 'other', label: 'Other (out of state or different court)' },
];

// Page number options (1-30)
const PAGE_NUMBER_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
  value: `Pg. ${i + 1}`,
  label: `Page ${i + 1}`,
}));

// Paragraph/section options — numbers, letters, and roman numerals
const PARAGRAPH_NUMBER_OPTIONS = [
  // Numbers 1-30
  ...Array.from({ length: 30 }, (_, i) => ({
    value: `${i + 1}`,
    label: `Paragraph ${i + 1}`,
  })),
  // Letters A-Z
  ...Array.from({ length: 26 }, (_, i) => ({
    value: String.fromCharCode(65 + i),
    label: `Paragraph ${String.fromCharCode(65 + i)}`,
  })),
  // Roman numerals (multi-character to avoid overlap with letters I, V, X)
  ...['II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII',
    'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  ].map((r) => ({
    value: r,
    label: `Section ${r}`,
  })),
];

export const MODIFICATION_QUESTIONS: ChatQuestion[] = [
  // =====================
  // WELCOME & ADVISORY
  // =====================
  {
    id: 'welcome',
    type: 'info',
    question:
      "Welcome to the Legal Simple QuickFile Wizard for a Petition to Modify Existing Court Orders.\n\nBefore we begin, please be advised:\n\n• Modification can only occur based on a substantial and continuing change in circumstance since entry of the previous orders\n• Typically, modification can only occur once every 12 months\n• If there has not been a substantial and continuing change in circumstance since entry of the last orders, and/or if you have requested a modification less than 12 months ago, the Court may reject your petition",
    nextQuestionId: 'proceed_check',
  },
  {
    id: 'proceed_check',
    type: 'yesno',
    question: 'Would you like to proceed with the Petition to Modify?',
    required: true,
    nextQuestionMap: {
      yes: 'upload_orders',
      no: 'proceed_stop',
    },
  },
  {
    id: 'upload_orders',
    type: 'file_upload',
    question: 'Would you like to upload your existing court orders?',
    description: 'Uploading your orders allows us to automatically extract case information, party names, children, and order details — saving you time and reducing errors.\n\nAccepted formats: PDF',
    tooltip: 'If you have a PDF copy of your existing court orders, uploading it will allow us to pre-fill many of the questions in this questionnaire automatically. You can always edit the pre-filled information.',
    required: false,
    nextQuestionId: 'case_number',
  },
  {
    id: 'proceed_stop',
    type: 'stop',
    question:
      'No problem. If you change your mind, you can return at any time to begin the modification process.\n\nClick below to return to your dashboard.',
  },

  // =====================
  // CASE INFORMATION
  // =====================
  {
    id: 'case_number',
    type: 'text',
    question: 'What is your current case number?',
    placeholder: 'e.g., FC2024-001234',
    tooltip:
      'This is the case number from the original court orders you wish to modify.',
    required: true,
    nextQuestionId: 'same_county',
  },
  {
    id: 'same_county',
    type: 'yesno',
    question:
      'Is this case number from the county you are currently filing in?',
    tooltip:
      'If your case was filed in a different county, you may need to domesticate it first.',
    required: true,
    nextQuestionMap: {
      yes: 'personal_intro',
      no: 'domesticated',
    },
  },
  {
    id: 'domesticated',
    type: 'yesno',
    question:
      'Have you domesticated your case in the county you are filing in?',
    description:
      'Domestication is the process wherein the Court from your current county takes over the case from your previous court.',
    tooltip:
      'If your case was filed in a different county, you must domesticate it before filing a modification.',
    required: true,
    nextQuestionMap: {
      yes: 'domesticated_case_number',
      no: 'domestication_stop',
    },
  },
  {
    id: 'domesticated_case_number',
    type: 'text',
    question:
      'What is the case number of the case from the county you are filing in?',
    placeholder: 'e.g., FC2025-005678',
    required: true,
    nextQuestionId: 'personal_intro',
  },
  {
    id: 'domestication_stop',
    type: 'info',
    question:
      'In order for the court to have jurisdiction over your case you need to domesticate your case. Domestication is a process wherein the Court from your current county takes over the case from your previous court. There are specific steps that need to be taken in order for domestication to occur.\n\nYou may want to consult with an attorney to assist you with this.',
    nextQuestionId: 'attorney_referral',
  },
  {
    id: 'attorney_referral',
    type: 'yesno',
    question: 'Would you like to be referred to an attorney?',
    required: true,
    nextQuestionMap: {
      yes: 'attorney_referral_stop',
      no: 'no_referral_stop',
    },
  },
  {
    id: 'attorney_referral_stop',
    type: 'stop',
    question:
      'We will connect you with one of our partner attorneys who can assist you with domesticating your case and filing the modification.\n\nYou will receive a call or email within 1-2 business days.',
  },
  {
    id: 'no_referral_stop',
    type: 'stop',
    question:
      'No problem. Once you have domesticated your case, you can return here to begin the modification process.\n\nClick below to return to your dashboard.',
  },

  // =====================
  // PERSONAL INFORMATION
  // =====================
  {
    id: 'personal_intro',
    type: 'info',
    question:
      "Great. Let's gather some basic information about you and the other party.",
    nextQuestionId: 'role_select',
  },
  {
    id: 'full_name',
    type: 'text',
    question: 'What is your full legal name?',
    placeholder: 'e.g., John Michael Smith',
    required: true,
    validation: { minLength: 2 },
    nextQuestionId: 'mailing_address',
  },
  {
    id: 'mailing_address',
    type: 'address',
    question: 'What is your current mailing address?',
    placeholder: '123 Main Street, Phoenix, AZ 85001',
    required: true,
    nextQuestionId: 'phone',
  },
  {
    id: 'phone',
    type: 'phone',
    question: 'What is your phone number?',
    placeholder: 'e.g., (602) 555-1234',
    required: true,
    nextQuestionId: 'email',
  },
  {
    id: 'email',
    type: 'email',
    question: 'What is your email address?',
    placeholder: 'e.g., john@example.com',
    required: true,
    nextQuestionId: 'other_party_name',
  },
  {
    id: 'other_party_name',
    type: 'text',
    question: "What is the other party's full legal name?",
    placeholder: 'e.g., Jane Marie Smith',
    required: true,
    validation: { minLength: 2 },
    nextQuestionId: 'children_intro',
  },

  // =====================
  // CHILDREN
  // =====================
  {
    id: 'children_intro',
    type: 'info',
    question:
      "Now let's gather the name and date of birth of any children involved in this case.",
    nextQuestionId: 'child_name',
  },
  {
    id: 'child_name',
    type: 'text',
    question: "What is the child's full name?",
    placeholder: 'e.g., Emily Jane Smith',
    required: true,
    nextQuestionId: 'child_dob',
  },
  {
    id: 'child_dob',
    type: 'date',
    question: "What is this child's date of birth?",
    required: true,
    nextQuestionId: 'more_children',
  },
  {
    id: 'more_children',
    type: 'yesno',
    question: 'Do you have another child to add?',
    required: true,
    nextQuestionMap: {
      yes: 'child_name',
      no: 'modifications_selected',
    },
  },

  // =====================
  // ROLE
  // =====================
  {
    id: 'role_select',
    type: 'select',
    question: 'Are you the Petitioner or Respondent in the original orders?',
    description:
      'The petition will automatically associate your information based on this answer. If you were the Respondent in the original orders then you will be the Respondent in this petition, and vice versa.',
    tooltip:
      'The Petitioner is the party who originally filed the case. The Respondent is the party who was served.',
    options: [
      { value: 'petitioner', label: 'I am the Petitioner' },
      { value: 'respondent', label: 'I am the Respondent' },
    ],
    required: true,
    nextQuestionId: 'full_name',
  },

  // =====================
  // MODIFICATION SELECTION
  // =====================
  {
    id: 'modifications_selected',
    type: 'multiselect',
    question: 'What orders are you seeking to modify? Please check all that apply.',
    description:
      'If you select more than one issue, we will handle each one individually.',
    options: [
      {
        value: 'legal_decision_making',
        label: 'Legal Decision Making',
        description: 'Modify how major decisions about the children are made.',
      },
      {
        value: 'parenting_time',
        label: 'Parenting Time',
        description: 'Modify the parenting time schedule.',
      },
      {
        value: 'child_support',
        label: 'Child Support',
        description: 'Modify child support arrangements.',
      },
    ],
    required: true,
    // Engine intercepts this sentinel to route to the first selected issue
    nextQuestionId: '__route_to_first_issue__',
  },

  // =====================
  // MISSING SECTION WARNINGS (shown when uploaded orders lack a section)
  // =====================
  {
    id: 'ldm_missing_warning',
    type: 'select',
    question: '⚠️ The court orders you uploaded do not appear to contain any information pertaining to Legal Decision Making. Do you have other orders that directly address this issue?\n\nYou can still proceed and enter the information manually, or you can upload additional orders now.',
    options: [
      { value: 'continue_manually', label: 'Continue manually' },
      { value: 'upload_additional', label: 'Upload additional orders' },
    ],
    nextQuestionMap: {
      continue_manually: 'ldm_intro',
      upload_additional: 'upload_additional_orders',
    },
  },
  {
    id: 'pt_missing_warning',
    type: 'select',
    question: '⚠️ The court orders you uploaded do not appear to contain any information pertaining to Parenting Time. Do you have other orders that directly address this issue?\n\nYou can still proceed and enter the information manually, or you can upload additional orders now.',
    options: [
      { value: 'continue_manually', label: 'Continue manually' },
      { value: 'upload_additional', label: 'Upload additional orders' },
    ],
    nextQuestionMap: {
      continue_manually: 'pt_intro',
      upload_additional: 'upload_additional_orders',
    },
  },
  {
    id: 'cs_missing_warning',
    type: 'select',
    question: '⚠️ The court orders you uploaded do not appear to contain any information pertaining to Child Support. Do you have other orders that directly address this issue?\n\nYou can still proceed and enter the information manually, or you can upload additional orders now.',
    options: [
      { value: 'continue_manually', label: 'Continue manually' },
      { value: 'upload_additional', label: 'Upload additional orders' },
    ],
    nextQuestionMap: {
      continue_manually: 'cs_intro',
      upload_additional: 'upload_additional_orders',
    },
  },
  {
    id: 'upload_additional_orders',
    type: 'file_upload',
    question: 'Upload your additional court orders.',
    description: 'Upload orders that contain the information for the section you want to modify.\n\nAccepted formats: PDF',
    required: false,
    // Engine resolves __resume_after_upload__ to the appropriate issue intro
    nextQuestionId: '__resume_after_upload__',
  },

  // =====================
  // LEGAL DECISION MAKING BLOCK
  // =====================
  {
    id: 'ldm_intro',
    type: 'info',
    question:
      "Great. Let's discuss the modification of Legal Decision Making first.",
    nextQuestionId: 'ldm_order_date',
  },
  {
    id: 'ldm_order_date',
    type: 'date',
    question:
      'What is the date that the Legal Decision Making order you want modified was issued?',
    required: true,
    nextQuestionId: 'ldm_court_name',
  },
  {
    id: 'ldm_court_name',
    type: 'select',
    question:
      'What is the name of the Court that entered your Legal Decision Making order?',
    options: COURT_OPTIONS,
    required: true,
    nextQuestionMap: {
      other: 'ldm_court_name_other',
    },
    nextQuestionId: 'ldm_page_number',
  },
  {
    id: 'ldm_court_name_other',
    type: 'text',
    question: 'Please enter the name of the Court that entered your Legal Decision Making order.',
    placeholder: 'e.g., Clark County Family Court, Las Vegas, NV',
    required: true,
    nextQuestionId: 'ldm_page_number',
  },
  {
    id: 'ldm_page_number',
    type: 'select',
    question:
      'What page number is the Legal Decision Making Order you wish to change?',
    options: PAGE_NUMBER_OPTIONS,
    required: true,
    nextQuestionId: 'ldm_paragraph_number',
  },
  {
    id: 'ldm_paragraph_number',
    type: 'select',
    question:
      'What paragraph or section is the Legal Decision Making Order you wish to change?',
    options: PARAGRAPH_NUMBER_OPTIONS,
    required: true,
    nextQuestionId: 'ldm_why_change',
  },
  {
    id: 'ldm_why_change',
    type: 'textarea',
    question:
      'Please describe the specific substantial and continuing change in circumstance that has occurred to warrant a modification of Legal Decision Making. Please be specific — for example, what has changed in the living situation, parental behavior, or the children\'s needs since the last order was entered?\n\nPlease write your answer in third person (e.g., "The {roleLabel} has experienced..." rather than "I have experienced..."). You can use the AI Assist feature to refine your answer for the Petition.',
    placeholder: 'Describe the specific substantial and continuing change in circumstance...',
    tooltip:
      'A court will only grant a modification if there has been a substantial and continuing change in circumstance since the last order. Simply wanting a different arrangement is not sufficient. Be specific about what has changed.',
    required: true,
    nextQuestionId: 'ldm_modification_type',
  },
  {
    id: 'ldm_modification_type',
    type: 'select',
    question: 'How would you like Legal Decision Making to be modified?',
    options: [
      {
        value: 'sole_to_me',
        label: 'Sole legal decision making to me',
      },
      {
        value: 'joint',
        label: 'Joint legal decision making to both parents',
      },
      {
        value: 'joint_with_final_say',
        label:
          'Joint legal decision making with me having final say',
      },
    ],
    required: true,
    // Engine intercepts this sentinel to route to next selected issue or complete
    nextQuestionId: '__next_issue__',
  },

  // =====================
  // PARENTING TIME BLOCK
  // =====================
  {
    id: 'pt_intro',
    type: 'info',
    question: "Now let's discuss the modification of Parenting Time.",
    nextQuestionId: 'pt_order_date',
  },
  {
    id: 'pt_order_date',
    type: 'date',
    question:
      'What is the date that the Parenting Time order you want modified was issued?',
    required: true,
    nextQuestionId: 'pt_court_name',
  },
  {
    id: 'pt_court_name',
    type: 'select',
    question:
      'What is the name of the Court that entered your Parenting Time order?',
    options: COURT_OPTIONS,
    required: true,
    nextQuestionMap: {
      other: 'pt_court_name_other',
    },
    nextQuestionId: 'pt_page_number',
  },
  {
    id: 'pt_court_name_other',
    type: 'text',
    question: 'Please enter the name of the Court that entered your Parenting Time order.',
    placeholder: 'e.g., Clark County Family Court, Las Vegas, NV',
    required: true,
    nextQuestionId: 'pt_page_number',
  },
  {
    id: 'pt_page_number',
    type: 'select',
    question:
      'What page number refers to the regular parenting time schedule in the existing orders?',
    options: PAGE_NUMBER_OPTIONS,
    required: true,
    nextQuestionId: 'pt_paragraph_number',
  },
  {
    id: 'pt_paragraph_number',
    type: 'select',
    question:
      'What paragraph or section refers to the regular parenting time schedule in the existing orders?',
    options: PARAGRAPH_NUMBER_OPTIONS,
    required: true,
    nextQuestionId: 'pt_why_change',
  },
  {
    id: 'pt_why_change',
    type: 'textarea',
    question:
      'Please describe the specific substantial and continuing change in circumstance that has occurred to warrant a modification of Parenting Time. Please be specific — for example, what has changed in the schedules, living situations, or the children\'s needs since the last order was entered?\n\nPlease write your answer in third person (e.g., "The {roleLabel} has experienced..." rather than "I have experienced..."). You can use the AI Assist feature to refine your answer for the Petition.',
    placeholder: 'Describe the specific substantial and continuing change in circumstance...',
    tooltip:
      'A court will only grant a modification if there has been a substantial and continuing change in circumstance since the last order. Simply wanting more time is not sufficient. Be specific about what has changed.',
    required: true,
    nextQuestionId: 'pt_new_schedule',
  },
  {
    id: 'pt_new_schedule',
    type: 'select',
    question: 'What would you like the new parenting time schedule to be?',
    description: 'This does not include holidays or special occasions.',
    options: [
      {
        value: '3-2-2-3',
        label: 'Equal parenting time based on a 3-2-2-3 schedule',
        description:
          'Parent A has Monday-Wednesday, Parent B has Wednesday-Friday, then alternate weekends.',
      },
      {
        value: '5-2-2-5',
        label: 'Equal parenting time based on a 5-2-2-5 schedule',
        description:
          'Parent A has Monday-Friday one week, Parent B the next, with Wednesday evening exchanges.',
      },
      {
        value: 'alternating_weeks',
        label: 'Alternating weeks',
        description:
          'Children spend one full week with each parent, alternating weekly.',
      },
      {
        value: 'custom',
        label: 'Custom schedule',
        description:
          'I want to specify a different parenting time arrangement.',
      },
      {
        value: 'no_parenting_time',
        label: 'No parenting time for the other parent',
        description:
          'Request that the other parent have no parenting time with the children.',
      },
    ],
    tooltip:
      'The 3-2-2-3, 5-2-2-5, and alternating weeks schedules all result in equal parenting time (50/50).',
    required: true,
    nextQuestionMap: {
      custom: 'pt_custom_schedule_details',
      '3-2-2-3': 'pt_supervised',
      '5-2-2-5': 'pt_supervised',
      alternating_weeks: 'pt_supervised',
      no_parenting_time: 'pt_supervised',
    },
  },
  {
    id: 'pt_custom_schedule_details',
    type: 'textarea',
    question: 'Please describe your desired parenting time schedule in detail.\n\nInclude which days/times each parent will have the children, weekend arrangements, and any other specifics about how parenting time should be divided. You can use the AI Assist feature to refine your answer for the Petition.',
    placeholder: 'Describe your preferred parenting time schedule...',
    tooltip: 'Be as specific as possible. The court will use this to establish the parenting time order.',
    required: true,
    nextQuestionId: 'pt_supervised',
  },
  {
    id: 'pt_supervised',
    type: 'yesno',
    question: 'Should parenting time be supervised?',
    tooltip:
      'Supervised parenting time means a third party must be present during visits. This may be appropriate in cases involving safety concerns.',
    required: true,
    nextQuestionMap: {
      yes: 'pt_supervised_reason',
      no: 'pt_modify_holidays',
    },
  },
  {
    id: 'pt_supervised_reason',
    type: 'textarea',
    question:
      'Please explain why you believe supervised parenting time is in the best interests of the minor children. Please use our AI assist feature to refine your answer for the Petition.',
    placeholder: 'Describe why supervision is needed...',
    required: true,
    nextQuestionId: 'pt_modify_holidays',
  },
  {
    id: 'pt_modify_holidays',
    type: 'yesno',
    question: 'Do you also want to modify the holiday parenting time schedule?',
    tooltip: 'This includes holidays such as Thanksgiving, Christmas, Easter, Fourth of July, and other special occasions.',
    required: true,
    nextQuestionMap: {
      yes: 'pt_holiday_page_number',
      no: 'pt_modify_breaks',
    },
  },
  {
    id: 'pt_holiday_page_number',
    type: 'select',
    question: 'What page number refers to the holiday parenting time schedule in the existing orders?',
    options: [
      { value: 'not_listed', label: 'Not listed in the Orders' },
      ...PAGE_NUMBER_OPTIONS,
    ],
    required: true,
    nextQuestionMap: {
      not_listed: 'pt_holiday_changes',
    },
    nextQuestionId: 'pt_holiday_paragraph_number',
  },
  {
    id: 'pt_holiday_paragraph_number',
    type: 'select',
    question: 'What paragraph or section refers to the holiday parenting time schedule in the existing orders?',
    options: PARAGRAPH_NUMBER_OPTIONS,
    required: true,
    nextQuestionId: 'pt_holiday_changes',
  },
  {
    id: 'pt_holiday_changes',
    type: 'textarea',
    question: 'Please describe the changes you are requesting to the holiday parenting time schedule.\n\nPlease write your answer in third person. You can use the AI Assist feature to refine your answer for the Petition.',
    placeholder: 'Describe the holiday schedule changes you are requesting...',
    required: true,
    nextQuestionId: 'pt_modify_breaks',
  },
  {
    id: 'pt_modify_breaks',
    type: 'yesno',
    question: 'Do you also want to modify the school break parenting time schedule?',
    tooltip: 'This includes spring break, fall break, winter break, and summer break.',
    required: true,
    nextQuestionMap: {
      yes: 'pt_break_page_number',
      // Engine intercepts __next_issue__ sentinel
      no: '__next_issue__',
    },
  },
  {
    id: 'pt_break_page_number',
    type: 'select',
    question: 'What page number refers to the school break parenting time schedule in the existing orders?',
    options: [
      { value: 'not_listed', label: 'Not listed in the Orders' },
      ...PAGE_NUMBER_OPTIONS,
    ],
    required: true,
    nextQuestionMap: {
      not_listed: 'pt_break_changes',
    },
    nextQuestionId: 'pt_break_paragraph_number',
  },
  {
    id: 'pt_break_paragraph_number',
    type: 'select',
    question: 'What paragraph or section refers to the school break parenting time schedule in the existing orders?',
    options: PARAGRAPH_NUMBER_OPTIONS,
    required: true,
    nextQuestionId: 'pt_break_changes',
  },
  {
    id: 'pt_break_changes',
    type: 'textarea',
    question: 'Please describe the changes you are requesting to the school break parenting time schedule.\n\nPlease write your answer in third person. You can use the AI Assist feature to refine your answer for the Petition.',
    placeholder: 'Describe the school break schedule changes you are requesting...',
    required: true,
    // Engine intercepts this sentinel to route to next selected issue or complete
    nextQuestionId: '__next_issue__',
  },

  // =====================
  // CHILD SUPPORT BLOCK
  // =====================
  {
    id: 'cs_intro',
    type: 'info',
    question: "Now let's discuss the modification of Child Support.",
    nextQuestionId: 'cs_order_date',
  },
  {
    id: 'cs_order_date',
    type: 'date',
    question:
      'What is the date that the Child Support order you want modified was issued?',
    required: true,
    nextQuestionId: 'cs_court_name',
  },
  {
    id: 'cs_court_name',
    type: 'select',
    question:
      'What is the name of the Court that entered your Child Support order?',
    options: COURT_OPTIONS,
    required: true,
    nextQuestionMap: {
      other: 'cs_court_name_other',
    },
    nextQuestionId: 'cs_page_number',
  },
  {
    id: 'cs_court_name_other',
    type: 'text',
    question: 'Please enter the name of the Court that entered your Child Support order.',
    placeholder: 'e.g., Clark County Family Court, Las Vegas, NV',
    required: true,
    nextQuestionId: 'cs_page_number',
  },
  {
    id: 'cs_page_number',
    type: 'select',
    question:
      'What page number is the Child Support Order you wish to change?',
    options: PAGE_NUMBER_OPTIONS,
    required: true,
    nextQuestionId: 'cs_paragraph_number',
  },
  {
    id: 'cs_paragraph_number',
    type: 'select',
    question:
      'What paragraph or section is the Child Support Order you wish to change?',
    options: PARAGRAPH_NUMBER_OPTIONS,
    required: true,
    nextQuestionId: 'cs_why_change',
  },
  {
    id: 'cs_why_change',
    type: 'textarea',
    question:
      'Please describe the specific substantial and continuing change in circumstance that has occurred to warrant a modification of Child Support. Please be specific — for example, what has changed in income, employment, or the children\'s needs since the last order was entered?\n\nPlease write your answer in third person (e.g., "The {roleLabel} has experienced..." rather than "I have experienced..."). You can use the AI Assist feature to refine your answer for the Petition.',
    placeholder: 'Describe the specific substantial and continuing change in circumstance...',
    tooltip:
      'A court will only grant a modification if there has been a substantial and continuing change in circumstance since the last order. Simply wanting a different amount is not sufficient. Be specific about what has changed.',
    required: true,
    // Engine intercepts this sentinel to route to next selected issue or complete
    nextQuestionId: '__next_issue__',
  },

  // =====================
  // COMPLETION
  // =====================
  {
    id: 'complete',
    type: 'info',
    question:
      "Thank you! You've completed the Petition to Modify questionnaire. Your responses have been saved and we're ready to generate your petition documents.\n\nClick the button below to review your answers and generate your documents.",
  },
];

// Helper to get question by ID
export function getQuestionById(id: string): ChatQuestion | undefined {
  return MODIFICATION_QUESTIONS.find((q) => q.id === id);
}

// Get the next question based on current question and answer
export function getNextQuestion(
  currentQuestion: ChatQuestion,
  answer: string
): string | null {
  // Check for explicit next question mapping based on answer
  if (currentQuestion.nextQuestionMap && answer) {
    const mappedNext =
      currentQuestion.nextQuestionMap[answer.toLowerCase()];
    if (mappedNext) return mappedNext;
  }

  // Check for explicit next question
  if (currentQuestion.nextQuestionId) {
    return currentQuestion.nextQuestionId;
  }

  // Find index and get next question in sequence
  const currentIndex = MODIFICATION_QUESTIONS.findIndex(
    (q) => q.id === currentQuestion.id
  );
  if (
    currentIndex >= 0 &&
    currentIndex < MODIFICATION_QUESTIONS.length - 1
  ) {
    return MODIFICATION_QUESTIONS[currentIndex + 1].id;
  }

  return null;
}
