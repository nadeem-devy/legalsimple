import { ChatQuestion } from './types';

// Nevada Counties
export const NEVADA_COUNTIES = [
  'Clark', 'Washoe', 'Carson City', 'Douglas', 'Elko', 'Lyon', 'Nye',
  'Churchill', 'Humboldt', 'White Pine', 'Pershing', 'Lander', 'Mineral',
  'Lincoln', 'Storey', 'Eureka', 'Esmeralda'
];

// Holiday options - using Plaintiff/Defendant for Nevada
const HOLIDAY_OPTIONS = [
  { value: 'plaintiff_even', label: 'Plaintiff in even years' },
  { value: 'defendant_even', label: 'Defendant in even years' },
  { value: 'plaintiff_every', label: 'Plaintiff every year' },
  { value: 'defendant_every', label: 'Defendant every year' },
  { value: 'regular_schedule', label: 'Regular schedule applies' },
];

export const NV_DIVORCE_WITH_CHILDREN_QUESTIONS: ChatQuestion[] = [
  // =====================
  // WELCOME & INITIAL CHECK
  // =====================
  {
    id: 'welcome',
    type: 'info',
    question: "Welcome to the Legal Simple QuickFile Wizard for a Complaint for Divorce and UCCJEA Declaration (With Children) in Nevada. I'll guide you through the process step by step.",
    description: "This questionnaire will help prepare your Nevada divorce complaint. In Nevada, the filing party is called the \"Plaintiff\" and the other spouse is the \"Defendant.\" Your case will be filed in the District Court.",
    nextQuestionId: 'has_minor_children',
  },
  {
    id: 'has_minor_children',
    type: 'yesno',
    question: 'Are there any children common to the parties?',
    description: 'This includes any minor children (under 18) that you and your spouse have together.',
    tooltip: 'This form is specifically for divorces involving minor children. If you do not have children together, you will need to file a different form.',
    required: true,
    nextQuestionMap: {
      'yes': 'personal_intro',
      'no': 'without_children_redirect',
    },
  },
  {
    id: 'without_children_redirect',
    type: 'stop',
    question: 'Since there are no minor children common to the parties, you will need to file a Complaint for Divorce without children instead. Please go back and select "Divorce (No Children)" to proceed with the correct form.',
  },

  // =====================
  // Q1-4: PERSONAL INFORMATION (PLAINTIFF)
  // =====================
  {
    id: 'personal_intro',
    type: 'info',
    question: "Let's start with your personal information. As the person filing this complaint, you are the Plaintiff.",
    nextQuestionId: 'full_name',
  },
  {
    id: 'full_name',
    type: 'text',
    question: 'What is your full legal name?',
    placeholder: 'First Middle Last',
    required: true,
    nextQuestionId: 'mailing_address',
  },
  {
    id: 'mailing_address',
    type: 'address',
    question: 'What is your current mailing address?',
    placeholder: '123 Main St, City, NV ZIP',
    required: true,
    nextQuestionId: 'county',
  },
  {
    id: 'county',
    type: 'select',
    question: 'In which Nevada county will you be filing?',
    tooltip: 'Your complaint will be filed in the District Court of this county.',
    options: NEVADA_COUNTIES.map(c => ({ value: c, label: c })),
    required: true,
    nextQuestionId: 'phone',
  },
  {
    id: 'phone',
    type: 'phone',
    question: 'What is your telephone number?',
    placeholder: '(702) 555-1234',
    required: true,
    nextQuestionId: 'email',
  },
  {
    id: 'email',
    type: 'email',
    question: 'What is your email address?',
    placeholder: 'you@example.com',
    required: true,
    nextQuestionId: 'defendant_full_name',
  },

  // =====================
  // Q5: DEFENDANT INFORMATION
  // =====================
  {
    id: 'defendant_full_name',
    type: 'text',
    question: "What is the Defendant's full legal name?",
    description: 'The Defendant is your spouse — the other party in the divorce.',
    placeholder: 'First Middle Last',
    required: true,
    nextQuestionId: 'date_of_marriage',
  },

  // =====================
  // Q6-7: MARRIAGE INFORMATION
  // =====================
  {
    id: 'date_of_marriage',
    type: 'date',
    question: 'What is the date of your marriage?',
    required: true,
    nextQuestionId: 'marriage_location',
  },
  {
    id: 'marriage_location',
    type: 'text',
    question: 'Where did the marriage take place?',
    description: 'Enter the city and state where you were married.',
    placeholder: 'Las Vegas, Nevada',
    required: true,
    nextQuestionId: 'residency_check',
  },

  // =====================
  // Q8: RESIDENCY
  // =====================
  {
    id: 'residency_check',
    type: 'select',
    question: 'Which spouse has been a resident of Nevada for at least 6 weeks prior to filing this complaint?',
    tooltip: 'Nevada requires at least one spouse to have been a Nevada resident for at least 6 weeks before filing for divorce.',
    options: [
      { value: 'plaintiff', label: 'I (Plaintiff) have' },
      { value: 'defendant', label: 'Defendant has' },
      { value: 'both', label: 'Both of us have' },
      { value: 'neither', label: 'Neither of us has' },
    ],
    required: true,
    nextQuestionMap: {
      'plaintiff': 'pregnancy_check',
      'defendant': 'pregnancy_check',
      'both': 'pregnancy_check',
      'neither': 'residency_not_met',
    },
  },
  {
    id: 'residency_not_met',
    type: 'stop',
    question: 'Nevada requires that at least one spouse has been a resident of the state for at least 6 weeks prior to filing. You may need to wait until the residency requirement is met, or file in a state where the residency requirement is satisfied.',
  },

  // =====================
  // Q9: PREGNANCY
  // =====================
  {
    id: 'pregnancy_check',
    type: 'select',
    question: 'Is either spouse currently pregnant?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unknown', label: "I don't know" },
    ],
    required: true,
    nextQuestionMap: {
      'yes': 'pregnancy_who',
      'no': 'child_name',
      'unknown': 'child_name',
    },
  },
  {
    id: 'pregnancy_who',
    type: 'select',
    question: 'Which spouse is pregnant?',
    options: [
      { value: 'plaintiff', label: 'I am (Plaintiff)' },
      { value: 'defendant', label: 'Defendant is' },
    ],
    required: true,
    nextQuestionId: 'pregnancy_due_date',
  },
  {
    id: 'pregnancy_due_date',
    type: 'date',
    question: 'What is the expected due date?',
    required: true,
    nextQuestionId: 'child_name',
  },

  // =====================
  // Q10: CHILDREN INFORMATION
  // =====================
  {
    id: 'child_name',
    type: 'text',
    question: "What is the child's full name?",
    placeholder: 'First Middle Last',
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
    question: 'Are there any other children common to the parties?',
    nextQuestionMap: {
      'yes': 'child_name',
      'no': 'children_residency_nevada',
    },
  },

  // =====================
  // Q11-12: UCCJEA - CHILD RESIDENCE
  // =====================
  {
    id: 'children_residency_nevada',
    type: 'yesno',
    question: 'Have the child/children lived in Nevada for the past six months, or since birth if the child/children are under six months old?',
    tooltip: 'This is required for the UCCJEA (Uniform Child Custody Jurisdiction and Enforcement Act) Declaration that must accompany your complaint.',
    required: true,
    nextQuestionId: 'child_current_residence',
  },
  {
    id: 'child_current_residence',
    type: 'address',
    question: 'Where do the child/children currently reside?',
    placeholder: '123 Main St, City, NV ZIP',
    required: true,
    nextQuestionId: 'child_residence_duration',
  },
  {
    id: 'child_residence_duration',
    type: 'text',
    question: 'How long have they resided at this address?',
    description: 'For example: "2 years", "6 months", "since birth".',
    placeholder: 'e.g., 3 years',
    required: true,
    nextQuestionId: 'child_residence_duration_check',
  },
  // This is an info/routing question - engine will check if < 5 years
  {
    id: 'child_residence_duration_check',
    type: 'info',
    question: 'Thank you. Let me check if we need additional address history.',
    nextQuestionId: 'prior_custody_case_check',
  },
  // If < 5 years total, we need prior addresses
  {
    id: 'child_prior_residence',
    type: 'address',
    question: 'Where did the child/children reside previously?',
    placeholder: 'Previous address',
    required: true,
    nextQuestionId: 'child_prior_residence_duration',
  },
  {
    id: 'child_prior_residence_duration',
    type: 'text',
    question: 'How long did they reside at this previous address?',
    placeholder: 'e.g., 2 years',
    required: true,
    nextQuestionId: 'child_residence_duration_check',
  },

  // =====================
  // Q13: PRIOR CUSTODY CASES
  // =====================
  {
    id: 'prior_custody_case_check',
    type: 'yesno',
    question: 'Have you ever participated in any case concerning these children as a party, witness, or in some other capacity?',
    required: true,
    nextQuestionMap: {
      'yes': 'prior_case_state',
      'no': 'affecting_case_check',
    },
  },
  {
    id: 'prior_case_state',
    type: 'text',
    question: 'In which state was the other case in which you were involved?',
    placeholder: 'e.g., California',
    required: true,
    nextQuestionId: 'prior_case_children',
  },
  {
    id: 'prior_case_children',
    type: 'text',
    question: 'Which children were involved in that case?',
    placeholder: 'Enter children names',
    required: true,
    nextQuestionId: 'prior_case_number',
  },
  {
    id: 'prior_case_number',
    type: 'text',
    question: 'What is the case number?',
    placeholder: 'e.g., FC-2023-001234',
    required: true,
    nextQuestionId: 'prior_case_custody_order',
  },
  {
    id: 'prior_case_custody_order',
    type: 'yesno',
    question: 'Was there a Child Custody Order in that case?',
    required: true,
    nextQuestionMap: {
      'yes': 'prior_case_custody_order_date',
      'no': 'more_prior_cases',
    },
  },
  {
    id: 'prior_case_custody_order_date',
    type: 'date',
    question: 'What is the date of the child custody order?',
    required: true,
    nextQuestionId: 'more_prior_cases',
  },
  {
    id: 'more_prior_cases',
    type: 'yesno',
    question: 'Have you been involved in any other cases concerning these children?',
    nextQuestionMap: {
      'yes': 'prior_case_state',
      'no': 'affecting_case_check',
    },
  },

  // =====================
  // Q14: AFFECTING CASES
  // =====================
  {
    id: 'affecting_case_check',
    type: 'yesno',
    question: 'Do you know of any other case that could affect this case, such as other custody cases, domestic violence cases, protection order cases, or adoptions/terminations?',
    required: true,
    nextQuestionMap: {
      'yes': 'affecting_case_state',
      'no': 'other_custody_claimant_check',
    },
  },
  {
    id: 'affecting_case_state',
    type: 'text',
    question: 'In which state was the other case that you believe could affect this case?',
    placeholder: 'e.g., Nevada',
    required: true,
    nextQuestionId: 'affecting_case_parties',
  },
  {
    id: 'affecting_case_parties',
    type: 'text',
    question: 'What is the full name of the parties involved? Separate each name with a comma.',
    placeholder: 'e.g., John Smith, Jane Smith',
    required: true,
    nextQuestionId: 'affecting_case_number',
  },
  {
    id: 'affecting_case_number',
    type: 'text',
    question: 'What is the case number?',
    placeholder: 'e.g., PO-2023-005678',
    required: true,
    nextQuestionId: 'affecting_case_type',
  },
  {
    id: 'affecting_case_type',
    type: 'text',
    question: 'What is the type of case?',
    description: 'For example: Protective Order, Domestic Violence, Adoption, Termination of Parental Rights, etc.',
    placeholder: 'e.g., Protective Order',
    required: true,
    nextQuestionId: 'more_affecting_cases',
  },
  {
    id: 'more_affecting_cases',
    type: 'yesno',
    question: 'Do you know of any other cases that could affect this case?',
    nextQuestionMap: {
      'yes': 'affecting_case_state',
      'no': 'other_custody_claimant_check',
    },
  },

  // =====================
  // Q15: OTHER CUSTODY CLAIMANTS
  // =====================
  {
    id: 'other_custody_claimant_check',
    type: 'yesno',
    question: 'Does anyone other than yourself or the Defendant have custody of the children or claim a right to custody or visitation with the children?',
    required: true,
    nextQuestionMap: {
      'yes': 'claimant_name',
      'no': 'legal_custody',
    },
  },
  {
    id: 'claimant_name',
    type: 'text',
    question: 'What is the full name of the party who claims custody/visitation rights?',
    placeholder: 'Full legal name',
    required: true,
    nextQuestionId: 'claimant_address',
  },
  {
    id: 'claimant_address',
    type: 'address',
    question: 'What is their address?',
    placeholder: 'Full address',
    required: true,
    nextQuestionId: 'more_claimants',
  },
  {
    id: 'more_claimants',
    type: 'yesno',
    question: 'Is there any other party who you believe can claim custody/visitation rights?',
    nextQuestionMap: {
      'yes': 'claimant_name',
      'no': 'legal_custody',
    },
  },

  // =====================
  // Q16: LEGAL CUSTODY
  // =====================
  {
    id: 'legal_custody',
    type: 'select',
    question: 'How do you wish to divide legal custody?',
    tooltip: 'Legal custody refers to the ability to access information and make major decisions about the child such as medical care, education, and religious upbringing.',
    options: [
      { value: 'joint', label: 'The parties should share joint legal custody of the children' },
      { value: 'plaintiff_sole', label: 'I (Plaintiff) should have sole legal custody of the children' },
      { value: 'defendant_sole', label: 'Defendant should have sole legal custody of the children' },
      { value: 'no_home_state', label: 'Nevada is not the home state of the children and the Court generally cannot enter custody orders' },
    ],
    required: true,
    nextQuestionId: 'physical_custody',
  },

  // =====================
  // Q17: PHYSICAL CUSTODY
  // =====================
  {
    id: 'physical_custody',
    type: 'select',
    question: 'How do you wish to divide physical custody?',
    tooltip: 'Physical custody refers to the amount of time the child spends with each parent.',
    options: [
      { value: 'joint', label: 'The parties should share joint physical custody of the children', description: 'Each parent would have the child/children roughly 40-60% of the time' },
      { value: 'plaintiff_primary', label: 'I (Plaintiff) should have primary physical custody of the children' },
      { value: 'defendant_primary', label: 'Defendant should have primary physical custody of the children' },
      { value: 'no_home_state', label: 'Nevada is not the home state of the children and the Court generally cannot enter custody orders' },
    ],
    required: true,
    nextQuestionId: 'regular_schedule',
  },

  // =====================
  // Q18: PARENTING TIME SCHEDULE
  // =====================
  {
    id: 'regular_schedule',
    type: 'textarea',
    question: 'How do you propose dividing the regular weekly schedule during the school year?',
    description: 'Be very specific. Include the times and days of the week for each parent\'s schedule. For example: "Plaintiff: Saturday at 7 p.m. until Wednesday at 3:00 p.m. Defendant: Wednesday at 3:00 p.m. until Saturday at 7:00 p.m."',
    placeholder: 'Plaintiff: [days/times]. Defendant: [days/times].',
    required: true,
    nextQuestionId: 'summer_same_as_regular',
  },
  {
    id: 'summer_same_as_regular',
    type: 'yesno',
    question: 'Would you like the summer schedule to be the same as the regular schedule?',
    required: true,
    nextQuestionMap: {
      'yes': 'holiday_intro',
      'no': 'summer_schedule',
    },
  },
  {
    id: 'summer_schedule',
    type: 'textarea',
    question: 'How would you like to divide the summer schedule?',
    description: 'Be very specific. Include the times and days of the week for each parent\'s schedule. For example: "Plaintiff: Saturday at 7 p.m. until Wednesday at 3:00 p.m. Defendant: Wednesday at 3:00 p.m. until Saturday at 7:00 p.m."',
    placeholder: 'Plaintiff: [days/times]. Defendant: [days/times].',
    required: true,
    nextQuestionId: 'holiday_intro',
  },

  // =====================
  // HOLIDAY SCHEDULE
  // =====================
  {
    id: 'holiday_intro',
    type: 'info',
    question: "Now let's set up the holiday and break schedule. For each holiday, choose which parent will have the children.",
    nextQuestionId: 'holiday_new_years_eve',
  },
  {
    id: 'holiday_new_years_eve',
    type: 'select',
    question: "New Year's Eve — who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_new_years_day',
  },
  {
    id: 'holiday_new_years_day',
    type: 'select',
    question: "New Year's Day — who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_easter',
  },
  {
    id: 'holiday_easter',
    type: 'select',
    question: 'Easter — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_fourth_july',
  },
  {
    id: 'holiday_fourth_july',
    type: 'select',
    question: 'Fourth of July — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_halloween',
  },
  {
    id: 'holiday_halloween',
    type: 'select',
    question: 'Halloween — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_thanksgiving',
  },
  {
    id: 'holiday_thanksgiving',
    type: 'select',
    question: 'Thanksgiving — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_hanukkah',
  },
  {
    id: 'holiday_hanukkah',
    type: 'select',
    question: 'Hanukkah — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_christmas_eve',
  },
  {
    id: 'holiday_christmas_eve',
    type: 'select',
    question: 'Christmas Eve — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_christmas_day',
  },
  {
    id: 'holiday_christmas_day',
    type: 'select',
    question: 'Christmas Day — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_child_birthday',
  },
  {
    id: 'holiday_child_birthday',
    type: 'select',
    question: "Child's Birthday — who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_father_birthday',
  },
  {
    id: 'holiday_father_birthday',
    type: 'select',
    question: "Father's Birthday — who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_mother_birthday',
  },
  {
    id: 'holiday_mother_birthday',
    type: 'select',
    question: "Mother's Birthday — who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_mothers_day',
  },
  {
    id: 'holiday_mothers_day',
    type: 'select',
    question: "Mother's Day — who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_fathers_day',
  },
  {
    id: 'holiday_fathers_day',
    type: 'select',
    question: "Father's Day — who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_other_check',
  },
  {
    id: 'holiday_other_check',
    type: 'yesno',
    question: 'Are there any other holidays you would like to include in the schedule?',
    nextQuestionMap: {
      'yes': 'holiday_other_name',
      'no': 'break_intro',
    },
  },
  {
    id: 'holiday_other_name',
    type: 'text',
    question: 'What is the name of the holiday?',
    placeholder: 'e.g., Eid, Diwali, etc.',
    required: true,
    nextQuestionId: 'holiday_other_division',
  },
  {
    id: 'holiday_other_division',
    type: 'select',
    question: 'Who should have the children for this holiday?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_other_more',
  },
  {
    id: 'holiday_other_more',
    type: 'yesno',
    question: 'Would you like to add another holiday?',
    nextQuestionMap: {
      'yes': 'holiday_other_name',
      'no': 'break_intro',
    },
  },

  // =====================
  // BREAK SCHEDULE
  // =====================
  {
    id: 'break_intro',
    type: 'info',
    question: "Now let's set up the school break schedule.",
    nextQuestionId: 'break_spring',
  },
  {
    id: 'break_spring',
    type: 'select',
    question: 'Spring Break — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'break_fall',
  },
  {
    id: 'break_fall',
    type: 'select',
    question: 'Fall Break — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'break_winter',
  },
  {
    id: 'break_winter',
    type: 'select',
    question: 'Winter Break — who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'child_support_intro',
  },

  // =====================
  // Q19: CHILD SUPPORT - INCOME
  // =====================
  {
    id: 'child_support_intro',
    type: 'info',
    question: "The following questions ask for information the judge will use to set or waive child support.",
    description: "The Court needs to know both parties' gross monthly incomes to make sure child support is set correctly. Gross monthly income includes income received from any source including income received from work, social security, unemployment, pension/retirement, interest/investments, veteran's benefits, and military allowances. It does NOT include SSI, SNAP, TANF, cash benefits from the county, or child support received for other children.",
    nextQuestionId: 'plaintiff_pay_frequency',
  },
  {
    id: 'plaintiff_pay_frequency',
    type: 'select',
    question: 'How do you (Plaintiff) get paid?',
    options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'biweekly', label: 'Biweekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'annually', label: 'Annually' },
    ],
    required: true,
    nextQuestionId: 'plaintiff_income',
  },
  {
    id: 'plaintiff_income',
    type: 'currency',
    question: 'What is your gross {plaintiffPayFrequency} income?',
    description: 'Enter the amount before taxes and deductions.',
    placeholder: '0.00',
    required: true,
    nextQuestionId: 'plaintiff_hours_check',
  },
  // Engine will route to plaintiff_hours_per_week if hourly, else to defendant_pay_frequency
  {
    id: 'plaintiff_hours_check',
    type: 'info',
    question: 'Processing your income information...',
    nextQuestionId: 'defendant_pay_frequency',
  },
  {
    id: 'plaintiff_hours_per_week',
    type: 'number',
    question: 'How many hours do you work per week?',
    placeholder: 'e.g., 40',
    required: true,
    nextQuestionId: 'defendant_pay_frequency',
  },
  {
    id: 'defendant_pay_frequency',
    type: 'select',
    question: 'How does the Defendant get paid?',
    options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'biweekly', label: 'Biweekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'annually', label: 'Annually' },
      { value: 'unknown', label: 'Unknown' },
    ],
    required: true,
    nextQuestionMap: {
      'hourly': 'defendant_income',
      'weekly': 'defendant_income',
      'biweekly': 'defendant_income',
      'monthly': 'defendant_income',
      'annually': 'defendant_income',
      'unknown': 'existing_cse_order_check',
    },
  },
  {
    id: 'defendant_income',
    type: 'currency',
    question: "What is the Defendant's gross {defendantPayFrequency} income?",
    description: 'Enter the amount before taxes and deductions.',
    placeholder: '0.00',
    required: true,
    nextQuestionId: 'defendant_hours_check',
  },
  {
    id: 'defendant_hours_check',
    type: 'info',
    question: "Processing Defendant's income information...",
    nextQuestionId: 'existing_cse_order_check',
  },
  {
    id: 'defendant_hours_per_week',
    type: 'number',
    question: 'How many hours does the Defendant work per week?',
    placeholder: 'e.g., 40',
    required: true,
    nextQuestionId: 'existing_cse_order_check',
  },

  // =====================
  // Q20: EXISTING CSE ORDER
  // =====================
  {
    id: 'existing_cse_order_check',
    type: 'yesno',
    question: 'Was child support already set by the Child Support Enforcement Office and you want to keep that amount in place?',
    required: true,
    nextQuestionMap: {
      'yes': 'cse_case_number',
      'no': 'seeking_child_support',
    },
  },
  {
    id: 'cse_case_number',
    type: 'text',
    question: 'What was the case number of the Child Support Enforcement case that established child support?',
    placeholder: 'e.g., CSE-2023-001234',
    required: true,
    nextQuestionId: 'cse_paying_parent',
  },
  {
    id: 'cse_paying_parent',
    type: 'select',
    question: 'Who is the parent that is ordered to pay child support?',
    options: [
      { value: 'plaintiff', label: 'I am (Plaintiff)' },
      { value: 'defendant', label: 'Defendant is' },
    ],
    required: true,
    nextQuestionId: 'cse_monthly_amount',
  },
  {
    id: 'cse_monthly_amount',
    type: 'currency',
    question: 'What is the amount of monthly child support that was determined?',
    placeholder: '0.00',
    required: true,
    nextQuestionId: 'public_assistance_check',
  },
  // If no existing CSE order:
  {
    id: 'seeking_child_support',
    type: 'yesno',
    question: 'Are you seeking child support?',
    tooltip: 'If you select "No," the complaint will state that child support is not being requested at this time in the best interests of the child/children.',
    required: true,
    nextQuestionId: 'public_assistance_check',
  },

  // =====================
  // Q21: PUBLIC ASSISTANCE
  // =====================
  {
    id: 'public_assistance_check',
    type: 'yesno',
    question: 'Has either party ever received public assistance?',
    tooltip: 'If yes, the Court cannot waive any back child support owed to the state without notifying the state first.',
    required: true,
    nextQuestionId: 'back_child_support_check',
  },

  // =====================
  // Q22: BACK CHILD SUPPORT
  // =====================
  {
    id: 'back_child_support_check',
    type: 'yesno',
    question: 'Should back child support be ordered?',
    tooltip: 'A maximum of four years\' worth of back child support may be requested. The court may award some, none, or all that is requested.',
    required: true,
    nextQuestionMap: {
      'yes': 'back_cs_da_handling',
      'no': 'child_care_check',
    },
  },
  {
    id: 'back_cs_da_handling',
    type: 'yesno',
    question: 'Is the District Attorney or Child Support Enforcement office handling back child support?',
    required: true,
    nextQuestionMap: {
      'yes': 'back_cs_da_case_number',
      'no': 'back_cs_paying_parent',
    },
  },
  {
    id: 'back_cs_da_case_number',
    type: 'text',
    question: 'What is the case number from the back child support case being handled by the District Attorney or Child Support Office?',
    placeholder: 'e.g., DA-CS-2023-001234',
    required: true,
    nextQuestionId: 'back_cs_paying_parent',
  },
  {
    id: 'back_cs_paying_parent',
    type: 'select',
    question: 'Who is the parent that should pay back child support?',
    options: [
      { value: 'plaintiff', label: 'I should (Plaintiff)' },
      { value: 'defendant', label: 'Defendant should' },
    ],
    required: true,
    nextQuestionId: 'back_cs_start_date',
  },
  {
    id: 'back_cs_start_date',
    type: 'date',
    question: 'What is the date child support should begin?',
    tooltip: 'A maximum of four years\' worth of back child support may be requested. The court may award some, none, or all that is requested.',
    required: true,
    nextQuestionId: 'child_care_check',
  },

  // =====================
  // Q23: CHILD CARE EXPENSES
  // =====================
  {
    id: 'child_care_check',
    type: 'yesno',
    question: 'Are there any child care expenses?',
    required: true,
    nextQuestionMap: {
      'yes': 'child_care_amount',
      'no': 'medical_insurance_type',
    },
  },
  {
    id: 'child_care_amount',
    type: 'currency',
    question: 'What is the amount of monthly child care expenses?',
    placeholder: '0.00',
    required: true,
    nextQuestionId: 'child_care_paid_by',
  },
  {
    id: 'child_care_paid_by',
    type: 'select',
    question: 'This amount should be paid by:',
    options: [
      { value: 'me', label: 'Me only (Plaintiff)' },
      { value: 'defendant', label: 'Defendant only' },
      { value: 'both', label: 'Both parents equally' },
    ],
    required: true,
    nextQuestionId: 'medical_insurance_type',
  },

  // =====================
  // Q24: MEDICAL INSURANCE
  // =====================
  {
    id: 'medical_insurance_type',
    type: 'select',
    question: 'How will the children get medical insurance?',
    options: [
      { value: 'medicaid', label: 'Medicaid' },
      { value: 'private', label: 'Private/Employer insurance' },
    ],
    required: true,
    nextQuestionMap: {
      'medicaid': 'child_support_factors',
      'private': 'medical_premium_amount',
    },
  },
  {
    id: 'medical_premium_amount',
    type: 'currency',
    question: 'What is the monthly premium amount for the children only?',
    description: 'Enter only the portion of the premium that covers the children.',
    placeholder: '0.00',
    required: true,
    nextQuestionId: 'medical_premium_paid_by',
  },
  {
    id: 'medical_premium_paid_by',
    type: 'select',
    question: 'Who should pay the monthly premium for the children?',
    options: [
      { value: 'me', label: 'Me only (Plaintiff)' },
      { value: 'defendant', label: 'Defendant only' },
      { value: 'both', label: 'Both parents equally' },
    ],
    required: true,
    nextQuestionId: 'child_support_factors',
  },

  // =====================
  // Q25-26: CHILD SUPPORT SPECIAL FACTORS / DEVIATION
  // =====================
  {
    id: 'child_support_factors',
    type: 'multiselect',
    question: 'Do any of the following factors apply? Select all that apply, or select none if none apply.',
    description: 'These factors may qualify you for a deviation from the standard child support amount.',
    options: [
      { value: 'special_education_needs', label: 'The child has special education needs' },
      { value: 'legal_responsibility_others', label: 'I have legal responsibility (court order) to support others' },
      { value: 'public_support_services', label: 'The child received public support services' },
      { value: 'transportation_costs', label: 'There is a cost for transportation to/from visitation' },
      { value: 'significantly_higher_income', label: 'One of the parents makes significantly higher income' },
      { value: 'other_necessary_expenses', label: 'The child has other necessary expenses' },
      { value: 'ability_to_pay', label: "Either parent's ability to pay" },
      { value: 'none', label: 'None of these apply' },
    ],
    required: true,
    nextQuestionId: 'child_support_factors_check',
  },
  // Engine will route to deviation_amount if factors selected, else to tax_deduction
  {
    id: 'child_support_factors_check',
    type: 'info',
    question: 'Processing your selections...',
    nextQuestionId: 'tax_deduction',
  },
  {
    id: 'deviation_amount',
    type: 'currency',
    question: 'Based on your selection above, you may qualify for a deviation of the typical child support amount. What would you like the child support amount to be?',
    placeholder: '0.00',
    required: true,
    nextQuestionId: 'tax_deduction',
  },

  // =====================
  // Q28: TAX DEDUCTIONS
  // =====================
  {
    id: 'tax_deduction',
    type: 'select',
    question: 'Who should claim the child tax deduction?',
    options: [
      { value: 'plaintiff_all', label: 'I (Plaintiff) should claim all children as dependents every year' },
      { value: 'defendant_all', label: 'Defendant should claim all children as dependents every year' },
      { value: 'split', label: 'We should split — each claiming specific children every year' },
      { value: 'alternate', label: 'We should alternate years' },
      { value: 'per_federal_law', label: 'The tax deduction should be allocated per federal law' },
    ],
    required: true,
    nextQuestionMap: {
      'plaintiff_all': 'tax_deduction_plaintiff_children',
      'defendant_all': 'tax_deduction_defendant_children',
      'split': 'tax_deduction_plaintiff_children',
      'alternate': 'tax_deduction_plaintiff_years',
      'per_federal_law': 'community_property_intro',
    },
  },
  {
    id: 'tax_deduction_plaintiff_children',
    type: 'text',
    question: 'Plaintiff should claim the following children as dependents for tax purposes each and every year:',
    description: 'Enter the names of the children, separated by commas.',
    placeholder: 'e.g., John Smith, Jane Smith',
    required: true,
    nextQuestionMap: {
      // If split, we need defendant children too
    },
    nextQuestionId: 'tax_deduction_route_check',
  },
  // Engine will check if split and route to defendant_children or community_property_intro
  {
    id: 'tax_deduction_route_check',
    type: 'info',
    question: 'Processing tax deduction selections...',
    nextQuestionId: 'community_property_intro',
  },
  {
    id: 'tax_deduction_defendant_children',
    type: 'text',
    question: 'Defendant should claim the following children as dependents for tax purposes each and every year:',
    description: 'Enter the names of the children, separated by commas.',
    placeholder: 'e.g., John Smith, Jane Smith',
    required: true,
    nextQuestionId: 'community_property_intro',
  },
  {
    id: 'tax_deduction_plaintiff_years',
    type: 'select',
    question: 'Plaintiff should claim the child/children in:',
    options: [
      { value: 'even', label: 'Even years (2024, 2026, ...)' },
      { value: 'odd', label: 'Odd years (2025, 2027, ...)' },
    ],
    required: true,
    nextQuestionId: 'community_property_intro',
  },

  // =====================
  // Q29-30: COMMUNITY PROPERTY
  // =====================
  {
    id: 'community_property_intro',
    type: 'info',
    question: "The following questions will discuss how you want to divide community and separate property and debts.",
    description: "Community property/debts include any property/debts that were acquired during the marriage other than property that was acquired by gift, inheritance, or through a settlement for a personal injury. Separate property/debt is generally property/debt that was acquired prior to the marriage.",
    nextQuestionId: 'community_property_check',
  },
  {
    id: 'community_property_check',
    type: 'yesno',
    question: 'Is there any community property to divide?',
    required: true,
    nextQuestionMap: {
      'yes': 'home_check',
      'no': 'community_debt_check',
    },
  },

  // Real Estate
  {
    id: 'home_check',
    type: 'yesno',
    question: 'Do you and your spouse own any real estate (homes, land, etc.) together?',
    required: true,
    nextQuestionMap: {
      'yes': 'home_address',
      'no': 'personal_property_preference',
    },
  },
  {
    id: 'home_address',
    type: 'address',
    question: 'What is the address of the property?',
    placeholder: '123 Main St, City, NV ZIP',
    required: true,
    nextQuestionId: 'home_division',
  },
  {
    id: 'home_division',
    type: 'select',
    question: 'How should this property be divided?',
    options: [
      { value: 'i_keep', label: 'I (Plaintiff) keep it' },
      { value: 'spouse_keeps', label: 'Defendant keeps it' },
      { value: 'sell_split', label: 'Sell and split the proceeds' },
    ],
    required: true,
    nextQuestionId: 'more_homes',
  },
  {
    id: 'more_homes',
    type: 'yesno',
    question: 'Do you own any other real estate together?',
    nextQuestionMap: {
      'yes': 'home_address',
      'no': 'personal_property_preference',
    },
  },

  // Personal Property
  {
    id: 'personal_property_preference',
    type: 'select',
    question: 'How would you like to handle personal property (furniture, appliances, electronics, etc.)?',
    options: [
      { value: 'keep_in_possession', label: 'Each party keeps what they currently have in their possession' },
      { value: 'itemize', label: 'I want to specify who gets what' },
    ],
    required: true,
    nextQuestionMap: {
      'keep_in_possession': 'bank_accounts_check',
      'itemize': 'personal_property_mine',
    },
  },
  {
    id: 'personal_property_mine',
    type: 'textarea',
    question: 'List the personal property items you (Plaintiff) should receive:',
    placeholder: 'e.g., Living room furniture, Kitchen appliances, Master bedroom set',
    required: true,
    nextQuestionId: 'personal_property_spouse',
  },
  {
    id: 'personal_property_spouse',
    type: 'textarea',
    question: 'List the personal property items the Defendant should receive:',
    placeholder: 'e.g., Office furniture, Garage tools, Guest bedroom set',
    required: true,
    nextQuestionId: 'bank_accounts_check',
  },

  // Bank Accounts
  {
    id: 'bank_accounts_check',
    type: 'yesno',
    question: 'Are there any bank accounts (checking, savings, etc.) to divide?',
    required: true,
    nextQuestionMap: {
      'yes': 'bank_account_name',
      'no': 'retirement_check',
    },
  },
  {
    id: 'bank_account_name',
    type: 'text',
    question: 'Describe the bank account (e.g., "Chase checking ending in 4567"):',
    placeholder: 'Bank name and last 4 digits',
    required: true,
    nextQuestionId: 'bank_account_division',
  },
  {
    id: 'bank_account_division',
    type: 'select',
    question: 'How should this bank account be divided?',
    options: [
      { value: 'i_keep', label: 'I (Plaintiff) keep it' },
      { value: 'spouse_keeps', label: 'Defendant keeps it' },
      { value: 'split_50_50', label: 'Split 50/50' },
    ],
    required: true,
    nextQuestionId: 'more_bank_accounts',
  },
  {
    id: 'more_bank_accounts',
    type: 'yesno',
    question: 'Are there any other bank accounts to divide?',
    nextQuestionMap: {
      'yes': 'bank_account_name',
      'no': 'retirement_check',
    },
  },

  // Retirement
  {
    id: 'retirement_check',
    type: 'yesno',
    question: 'Are there any retirement accounts (401k, IRA, pension, etc.) to divide?',
    required: true,
    nextQuestionMap: {
      'yes': 'retirement_account_type',
      'no': 'vehicle_check',
    },
  },
  {
    id: 'retirement_account_type',
    type: 'select',
    question: 'What type of retirement account is it?',
    options: [
      { value: '401k', label: '401(k)' },
      { value: 'ira', label: 'IRA' },
      { value: 'roth_ira', label: 'Roth IRA' },
      { value: 'pension', label: 'Pension' },
      { value: '403b', label: '403(b)' },
      { value: 'other', label: 'Other' },
    ],
    required: true,
    nextQuestionMap: {
      'other': 'retirement_type_other',
      '401k': 'retirement_owner',
      'ira': 'retirement_owner',
      'roth_ira': 'retirement_owner',
      'pension': 'retirement_owner',
      '403b': 'retirement_owner',
    },
  },
  {
    id: 'retirement_type_other',
    type: 'text',
    question: 'Please specify the type of retirement account:',
    placeholder: 'e.g., Deferred Compensation',
    required: true,
    nextQuestionId: 'retirement_owner',
  },
  {
    id: 'retirement_owner',
    type: 'select',
    question: 'Whose name is this retirement account in?',
    options: [
      { value: 'me', label: 'Mine (Plaintiff)' },
      { value: 'spouse', label: "Defendant's" },
    ],
    required: true,
    nextQuestionId: 'retirement_administrator',
  },
  {
    id: 'retirement_administrator',
    type: 'text',
    question: 'Who is the administrator or plan sponsor of this account?',
    placeholder: 'e.g., Fidelity, Vanguard, PERS',
    required: true,
    nextQuestionId: 'retirement_division',
  },
  {
    id: 'retirement_division',
    type: 'select',
    question: 'How should this retirement account be divided?',
    options: [
      { value: 'i_keep', label: 'I (Plaintiff) keep all of it' },
      { value: 'spouse_keeps', label: 'Defendant keeps all of it' },
      { value: 'split_community', label: 'Split the community portion 50/50' },
    ],
    required: true,
    nextQuestionId: 'more_retirement',
  },
  {
    id: 'more_retirement',
    type: 'yesno',
    question: 'Are there any other retirement accounts to divide?',
    nextQuestionMap: {
      'yes': 'retirement_account_type',
      'no': 'vehicle_check',
    },
  },

  // Vehicles
  {
    id: 'vehicle_check',
    type: 'yesno',
    question: 'Are there any vehicles to divide?',
    required: true,
    nextQuestionMap: {
      'yes': 'vehicle_info',
      'no': 'community_debt_check',
    },
  },
  {
    id: 'vehicle_info',
    type: 'text',
    question: 'Enter the year, make, and model of the vehicle:',
    placeholder: 'e.g., 2020 Toyota Camry',
    required: true,
    nextQuestionId: 'vehicle_title',
  },
  {
    id: 'vehicle_title',
    type: 'select',
    question: 'Whose name is the vehicle titled in?',
    options: [
      { value: 'me', label: 'Mine (Plaintiff)' },
      { value: 'spouse', label: "Defendant's" },
      { value: 'both', label: 'Both of us' },
    ],
    required: true,
    nextQuestionId: 'vehicle_loan_check',
  },
  {
    id: 'vehicle_loan_check',
    type: 'yesno',
    question: 'Is there an outstanding loan on this vehicle?',
    required: true,
    nextQuestionId: 'vehicle_division',
  },
  {
    id: 'vehicle_division',
    type: 'select',
    question: 'Who should keep this vehicle?',
    options: [
      { value: 'i_keep', label: 'I (Plaintiff) keep it' },
      { value: 'spouse_keeps', label: 'Defendant keeps it' },
      { value: 'sell_split', label: 'Sell and split the proceeds' },
    ],
    required: true,
    nextQuestionId: 'more_vehicles',
  },
  {
    id: 'more_vehicles',
    type: 'yesno',
    question: 'Are there any other vehicles to divide?',
    nextQuestionMap: {
      'yes': 'vehicle_info',
      'no': 'community_debt_check',
    },
  },

  // =====================
  // Q31: COMMUNITY DEBTS
  // =====================
  {
    id: 'community_debt_check',
    type: 'yesno',
    question: 'Is there any community debt to divide?',
    description: 'Community debts are debts acquired during the marriage.',
    required: true,
    nextQuestionMap: {
      'yes': 'community_debt_preference',
      'no': 'separate_property_check',
    },
  },
  {
    id: 'community_debt_preference',
    type: 'select',
    question: 'How would you like to handle community debts?',
    options: [
      { value: 'keep_in_name', label: 'Each party is responsible for debts in their name' },
      { value: 'itemize', label: 'I want to specify who pays what' },
    ],
    required: true,
    nextQuestionMap: {
      'keep_in_name': 'separate_property_check',
      'itemize': 'credit_card_check',
    },
  },
  {
    id: 'credit_card_check',
    type: 'yesno',
    question: 'Are there any credit card debts to divide?',
    required: true,
    nextQuestionMap: {
      'yes': 'credit_card_info',
      'no': 'student_loan_check',
    },
  },
  {
    id: 'credit_card_info',
    type: 'text',
    question: 'Describe the credit card (e.g., "Visa ending in 1234"):',
    placeholder: 'Card type and last 4 digits',
    required: true,
    nextQuestionId: 'credit_card_division',
  },
  {
    id: 'credit_card_division',
    type: 'select',
    question: 'Who should be responsible for this credit card debt?',
    options: [
      { value: 'me', label: 'I will pay (Plaintiff)' },
      { value: 'spouse', label: 'Defendant will pay' },
      { value: 'split', label: 'Split equally' },
      { value: 'other', label: 'Other arrangement' },
    ],
    required: true,
    nextQuestionMap: {
      'me': 'more_credit_cards',
      'spouse': 'more_credit_cards',
      'split': 'more_credit_cards',
      'other': 'credit_card_other_details',
    },
  },
  {
    id: 'credit_card_other_details',
    type: 'text',
    question: 'Please describe the arrangement:',
    placeholder: 'e.g., Plaintiff pays 60%, Defendant pays 40%',
    required: true,
    nextQuestionId: 'more_credit_cards',
  },
  {
    id: 'more_credit_cards',
    type: 'yesno',
    question: 'Are there any other credit card debts to divide?',
    nextQuestionMap: {
      'yes': 'credit_card_info',
      'no': 'student_loan_check',
    },
  },
  {
    id: 'student_loan_check',
    type: 'yesno',
    question: 'Are there any student loan debts to divide?',
    required: true,
    nextQuestionMap: {
      'yes': 'student_loan_division',
      'no': 'medical_debt_check',
    },
  },
  {
    id: 'student_loan_division',
    type: 'select',
    question: 'Who should be responsible for the student loan debt?',
    options: [
      { value: 'me', label: 'I will pay (Plaintiff)' },
      { value: 'spouse', label: 'Defendant will pay' },
      { value: 'split', label: 'Split equally' },
      { value: 'other', label: 'Other arrangement' },
    ],
    required: true,
    nextQuestionMap: {
      'me': 'medical_debt_check',
      'spouse': 'medical_debt_check',
      'split': 'medical_debt_check',
      'other': 'student_loan_other_details',
    },
  },
  {
    id: 'student_loan_other_details',
    type: 'text',
    question: 'Please describe the arrangement:',
    required: true,
    nextQuestionId: 'medical_debt_check',
  },
  {
    id: 'medical_debt_check',
    type: 'yesno',
    question: 'Are there any medical debts to divide?',
    required: true,
    nextQuestionMap: {
      'yes': 'medical_debt_division',
      'no': 'other_community_debt_check',
    },
  },
  {
    id: 'medical_debt_division',
    type: 'select',
    question: 'Who should be responsible for the medical debt?',
    options: [
      { value: 'me', label: 'I will pay (Plaintiff)' },
      { value: 'spouse', label: 'Defendant will pay' },
      { value: 'split', label: 'Split equally' },
      { value: 'other', label: 'Other arrangement' },
    ],
    required: true,
    nextQuestionMap: {
      'me': 'other_community_debt_check',
      'spouse': 'other_community_debt_check',
      'split': 'other_community_debt_check',
      'other': 'medical_debt_other_details',
    },
  },
  {
    id: 'medical_debt_other_details',
    type: 'text',
    question: 'Please describe the arrangement:',
    required: true,
    nextQuestionId: 'other_community_debt_check',
  },
  {
    id: 'other_community_debt_check',
    type: 'yesno',
    question: 'Are there any other community debts to divide?',
    required: true,
    nextQuestionMap: {
      'yes': 'other_community_debt_description',
      'no': 'separate_property_check',
    },
  },
  {
    id: 'other_community_debt_description',
    type: 'text',
    question: 'Describe the debt:',
    placeholder: 'e.g., Personal loan from Bank of America',
    required: true,
    nextQuestionId: 'other_community_debt_division',
  },
  {
    id: 'other_community_debt_division',
    type: 'select',
    question: 'Who should be responsible for this debt?',
    options: [
      { value: 'me', label: 'I will pay (Plaintiff)' },
      { value: 'spouse', label: 'Defendant will pay' },
      { value: 'split', label: 'Split equally' },
      { value: 'other', label: 'Other arrangement' },
    ],
    required: true,
    nextQuestionMap: {
      'me': 'separate_property_check',
      'spouse': 'separate_property_check',
      'split': 'separate_property_check',
      'other': 'other_community_debt_other_details',
    },
  },
  {
    id: 'other_community_debt_other_details',
    type: 'text',
    question: 'Please describe the arrangement:',
    required: true,
    nextQuestionId: 'separate_property_check',
  },

  // =====================
  // Q32: SEPARATE PROPERTY
  // =====================
  {
    id: 'separate_property_check',
    type: 'yesno',
    question: 'Is there any separate property to allocate?',
    description: 'Separate property is generally property acquired before the marriage, or by gift or inheritance during the marriage.',
    required: true,
    nextQuestionMap: {
      'yes': 'my_separate_property_list',
      'no': 'separate_debt_check',
    },
  },
  {
    id: 'my_separate_property_list',
    type: 'textarea',
    question: 'List your (Plaintiff) separate property:',
    placeholder: 'e.g., Engagement ring, Pre-marital savings account at Wells Fargo',
    required: true,
    nextQuestionId: 'spouse_separate_property_list',
  },
  {
    id: 'spouse_separate_property_list',
    type: 'textarea',
    question: "List the Defendant's separate property:",
    placeholder: 'e.g., Inherited jewelry, Pre-marital investment account',
    required: true,
    nextQuestionId: 'separate_debt_check',
  },

  // =====================
  // Q33: SEPARATE DEBTS
  // =====================
  {
    id: 'separate_debt_check',
    type: 'yesno',
    question: 'Is there any separate debt to allocate?',
    description: 'Separate debt is generally debt acquired before the marriage.',
    required: true,
    nextQuestionMap: {
      'yes': 'my_separate_debt_list',
      'no': 'spousal_support_check',
    },
  },
  {
    id: 'my_separate_debt_list',
    type: 'textarea',
    question: 'List your (Plaintiff) separate debts:',
    placeholder: 'e.g., Pre-marital student loans, Credit card opened before marriage',
    required: true,
    nextQuestionId: 'spouse_separate_debt_list',
  },
  {
    id: 'spouse_separate_debt_list',
    type: 'textarea',
    question: "List the Defendant's separate debts:",
    placeholder: "e.g., Defendant's pre-marital car loan",
    required: true,
    nextQuestionId: 'spousal_support_check',
  },

  // =====================
  // Q34: SPOUSAL SUPPORT / ALIMONY
  // =====================
  {
    id: 'spousal_support_check',
    type: 'yesno',
    question: 'Should either spouse pay spousal support/alimony?',
    required: true,
    nextQuestionMap: {
      'yes': 'spousal_support_payer',
      'no': 'name_restoration_check',
    },
  },
  {
    id: 'spousal_support_payer',
    type: 'select',
    question: 'Who should pay spousal support/alimony?',
    options: [
      { value: 'me', label: 'I should pay (Plaintiff)' },
      { value: 'defendant', label: 'Defendant should pay' },
    ],
    required: true,
    nextQuestionId: 'spousal_support_amount',
  },
  {
    id: 'spousal_support_amount',
    type: 'currency',
    question: 'How much should the monthly spousal support payment be?',
    placeholder: '0.00',
    required: true,
    nextQuestionId: 'name_restoration_check',
  },

  // =====================
  // Q35: NAME RESTORATION
  // =====================
  {
    id: 'name_restoration_check',
    type: 'yesno',
    question: 'Do you wish to revert to a former/maiden name?',
    required: true,
    nextQuestionMap: {
      'yes': 'former_name',
      'no': 'review_complete',
    },
  },
  {
    id: 'former_name',
    type: 'text',
    question: 'What is the former/maiden name you would like to go back to?',
    placeholder: 'Full former name',
    required: true,
    nextQuestionId: 'review_complete',
  },

  // =====================
  // COMPLETION
  // =====================
  {
    id: 'review_complete',
    type: 'info',
    question: "Thank you! You have completed the Nevada Complaint for Divorce and UCCJEA Declaration questionnaire. Your answers have been saved and will be used to prepare your complaint for filing in the District Court of {county} County, Nevada.",
    description: "Your complaint will include the standard Nevada verification statement and the UCCJEA Declaration. A separate Child Support Worksheet will also be generated based on the income information you provided.",
    nextQuestionId: 'complete',
  },
];

/**
 * Get a question by ID
 */
export function getQuestionById(id: string): ChatQuestion | null {
  return NV_DIVORCE_WITH_CHILDREN_QUESTIONS.find(q => q.id === id) || null;
}

/**
 * Get the next question ID based on current question and answer
 */
export function getNextQuestion(question: ChatQuestion, answer: string): string {
  // Check nextQuestionMap first (branching logic)
  if (question.nextQuestionMap) {
    const mapped = question.nextQuestionMap[answer.toLowerCase()];
    if (mapped) return mapped;
  }

  // Use explicit nextQuestionId
  if (question.nextQuestionId) {
    return question.nextQuestionId;
  }

  // Find next question in sequence
  const currentIndex = NV_DIVORCE_WITH_CHILDREN_QUESTIONS.findIndex(q => q.id === question.id);
  if (currentIndex >= 0 && currentIndex < NV_DIVORCE_WITH_CHILDREN_QUESTIONS.length - 1) {
    return NV_DIVORCE_WITH_CHILDREN_QUESTIONS[currentIndex + 1].id;
  }

  return 'complete';
}
