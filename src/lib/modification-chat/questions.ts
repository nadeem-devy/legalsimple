import { ChatQuestion } from './types';

// Arizona Counties
const ARIZONA_COUNTIES = [
  'Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee',
  'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal',
  'Santa Cruz', 'Yavapai', 'Yuma'
];

const COURT_OPTIONS = ARIZONA_COUNTIES.map(county => ({
  value: `${county} County Superior Court`,
  label: `${county} County Superior Court`,
}));

export const MODIFICATION_QUESTIONS: ChatQuestion[] = [
  // =====================
  // WELCOME & ADVISORY
  // =====================
  {
    id: 'welcome',
    type: 'info',
    question:
      "Welcome to the Legal QuickFile Wizard for Petition to Modify Existing Court Orders.\n\nBefore we begin, please be advised:\n\n• Modification can only occur based on a substantial and continuing change in circumstance since entry of the previous orders\n• Typically, modification can only occur once every 12 months\n• If there has not been a substantial and continuing change in circumstance since entry of the last orders, and/or if you have requested a modification less than 12 months ago, the Court may reject your petition",
    nextQuestionId: 'proceed_check',
  },
  {
    id: 'proceed_check',
    type: 'yesno',
    question: 'Would you like to proceed with the Petition to Modify?',
    required: true,
    nextQuestionMap: {
      yes: 'case_number',
      no: 'proceed_stop',
    },
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
    nextQuestionId: 'full_name',
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
    nextQuestionId: 'other_party_name',
  },
  {
    id: 'other_party_name',
    type: 'text',
    question: "What is the other party's full legal name?",
    placeholder: 'e.g., Jane Marie Smith',
    required: true,
    validation: { minLength: 2 },
    nextQuestionId: 'other_party_address',
  },
  {
    id: 'other_party_address',
    type: 'address',
    question: "What is the other party's current mailing address?",
    placeholder: '456 Oak Avenue, Phoenix, AZ 85002',
    required: true,
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
      no: 'role_select',
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
    nextQuestionId: 'modifications_selected',
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
    nextQuestionId: 'ldm_page_number',
  },
  {
    id: 'ldm_page_number',
    type: 'text',
    question:
      'What page number is the Legal Decision Making Order you wish to change?',
    placeholder: 'e.g., Page 3',
    required: true,
    nextQuestionId: 'ldm_section_paragraph',
  },
  {
    id: 'ldm_section_paragraph',
    type: 'text',
    question:
      'What section/paragraph is the Legal Decision Making Order you wish to change?',
    placeholder: 'e.g., Section 4, Paragraph B',
    required: true,
    nextQuestionId: 'ldm_why_change',
  },
  {
    id: 'ldm_why_change',
    type: 'textarea',
    question:
      'Why do you believe this Legal Decision Making Order should be changed?',
    placeholder: 'Describe why you believe this order should be modified...',
    required: true,
    nextQuestionId: 'ldm_change_circumstance',
  },
  {
    id: 'ldm_change_circumstance',
    type: 'textarea',
    question:
      'Please describe the substantial and continuing change in circumstance you believe has occurred since entry of the previous orders regarding Legal Decision Making.',
    placeholder: 'Describe the change in circumstances...',
    tooltip:
      'Arizona courts require proof of a substantial and continuing change in circumstance to modify existing orders.',
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
        label: 'Sole legal decision making to me ({roleLabel})',
      },
      {
        value: 'joint',
        label: 'Award joint legal decision making to both parents',
      },
      {
        value: 'joint_with_final_say',
        label:
          'Award joint legal decision making with me ({roleLabel}) having final say',
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
    nextQuestionId: 'pt_page_number',
  },
  {
    id: 'pt_page_number',
    type: 'text',
    question:
      'What page number is the Parenting Time Order you wish to change?',
    placeholder: 'e.g., Page 5',
    required: true,
    nextQuestionId: 'pt_section_paragraph',
  },
  {
    id: 'pt_section_paragraph',
    type: 'text',
    question:
      'What section/paragraph is the Parenting Time Order you wish to change?',
    placeholder: 'e.g., Section 6, Paragraph A',
    required: true,
    nextQuestionId: 'pt_why_change',
  },
  {
    id: 'pt_why_change',
    type: 'textarea',
    question:
      'Why do you believe this Parenting Time Order should be changed?',
    placeholder: 'Describe why you believe this order should be modified...',
    required: true,
    nextQuestionId: 'pt_change_circumstance',
  },
  {
    id: 'pt_change_circumstance',
    type: 'textarea',
    question:
      'Please describe the substantial and continuing change in circumstance you believe has occurred since entry of the previous orders regarding Parenting Time.',
    placeholder: 'Describe the change in circumstances...',
    tooltip:
      'Arizona courts require proof of a substantial and continuing change in circumstance to modify existing orders.',
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
    question: 'Please describe your desired parenting time schedule:',
    placeholder:
      'e.g., Every other weekend Friday 6pm to Sunday 6pm, plus Wednesday evenings 4pm-8pm...',
    tooltip:
      'Be as specific as possible about days, times, and pickup/dropoff locations.',
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
      // Engine intercepts __next_issue__ sentinel
      no: '__next_issue__',
    },
  },
  {
    id: 'pt_supervised_reason',
    type: 'textarea',
    question:
      'Please explain why you believe supervised parenting time is in the best interests of the minor children.',
    placeholder: 'Describe why supervision is needed...',
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
    nextQuestionId: 'cs_page_number',
  },
  {
    id: 'cs_page_number',
    type: 'text',
    question:
      'What page number is the Child Support Order you wish to change?',
    placeholder: 'e.g., Page 7',
    required: true,
    nextQuestionId: 'cs_section_paragraph',
  },
  {
    id: 'cs_section_paragraph',
    type: 'text',
    question:
      'What section/paragraph is the Child Support Order you wish to change?',
    placeholder: 'e.g., Section 8, Paragraph C',
    required: true,
    nextQuestionId: 'cs_why_change',
  },
  {
    id: 'cs_why_change',
    type: 'textarea',
    question:
      'Why do you believe this Child Support Order should be changed?',
    placeholder: 'Describe why you believe this order should be modified...',
    required: true,
    nextQuestionId: 'cs_change_circumstance',
  },
  {
    id: 'cs_change_circumstance',
    type: 'textarea',
    question:
      'Please describe the substantial and continuing change in circumstance you believe has occurred since entry of the previous orders regarding Child Support.',
    placeholder: 'Describe the change in circumstances...',
    tooltip:
      'Arizona courts require proof of a substantial and continuing change in circumstance to modify existing orders.',
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
