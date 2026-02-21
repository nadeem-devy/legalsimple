import { ChatQuestion } from './types';

// Arizona Counties
export const ARIZONA_COUNTIES = [
  'Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee',
  'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal',
  'Santa Cruz', 'Yavapai', 'Yuma'
];

export const DIVORCE_CHAT_QUESTIONS: ChatQuestion[] = [
  // =====================
  // WELCOME & INITIAL CHECK
  // =====================
  {
    id: 'welcome',
    type: 'info',
    question: "Welcome to the Legal QuickFile Wizard for Petition for Dissolution of Marriage. I'll guide you through the process step by step.",
    nextQuestionId: 'has_children',
  },
  {
    id: 'has_children',
    type: 'yesno',
    question: 'Do you and your spouse have any minor children together?',
    description: 'This includes any children under 18 years old.',
    tooltip: 'Arizona has different divorce forms depending on whether children are involved. Cases with children require additional custody, support, and parenting plan provisions.',
    required: true,
    nextQuestionMap: {
      'yes': 'children_redirect',
      'no': 'personal_intro',
    },
  },
  {
    id: 'children_redirect',
    type: 'stop',
    question: "Since you have minor children, you'll need to complete the Petition WITH Children form instead.\n\nThis form handles:\n• Child custody arrangements\n• Child support calculations\n• Parenting time schedules\n• Holiday and vacation schedules\n\nClick the button below to start the correct form.",
  },

  // =====================
  // PERSONAL INFORMATION (Q1-Q9)
  // Order: full_name → email → ssn4 → county → date_of_birth → gender → mailing_address → phone → date_of_marriage
  // =====================
  {
    id: 'personal_intro',
    type: 'info',
    question: "Great! Let's start with your personal information. You are the Petitioner in this case.",
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
    nextQuestionId: 'email',
  },
  {
    id: 'email',
    type: 'email',
    question: 'What is your email address?',
    placeholder: 'e.g., john@example.com',
    tooltip: 'The court may use this email address to send you important notices and updates about your case. Make sure it\'s an email you check regularly.',
    required: true,
    nextQuestionId: 'ssn4',
  },
  {
    id: 'ssn4',
    type: 'ssn4',
    question: 'What are the last 4 digits of your Social Security number?',
    description: 'This is required for court filing purposes and will be kept confidential.',
    placeholder: '1234',
    tooltip: 'Arizona courts require the last 4 digits of your SSN for identification purposes. This information is kept confidential and is not part of the public court record.',
    required: true,
    validation: { minLength: 4, maxLength: 4 },
    nextQuestionId: 'county',
  },
  {
    id: 'county',
    type: 'select',
    question: 'What Arizona county do you live in?',
    options: ARIZONA_COUNTIES.map(county => ({ value: county, label: `${county} County` })),
    tooltip: 'Your divorce must be filed in the county where you or your spouse reside. This determines which Superior Court will handle your case.',
    required: true,
    nextQuestionId: 'date_of_birth',
  },
  {
    id: 'date_of_birth',
    type: 'date',
    question: 'What is your date of birth?',
    tooltip: 'Your date of birth is required for identification purposes on the petition and helps verify you are of legal age.',
    required: true,
    nextQuestionId: 'gender',
  },
  {
    id: 'gender',
    type: 'select',
    question: 'What is your gender?',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
    tooltip: 'This is used to properly identify you as Petitioner (Husband/Wife) in the court documents.',
    required: true,
    nextQuestionId: 'mailing_address',
  },
  {
    id: 'mailing_address',
    type: 'address',
    question: 'What is your current mailing address?',
    placeholder: '123 Main Street, Phoenix, AZ 85001',
    tooltip: 'The court will send all official correspondence to this address. Use an address where you can reliably receive mail.',
    required: true,
    nextQuestionId: 'phone',
  },
  {
    id: 'phone',
    type: 'phone',
    question: 'What is your best contact phone number?',
    placeholder: '(602) 555-0123',
    tooltip: 'The court or your spouse\'s attorney may need to contact you. Provide a number where you can be reached during business hours.',
    required: true,
    nextQuestionId: 'date_of_marriage',
  },
  {
    id: 'date_of_marriage',
    type: 'date',
    question: 'What is the date of your marriage?',
    description: 'This should match your marriage certificate.',
    tooltip: 'The marriage date establishes the beginning of your marital community, which affects property division. Assets acquired during the marriage are typically community property.',
    required: true,
    nextQuestionId: 'spouse_intro',
  },

  // =====================
  // SPOUSE INFORMATION (Q10-Q15)
  // Order: spouse_full_name → spouse_date_of_birth → spouse_mailing_address → spouse_ssn4 → spouse_phone → spouse_email
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
    tooltip: 'Your spouse\'s legal name must be accurate so they can be properly served with the divorce papers and identified in court records.',
    required: true,
    nextQuestionId: 'spouse_date_of_birth',
  },
  {
    id: 'spouse_date_of_birth',
    type: 'date',
    question: "What is your spouse's date of birth?",
    tooltip: 'This information is required for the petition and helps identify your spouse in court records.',
    required: true,
    nextQuestionId: 'spouse_mailing_address',
  },
  {
    id: 'spouse_mailing_address',
    type: 'address',
    question: "What is your spouse's current mailing address?",
    placeholder: '456 Oak Avenue, Phoenix, AZ 85002',
    tooltip: 'This address is used to serve your spouse with the divorce papers. Accurate information ensures proper legal service of process.',
    required: true,
    nextQuestionId: 'spouse_ssn4',
  },
  {
    id: 'spouse_ssn4',
    type: 'ssn4',
    question: "What are the last 4 digits of your spouse's Social Security number?",
    description: 'If you don\'t know, you can enter "0000".',
    placeholder: '5678',
    tooltip: 'If known, this helps identify your spouse in court records. If you don\'t know it, entering "0000" is acceptable.',
    required: true,
    nextQuestionId: 'spouse_phone',
  },
  {
    id: 'spouse_phone',
    type: 'phone',
    question: "What is your spouse's best contact phone number?",
    placeholder: '(602) 555-0456',
    tooltip: 'This may be used for communication regarding the case. It\'s optional but helpful for facilitating the process.',
    required: false,
    nextQuestionId: 'spouse_email',
  },
  {
    id: 'spouse_email',
    type: 'email',
    question: "What is your spouse's email address?",
    placeholder: 'spouse@example.com',
    tooltip: 'An email address can help facilitate communication and document sharing during the divorce process.',
    required: false,
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
  // RESIDENCY CHECK
  // =====================
  {
    id: 'residency_check',
    type: 'yesno',
    question: `Did you or your spouse reside in ${'{county}'} County for at least 90 days prior to filing this petition?`,
    description: 'Arizona law requires at least one spouse to have lived in the county for 90 days before filing.',
    tooltip: 'Arizona law (A.R.S. § 25-312) requires that at least one spouse be a domiciliary of Arizona for 90 days before filing. This establishes the court\'s jurisdiction over your case.',
    required: true,
    nextQuestionMap: {
      'yes': 'military_check',
      'no': 'residency_stop',
    },
  },
  {
    id: 'residency_stop',
    type: 'stop',
    question: "STOP HERE\n\nResidency requirements require you or your spouse to have resided in {county} County for at least 90 days prior to filing a petition for dissolution.\n\nPlease come back after you have met this requirement. If you believe you may qualify to file in a different county, please start over and select the correct county.",
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
  // STATUS QUESTIONS
  // =====================
  {
    id: 'pregnancy_check',
    type: 'yesno',
    question: 'Are you or your spouse currently pregnant?',
    description: 'This information is required for the petition.',
    tooltip: 'Arizona courts require this disclosure. If there is a pregnancy, it may affect the timing and terms of the divorce as custody and support issues may need to be addressed.',
    required: true,
    nextQuestionMap: {
      'yes': 'pregnancy_who',
      'no': 'covenant_marriage',
    },
  },
  {
    id: 'pregnancy_who',
    type: 'select',
    question: 'Who is pregnant?',
    options: [
      { value: 'petitioner', label: 'I am (Petitioner)' },
      { value: 'respondent', label: 'My spouse (Respondent)' },
    ],
    tooltip: 'This information is required for the petition to properly identify which party is pregnant.',
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
    question: 'Are you or your spouse the biological father of the baby?',
    required: true,
    nextQuestionId: 'covenant_marriage',
  },

  // =====================
  // COVENANT MARRIAGE & STATUS
  // =====================
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
    question: 'Do you believe the marriage is irretrievably broken with no reasonable prospect of reconciliation?',
    tooltip: 'Arizona is a "no-fault" divorce state. You do not need to prove wrongdoing. You only need to state that the marriage is irretrievably broken (A.R.S. § 25-312).',
    required: true,
    nextQuestionMap: {
      'yes': 'conciliation',
      'no': 'marriage_broken_stop',
    },
  },
  {
    id: 'marriage_broken_stop',
    type: 'stop',
    question: "STOP HERE\n\nTo file for divorce in Arizona, you must believe the marriage is irretrievably broken. If you are unsure, you may wish to consider marriage counseling or mediation before proceeding.\n\nYou can return to this process when you are ready.",
  },
  {
    id: 'conciliation',
    type: 'yesno',
    question: 'Do you want the Court to refer you and your spouse to conciliation services?',
    description: 'Conciliation services are optional and provide an opportunity for couples to work through issues with a counselor.',
    tooltip: 'Under A.R.S. § 25-381.09, either party may request conciliation services through the court. This is voluntary and confidential.',
    required: true,
    nextQuestionId: 'maiden_name_check',
  },
  {
    id: 'maiden_name_check',
    type: 'yesno',
    question: 'Do you or your spouse want to restore a former/maiden name?',
    tooltip: 'A divorce decree can include a court order to restore your name to what it was before the marriage. This makes changing your name on IDs, accounts, and records much easier.',
    required: true,
    nextQuestionMap: {
      'yes': 'maiden_name_input',
      'no': 'property_agreement_check',
    },
  },
  {
    id: 'maiden_name_input',
    type: 'text',
    question: 'What name should be restored?',
    placeholder: 'e.g., Jane Marie Johnson',
    tooltip: 'Enter the full legal name to be restored. This will be included in the divorce decree as a court-ordered name change.',
    required: true,
    nextQuestionId: 'property_agreement_check',
  },

  // =====================
  // PROPERTY AGREEMENT
  // If YES and "All covered" = YES → jump to other_orders
  // If NO → ask if they want court to decide or specify themselves
  // =====================
  {
    id: 'property_agreement_check',
    type: 'yesno',
    question: 'Have you and your spouse reached an agreement about how to divide community property?',
    description: 'Community property includes assets and debts acquired during the marriage.',
    tooltip: 'Arizona is a community property state. Property acquired during the marriage is presumed to be owned equally by both spouses. An existing agreement can simplify the divorce process.',
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
        description: 'The court will make a fair and just allocation of community property and debts'
      },
      {
        value: 'specify_myself',
        label: 'I want to specify the division',
        description: 'I will provide details about each asset and how it should be divided'
      },
    ],
    tooltip: 'If you choose "Let the court decide," the petition will include language requesting the court make a fair allocation. This simplifies the process if you cannot agree on specific items.',
    required: true,
    nextQuestionMap: {
      'court_decides': 'separate_property_preference',
      'specify_myself': 'home_check',
    },
  },
  {
    id: 'separate_property_preference',
    type: 'yesno',
    question: 'Do you or your spouse have separate property that needs to be confirmed?',
    description: 'Separate property is property owned before marriage, inherited, or received as a gift to one spouse only.',
    tooltip: 'Even if the court is deciding community property division, you may want to confirm separate property belongs to the rightful owner.',
    required: true,
    nextQuestionMap: {
      'yes': 'separate_property_court_text',
      'no': 'court_division_info',
    },
  },
  {
    id: 'separate_property_court_text',
    type: 'textarea',
    question: 'Please list each separate property item followed by who it belongs to, separated by commas.',
    description: 'Format: Item, Person, Item, Person. Example: Ring, John, TV, Sarah',
    placeholder: 'e.g., Diamond ring, Petitioner, Antique furniture, Respondent, Savings account, Petitioner',
    tooltip: 'This will be included in the petition to ensure separate property is confirmed to the rightful owner.',
    required: true,
    nextQuestionId: 'court_division_info',
  },
  {
    id: 'court_division_info',
    type: 'info',
    question: "We will add the following language to your petition:\n\n\"The parties have acquired certain community and jointly owned property and community or joint debts during the marriage, and a fair and just allocation of such property and responsibility for payment of such debts should be made by the Court.\"\n\nAnd if applicable:\n\n\"The parties have certain separate property and separate debt that the court should confirm to each as such.\"",
    nextQuestionId: 'tax_filing',
  },
  {
    id: 'property_agreement_details',
    type: 'textarea',
    question: 'What agreements have you reached regarding division of community property?',
    placeholder: 'Please describe your agreement in detail...',
    tooltip: 'Documenting your agreement helps ensure it can be included in the divorce decree. Be specific about who gets what property and who is responsible for which debts.',
    required: true,
    nextQuestionId: 'property_agreement_complete',
  },
  {
    id: 'property_agreement_complete',
    type: 'yesno',
    question: 'Does this account for ALL of your community property, or is there community property for which an agreement has not been reached?',
    options: [
      { value: 'yes', label: 'Yes, this covers everything' },
      { value: 'no', label: 'No, there is more property to discuss' },
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
  // Order: Sep Property → Community Property → Sep Debt → Community Debt → Tax
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
    tooltip: 'The property address will be included in the decree to clearly identify which property is being divided or awarded.',
    required: true,
    nextQuestionId: 'disclaimer_deed_check',
  },
  {
    id: 'disclaimer_deed_check',
    type: 'yesno',
    question: 'Did either party sign a disclaimer deed upon purchase of this home?',
    description: 'A disclaimer deed means one spouse gave up their ownership interest in the property.',
    tooltip: 'A disclaimer deed (also called a quit claim deed) transfers any ownership interest from one spouse to the other. If one was signed, it may affect who has legal ownership of the property.',
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
    tooltip: 'If community funds (money earned during the marriage) were used for mortgage payments, improvements, or other expenses, the community may have an equitable interest in the property even if title is in only one name.',
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
    question: 'Since you used community funds to pay for expenses associated with the home, the community may have an equitable lien on the property, and you may be entitled to a portion of the home\'s value. Would you like to request that in your petition?',
    tooltip: 'An equitable lien gives the community (and therefore you) a claim to reimbursement for community funds used on what would otherwise be separate property. This is a legal right under Arizona law.',
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
    question: 'How would you like to divide the ownership interest in this home?',
    options: [
      {
        value: 'i_keep',
        label: 'I keep the home',
        description: "I will pay my spouse's ½ interest and take ownership of the home and any debt attached thereto as my sole and separate property and debt",
      },
      {
        value: 'spouse_keeps',
        label: 'Spouse keeps the home',
        description: "My spouse will pay my ½ interest in the property and take ownership",
      },
      {
        value: 'sell_split',
        label: 'Sell and split proceeds',
        description: "Sell the property on the open market and equally divide the net proceeds after paying all fees and costs associated with the sale",
      },
    ],
    tooltip: 'This determines what happens to the property. The person who keeps it typically must refinance to remove the other spouse from the mortgage and pay them their share of equity.',
    required: true,
    nextQuestionId: 'more_homes_check',
  },
  {
    id: 'more_homes_check',
    type: 'yesno',
    question: 'Do you have another property to add?',
    tooltip: 'If you own multiple properties (vacation homes, rental properties, vacant land), each one needs to be addressed in the divorce decree.',
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
    tooltip: 'These items will be allocated to you in the decree. Be specific about which items you want.',
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
    tooltip: 'Bank accounts opened during the marriage are community property and need to be divided. Include all accounts opened by either spouse during the marriage.',
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
    tooltip: 'This helps identify each community bank account in the decree.',
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
    tooltip: 'This determines how the funds in this specific account will be distributed.',
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
  // RETIREMENT ACCOUNTS
  // =====================
  {
    id: 'retirement_check',
    type: 'yesno',
    question: 'Do you or your spouse have any retirement accounts?',
    description: 'This includes 401(k), IRA, pension plans, etc.',
    tooltip: 'Retirement accounts are often the largest marital asset. Contributions made during the marriage are community property and must be divided, even if the account is in only one name.',
    required: true,
    nextQuestionMap: {
      'yes': 'retirement_type',
      'no': 'vehicle_check',
    },
  },
  {
    id: 'retirement_type',
    type: 'select',
    question: 'What type of retirement account is this?',
    options: [
      { value: '401k', label: '401(k)' },
      { value: 'ira', label: 'Traditional IRA' },
      { value: 'roth_ira', label: 'Roth IRA' },
      { value: 'pension', label: 'Pension' },
      { value: '403b', label: '403(b)' },
      { value: '457b', label: '457(b)' },
      { value: 'sep_ira', label: 'SEP IRA' },
      { value: 'simple_ira', label: 'SIMPLE IRA' },
      { value: 'tsp', label: 'TSP (Thrift Savings Plan)' },
      { value: 'other', label: 'Other' },
    ],
    tooltip: 'Different account types have different rules for division. 401(k)s and pensions often require a special court order called a QDRO to divide without tax penalties.',
    required: true,
    nextQuestionMap: {
      'other': 'retirement_type_other',
      '401k': 'retirement_owner',
      'ira': 'retirement_owner',
      'roth_ira': 'retirement_owner',
      'pension': 'retirement_owner',
      '403b': 'retirement_owner',
      '457b': 'retirement_owner',
      'sep_ira': 'retirement_owner',
      'simple_ira': 'retirement_owner',
      'tsp': 'retirement_owner',
    },
  },
  {
    id: 'retirement_type_other',
    type: 'text',
    question: 'Please specify the type of retirement account.',
    placeholder: 'e.g., Deferred Compensation Plan, Cash Balance Plan, etc.',
    tooltip: 'Enter the specific name or type of your retirement account.',
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
    tooltip: 'Even if the account is only in one spouse\'s name, contributions made during the marriage are community property that may need to be divided.',
    required: true,
    nextQuestionId: 'retirement_administrator',
  },
  {
    id: 'retirement_administrator',
    type: 'text',
    question: 'Where is the account located or who administers it?',
    placeholder: 'e.g., Fidelity, Vanguard, Employer Name',
    tooltip: 'Knowing the plan administrator helps identify the account and determines which forms or orders are needed to divide the account.',
    required: true,
    nextQuestionId: 'retirement_division',
  },
  {
    id: 'retirement_division',
    type: 'textarea',
    question: 'How do you propose dividing this retirement account?',
    placeholder: 'e.g., Split community portion 50/50, owner keeps entire account, etc.',
    tooltip: 'Only the "community portion" (contributions and growth during the marriage) is typically divided. Contributions from before the marriage may be separate property.',
    required: true,
    nextQuestionId: 'more_retirement',
  },
  {
    id: 'more_retirement',
    type: 'yesno',
    question: 'Do you have another retirement account to add?',
    tooltip: 'Include all retirement accounts - yours and your spouse\'s. 401(k)s, IRAs, pensions, and any other retirement savings should be listed.',
    required: true,
    nextQuestionMap: {
      'yes': 'retirement_type',
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
    tooltip: 'Vehicles purchased during the marriage are community property. This includes cars, trucks, motorcycles, RVs, boats, and other titled vehicles.',
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
    tooltip: 'This information identifies the vehicle in the decree. You can find it on the vehicle registration or title.',
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
    tooltip: 'Title ownership affects who needs to sign paperwork to transfer the vehicle. Community property rules still apply regardless of whose name is on the title.',
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
        description: 'I want to keep this vehicle and any debt attached thereto as my sole and separate property/debt',
      },
      {
        value: 'spouse_keeps',
        label: 'Spouse keeps this vehicle',
        description: "I want my spouse to keep this vehicle and any debt attached thereto as my spouse's sole and separate property/debt",
      },
      {
        value: 'sell_split',
        label: 'Sell and split',
        description: 'I want to sell this vehicle and my spouse and I should equally divide any proceeds or debt associated with this vehicle',
      },
    ],
    tooltip: 'The person keeping the vehicle typically takes responsibility for any associated loan. Title will need to be transferred to match the decree.',
    required: true,
    nextQuestionId: 'more_vehicles',
  },
  {
    id: 'more_vehicles',
    type: 'yesno',
    question: 'Do you have another vehicle to add?',
    tooltip: 'Include all vehicles purchased during the marriage - cars, trucks, motorcycles, boats, RVs, etc.',
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
    tooltip: 'Debts from before the marriage or debts incurred solely for one party\'s benefit may be "separate debts" assigned only to that party.',
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
    tooltip: 'These debts will be confirmed as your separate responsibility in the decree.',
    required: true,
    nextQuestionId: 'spouse_separate_debt_list',
  },
  {
    id: 'spouse_separate_debt_list',
    type: 'textarea',
    question: 'Please identify any debt you want the court to allocate to your spouse. Please separate each item of debt with a comma.',
    placeholder: 'e.g., Car loan from before marriage, personal loan',
    tooltip: 'These debts will be confirmed as your spouse\'s separate responsibility in the decree.',
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
    tooltip: 'Community debts are obligations incurred during the marriage. Like community property, these are typically divided between spouses.',
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
    tooltip: 'This helps identify each credit card debt in the decree.',
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
  // TAX FILING
  // =====================
  {
    id: 'tax_filing',
    type: 'select',
    question: 'How would you like to handle the filing of tax returns for the calendar year in which the decree is signed?',
    options: [
      { value: 'jointly', label: 'File Jointly', description: 'Both parties will file a joint tax return' },
      { value: 'separately', label: 'File Separately', description: 'Each party will file their own tax return' },
    ],
    tooltip: 'Filing jointly often provides tax benefits, but requires cooperation between spouses. Filing separately may be simpler but could result in higher taxes. Consult a tax professional if unsure.',
    required: true,
    nextQuestionId: 'previous_tax_check',
  },
  {
    id: 'previous_tax_check',
    type: 'yesno',
    question: 'Do you have any previous year tax returns that have not yet been filed?',
    tooltip: 'If you have unfiled tax returns from prior years, the decree should specify how those will be handled to prevent future disputes about refunds or liabilities.',
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
        value: 'file_separately',
        label: 'File Separately',
        description: 'For previous years, the parties will file separate federal and state income tax returns. Each party will pay and hold the other harmless from any income taxes incurred as a result of the filing of that party\'s tax return and each party will be awarded 100% of any refund received.',
      },
      {
        value: 'file_jointly',
        label: 'File Jointly',
        description: 'For previous years, the parties will file joint federal and state income tax returns and equally share any refund or liability.',
      },
    ],
    tooltip: 'This determines how any tax refunds will be split and who is responsible for any taxes owed for previous years. This language will be included in your decree.',
    required: true,
    nextQuestionId: 'maintenance_check',
  },

  // =====================
  // SPOUSAL MAINTENANCE
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
    tooltip: 'Spousal maintenance (alimony) is financial support paid by one spouse to the other. Arizona courts consider factors like income disparity, length of marriage, and each spouse\'s ability to be self-supporting.',
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
      { value: 'contributed_spouse', label: "I have made significant financial or other contributions to my spouse's education, training, vocational skills, career or earning ability, or have significantly reduced my income or career opportunities for the benefit of my spouse" },
      { value: 'long_marriage', label: 'I had a marriage of long duration and I am of an age that may preclude the possibility of gaining employment adequate to be self-sufficient' },
    ],
    tooltip: 'These are the legal grounds for spousal maintenance under Arizona law (A.R.S. § 25-319). You must meet at least one of these criteria to be eligible for maintenance.',
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
      { value: 'contributed_me', label: 'My spouse has made significant financial or other contributions to my education, training, vocational skills, career or earning ability, or has significantly reduced their income or career opportunities for my benefit' },
      { value: 'long_marriage', label: 'We had a marriage of long duration and my spouse is of an age that may preclude the possibility of gaining employment adequate to be self-sufficient' },
    ],
    tooltip: 'These are the legal grounds for spousal maintenance under Arizona law (A.R.S. § 25-319). Your spouse must meet at least one of these criteria to be eligible for maintenance.',
    required: true,
    nextQuestionId: 'other_orders',
  },

  // =====================
  // OTHER ORDERS
  // =====================
  {
    id: 'other_orders',
    type: 'textarea',
    question: 'Are there any other orders that you are seeking from the court?',
    description: 'This is optional. You can describe any additional requests here.',
    placeholder: 'e.g., Request for temporary restraining order, request to attend mediation, etc.',
    tooltip: 'This is your opportunity to request anything else not covered above. Common requests include restraining orders, orders regarding specific property, or requests for mediation.',
    required: false,
    nextQuestionId: 'complete',
  },

  // =====================
  // COMPLETION
  // =====================
  {
    id: 'complete',
    type: 'info',
    question: "Thank you! You've completed the divorce petition questionnaire. Your responses have been saved and we're ready to generate your petition documents.\n\nClick the button below to review your answers and generate your documents.",
  },
];

// Helper to get question by ID
export function getQuestionById(id: string): ChatQuestion | undefined {
  return DIVORCE_CHAT_QUESTIONS.find(q => q.id === id);
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
  const currentIndex = DIVORCE_CHAT_QUESTIONS.findIndex(q => q.id === currentQuestion.id);
  if (currentIndex >= 0 && currentIndex < DIVORCE_CHAT_QUESTIONS.length - 1) {
    return DIVORCE_CHAT_QUESTIONS[currentIndex + 1].id;
  }

  return null;
}
