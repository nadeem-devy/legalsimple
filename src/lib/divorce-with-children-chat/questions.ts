import { ChatQuestion } from './types';

// Arizona Counties
export const ARIZONA_COUNTIES = [
  'Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee',
  'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal',
  'Santa Cruz', 'Yavapai', 'Yuma'
];

// Holiday options for scheduling
const HOLIDAY_OPTIONS = [
  { value: 'petitioner_even', label: 'Petitioner in even years' },
  { value: 'respondent_even', label: 'Respondent in even years' },
  { value: 'petitioner_every', label: 'Petitioner every year' },
  { value: 'respondent_every', label: 'Respondent every year' },
  { value: 'regular_schedule', label: 'Regular schedule applies' },
];

export const DIVORCE_WITH_CHILDREN_QUESTIONS: ChatQuestion[] = [
  // =====================
  // WELCOME & INITIAL CHECK
  // =====================
  {
    id: 'welcome',
    type: 'info',
    question: "Welcome to the Legal Simple QuickFile Wizard for a Petition for Dissolution of Marriage WITH CHILDREN. I'll guide you through the process step by step.",
    nextQuestionId: 'has_minor_children',
  },
  {
    id: 'has_minor_children',
    type: 'yesno',
    question: 'Do you and your spouse have any minor children together?',
    description: 'This includes any children under 18 years old.',
    tooltip: 'This form is specifically for divorces involving minor children. Cases with children require additional custody, support, and parenting plan provisions.',
    required: true,
    nextQuestionMap: {
      'yes': 'personal_intro',
      'no': 'without_children_redirect',
    },
  },
  {
    id: 'without_children_redirect',
    type: 'stop',
    question: "Since you do not have minor children, you should complete the Petition WITHOUT Children form instead.\n\nThe 'Without Children' form is simpler and focuses on:\n• Property division\n• Debt allocation\n• Spousal maintenance\n\nClick the button below to start the correct form.",
  },

  // =====================
  // PERSONAL INFORMATION (Q1-Q9)
  // =====================
  {
    id: 'personal_intro',
    type: 'info',
    question: "Let's start with your personal information. You are the Petitioner in this case.",
    tooltip: 'The Petitioner is the person who initiates the case. The Respondent is the other party who is responding to the Petition.',
    nextQuestionId: 'full_name',
  },
  {
    id: 'full_name',
    type: 'text',
    question: 'What is your full legal name?',
    placeholder: 'e.g., John Michael Smith',
    tooltip: 'Your full legal name is required for the petition. This must match your government-issued ID and will appear on all court documents.',
    required: true,
    validation: { minLength: 2 },
    nextQuestionId: 'gender',
  },
  {
    id: 'gender',
    type: 'select',
    question: 'Are you male or female?',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
    tooltip: 'This is used to properly identify you as Petitioner (Husband/Wife) in the court documents.',
    required: true,
    nextQuestionId: 'date_of_birth',
  },
  {
    id: 'date_of_birth',
    type: 'date',
    question: 'What is your date of birth?',
    tooltip: 'Your date of birth is required for identification purposes on the petition.',
    required: true,
    nextQuestionId: 'mailing_address',
  },
  {
    id: 'mailing_address',
    type: 'address',
    question: 'What is your mailing address?',
    placeholder: '123 Main Street, Phoenix, AZ 85001',
    tooltip: 'The court will send all official correspondence to this address.',
    required: true,
    nextQuestionId: 'county',
  },
  {
    id: 'county',
    type: 'select',
    question: 'What county is that in?',
    options: ARIZONA_COUNTIES.map(county => ({ value: county, label: `${county} County` })),
    tooltip: 'Your divorce must be filed in the county where you or your spouse reside.',
    required: true,
    nextQuestionId: 'ssn4',
  },
  {
    id: 'ssn4',
    type: 'ssn4',
    question: 'What are the last 4 digits of your Social Security number?',
    description: 'This is required for court filing purposes and will be kept confidential.',
    placeholder: '1234',
    tooltip: 'Arizona courts require the last 4 digits of your SSN for identification purposes. This information is kept confidential.',
    required: true,
    validation: { minLength: 4, maxLength: 4 },
    nextQuestionId: 'phone',
  },
  {
    id: 'phone',
    type: 'phone',
    question: 'What is your best contact phone number?',
    placeholder: '(602) 555-0123',
    tooltip: 'The court or your spouse\'s attorney may need to contact you.',
    required: true,
    nextQuestionId: 'email',
  },
  {
    id: 'email',
    type: 'email',
    question: 'What is your email address?',
    placeholder: 'e.g., john@example.com',
    tooltip: 'The court may use this email address to send you important notices.',
    required: true,
    nextQuestionId: 'date_of_marriage',
  },
  {
    id: 'date_of_marriage',
    type: 'date',
    question: 'What is the date of your marriage?',
    description: 'This should match your marriage certificate.',
    tooltip: 'The marriage date establishes the beginning of your marital community, which affects property division.',
    required: true,
    nextQuestionId: 'marriage_county_state',
  },
  {
    id: 'marriage_county_state',
    type: 'text',
    question: 'In what county and state were you married?',
    placeholder: 'e.g., Maricopa County, Arizona',
    tooltip: 'The location of marriage is included in the petition for the court record.',
    required: true,
    nextQuestionId: 'spouse_intro',
  },

  // =====================
  // SPOUSE INFORMATION (Q10-Q15)
  // =====================
  {
    id: 'spouse_intro',
    type: 'info',
    question: "Now let's gather information about your spouse. They are the Respondent in this case.",
    nextQuestionId: 'spouse_full_name',
  },
  {
    id: 'spouse_full_name',
    type: 'text',
    question: "What is your spouse's full legal name?",
    placeholder: 'e.g., Jane Marie Smith',
    tooltip: 'Your spouse\'s legal name must be accurate so they can be properly served with the divorce papers.',
    required: true,
    nextQuestionId: 'spouse_date_of_birth',
  },
  {
    id: 'spouse_date_of_birth',
    type: 'date',
    question: "What is your spouse's date of birth?",
    tooltip: 'This information is required for the petition.',
    required: true,
    nextQuestionId: 'spouse_address_known',
  },
  {
    id: 'spouse_address_known',
    type: 'yesno',
    question: "Do you know your spouse's mailing address?",
    tooltip: 'Please note that after filing of your Petition, you will need to serve the Respondent with copies. In order to do that you will need their current address. If you do not have, or cannot locate a current address, you will need to request permission from the Court to serve them via alternative means.',
    required: true,
    nextQuestionMap: {
      'yes': 'spouse_mailing_address',
      'no': 'spouse_ssn4',
    },
  },
  {
    id: 'spouse_mailing_address',
    type: 'address',
    question: "What is your spouse's mailing address?",
    placeholder: '456 Oak Avenue, Phoenix, AZ 85002',
    tooltip: 'This address is used to serve your spouse with the divorce papers.',
    required: true,
    nextQuestionId: 'spouse_ssn4',
  },
  {
    id: 'spouse_ssn4',
    type: 'ssn4',
    question: "What are the last 4 digits of your spouse's Social Security number?",
    description: 'If you don\'t know, you can enter "0000".',
    placeholder: '5678',
    tooltip: 'If known, this helps identify your spouse in court records.',
    required: true,
    nextQuestionId: 'spouse_phone',
  },
  {
    id: 'spouse_phone',
    type: 'phone',
    question: "What is your spouse's best contact phone number?",
    placeholder: '(602) 555-0456',
    tooltip: 'This may be used for communication regarding the case.',
    required: false,
    nextQuestionId: 'spouse_email',
  },
  {
    id: 'spouse_email_known',
    type: 'yesno',
    question: "Do you know your spouse's email address?",
    tooltip: 'An email address can help facilitate communication and document sharing during the divorce process.',
    required: true,
    nextQuestionMap: {
      'yes': 'spouse_email',
      'no': 'spouse_gender',
    },
  },
  {
    id: 'spouse_email',
    type: 'email',
    question: "What is your spouse's email address?",
    placeholder: 'spouse@example.com',
    tooltip: 'An email address can help facilitate communication during the divorce process.',
    required: true,
    nextQuestionId: 'spouse_gender',
  },
  {
    id: 'spouse_gender',
    type: 'select',
    question: "What is your spouse's gender?",
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
    tooltip: 'This is used to properly identify your spouse as Respondent (Husband/Wife) in the court documents.',
    required: true,
    nextQuestionId: 'residency_check',
  },

  // =====================
  // RESIDENCY CHECK (Q16)
  // =====================
  {
    id: 'residency_check',
    type: 'yesno',
    question: 'Did you or your spouse reside in {county} County for at least 90 days prior to filing this petition?',
    description: 'Arizona law requires at least one spouse to have lived in the county for 90 days before filing.',
    tooltip: 'Arizona law (A.R.S. § 25-312) requires that at least one spouse be a domiciliary of Arizona for 90 days before filing.',
    required: true,
    nextQuestionMap: {
      'yes': 'military_check',
      'no': 'residency_stop',
    },
  },
  {
    id: 'residency_stop',
    type: 'stop',
    question: "STOP HERE\n\nResidency requirements require you or your spouse to have resided in {county} County for at least 90 days prior to filing a petition for dissolution.\n\nPlease come back after you have met this threshold. If you believe you may qualify to file in a different county, please start over and select the correct county.",
  },

  // =====================
  // MILITARY SERVICE
  // =====================
  {
    id: 'military_check',
    type: 'yesno',
    question: 'Are either you or your spouse a member of the U.S. Armed Forces?',
    tooltip: 'Military service may affect jurisdiction, service of process, and other aspects of the divorce under the Servicemembers Civil Relief Act (SCRA).',
    required: true,
    nextQuestionMap: {
      'yes': 'military_deployed',
      'no': 'pregnancy_check',
    },
  },
  {
    id: 'military_deployed',
    type: 'yesno',
    question: 'Are either you or your spouse currently deployed?',
    required: true,
    nextQuestionMap: {
      'yes': 'military_deploy_location',
      'no': 'pregnancy_check',
    },
  },
  {
    id: 'military_deploy_location',
    type: 'text',
    question: 'Where are you currently deployed?',
    placeholder: 'e.g., Fort Bragg, NC or overseas location',
    required: true,
    nextQuestionId: 'pregnancy_check',
  },

  // =====================
  // STATUS QUESTIONS (Q17-Q20)
  // =====================
  {
    id: 'pregnancy_check',
    type: 'yesno',
    question: 'Is the Petitioner or Respondent currently pregnant?',
    description: 'This information is required for the petition.',
    tooltip: 'Arizona courts require this disclosure. If there is a pregnancy, it may affect the timing and terms of the divorce.',
    required: true,
    nextQuestionMap: {
      'yes': 'pregnancy_who',
      'no': 'covenant_marriage',
    },
  },
  {
    id: 'pregnancy_who',
    type: 'select',
    question: 'Who is currently pregnant?',
    options: [
      { value: 'petitioner', label: 'Petitioner' },
      { value: 'respondent', label: 'Respondent' },
    ],
    required: true,
    nextQuestionId: 'pregnancy_due_date',
  },
  {
    id: 'pregnancy_due_date',
    type: 'date',
    question: 'When is the anticipated due date of the baby?',
    required: true,
    nextQuestionId: 'pregnancy_biological_father',
  },
  {
    id: 'pregnancy_biological_father',
    type: 'yesno',
    question: 'Is the other party the biological father of the unborn child?',
    tooltip: 'This information is required for the petition and may affect custody and support determinations.',
    required: true,
    nextQuestionId: 'covenant_marriage',
  },
  {
    id: 'covenant_marriage',
    type: 'yesno',
    question: 'Do you have a covenant marriage?',
    description: 'A covenant marriage is a special type of marriage that requires additional steps for divorce.',
    tooltip: 'Covenant marriages have stricter requirements for divorce under Arizona law. If you have one, different procedures may apply.',
    required: true,
    nextQuestionMap: {
      'yes': 'covenant_marriage_warning',
      'no': 'marriage_broken',
    },
  },
  {
    id: 'covenant_marriage_warning',
    type: 'info',
    question: "Important: There are additional restrictions for obtaining a divorce in a covenant marriage under Arizona law (A.R.S. §25-903). These include requirements such as counseling, specific grounds for divorce, and waiting periods. The information you provide will be used to prepare your petition, but you should be aware that additional steps may be required. We recommend consulting with an attorney familiar with covenant marriage dissolution.",
    nextQuestionId: 'marriage_broken',
  },
  {
    id: 'marriage_broken',
    type: 'yesno',
    question: 'Is your marriage broken beyond repair and there is no hope of reconciliation?',
    tooltip: 'Arizona is a "no-fault" divorce state. This means you only need to state that the marriage is "irretrievably broken" to file for divorce.',
    required: true,
    nextQuestionMap: {
      'yes': 'children_intro',
      'no': 'conciliation_check',
    },
  },
  {
    id: 'conciliation_check',
    type: 'yesno',
    question: 'Would you like to try to resolve your marriage through conciliation services?',
    description: 'Conciliation services help couples work through marital issues.',
    tooltip: 'Arizona courts offer conciliation services to help couples try to save their marriage before proceeding with divorce.',
    required: true,
    nextQuestionMap: {
      'yes': 'conciliation_stop',
      'no': 'children_intro',
    },
  },
  {
    id: 'conciliation_stop',
    type: 'stop',
    question: "STOP HERE\n\nWe cannot help with conciliation services. Please contact your local court for information about conciliation services in your county.\n\nIf you decide to proceed with divorce in the future, please return to complete this questionnaire.",
  },

  // =====================
  // CHILDREN SECTION (Q21-Q27)
  // =====================
  {
    id: 'children_intro',
    type: 'info',
    question: "Now let's gather information about your minor children. You'll be able to add each child one at a time.",
    nextQuestionId: 'child_name',
  },
  {
    id: 'child_name',
    type: 'text',
    question: 'What is the full name of the minor child?',
    placeholder: 'e.g., Emily Jane Smith',
    tooltip: 'Enter the child\'s full legal name as it appears on their birth certificate.',
    required: true,
    nextQuestionId: 'child_gender',
  },
  {
    id: 'child_gender',
    type: 'select',
    question: "What is this child's gender?",
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
    required: true,
    nextQuestionId: 'child_dob',
  },
  {
    id: 'child_dob',
    type: 'date',
    question: "What is this child's date of birth?",
    tooltip: 'The child\'s date of birth confirms they are a minor (under 18).',
    required: true,
    nextQuestionId: 'more_children',
  },
  {
    id: 'more_children',
    type: 'yesno',
    question: 'Do you have another minor child to add?',
    tooltip: 'Add all minor children you share with your spouse.',
    required: true,
    nextQuestionMap: {
      'yes': 'child_name',
      'no': 'children_residency',
    },
  },
  {
    id: 'children_residency',
    type: 'yesno',
    question: 'Have the child/children lived with you or your spouse in Arizona for at least the past 6 months?',
    description: 'This establishes Arizona\'s jurisdiction over custody matters.',
    tooltip: 'Under the UCCJEA, Arizona must have been the child\'s "home state" for at least 6 months to have jurisdiction over custody and parenting time.',
    required: true,
    nextQuestionMap: {
      'yes': 'children_reside_with',
      'no': 'children_residency_stop',
    },
  },
  {
    id: 'children_residency_stop',
    type: 'stop',
    question: "STOP HERE\n\nThe child/children must have lived with you or your spouse in Arizona for at least 6 months before filing.\n\nPlease come back after you have met this residency threshold.",
  },
  {
    id: 'children_reside_with',
    type: 'select',
    question: 'With whom have the minor child/children been residing?',
    options: [
      { value: 'petitioner', label: 'With me (Petitioner)' },
      { value: 'respondent', label: 'With my spouse (Respondent)' },
      { value: 'both', label: 'With both of us' },
    ],
    tooltip: 'This helps establish the current living arrangement for custody purposes.',
    required: true,
    nextQuestionId: 'children_born_before_marriage',
  },
  {
    id: 'children_born_before_marriage',
    type: 'yesno',
    question: 'Were any of the minor children you share with your spouse born prior to the marriage?',
    tooltip: 'Children born before marriage may have different paternity considerations.',
    required: true,
    nextQuestionMap: {
      'yes': 'children_born_before_names',
      'no': 'domestic_violence_check',
    },
  },
  {
    id: 'children_born_before_names',
    type: 'textarea',
    question: 'Please provide the name(s) of the minor child/children born prior to the marriage.',
    placeholder: 'e.g., Emily Jane Smith, born January 15, 2018',
    tooltip: 'List all children born before your marriage date.',
    required: true,
    nextQuestionId: 'biological_parents_check',
  },
  {
    id: 'biological_parents_check',
    type: 'yesno',
    question: 'Are you and your spouse the biological parents of the child/children born prior to the marriage?',
    tooltip: 'This is important for paternity purposes and will affect the language used in the petition.',
    required: true,
    nextQuestionMap: {
      'yes': 'domestic_violence_check',
      'no': 'biological_role',
    },
  },
  {
    id: 'biological_role',
    type: 'select',
    question: 'Are you the biological Mother or Father of this child/children?',
    options: [
      { value: 'mother', label: 'I am the biological Mother' },
      { value: 'father', label: 'I am the biological Father' },
    ],
    required: true,
    nextQuestionId: 'other_bio_parent_name',
  },
  {
    id: 'other_bio_parent_name',
    type: 'text',
    question: 'What is the full name of the other biological parent of this child/children?',
    placeholder: 'e.g., John Michael Smith',
    tooltip: 'The name of the biological parent who is not a party to this case.',
    required: true,
    nextQuestionId: 'other_bio_parent_address',
  },
  {
    id: 'other_bio_parent_address',
    type: 'address',
    question: 'What is the address of the other biological parent?',
    placeholder: '123 Main Street, Phoenix, AZ 85001',
    tooltip: 'The address of the biological parent who is not a party to this case.',
    required: true,
    nextQuestionId: 'domestic_violence_check',
  },

  // =====================
  // DOMESTIC VIOLENCE (Q26)
  // =====================
  {
    id: 'domestic_violence_check',
    type: 'yesno',
    question: 'Has there been significant domestic violence in your marriage pursuant to A.R.S. 25-403.03?',
    description: 'This includes physical violence, threats, or patterns of controlling behavior.',
    tooltip: 'Arizona law requires the court to consider domestic violence when making custody and legal decision-making orders.',
    required: true,
    nextQuestionMap: {
      'yes': 'domestic_violence_who',
      'no': 'parent_info_program_check',
    },
  },
  {
    id: 'domestic_violence_who',
    type: 'select',
    question: 'Which party committed domestic violence?',
    options: [
      { value: 'petitioner', label: 'Petitioner' },
      { value: 'respondent', label: 'Respondent' },
    ],
    tooltip: 'This information is used to determine legal decision-making arrangements.',
    required: true,
    nextQuestionId: 'domestic_violence_option',
  },
  {
    id: 'domestic_violence_option',
    type: 'select',
    question: 'Please select which applies to your situation:',
    options: [
      {
        value: 'no_joint_decision',
        label: 'No joint legal decision making for the violent party',
        description: 'There has been domestic violence in this relationship and no legal decision making should be awarded to the party who committed the violence.',
      },
      {
        value: 'joint_despite_violence',
        label: 'Joint legal decision making despite violence',
        description: 'Domestic violence has occurred but it was committed by both parties OR it is still in the best interests of the child/children to grant joint legal decision making.',
      },
    ],
    tooltip: 'Arizona law creates a presumption against awarding legal decision-making to a parent who has committed domestic violence.',
    required: true,
    nextQuestionMap: {
      'no_joint_decision': 'parent_info_program_check',
      'joint_despite_violence': 'domestic_violence_explanation',
    },
  },
  {
    id: 'domestic_violence_explanation',
    type: 'textarea',
    question: 'Please explain why joint legal decision making is still in the best interests of the child/children despite the domestic violence:',
    placeholder: 'Explain the circumstances...',
    tooltip: 'The court will consider your explanation when determining custody arrangements.',
    required: true,
    nextQuestionId: 'parent_info_program_check',
  },

  // =====================
  // PARENT INFORMATION PROGRAM
  // =====================
  {
    id: 'parent_info_program_check',
    type: 'yesno',
    question: 'Have you attended the Parent Information Program class?',
    description: 'Arizona law (A.R.S. §25-352) requires parents to attend a Parent Information Program class when there are minor children involved in a divorce.',
    tooltip: 'This is a court-mandated educational program that covers the impact of divorce on children, co-parenting strategies, and conflict resolution.',
    required: true,
    nextQuestionId: 'drug_conviction_check',
  },

  // =====================
  // DRUG/DUI CONVICTION (Q27)
  // =====================
  {
    id: 'drug_conviction_check',
    type: 'select',
    question: 'Has either party been convicted for a drug offense or driving under the influence of drugs or alcohol in the last 12 months?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      {
        value: 'unaware',
        label: 'I have not, but I am unaware if my significant other has',
        description: 'You have not been convicted, but you do not know whether your spouse has.',
      },
    ],
    tooltip: 'Arizona law requires disclosure of recent drug or DUI convictions as they may affect custody and parenting time decisions.',
    required: true,
    nextQuestionMap: {
      'yes': 'drug_conviction_who',
      'no': 'child_support_check',
      'unaware': 'child_support_check',
    },
  },
  {
    id: 'drug_conviction_who',
    type: 'select',
    question: 'Who was convicted?',
    options: [
      { value: 'me', label: 'I was convicted' },
      { value: 'spouse', label: 'My spouse was convicted' },
    ],
    tooltip: 'This information will be disclosed in the petition.',
    required: true,
    nextQuestionId: 'child_support_check',
  },

  // =====================
  // CHILD SUPPORT (Q28)
  // =====================
  {
    id: 'child_support_check',
    type: 'yesno',
    question: 'Will you be seeking child support?',
    description: 'Child support is calculated based on Arizona\'s Child Support Guidelines.',
    tooltip: 'Arizona uses a formula based on both parents\' incomes, parenting time, and other factors to calculate child support.',
    required: true,
    nextQuestionMap: {
      'yes': 'voluntary_support_check',
      'no': 'health_insurance_provider',
    },
  },
  {
    id: 'voluntary_support_check',
    type: 'yesno',
    question: 'Have either you or your spouse made voluntary/direct child support payments that need to be taken into account if past support is requested?',
    tooltip: 'Voluntary payments made before a court order may be credited toward past support obligations.',
    required: true,
    nextQuestionMap: {
      'yes': 'voluntary_support_who',
      'no': 'past_support_check',
    },
  },
  {
    id: 'voluntary_support_who',
    type: 'select',
    question: 'Who made the voluntary payments?',
    options: [
      { value: 'petitioner', label: 'I (Petitioner) made the payments' },
      { value: 'respondent', label: 'My spouse (Respondent) made the payments' },
    ],
    required: true,
    nextQuestionId: 'voluntary_support_amount',
  },
  {
    id: 'voluntary_support_amount',
    type: 'currency',
    question: 'Please state the total amount of voluntary payments that have been made.',
    placeholder: 'e.g., 5000',
    tooltip: 'Enter the total cumulative amount of all voluntary child support payments.',
    required: true,
    nextQuestionId: 'voluntary_support_start_date',
  },
  {
    id: 'voluntary_support_start_date',
    type: 'date',
    question: 'Please provide the date that the first payment was made.',
    tooltip: 'This helps establish the timeline of voluntary support payments.',
    required: true,
    nextQuestionId: 'past_support_check',
  },
  {
    id: 'past_support_check',
    type: 'yesno',
    question: 'Are you seeking past child support?',
    description: 'Past child support covers the period before a court order is in place. Arizona allows past child support to be ordered for up to 3 years before the petition was filed.',
    tooltip: 'If you believe your spouse should have been paying child support before now, you can request the court to order past support.',
    required: true,
    nextQuestionMap: {
      'yes': 'past_support_period',
      'no': 'health_insurance_provider',
    },
  },
  {
    id: 'past_support_period',
    type: 'select',
    question: 'For what period should past child support be calculated?',
    description: 'Select the time period for calculating any past child support owed.',
    options: [
      {
        value: 'from_filing',
        label: 'From petition filing to order date',
        description: 'The date this petition was filed and the date current child support is ordered.',
      },
      {
        value: 'from_separation',
        label: 'From separation date (up to 3 years before filing)',
        description: 'The date the parties started living apart but not more than three years before the date this petition was filed.',
      },
    ],
    tooltip: 'Arizona allows past child support to be ordered for up to 3 years before the petition was filed.',
    required: true,
    nextQuestionId: 'health_insurance_provider',
  },

  // =====================
  // HEALTH INSURANCE (Q28b)
  // =====================
  {
    id: 'health_insurance_provider',
    type: 'select',
    question: 'Who will be providing medical/health insurance for the minor child/children?',
    options: [
      { value: 'petitioner', label: 'I (Petitioner) will provide health insurance' },
      { value: 'respondent', label: 'My spouse (Respondent) will provide health insurance' },
      { value: 'both', label: 'Both parties shall provide medical insurance for the minor child/children' },
    ],
    tooltip: 'Arizona courts require that health insurance be maintained for the children. The cost of insurance is factored into child support calculations.',
    required: true,
    nextQuestionId: 'legal_decision_making',
  },

  // =====================
  // LEGAL DECISION MAKING (Q29)
  // =====================
  {
    id: 'legal_decision_making',
    type: 'select',
    question: 'How do you wish to divide legal decision making?',
    description: 'Legal decision making involves major decisions like healthcare, education, and religious upbringing.',
    options: [
      {
        value: 'petitioner_sole',
        label: 'I should have sole legal decision making',
        description: 'I will make all major decisions about the children.',
      },
      {
        value: 'respondent_sole',
        label: 'My spouse should have sole legal decision making',
        description: 'My spouse will make all major decisions about the children.',
      },
      {
        value: 'joint',
        label: 'We should share equally in legal decision making',
        description: 'Both parents must agree on major decisions.',
      },
      {
        value: 'joint_with_final_say',
        label: 'Joint with final say',
        description: 'We share in legal decision making but one parent has final say if we cannot agree.',
      },
    ],
    tooltip: 'Legal decision-making authority covers healthcare, education, religion, and personal care decisions for the children.',
    required: true,
    nextQuestionMap: {
      'joint_with_final_say': 'final_say_party',
      'petitioner_sole': 'parenting_time_schedule',
      'respondent_sole': 'parenting_time_schedule',
      'joint': 'parenting_time_schedule',
    },
  },
  {
    id: 'final_say_party',
    type: 'select',
    question: 'Who should have final say if you cannot reach a decision?',
    options: [
      { value: 'petitioner', label: 'I should have final say' },
      { value: 'respondent', label: 'My spouse should have final say' },
    ],
    required: true,
    nextQuestionId: 'parenting_time_schedule',
  },

  // =====================
  // PARENTING TIME (Q30)
  // =====================
  {
    id: 'parenting_time_schedule',
    type: 'select',
    question: 'How would you like to divide regular parenting time?',
    description: 'This does not include holidays or special occasions.',
    options: [
      {
        value: '3-2-2-3',
        label: 'Equal parenting time based on a 3-2-2-3 schedule',
        description: 'Parent A has Monday-Wednesday, Parent B has Wednesday-Friday, then alternate weekends.',
      },
      {
        value: '5-2-2-5',
        label: 'Equal parenting time based on a 5-2-2-5 schedule',
        description: 'Parent A has Monday-Friday one week, Parent B the next, with Wednesday evening exchanges.',
      },
      {
        value: 'alternating_weeks',
        label: 'Alternating weeks',
        description: 'Children spend one full week with each parent, alternating weekly.',
      },
      {
        value: 'custom',
        label: 'Custom schedule',
        description: 'I want to specify a different parenting time arrangement.',
      },
      {
        value: 'no_parenting_time',
        label: 'No parenting time for the other parent',
        description: 'Petitioner requests that the other parent have no parenting time with the children.',
      },
    ],
    tooltip: 'The 3-2-2-3, 5-2-2-5, and alternating weeks schedules all result in equal parenting time (50/50).',
    required: true,
    nextQuestionMap: {
      'custom': 'custom_schedule_details',
      '3-2-2-3': 'holiday_intro',
      '5-2-2-5': 'holiday_intro',
      'alternating_weeks': 'holiday_intro',
      'no_parenting_time': 'holiday_intro',
    },
  },
  {
    id: 'custom_schedule_details',
    type: 'textarea',
    question: 'Please describe your desired parenting time schedule in detail.',
    description: 'Include which days/times each parent will have the children, exchange times, and any other specifics. Please use our AI assist feature to refine your answer for the Petition.',
    placeholder: 'e.g., Petitioner shall have the children every other weekend from Friday at 6:00 PM to Sunday at 6:00 PM, and every Wednesday from 3:00 PM to 7:00 PM...',
    tooltip: 'Be as specific as possible. This will be included in your court filing exactly as written.',
    required: true,
    nextQuestionId: 'supervised_check',
  },
  {
    id: 'supervised_check',
    type: 'select',
    question: 'Should parenting time be supervised or unsupervised?',
    options: [
      { value: 'unsupervised', label: 'Unsupervised' },
      { value: 'supervised', label: 'Supervised' },
    ],
    tooltip: 'Supervised parenting time means a third party must be present during visits. This may be appropriate in cases involving safety concerns.',
    required: true,
    nextQuestionId: 'holiday_intro',
  },

  // =====================
  // HOLIDAY SCHEDULE (Q31)
  // =====================
  {
    id: 'holiday_intro',
    type: 'info',
    question: "Now let's set up the holiday schedule. For each holiday, you'll specify which parent has the children and in which years.",
    nextQuestionId: 'holiday_new_years_eve',
  },
  {
    id: 'holiday_new_years_eve',
    type: 'select',
    question: "New Year's Eve - Who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_new_years_day',
  },
  {
    id: 'holiday_new_years_day',
    type: 'select',
    question: "New Year's Day - Who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_easter',
  },
  {
    id: 'holiday_easter',
    type: 'select',
    question: 'Easter - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_fourth_july',
  },
  {
    id: 'holiday_fourth_july',
    type: 'select',
    question: '4th of July - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_halloween',
  },
  {
    id: 'holiday_halloween',
    type: 'select',
    question: 'Halloween - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_thanksgiving',
  },
  {
    id: 'holiday_thanksgiving',
    type: 'select',
    question: 'Thanksgiving - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_hanukkah',
  },
  {
    id: 'holiday_hanukkah',
    type: 'select',
    question: 'Hanukkah - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_christmas_eve',
  },
  {
    id: 'holiday_christmas_eve',
    type: 'select',
    question: 'Christmas Eve - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_christmas_day',
  },
  {
    id: 'holiday_christmas_day',
    type: 'select',
    question: 'Christmas Day - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_child_birthday',
  },
  {
    id: 'holiday_child_birthday',
    type: 'select',
    question: "Child's Birthday - Who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_father_birthday',
  },
  {
    id: 'holiday_father_birthday',
    type: 'select',
    question: "Father's Birthday - Who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_mother_birthday',
  },
  {
    id: 'holiday_mother_birthday',
    type: 'select',
    question: "Mother's Birthday - Who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_mothers_day',
  },
  {
    id: 'holiday_mothers_day',
    type: 'select',
    question: "Mother's Day - Who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_fathers_day',
  },
  {
    id: 'holiday_fathers_day',
    type: 'select',
    question: "Father's Day - Who should have the children?",
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_other_check',
  },
  {
    id: 'holiday_other_check',
    type: 'yesno',
    question: 'Are there any other holidays you would like to add?',
    description: 'e.g., religious holidays, cultural celebrations, etc.',
    required: true,
    nextQuestionMap: {
      'yes': 'holiday_other_name',
      'no': 'break_intro',
    },
  },
  {
    id: 'holiday_other_name',
    type: 'text',
    question: 'What is the name of the holiday?',
    placeholder: 'e.g., Eid, Diwali, Lunar New Year',
    required: true,
    nextQuestionId: 'holiday_other_division',
  },
  {
    id: 'holiday_other_division',
    type: 'select',
    question: 'How should this holiday be divided?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'holiday_more_other_check',
  },
  {
    id: 'holiday_more_other_check',
    type: 'yesno',
    question: 'Would you like to add another holiday?',
    required: true,
    nextQuestionMap: {
      'yes': 'holiday_other_name',
      'no': 'break_intro',
    },
  },

  // =====================
  // SCHOOL BREAKS (Q32)
  // =====================
  {
    id: 'break_intro',
    type: 'info',
    question: "Now let's set up the schedule for school breaks.",
    nextQuestionId: 'break_spring',
  },
  {
    id: 'break_spring',
    type: 'select',
    question: 'Spring Break - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'break_fall',
  },
  {
    id: 'break_fall',
    type: 'select',
    question: 'Fall Break - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'break_winter',
  },
  {
    id: 'break_winter',
    type: 'select',
    question: 'Winter Break - Who should have the children?',
    options: HOLIDAY_OPTIONS,
    required: true,
    nextQuestionId: 'summer_deviation_check',
  },

  // =====================
  // SUMMER BREAK (Q33)
  // =====================
  {
    id: 'summer_deviation_check',
    type: 'yesno',
    question: 'Do you want a deviation from the regular parenting time schedule during summer break?',
    tooltip: 'Summer break schedules often differ from the regular schedule to allow for extended vacation time with each parent.',
    required: true,
    nextQuestionMap: {
      'yes': 'summer_deviation_details',
      'no': 'exchange_method',
    },
  },
  {
    id: 'summer_deviation_details',
    type: 'textarea',
    question: 'Please describe how you would like the summer break schedule to differ from the regular schedule. Please use our AI assist feature to refine your answer for the Petition.',
    placeholder: 'e.g., Each parent gets 2 consecutive weeks during summer break...',
    required: true,
    nextQuestionId: 'exchange_method',
  },

  // =====================
  // EXCHANGE OF CHILDREN (Q34)
  // =====================
  {
    id: 'exchange_method',
    type: 'select',
    question: 'How would you like to handle exchanges of the children?',
    options: [
      {
        value: 'pickup',
        label: 'Parent picking up',
        description: 'The parent whose time is beginning should pick up the children.',
      },
      {
        value: 'dropoff',
        label: 'Parent dropping off',
        description: 'The parent whose parenting time is ending should drop off the children.',
      },
      {
        value: 'midway',
        label: 'Meet at midway location',
        description: 'Both parents meet at a location midway between their homes to exchange the children.',
      },
    ],
    tooltip: 'Consider factors like distance between homes and work schedules when deciding on exchange methods.',
    required: true,
    nextQuestionId: 'phone_contact',
  },

  // =====================
  // PHONE/VIDEO CONTACT (Q35)
  // =====================
  {
    id: 'phone_contact',
    type: 'select',
    question: 'How would you like to handle telephone/video contact with the children?',
    options: [
      {
        value: 'normal_hours',
        label: 'Normal waking hours',
        description: 'Each parent may have telephone/video contact with the children during the children\'s normal waking hours.',
      },
      {
        value: 'custom',
        label: 'Custom schedule',
        description: 'I want to specify particular times for phone/video contact.',
      },
    ],
    tooltip: 'Phone and video contact allows children to maintain connection with the non-custodial parent.',
    required: true,
    nextQuestionMap: {
      'normal_hours': 'vacation_time_check',
      'custom': 'phone_contact_custom_details',
    },
  },
  {
    id: 'phone_contact_custom_details',
    type: 'textarea',
    question: 'Please describe your desired telephone/video contact schedule.',
    description: 'Specify times, frequency, and any other details for phone/video contact. Please use our AI assist feature to refine your answer for the Petition.',
    placeholder: 'e.g., Each parent may have a 15-minute phone or video call with the children each evening between 7:00 PM and 8:00 PM during the other parent\'s parenting time...',
    tooltip: 'This will be included in your court filing as written.',
    required: true,
    nextQuestionId: 'vacation_time_check',
  },

  // =====================
  // VACATION TIME (Q36)
  // =====================
  {
    id: 'vacation_time_check',
    type: 'yesno',
    question: 'Would you like both parents to have a period of uninterrupted parenting time for vacations with the child/children?',
    tooltip: 'Vacation time allows each parent to take extended trips with the children without the regular exchange schedule.',
    required: true,
    nextQuestionMap: {
      'yes': 'vacation_duration',
      'no': 'travel_permission_check',
    },
  },
  {
    id: 'vacation_duration',
    type: 'select',
    question: 'How long should each parent have for uninterrupted vacation time?',
    options: [
      { value: '1 week', label: '1 week' },
      { value: '2 weeks', label: '2 weeks' },
      { value: '3 weeks', label: '3 weeks' },
      { value: '4 weeks', label: '4 weeks' },
    ],
    tooltip: 'This is the maximum consecutive time each parent can have the children for vacation purposes.',
    required: true,
    nextQuestionId: 'vacation_notice',
  },
  {
    id: 'vacation_notice',
    type: 'select',
    question: 'How much advance notice should be required for vacation scheduling?',
    options: [
      { value: '1 week', label: '1 week' },
      { value: '2 weeks', label: '2 weeks' },
      { value: '30 days', label: '30 days' },
      { value: '60 days', label: '60 days' },
    ],
    tooltip: 'Advance notice helps both parents plan around vacation schedules.',
    required: true,
    nextQuestionId: 'vacation_priority',
  },
  {
    id: 'vacation_priority',
    type: 'select',
    question: 'In the event of a scheduling conflict, who should have priority in selecting the vacation date?',
    options: [
      { value: 'even', label: 'I have priority in even years' },
      { value: 'odd', label: 'I have priority in odd years' },
    ],
    tooltip: 'This determines who gets first choice of vacation dates in case of conflict.',
    required: true,
    nextQuestionId: 'travel_permission_check',
  },

  // =====================
  // TRAVEL OUTSIDE ARIZONA (Q37)
  // =====================
  {
    id: 'travel_permission_check',
    type: 'yesno',
    question: 'Are both parents permitted to travel outside of Arizona without written consent of the other parent?',
    tooltip: 'Some parents agree to restrictions on out-of-state travel with children for safety or other concerns.',
    required: true,
    nextQuestionMap: {
      'yes': 'travel_max_days',
      'no': 'travel_restricted_party',
    },
  },
  {
    id: 'travel_restricted_party',
    type: 'select',
    question: 'Which parent is NOT permitted to travel outside of Arizona without consent?',
    options: [
      { value: 'petitioner', label: 'I (Petitioner) need consent to travel' },
      { value: 'respondent', label: 'My spouse (Respondent) needs consent to travel' },
      { value: 'neither', label: 'Neither parent is permitted to travel without consent' },
    ],
    required: true,
    nextQuestionId: 'extracurricular_activities',
  },
  {
    id: 'travel_max_days',
    type: 'text',
    question: 'What is the maximum number of travel days outside of Arizona?',
    placeholder: 'e.g., 14 days',
    tooltip: 'This sets a limit on how long a parent can travel out of state with the children.',
    required: true,
    nextQuestionId: 'travel_itinerary_notice',
  },
  {
    id: 'travel_itinerary_notice',
    type: 'text',
    question: 'How far in advance should a travel itinerary (including destination, address, and phone number) be provided?',
    placeholder: 'e.g., 7 days, 2 weeks',
    tooltip: 'The other parent should have contact information for the children while they are traveling.',
    required: true,
    nextQuestionId: 'extracurricular_activities',
  },

  // =====================
  // EXTRACURRICULAR ACTIVITIES (Q38)
  // =====================
  {
    id: 'extracurricular_activities',
    type: 'select',
    question: 'How would you like to handle extracurricular activities for the children?',
    options: [
      {
        value: 'none',
        label: 'No extracurricular activities',
        description: 'I do not wish to include extracurricular activities at this time.',
      },
      {
        value: 'both_agree_split',
        label: 'Both parents must agree, costs split evenly',
        description: 'Both parents must agree on all extracurricular activities and cost is evenly split.',
      },
      {
        value: 'each_selects_pays',
        label: 'Each parent selects and pays',
        description: 'Each parent may select activities provided it doesn\'t impact other parent\'s time without agreement. The selecting parent pays full cost.',
      },
      {
        value: 'each_selects_limit_split',
        label: 'Each parent selects with limit, costs split',
        description: 'Each parent may select up to a specific number of activities and both parents equally divide cost.',
      },
      {
        value: 'other',
        label: 'Other arrangement',
        description: 'I want to specify a different arrangement.',
      },
    ],
    tooltip: 'Extracurricular activities include sports, music lessons, clubs, and other organized activities.',
    required: true,
    nextQuestionMap: {
      'none': 'right_of_first_refusal',
      'each_selects_limit_split': 'extracurricular_limit',
      'other': 'extracurricular_other_details',
      'both_agree_split': 'right_of_first_refusal',
      'each_selects_pays': 'right_of_first_refusal',
    },
  },
  {
    id: 'extracurricular_limit',
    type: 'select',
    question: 'How many activities may each parent select?',
    options: [
      { value: '1', label: '1 activity' },
      { value: '2', label: '2 activities' },
      { value: '3', label: '3 activities' },
      { value: '4', label: '4 activities' },
    ],
    required: true,
    nextQuestionId: 'right_of_first_refusal',
  },
  {
    id: 'extracurricular_other_details',
    type: 'textarea',
    question: 'Please describe your desired arrangement for extracurricular activities:',
    placeholder: 'Describe your preferred arrangement...',
    required: true,
    nextQuestionId: 'right_of_first_refusal',
  },

  // =====================
  // RIGHT OF FIRST REFUSAL (Q39)
  // =====================
  {
    id: 'right_of_first_refusal',
    type: 'yesno',
    question: 'Do you want to incorporate right of first refusal?',
    description: 'Right of first refusal means if a parent cannot engage in parenting time for 24+ hours, they must offer that time to the other parent before arranging alternative care.',
    tooltip: 'This gives each parent the opportunity to spend additional time with the children instead of using babysitters or other childcare.',
    required: true,
    nextQuestionId: 'maiden_name_check',
  },

  // =====================
  // NAME CHANGE (Q40-Q41)
  // =====================
  {
    id: 'maiden_name_check',
    type: 'yesno',
    question: 'Do you or your spouse want to revert to a maiden name?',
    tooltip: 'A divorce decree can include a court order to restore a former name.',
    required: true,
    nextQuestionMap: {
      'yes': 'maiden_name_who',
      'no': 'property_agreement_check',
    },
  },
  {
    id: 'maiden_name_who',
    type: 'select',
    question: 'Who wants to restore their maiden name?',
    options: [
      { value: 'me', label: 'I want to restore my maiden name' },
      { value: 'spouse', label: 'My spouse wants to restore their maiden name' },
      { value: 'both', label: 'Both of us want to restore our maiden names' },
    ],
    required: true,
    nextQuestionMap: {
      'me': 'my_maiden_name',
      'spouse': 'spouse_maiden_name',
      'both': 'my_maiden_name',
    },
  },
  {
    id: 'my_maiden_name',
    type: 'text',
    question: 'What is your maiden name to be restored?',
    placeholder: 'e.g., Jane Marie Johnson',
    required: true,
    nextQuestionId: 'property_agreement_check',
  },
  {
    id: 'spouse_maiden_name',
    type: 'text',
    question: "What is your spouse's maiden name to be restored?",
    placeholder: 'e.g., John Robert Jones',
    required: true,
    nextQuestionId: 'property_agreement_check',
  },

  // =====================
  // PROPERTY AGREEMENT (Q42)
  // =====================
  {
    id: 'property_agreement_check',
    type: 'yesno',
    question: 'Have you and your spouse come to an agreement about how to divide community property?',
    description: 'Community property includes assets and debts acquired during the marriage.',
    tooltip: 'Arizona is a community property state. Property acquired during the marriage is presumed to be owned equally by both spouses.',
    required: true,
    nextQuestionMap: {
      'yes': 'property_agreement_details',
      'no': 'property_division_preference',
    },
  },
  {
    id: 'property_division_preference',
    type: 'select',
    question: 'Would you like the court to determine how to divide your property, or would you like to specify how to divide it yourself?',
    options: [
      {
        value: 'court_decides',
        label: 'Let the court decide',
        description: 'The court will make a fair and just allocation of community property and debts.',
      },
      {
        value: 'specify_myself',
        label: 'I want to specify the division',
        description: 'I will provide details about each asset and how it should be divided.',
      },
    ],
    required: true,
    nextQuestionMap: {
      'court_decides': 'court_division_info',
      'specify_myself': 'home_check',
    },
  },
  {
    id: 'court_division_info',
    type: 'info',
    question: "We will add the following language to your petition:\n\n\"The parties have acquired certain community and jointly owned property and community or joint debts during the marriage, and a fair and just allocation of such property and responsibility for payment of such debts should be made by the Court.\"",
    nextQuestionId: 'tax_filing',
  },
  {
    id: 'property_agreement_details',
    type: 'textarea',
    question: 'What agreements have you reached regarding division of community property?',
    placeholder: 'Please describe your agreement in detail...',
    tooltip: 'Be specific about who gets what property and who is responsible for which debts.',
    required: true,
    nextQuestionId: 'property_agreement_complete',
  },
  {
    id: 'property_agreement_complete',
    type: 'select',
    question: 'Does this agreement cover all of your community property?',
    options: [
      { value: 'yes', label: 'This accounts for all community property', description: 'Our agreement covers everything — no additional property needs to be divided' },
      { value: 'no', label: 'There is still community property for which an agreement has not been reached', description: 'We need to address additional assets or debts beyond what we\'ve agreed upon' },
    ],
    tooltip: 'We need to know if there are additional assets or debts that need to be addressed in the petition beyond what you\'ve already agreed upon.',
    required: true,
    nextQuestionMap: {
      'yes': 'separate_property_check',
      'no': 'home_check',
    },
  },

  // =====================
  // SEPARATE PROPERTY
  // Order: Community Property → Community Debt → Sep Property → Sep Debt → Tax
  // =====================
  {
    id: 'separate_property_check',
    type: 'yesno',
    question: 'Do you or your spouse have separate property you want the Court to allocate to each as such?',
    tooltip: 'Separate property includes property acquired before the marriage, gifts received by one spouse only, and inherited property. Under Arizona law, separate property is not subject to division but should be confirmed to the rightful owner.',
    required: true,
    nextQuestionMap: {
      'yes': 'my_separate_property_list',
      'no': 'separate_debt_check',
    },
  },
  {
    id: 'my_separate_property_list',
    type: 'textarea',
    question: 'Please identify each item of separate property you want the court to award you. Separate each item with a comma. For real property (i.e. real estate) please identify the address.',
    placeholder: 'e.g., antique lamp, diamond ring inherited from grandmother, coin collection',
    tooltip: 'These items will be confirmed as your separate property in the decree.',
    required: true,
    nextQuestionId: 'spouse_separate_property_list',
  },
  {
    id: 'spouse_separate_property_list',
    type: 'textarea',
    question: 'Please identify each item of separate property you want the court to award your spouse. Separate each item with a comma. For real property (i.e. real estate) please identify the address.',
    placeholder: 'e.g., family heirloom, car owned before marriage, inherited artwork',
    tooltip: 'These items will be confirmed as your spouse\'s separate property in the decree.',
    required: true,
    nextQuestionId: 'separate_debt_check',
  },

  // =====================
  // REAL ESTATE / HOME (Community Property)
  // =====================
  {
    id: 'home_check',
    type: 'yesno',
    question: 'Did you acquire any real property during the marriage?',
    tooltip: 'Real property (real estate) acquired during the marriage is typically community property and must be addressed in the divorce. This includes houses, condos, land, or investment properties.',
    required: true,
    nextQuestionMap: {
      'yes': 'home_address',
      'no': 'personal_property_intro',
    },
  },
  {
    id: 'home_address',
    type: 'address',
    question: 'What is the address of the property?',
    placeholder: '789 Desert Lane, Scottsdale, AZ 85251',
    required: true,
    nextQuestionId: 'disclaimer_deed_check',
  },
  {
    id: 'disclaimer_deed_check',
    type: 'yesno',
    question: 'Did either party sign a disclaimer deed upon purchase of this home?',
    description: 'A disclaimer deed means one spouse gave up their ownership interest in the property.',
    tooltip: 'A disclaimer deed transfers any ownership interest from one spouse to the other.',
    required: true,
    nextQuestionMap: {
      'yes': 'community_funds_check',
      'no': 'home_division',
    },
  },
  {
    id: 'community_funds_check',
    type: 'yesno',
    question: 'Did you use community funds to pay for expenses associated with the home?',
    description: 'Community funds include income earned by either spouse during the marriage.',
    tooltip: 'If community funds were used, the community may have an equitable interest in the property.',
    required: true,
    nextQuestionMap: {
      'yes': 'equitable_lien_request',
      'no': 'no_community_interest_info',
    },
  },
  {
    id: 'no_community_interest_info',
    type: 'info',
    question: 'Since no community funds were used to pay for expenses associated with the home, the community does not have any interest in the home, and the spouse in whose name the home is deeded owns a 100% interest in the home. We will note this in your petition.',
    nextQuestionId: 'more_homes_check',
  },
  {
    id: 'equitable_lien_request',
    type: 'yesno',
    question: 'Since you used community funds to pay for expenses associated with the home, the community may have an equitable lien on the property. Would you like to request that in your petition?',
    required: true,
    nextQuestionMap: {
      'yes': 'equitable_lien_added',
      'no': 'home_division',
    },
  },
  {
    id: 'equitable_lien_added',
    type: 'info',
    question: "We will add the following language to your petition:\n\n\"The parties acquired real property located at [property address]. The community may have an equitable lien on this property and Petitioner requests their equitable share of the community lien.\"",
    nextQuestionId: 'home_division',
  },
  {
    id: 'home_division',
    type: 'select',
    question: 'How would you like to divide each spouse\'s ownership interest in the home?',
    options: [
      {
        value: 'i_keep',
        label: 'I keep the home',
        description: "I will pay my spouse's ½ interest and take ownership of the home and any debt as my sole and separate property and debt.",
      },
      {
        value: 'spouse_keeps',
        label: 'Spouse keeps the home',
        description: "My spouse will pay my ½ interest in the property and take ownership of the home and any debt as their sole and separate property and debt.",
      },
      {
        value: 'sell_split',
        label: 'Sell and split proceeds',
        description: "Sell the property on the open market and equally divide the net proceeds after paying all fees and costs associated with the sale.",
      },
    ],
    required: true,
    nextQuestionId: 'more_homes_check',
  },
  {
    id: 'more_homes_check',
    type: 'yesno',
    question: 'Do you have another property to add?',
    required: true,
    nextQuestionMap: {
      'yes': 'home_address',
      'no': 'personal_property_intro',
    },
  },

  // =====================
  // PERSONAL PROPERTY (Furniture, Appliances, etc.)
  // =====================
  {
    id: 'personal_property_intro',
    type: 'info',
    question: "Next, let's discuss how you want to divide your personal property.",
    tooltip: 'Personal property includes all items of tangible property that were acquired during the marriage, not including real estate. This includes furniture, appliances, art or any other tangible item generally valued at over $200.',
    nextQuestionId: 'personal_property_preference',
  },
  {
    id: 'personal_property_preference',
    type: 'select',
    question: 'Would you like each party to keep the property in his/her possession as their sole and separate property, or do you want to itemize the allocation of personal property?',
    options: [
      {
        value: 'keep_in_possession',
        label: 'Each party keeps what they have',
        description: 'Each party keeps the personal property currently in their possession as their sole and separate property',
      },
      {
        value: 'itemize',
        label: 'I want to itemize',
        description: 'I want to specify which items go to which party',
      },
    ],
    required: true,
    nextQuestionMap: {
      'keep_in_possession': 'bank_accounts_during_marriage_check',
      'itemize': 'personal_property_mine',
    },
  },
  {
    id: 'personal_property_mine',
    type: 'textarea',
    question: 'Please identify each appliance or item of household furniture valued over $200 that you want the court to allocate to you. Please separate each item with a comma.',
    placeholder: 'e.g., living room couch, dining table, refrigerator, washer/dryer',
    tooltip: 'These items will be allocated to you in the decree.',
    required: true,
    nextQuestionId: 'personal_property_spouse',
  },
  {
    id: 'personal_property_spouse',
    type: 'textarea',
    question: 'Please identify each appliance or item of household furniture valued over $200 that you want the court to allocate to your spouse. Please separate each item with a comma.',
    placeholder: 'e.g., bedroom furniture, TV, dishwasher',
    tooltip: 'These items will be allocated to your spouse in the decree.',
    required: true,
    nextQuestionId: 'bank_accounts_during_marriage_check',
  },

  // =====================
  // BANK ACCOUNTS (Structured per-account)
  // =====================
  {
    id: 'bank_accounts_during_marriage_check',
    type: 'yesno',
    question: 'Did you or your spouse open any bank accounts during the marriage?',
    description: 'This includes checking accounts, savings accounts, and money market accounts.',
    required: true,
    nextQuestionMap: {
      'yes': 'bank_account_name',
      'no': 'retirement_check',
    },
  },
  {
    id: 'bank_account_name',
    type: 'text',
    question: "Please identify the bank account with the name of the bank and the last four digits of the account number. If you don't know the account number please put 'xxxx'.",
    placeholder: 'e.g., Bank of America 4564',
    required: true,
    nextQuestionId: 'bank_account_division',
  },
  {
    id: 'bank_account_division',
    type: 'select',
    question: 'How would you like the Court to distribute the funds in this bank account?',
    options: [
      {
        value: 'i_keep',
        label: 'I keep this account',
        description: 'I keep this account and all of the funds therein as my sole and separate property',
      },
      {
        value: 'spouse_keeps',
        label: 'My spouse keeps this account',
        description: 'My spouse keeps this account and all of the funds therein as their sole and separate property',
      },
      {
        value: 'split_50_50',
        label: 'Divide the funds 50/50',
        description: 'We divide the funds in this account equally between both parties',
      },
    ],
    required: true,
    nextQuestionId: 'more_bank_accounts',
  },
  {
    id: 'more_bank_accounts',
    type: 'yesno',
    question: 'Did you or your spouse open another bank account during the marriage?',
    required: true,
    nextQuestionMap: {
      'yes': 'bank_account_name',
      'no': 'retirement_check',
    },
  },

  // =====================
  // RETIREMENT ACCOUNTS (Q43e)
  // =====================
  {
    id: 'retirement_check',
    type: 'yesno',
    question: 'Do you or your spouse have any retirement accounts?',
    description: 'This includes 401(k), IRA, pension plans, etc.',
    required: true,
    nextQuestionMap: {
      'yes': 'retirement_account_type',
      'no': 'vehicle_check',
    },
  },
  {
    id: 'retirement_account_type',
    type: 'select',
    question: 'What type of retirement account is this?',
    options: [
      { value: '401k', label: '401(k)' },
      { value: 'ira', label: 'Traditional IRA' },
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
    question: 'Please specify the type of retirement account.',
    placeholder: 'e.g., Deferred Compensation Plan',
    required: true,
    nextQuestionId: 'retirement_owner',
  },
  {
    id: 'retirement_owner',
    type: 'select',
    question: 'Whose name is this account in?',
    options: [
      { value: 'me', label: 'My name' },
      { value: 'spouse', label: "My spouse's name" },
    ],
    required: true,
    nextQuestionId: 'retirement_administrator',
  },
  {
    id: 'retirement_administrator',
    type: 'text',
    question: 'Where is the account located or who administers it?',
    placeholder: 'e.g., Fidelity, Vanguard, Employer Name',
    required: true,
    nextQuestionId: 'retirement_division',
  },
  {
    id: 'retirement_division',
    type: 'select',
    question: 'How do you propose dividing this retirement account?',
    options: [
      {
        value: 'i_keep',
        label: 'I keep this account',
        description: 'I keep this retirement account and all of the funds therein as my sole and separate property',
      },
      {
        value: 'spouse_keeps',
        label: 'My spouse keeps this account',
        description: 'My spouse keeps this retirement account and all of the funds therein as their sole and separate property',
      },
      {
        value: 'split_50_50',
        label: 'Divide the community portion 50/50',
        description: 'We divide the community portion of this account equally between both parties via a Qualified Domestic Relations Order (QDRO)',
      },
    ],
    required: true,
    nextQuestionId: 'more_retirement',
  },
  {
    id: 'more_retirement',
    type: 'yesno',
    question: 'Do you have another retirement account to add?',
    required: true,
    nextQuestionMap: {
      'yes': 'retirement_account_type',
      'no': 'vehicle_check',
    },
  },

  // =====================
  // VEHICLES
  // =====================
  {
    id: 'vehicle_check',
    type: 'yesno',
    question: 'Did you or your spouse purchase any motor vehicles during the marriage?',
    required: true,
    nextQuestionMap: {
      'yes': 'vehicle_info',
      'no': 'community_debt_check',
    },
  },
  {
    id: 'vehicle_info',
    type: 'text',
    question: 'Please enter the year, make, and model of the vehicle.',
    placeholder: 'e.g., 2020 Toyota Camry',
    required: true,
    nextQuestionId: 'vehicle_title',
  },
  {
    id: 'vehicle_title',
    type: 'select',
    question: 'In whose name is this vehicle titled?',
    options: [
      { value: 'me', label: 'My name' },
      { value: 'spouse', label: "My spouse's name" },
      { value: 'both', label: 'Both names' },
    ],
    required: true,
    nextQuestionId: 'vehicle_loan_check',
  },
  {
    id: 'vehicle_loan_check',
    type: 'yesno',
    question: 'Is there an outstanding loan balance on this vehicle?',
    required: true,
    nextQuestionId: 'vehicle_division',
  },
  {
    id: 'vehicle_division',
    type: 'select',
    question: 'How do you propose disposing of this vehicle?',
    options: [
      {
        value: 'i_keep',
        label: 'I keep this vehicle',
        description: 'I want to keep this vehicle and any debt attached thereto as my sole and separate property/debt.',
      },
      {
        value: 'spouse_keeps',
        label: 'Spouse keeps this vehicle',
        description: "I want my spouse to keep this vehicle and any debt attached thereto as my spouse's sole and separate property/debt.",
      },
      {
        value: 'sell_split',
        label: 'Sell and split',
        description: 'I want to sell this vehicle and we should equally divide any proceeds or debt.',
      },
    ],
    required: true,
    nextQuestionId: 'more_vehicles',
  },
  {
    id: 'more_vehicles',
    type: 'yesno',
    question: 'Do you have another vehicle to add?',
    required: true,
    nextQuestionMap: {
      'yes': 'vehicle_info',
      'no': 'community_debt_check',
    },
  },

  // =====================
  // SEPARATE DEBTS
  // =====================
  {
    id: 'separate_debt_check',
    type: 'yesno',
    question: 'Do you or your spouse have any separate debt you want the court to allocate?',
    description: 'Separate debts are debts incurred before the marriage or debts that are solely in one party\'s name for their sole benefit.',
    required: true,
    nextQuestionMap: {
      'yes': 'my_separate_debt_list',
      'no': 'tax_filing',
    },
  },
  {
    id: 'my_separate_debt_list',
    type: 'textarea',
    question: 'Please identify any debt you want the court to allocate to you. Please separate each item of debt with a comma.',
    placeholder: 'e.g., Student loan from before marriage, credit card ending in 1234',
    required: true,
    nextQuestionId: 'spouse_separate_debt_list',
  },
  {
    id: 'spouse_separate_debt_list',
    type: 'textarea',
    question: 'Please identify any debt you want the court to allocate to your spouse. Please separate each item of debt with a comma.',
    placeholder: 'e.g., Car loan from before marriage, personal loan',
    required: true,
    nextQuestionId: 'tax_filing',
  },

  // =====================
  // COMMUNITY DEBTS (Structured)
  // =====================
  {
    id: 'community_debt_check',
    type: 'yesno',
    question: 'Did you or your spouse incur any debts during the marriage?',
    description: 'This includes credit cards, student loans, medical bills, and other debts (not including mortgage or car loans already mentioned).',
    required: true,
    nextQuestionMap: {
      'yes': 'community_debt_preference',
      'no': 'separate_property_check',
    },
  },
  {
    id: 'community_debt_preference',
    type: 'select',
    question: 'Would you like each party to keep the debts in his/her name as their sole and separate debt, or would you like to itemize the allocation of debt?',
    options: [
      {
        value: 'keep_in_name',
        label: 'Each party keeps debts in their name',
        description: 'Each party will be responsible for the debts currently in their name',
      },
      {
        value: 'itemize',
        label: 'I want to itemize',
        description: 'I want to specify how each debt should be divided',
      },
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
    question: 'Did you or your spouse open a credit card during the marriage?',
    required: true,
    nextQuestionMap: {
      'yes': 'credit_card_info',
      'no': 'student_loan_check',
    },
  },
  {
    id: 'credit_card_info',
    type: 'text',
    question: 'Please identify the credit card company and the last 4 digits of the account.',
    placeholder: 'e.g., Mastercard 8743',
    required: true,
    nextQuestionId: 'credit_card_division',
  },
  {
    id: 'credit_card_division',
    type: 'select',
    question: 'This debt should be awarded to:',
    options: [
      { value: 'me', label: 'Me', description: 'I will be responsible for this credit card debt' },
      { value: 'spouse', label: 'My spouse', description: 'My spouse will be responsible for this credit card debt' },
      { value: 'split', label: 'Split 50-50', description: 'We will equally share responsibility for this debt' },
      { value: 'other', label: 'Other', description: 'I want to specify a different arrangement' },
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
    type: 'textarea',
    question: 'Please describe how this credit card debt should be divided.',
    placeholder: 'e.g., I will pay 75% and my spouse will pay 25%',
    required: true,
    nextQuestionId: 'more_credit_cards',
  },
  {
    id: 'more_credit_cards',
    type: 'yesno',
    question: 'Did you or your spouse open another credit card during the marriage?',
    required: true,
    nextQuestionMap: {
      'yes': 'credit_card_info',
      'no': 'student_loan_check',
    },
  },
  {
    id: 'student_loan_check',
    type: 'yesno',
    question: 'Did you or your spouse incur any student loan debt during the marriage?',
    required: true,
    nextQuestionMap: {
      'yes': 'student_loan_division',
      'no': 'medical_debt_check',
    },
  },
  {
    id: 'student_loan_division',
    type: 'select',
    question: 'This student loan debt should be awarded to:',
    options: [
      { value: 'me', label: 'Me', description: 'I will be responsible for the student loan debt' },
      { value: 'spouse', label: 'My spouse', description: 'My spouse will be responsible for the student loan debt' },
      { value: 'split', label: 'Split 50-50', description: 'We will equally share responsibility for this debt' },
      { value: 'other', label: 'Other', description: 'I want to specify a different arrangement' },
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
    type: 'textarea',
    question: 'Please describe how the student loan debt should be divided.',
    required: true,
    nextQuestionId: 'medical_debt_check',
  },
  {
    id: 'medical_debt_check',
    type: 'yesno',
    question: 'Did you or your spouse incur any medical debt during the marriage?',
    required: true,
    nextQuestionMap: {
      'yes': 'medical_debt_division',
      'no': 'other_community_debt_check',
    },
  },
  {
    id: 'medical_debt_division',
    type: 'select',
    question: 'This medical debt should be awarded to:',
    options: [
      { value: 'me', label: 'Me', description: 'I will be responsible for the medical debt' },
      { value: 'spouse', label: 'My spouse', description: 'My spouse will be responsible for the medical debt' },
      { value: 'split', label: 'Split 50-50', description: 'We will equally share responsibility for this debt' },
      { value: 'other', label: 'Other', description: 'I want to specify a different arrangement' },
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
    type: 'textarea',
    question: 'Please describe how the medical debt should be divided.',
    required: true,
    nextQuestionId: 'other_community_debt_check',
  },
  {
    id: 'other_community_debt_check',
    type: 'yesno',
    question: 'Is there any other debt you believe is community debt?',
    required: true,
    nextQuestionMap: {
      'yes': 'other_community_debt_description',
      'no': 'separate_property_check',
    },
  },
  {
    id: 'other_community_debt_description',
    type: 'text',
    question: 'Please describe this debt.',
    placeholder: 'e.g., personal loan from credit union',
    required: true,
    nextQuestionId: 'other_community_debt_division',
  },
  {
    id: 'other_community_debt_division',
    type: 'select',
    question: 'This debt should be awarded to:',
    options: [
      { value: 'me', label: 'Me', description: 'I will be responsible for this debt' },
      { value: 'spouse', label: 'My spouse', description: 'My spouse will be responsible for this debt' },
      { value: 'split', label: 'Split 50-50', description: 'We will equally share responsibility for this debt' },
      { value: 'other', label: 'Other', description: 'I want to specify a different arrangement' },
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
    type: 'textarea',
    question: 'Please describe how this debt should be divided.',
    required: true,
    nextQuestionId: 'separate_property_check',
  },

  // =====================
  // TAX FILING (Q43j-Q43k)
  // =====================
  {
    id: 'tax_filing',
    type: 'select',
    question: 'How would you like to handle the filing of tax returns for the calendar year in which the decree is signed?',
    options: [
      { value: 'jointly', label: 'File Jointly', description: 'Both parties will file a joint tax return.' },
      { value: 'separately', label: 'File Separately', description: 'Each party will file their own tax return.' },
    ],
    required: true,
    nextQuestionId: 'previous_tax_check',
  },
  {
    id: 'previous_tax_check',
    type: 'yesno',
    question: 'Do you have any previous year tax returns that have not yet been filed?',
    required: true,
    nextQuestionMap: {
      'yes': 'previous_tax_option',
      'no': 'maintenance_check',
    },
  },
  {
    id: 'previous_tax_option',
    type: 'select',
    question: 'How should unfiled previous year taxes be handled?',
    options: [
      {
        value: 'file_jointly',
        label: 'File Jointly',
        description: 'For previous years, the parties will file joint federal and state income tax returns. Both parties will pay and hold the other harmless.',
      },
      {
        value: 'file_separately',
        label: 'File Separately',
        description: 'For previous years, the parties will file separate federal and state income tax returns. Each party will pay and hold the other harmless from any income taxes incurred as a result of the filing of that party\'s tax return and each party will be awarded 100% of any refund received.',
      },
    ],
    required: true,
    nextQuestionId: 'maintenance_check',
  },

  // =====================
  // SPOUSAL MAINTENANCE (Q43l)
  // =====================
  {
    id: 'maintenance_check',
    type: 'select',
    question: 'Do you believe that either spouse is entitled to spousal maintenance (also known as alimony)?',
    options: [
      { value: 'neither', label: 'Neither spouse is entitled' },
      { value: 'me', label: 'I am entitled to spousal maintenance' },
      { value: 'spouse', label: 'My spouse is entitled to spousal maintenance' },
    ],
    required: true,
    nextQuestionMap: {
      'neither': 'other_orders',
      'me': 'maintenance_reasons_me',
      'spouse': 'maintenance_reasons_spouse',
    },
  },
  {
    id: 'maintenance_reasons_me',
    type: 'multiselect',
    question: 'I am entitled to spousal maintenance because (select all that apply):',
    options: [
      { value: 'lack_property', label: 'I lack sufficient property to provide for my reasonable needs' },
      { value: 'lack_earning', label: 'I lack earning ability in the labor market that is adequate to be self-sufficient' },
      { value: 'parent_child', label: 'I am the parent of a child whose age or condition is such that I should not be required to seek employment outside the home' },
      { value: 'contributed_spouse', label: "I have made significant financial or other contributions to my spouse's education, training, vocational skills, career or earning ability, or have significantly reduced my income or career opportunities for the benefit of my spouse" },
      { value: 'long_marriage', label: 'I had a marriage of long duration and I am of an age that may preclude the possibility of gaining employment adequate to be self-sufficient' },
    ],
    required: true,
    nextQuestionId: 'other_orders',
  },
  {
    id: 'maintenance_reasons_spouse',
    type: 'multiselect',
    question: 'My spouse is entitled to spousal maintenance because (select all that apply):',
    options: [
      { value: 'lack_property', label: 'My spouse lacks sufficient property to provide for their reasonable needs' },
      { value: 'lack_earning', label: 'My spouse lacks earning ability in the labor market that is adequate to be self-sufficient' },
      { value: 'parent_child', label: 'My spouse is the parent of a child whose age or condition is such that they should not be required to seek employment outside the home' },
      { value: 'contributed_me', label: 'My spouse has made significant financial or other contributions to my education, training, vocational skills, career or earning ability, or has significantly reduced their income or career opportunities for my benefit' },
      { value: 'long_marriage', label: 'We had a marriage of long duration and my spouse is of an age that may preclude the possibility of gaining employment adequate to be self-sufficient' },
    ],
    required: true,
    nextQuestionId: 'other_orders',
  },

  // =====================
  // OTHER ORDERS (Q44)
  // =====================
  {
    id: 'other_orders',
    type: 'textarea',
    question: 'Are there any other orders that you are seeking from the court?',
    description: 'This is optional. You can describe any additional requests here. Please use our AI assist feature to refine your answer for the Petition.',
    placeholder: 'e.g., Request for temporary restraining order, request to attend mediation, etc.',
    required: false,
    nextQuestionId: 'complete',
  },

  // =====================
  // COMPLETION
  // =====================
  {
    id: 'complete',
    type: 'info',
    question: "Thank you! You've completed the divorce with children petition questionnaire. Your responses have been saved and we're ready to generate your petition documents.\n\nClick the button below to review your answers and generate your documents.",
  },
];

// Helper to get question by ID
export function getQuestionById(id: string): ChatQuestion | undefined {
  return DIVORCE_WITH_CHILDREN_QUESTIONS.find(q => q.id === id);
}

// Get the next question based on current question and answer
export function getNextQuestion(currentQuestion: ChatQuestion, answer: string): string | null {
  // Check for explicit next question mapping based on answer
  if (currentQuestion.nextQuestionMap && answer) {
    const mappedNext = currentQuestion.nextQuestionMap[answer.toLowerCase()];
    if (mappedNext) return mappedNext;
  }

  // Check for explicit next question
  if (currentQuestion.nextQuestionId) {
    return currentQuestion.nextQuestionId;
  }

  // Find index and get next question in sequence
  const currentIndex = DIVORCE_WITH_CHILDREN_QUESTIONS.findIndex(q => q.id === currentQuestion.id);
  if (currentIndex >= 0 && currentIndex < DIVORCE_WITH_CHILDREN_QUESTIONS.length - 1) {
    return DIVORCE_WITH_CHILDREN_QUESTIONS[currentIndex + 1].id;
  }

  return null;
}
