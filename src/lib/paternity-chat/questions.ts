import { ChatQuestion } from './types';

// Arizona Counties
export const ARIZONA_COUNTIES = [
  'Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee',
  'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal',
  'Santa Cruz', 'Yavapai', 'Yuma'
];

// US States
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
];

// Holiday options for scheduling
const HOLIDAY_OPTIONS = [
  { value: 'petitioner_even', label: 'Petitioner in even years' },
  { value: 'respondent_even', label: 'Respondent in even years' },
  { value: 'petitioner_every', label: 'Petitioner every year' },
  { value: 'respondent_every', label: 'Respondent every year' },
  { value: 'regular_schedule', label: 'Regular schedule applies' },
];

export const PATERNITY_QUESTIONS: ChatQuestion[] = [
  // =====================
  // WELCOME
  // =====================
  {
    id: 'welcome',
    type: 'info',
    question: "Welcome to the Legal Simple QuickFile Wizard for a Petition to Establish Paternity, Legal Decision Making, Parenting Time and Child Support. I'll guide you through the process step by step.",
    nextQuestionId: 'personal_intro',
  },

  // =====================
  // PERSONAL INFORMATION (Petitioner)
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
    tooltip: 'This is used to properly identify you as Petitioner in the court documents.',
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
    tooltip: 'Your petition must be filed in the county where you or your significant other reside.',
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
    tooltip: 'The court or the other party\'s attorney may need to contact you.',
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
    nextQuestionId: 'preliminary_injunction_check',
  },

  // =====================
  // PRELIMINARY INJUNCTION (NEW)
  // =====================
  {
    id: 'preliminary_injunction_check',
    type: 'yesno',
    question: 'Would you like the Court to issue a preliminary injunction?',
    tooltip: 'A preliminary injunction prevents the removal of the child out of state, as well as the removal of the child from any insurance coverage including medical, hospital, dental, automobile or disability insurance. A preliminary injunction is NOT required in order to proceed with the filing of your documents.',
    required: true,
    nextQuestionMap: {
      'yes': 'injunction_document_type',
      'no': 'biological_father',
    },
  },
  {
    id: 'injunction_document_type',
    type: 'select',
    question: 'In order to obtain a preliminary injunction you must provide one of the following documents along with the rest of your filing. Please select which of these options you would like to provide to the Court.',
    description: 'You will need to provide a copy of the selected document when filing.',
    options: [
      { value: 'birth_certificate', label: 'A copy of the birth certificate' },
      { value: 'affidavit_paternity', label: 'An Affidavit or Acknowledgement of Paternity signed by the Father admitting paternity' },
      { value: 'adoption_order', label: 'An Adoption Order listing both parties as parents' },
      { value: 'court_order_paternity', label: 'A court order establishing paternity' },
    ],
    tooltip: 'One of these documents is required to support your request for a preliminary injunction in a paternity case.',
    required: true,
    nextQuestionId: 'biological_father',
  },

  // =====================
  // BIOLOGICAL FATHER (NEW)
  // =====================
  {
    id: 'biological_father',
    type: 'select',
    question: 'Are you or your significant other the biological or adopted father of the child?',
    options: [
      { value: 'me', label: 'I am the biological or adopted father' },
      { value: 'significant_other', label: 'My significant other is the biological or adopted father' },
    ],
    tooltip: 'This determines how the petition identifies the biological father and mother in the court documents.',
    required: true,
    nextQuestionId: 'other_party_intro',
  },

  // =====================
  // OTHER PARTY INFORMATION (Respondent / Significant Other)
  // =====================
  {
    id: 'other_party_intro',
    type: 'info',
    question: "Now let's gather information about your significant other. They are the Respondent in this case.",
    nextQuestionId: 'other_party_full_name',
  },
  {
    id: 'other_party_full_name',
    type: 'text',
    question: "What is your significant other's full legal name?",
    placeholder: 'e.g., Jane Marie Smith',
    tooltip: 'Your significant other\'s legal name must be accurate so they can be properly served with the court papers.',
    required: true,
    nextQuestionId: 'other_party_date_of_birth',
  },
  {
    id: 'other_party_date_of_birth',
    type: 'date',
    question: "What is your significant other's date of birth?",
    tooltip: 'This information is required for the petition.',
    required: true,
    nextQuestionId: 'other_party_address_known',
  },
  {
    id: 'other_party_address_known',
    type: 'yesno',
    question: "Do you know your significant other's mailing address?",
    tooltip: 'Please note that after filing of your Petition, you will need to serve the Respondent with copies. In order to do that you will need their current address. If you do not have, or cannot locate a current address, you will need to request permission from the Court to serve them via alternative means.',
    required: true,
    nextQuestionMap: {
      'yes': 'other_party_mailing_address',
      'no': 'other_party_ssn4_known',
    },
  },
  {
    id: 'other_party_mailing_address',
    type: 'address',
    question: "What is your significant other's mailing address?",
    placeholder: '456 Oak Avenue, Phoenix, AZ 85002',
    tooltip: 'This address is used to serve your significant other with the court papers.',
    required: true,
    nextQuestionId: 'other_party_ssn4_known',
  },
  {
    id: 'other_party_ssn4_known',
    type: 'yesno',
    question: "Do you know the last 4 digits of your significant other's Social Security number?",
    tooltip: 'If known, this helps identify your significant other in court records.',
    required: true,
    nextQuestionMap: {
      'yes': 'other_party_ssn4',
      'no': 'other_party_phone_known',
    },
  },
  {
    id: 'other_party_ssn4',
    type: 'ssn4',
    question: "What are the last 4 digits of your significant other's Social Security number?",
    placeholder: '5678',
    tooltip: 'This helps identify your significant other in court records.',
    required: true,
    nextQuestionId: 'other_party_phone_known',
  },
  {
    id: 'other_party_phone_known',
    type: 'yesno',
    question: "Do you know your significant other's phone number?",
    tooltip: 'This may be used for communication regarding the case.',
    required: true,
    nextQuestionMap: {
      'yes': 'other_party_phone',
      'no': 'other_party_email_known',
    },
  },
  {
    id: 'other_party_phone',
    type: 'phone',
    question: "What is your significant other's best contact phone number?",
    placeholder: '(602) 555-0456',
    tooltip: 'This may be used for communication regarding the case.',
    required: true,
    nextQuestionId: 'other_party_email_known',
  },
  {
    id: 'other_party_email_known',
    type: 'yesno',
    question: "Do you know your significant other's email address?",
    tooltip: 'An email address can help facilitate communication during the case.',
    required: true,
    nextQuestionMap: {
      'yes': 'other_party_email',
      'no': 'other_party_gender',
    },
  },
  {
    id: 'other_party_email',
    type: 'text',
    question: "What is your significant other's email address?",
    placeholder: 'other@example.com',
    tooltip: 'An email address can help facilitate communication during the case.',
    required: true,
    nextQuestionId: 'other_party_gender',
  },
  {
    id: 'other_party_gender',
    type: 'select',
    question: "What is your significant other's gender?",
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
    tooltip: 'This is used to properly identify your significant other as Respondent in the court documents.',
    required: true,
    nextQuestionId: 'jurisdiction_reasons',
  },

  // =====================
  // ARIZONA JURISDICTION (NEW)
  // =====================
  {
    id: 'jurisdiction_reasons',
    type: 'multiselect',
    question: 'Please choose from the following why you are filing this case against the other party in Arizona. Please select all that are true:',
    options: [
      { value: 'resident_az', label: 'The person is a resident of Arizona' },
      { value: 'serve_in_az', label: 'I believe that I will personally serve the person in Arizona' },
      { value: 'agrees_az', label: 'The person agrees to have the case heard in Arizona and will file written papers in the court case' },
      { value: 'lived_with_child_az', label: 'The person lived with the minor child in this state at some time' },
      { value: 'pre_birth_support_az', label: 'The person lived in this state and provided pre-birth expenses or support for the minor child' },
      { value: 'child_lives_az', label: 'The minor child lives in this state as a result of acts or directions of the person' },
      { value: 'conceived_az', label: 'The person had sexual intercourse in this state as a result of which the minor child may have been conceived' },
      { value: 'signed_affidavit_az', label: 'The person signed an affidavit acknowledging paternity that is filed in this state' },
      { value: 'other_acts_az', label: 'The person did any other acts that substantially connect the person with this state' },
    ],
    tooltip: 'Arizona must have jurisdiction over the other party in order to hear this case. At least one of these reasons must apply.',
    required: true,
    nextQuestionId: 'children_intro',
  },

  // =====================
  // CHILDREN INFORMATION
  // =====================
  {
    id: 'children_intro',
    type: 'info',
    question: "Now let's gather information about your minor child/children. You'll be able to add each child one at a time.",
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
    tooltip: 'Add all minor children involved in this petition.',
    required: true,
    nextQuestionMap: {
      'yes': 'child_name',
      'no': 'children_residency',
    },
  },
  {
    id: 'children_residency',
    type: 'yesno',
    question: 'Have the child/children lived with you or your significant other in Arizona for at least the past 6 months?',
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
    question: "STOP HERE\n\nThe child/children must have lived with you or your significant other in Arizona for at least 6 months before filing.\n\nPlease come back after you have met this residency threshold.",
  },
  {
    id: 'children_reside_with',
    type: 'select',
    question: 'With whom have the minor child/children been residing?',
    options: [
      { value: 'petitioner', label: 'With me (Petitioner)' },
      { value: 'respondent', label: 'With my significant other (Respondent)' },
      { value: 'both', label: 'With both of us' },
    ],
    tooltip: 'This helps establish the current living arrangement for custody purposes.',
    required: true,
    nextQuestionId: 'children_address',
  },

  // =====================
  // CHILDREN'S RESIDENCE
  // =====================
  {
    id: 'children_address',
    type: 'address',
    question: 'What is the address where the child/children currently reside?',
    placeholder: '123 Main Street, Phoenix, AZ 85001',
    tooltip: 'The court requires the current residence of the minor child/children.',
    required: true,
    nextQuestionId: 'paternity_reason',
  },

  // =====================
  // PATERNITY REASON (NEW - dynamic text based on biological_father answer)
  // =====================
  {
    id: 'paternity_reason',
    type: 'select',
    question: 'Why do you think {bioFatherText} the Father of the minor child(ren)? Please check only one:',
    options: [
      {
        value: 'signed_affidavit',
        label: 'Both parties signed an Affidavit of Paternity',
        description: 'Both parties signed an Affidavit of paternity acknowledging that {bioFatherShort} the minor child(ren)\'s natural Father. I am attaching a copy to this Petition.',
      },
      {
        value: 'named_on_birth_cert',
        label: 'Named as natural father on birth certificate',
        description: '{bioFatherShort} named the natural father on one or more minor child(ren)\'s birth certificate. I am attaching a copy to this Petition.',
      },
      {
        value: 'dna_testing',
        label: 'DNA testing confirms paternity',
        description: 'DNA testing indicates that {bioFatherShort} the minor child(ren)\'s natural father. I am attaching a copy of the test results to this Petition.',
      },
      {
        value: 'lived_together',
        label: 'Parties lived together during probable conception',
        description: 'The parties were not married to each other at any time during the ten months before birth of the minor child(ren). However, the parties lived together during the period when the minor child(ren) could have been conceived.',
      },
      {
        value: 'sexual_intercourse',
        label: 'Sexual intercourse at probable date of conception',
        description: 'The parties were not living together but had sexual intercourse at the probable date of conception of the minor child(ren).',
      },
      {
        value: 'other',
        label: 'Other',
        description: 'I have a different reason for believing paternity. I will explain below.',
      },
    ],
    tooltip: 'This establishes the basis for your paternity claim in the petition.',
    required: true,
    nextQuestionMap: {
      'signed_affidavit': 'existing_child_support_order',
      'named_on_birth_cert': 'existing_child_support_order',
      'dna_testing': 'existing_child_support_order',
      'lived_together': 'existing_child_support_order',
      'sexual_intercourse': 'existing_child_support_order',
      'other': 'paternity_reason_other',
    },
  },
  {
    id: 'paternity_reason_other',
    type: 'textarea',
    question: 'Please explain why you believe paternity should be established:',
    description: 'Use our AI Assist feature to help refine your answer for the Petition.',
    placeholder: 'Please provide your explanation...',
    required: true,
    nextQuestionId: 'existing_child_support_order',
  },

  // =====================
  // CHILD SUPPORT ORDER (NEW)
  // =====================
  {
    id: 'existing_child_support_order',
    type: 'yesno',
    question: 'Is there an order for Child Support from this or any other court?',
    tooltip: 'This includes any existing court orders requiring child support payments for the minor child(ren) involved in this petition.',
    required: true,
    nextQuestionMap: {
      'yes': 'existing_order_court',
      'no': 'past_child_support_check',
    },
  },
  {
    id: 'existing_order_court',
    type: 'text',
    question: 'What court is the Child Support Order from?',
    placeholder: 'e.g., Maricopa County Superior Court',
    required: true,
    nextQuestionId: 'existing_order_date',
  },
  {
    id: 'existing_order_date',
    type: 'date',
    question: 'What date was the order entered?',
    required: true,
    nextQuestionId: 'existing_order_modification',
  },
  {
    id: 'existing_order_modification',
    type: 'yesno',
    question: 'Does this order need to be modified?',
    tooltip: 'If circumstances have changed since the order was entered, you may request modification.',
    required: true,
    nextQuestionMap: {
      'yes': 'existing_order_modify_how',
      'no': 'past_child_support_check',
    },
  },
  {
    id: 'existing_order_modify_how',
    type: 'textarea',
    question: 'How should the existing child support order be modified? Please use our AI assist feature to refine your answer for the Petition.',
    placeholder: 'e.g., The existing order should be modified because my income has decreased significantly since the order was entered...',
    tooltip: 'Describe what changes you are requesting and why. Common reasons include changes in income, changes in parenting time, or changes in the needs of the child(ren).',
    required: true,
    nextQuestionId: 'past_child_support_check',
  },

  // =====================
  // PAST CHILD SUPPORT (NEW)
  // =====================
  {
    id: 'past_child_support_check',
    type: 'yesno',
    question: 'Does either party owe past child support?',
    tooltip: 'Past child support may be owed if one party has been providing more than their fair share of support for the child(ren).',
    required: true,
    nextQuestionMap: {
      'yes': 'past_support_who',
      'no': 'child_support_check',
    },
  },
  {
    id: 'past_support_who',
    type: 'select',
    question: 'Who owes past support?',
    options: [
      { value: 'me', label: 'Me' },
      { value: 'significant_other', label: 'My significant other' },
    ],
    required: true,
    nextQuestionId: 'past_support_period',
  },
  {
    id: 'past_support_period',
    type: 'select',
    question: 'For what period is past child support owed?',
    options: [
      {
        value: 'from_filing',
        label: 'From petition filing to order date',
        description: 'The date this petition was filed and the date current child support is ordered.',
      },
      {
        value: 'from_living_apart',
        label: 'From living apart (up to 3 years before filing)',
        description: 'The date we started living apart but not more than three years before the date this petition was filed and the date current child support is ordered.',
      },
    ],
    tooltip: 'Arizona allows past child support to be ordered for up to 3 years before the petition was filed.',
    required: true,
    nextQuestionId: 'child_support_check',
  },

  // =====================
  // SEEKING CHILD SUPPORT (reused from divorce)
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
      'no': 'child_support_waiver',
    },
  },
  {
    id: 'child_support_waiver',
    type: 'yesno',
    question: 'Would you like to waive child support at this time?',
    description: 'If you choose to waive child support, the petition will state that you are willing to waive any child support. If you choose not to waive, the petition will still request child support be awarded in accordance with the Arizona Child Support Guidelines.',
    tooltip: 'Waiving child support means you are voluntarily giving up your right to receive child support payments at this time. You may still petition the court for child support in the future.',
    required: true,
    nextQuestionId: 'prior_custody_cases_check',
  },
  {
    id: 'voluntary_support_check',
    type: 'yesno',
    question: 'Have either you or your significant other made voluntary/direct child support payments that need to be taken into account if past support is requested?',
    tooltip: 'Voluntary payments made before a court order may be credited toward past support obligations.',
    required: true,
    nextQuestionMap: {
      'yes': 'voluntary_support_who',
      'no': 'prior_custody_cases_check',
    },
  },
  {
    id: 'voluntary_support_who',
    type: 'select',
    question: 'Who made the voluntary payments?',
    options: [
      { value: 'petitioner', label: 'I made the payments (Petitioner)' },
      { value: 'respondent', label: 'My significant other made the payments (Respondent)' },
    ],
    required: true,
    nextQuestionId: 'voluntary_support_amount',
  },
  {
    id: 'voluntary_support_amount',
    type: 'currency',
    question: 'Please state the total amount of voluntary payments that have been made:',
    placeholder: 'e.g., 5000',
    tooltip: 'Enter the total dollar amount of all voluntary child support payments made.',
    required: true,
    nextQuestionId: 'voluntary_support_start_date',
  },
  {
    id: 'voluntary_support_start_date',
    type: 'date',
    question: 'Please provide the date that the first payment was made:',
    tooltip: 'This helps the court determine the period of voluntary support.',
    required: true,
    nextQuestionId: 'prior_custody_cases_check',
  },

  // =====================
  // OTHER COURT CASES (Q10 - NEW)
  // =====================
  {
    id: 'prior_custody_cases_check',
    type: 'yesno',
    question: 'Have you been a party or witness or participated in any court case involving the physical custody, legal decision making or parenting time for any of the minor children involved in this Petition in this state or in any other state?',
    required: true,
    nextQuestionMap: {
      'yes': 'prior_case_child_name',
      'no': 'affecting_court_actions_check',
    },
  },
  {
    id: 'prior_case_child_name',
    type: 'text',
    question: 'Please state the name of the minor child for which you have been a party or witness involving physical custody, legal decision making, or parenting time.',
    placeholder: 'e.g., Emily Jane Smith',
    required: true,
    nextQuestionId: 'prior_case_state',
  },
  {
    id: 'prior_case_state',
    type: 'select',
    question: 'In which state was this court case?',
    options: US_STATES.map(state => ({ value: state, label: state })),
    tooltip: 'Select the state where the prior custody case was filed or heard.',
    required: true,
    nextQuestionMap: {
      'arizona': 'prior_case_county',
    },
    nextQuestionId: 'prior_case_county_text',
  },
  {
    id: 'prior_case_county',
    type: 'select',
    question: 'In which county was this court case?',
    options: ARIZONA_COUNTIES.map(county => ({ value: county, label: `${county} County` })),
    tooltip: 'Select the county where the prior custody case was filed or heard.',
    required: true,
    nextQuestionId: 'prior_case_number_known',
  },
  {
    id: 'prior_case_county_text',
    type: 'text',
    question: 'In which county was this court case?',
    placeholder: 'e.g., Los Angeles County',
    tooltip: 'Enter the county where the prior custody case was filed or heard.',
    required: true,
    nextQuestionId: 'prior_case_number_known',
  },
  {
    id: 'prior_case_number_known',
    type: 'yesno',
    question: 'Do you know the court case number?',
    required: true,
    nextQuestionMap: {
      'yes': 'prior_case_number',
      'no': 'prior_case_type',
    },
  },
  {
    id: 'prior_case_number',
    type: 'text',
    question: 'Please list the Court case number:',
    placeholder: 'e.g., FC2024-001234',
    required: true,
    nextQuestionId: 'prior_case_type',
  },
  {
    id: 'prior_case_type',
    type: 'text',
    question: 'Please state the type of proceeding:',
    placeholder: 'e.g., Custody petition, Protective order',
    required: true,
    nextQuestionId: 'prior_case_summary',
  },
  {
    id: 'prior_case_summary',
    type: 'textarea',
    question: 'Please summarize the court order:',
    description: 'Use our AI Assist feature to help refine your answer for the Petition.',
    placeholder: 'Briefly describe what the court ordered...',
    required: true,
    nextQuestionId: 'more_prior_cases',
  },
  {
    id: 'more_prior_cases',
    type: 'yesno',
    question: 'Is there another prior court case to add?',
    required: true,
    nextQuestionMap: {
      'yes': 'prior_case_child_name',
      'no': 'affecting_court_actions_check',
    },
  },

  // =====================
  // OTHER COURT CASES (Q11 - NEW)
  // =====================
  {
    id: 'affecting_court_actions_check',
    type: 'yesno',
    question: 'Do you have any information regarding any court action in this state or any other state involving the minor child(ren) involved in this Petition that could affect this case, including cases relating to domestic violence, protective orders, termination of parental rights and adoptions?',
    required: true,
    nextQuestionMap: {
      'yes': 'affecting_case_child_name',
      'no': 'other_custody_claimants_check',
    },
  },
  {
    id: 'affecting_case_child_name',
    type: 'text',
    question: 'Please state the name of the child:',
    placeholder: 'e.g., Emily Jane Smith',
    required: true,
    nextQuestionId: 'affecting_case_state',
  },
  {
    id: 'affecting_case_state',
    type: 'select',
    question: 'In which state was this court action?',
    options: US_STATES.map(state => ({ value: state, label: state })),
    tooltip: 'Select the state where the court action was filed or heard.',
    required: true,
    nextQuestionMap: {
      'arizona': 'affecting_case_county',
    },
    nextQuestionId: 'affecting_case_county_text',
  },
  {
    id: 'affecting_case_county',
    type: 'select',
    question: 'In which county was this court action?',
    options: ARIZONA_COUNTIES.map(county => ({ value: county, label: `${county} County` })),
    tooltip: 'Select the county where the court action was filed or heard.',
    required: true,
    nextQuestionId: 'affecting_case_number_known',
  },
  {
    id: 'affecting_case_county_text',
    type: 'text',
    question: 'In which county was this court action?',
    placeholder: 'e.g., Los Angeles County',
    tooltip: 'Enter the county where the court action was filed or heard.',
    required: true,
    nextQuestionId: 'affecting_case_number_known',
  },
  {
    id: 'affecting_case_number_known',
    type: 'yesno',
    question: 'Do you know the court case number?',
    required: true,
    nextQuestionMap: {
      'yes': 'affecting_case_number',
      'no': 'affecting_case_type',
    },
  },
  {
    id: 'affecting_case_number',
    type: 'text',
    question: 'Please list the Court case number:',
    placeholder: 'e.g., FC2024-001234',
    required: true,
    nextQuestionId: 'affecting_case_type',
  },
  {
    id: 'affecting_case_type',
    type: 'text',
    question: 'Please state the type of proceeding:',
    placeholder: 'e.g., Protective order, Adoption',
    required: true,
    nextQuestionId: 'affecting_case_summary',
  },
  {
    id: 'affecting_case_summary',
    type: 'textarea',
    question: 'Please summarize the court order:',
    description: 'Use our AI Assist feature to help refine your answer for the Petition.',
    placeholder: 'Briefly describe what the court ordered...',
    required: true,
    nextQuestionId: 'more_affecting_cases',
  },
  {
    id: 'more_affecting_cases',
    type: 'yesno',
    question: 'Is there another court action to add?',
    required: true,
    nextQuestionMap: {
      'yes': 'affecting_case_child_name',
      'no': 'other_custody_claimants_check',
    },
  },

  // =====================
  // OTHER COURT CASES (Q12 - NEW)
  // =====================
  {
    id: 'other_custody_claimants_check',
    type: 'yesno',
    question: 'Do you know any other person other than the parties involved in this Petition who has physical custody or who claims legal decision making or parenting time rights to any of the minor children identified in this petition?',
    tooltip: 'Please identify the party who you believe has a claim for parenting time/legal decision making orders and their relationship to the minor child.',
    required: true,
    nextQuestionMap: {
      'yes': 'claimant_child_name',
      'no': 'domestic_violence_check',
    },
  },
  {
    id: 'claimant_child_name',
    type: 'text',
    question: 'Name of child:',
    placeholder: 'e.g., Emily Jane Smith',
    required: true,
    nextQuestionId: 'claimant_person_name',
  },
  {
    id: 'claimant_person_name',
    type: 'text',
    question: 'Name of person with claim:',
    placeholder: 'e.g., Mary Johnson',
    required: true,
    nextQuestionId: 'claimant_person_address',
  },
  {
    id: 'claimant_person_address',
    type: 'address',
    question: 'Address of person with the claim:',
    placeholder: '789 Oak Street, Phoenix, AZ 85003',
    required: true,
    nextQuestionId: 'claimant_claim_nature',
  },
  {
    id: 'claimant_claim_nature',
    type: 'textarea',
    question: 'Nature of the claim:',
    description: 'Use our AI Assist feature to help refine your answer for the Petition.',
    placeholder: 'e.g., Grandparent claiming visitation rights...',
    required: true,
    nextQuestionId: 'more_claimants',
  },
  {
    id: 'more_claimants',
    type: 'yesno',
    question: 'Is there another person with a custody claim to add?',
    required: true,
    nextQuestionMap: {
      'yes': 'claimant_child_name',
      'no': 'domestic_violence_check',
    },
  },

  // =====================
  // DOMESTIC VIOLENCE (reused, "spouse" → "significant other")
  // =====================
  {
    id: 'domestic_violence_check',
    type: 'yesno',
    question: 'Has there been significant domestic violence in your relationship pursuant to A.R.S. 25-403.03?',
    description: 'This includes physical violence, threats, or patterns of controlling behavior.',
    tooltip: 'Arizona law requires the court to consider domestic violence when making custody and legal decision-making orders.',
    required: true,
    nextQuestionMap: {
      'yes': 'domestic_violence_who',
      'no': 'drug_conviction_check',
    },
  },
  {
    id: 'domestic_violence_who',
    type: 'select',
    question: 'Which party committed domestic violence?',
    options: [
      { value: 'petitioner', label: 'Petitioner (me)' },
      { value: 'respondent', label: 'Respondent (my significant other)' },
    ],
    tooltip: 'This determines how the court addresses domestic violence in legal decision-making orders.',
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
      'no_joint_decision': 'drug_conviction_check',
      'joint_despite_violence': 'domestic_violence_explanation',
    },
  },
  {
    id: 'domestic_violence_explanation',
    type: 'textarea',
    question: 'Please explain why joint legal decision making is still in the best interests of the child/children despite the domestic violence:',
    description: 'Use our AI Assist feature to help refine your answer for the Petition.',
    placeholder: 'Explain the circumstances...',
    tooltip: 'The court will consider your explanation when determining custody arrangements.',
    required: true,
    nextQuestionId: 'drug_conviction_check',
  },

  // =====================
  // DRUG/DUI CONVICTION (reused, "spouse" → "significant other")
  // =====================
  {
    id: 'drug_conviction_check',
    type: 'select',
    question: 'Has either party been convicted for a drug offense or driving under the influence of drugs or alcohol in the last 12 months?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unaware', label: 'I have not, but I am unaware if my significant other has' },
    ],
    tooltip: 'Arizona law requires disclosure of recent drug or DUI convictions as they may affect custody and parenting time decisions.',
    required: true,
    nextQuestionMap: {
      'yes': 'drug_conviction_who',
      'no': 'legal_decision_making',
      'unaware': 'legal_decision_making',
    },
  },
  {
    id: 'drug_conviction_who',
    type: 'select',
    question: 'Who was convicted?',
    options: [
      { value: 'me', label: 'I was convicted' },
      { value: 'significant_other', label: 'My significant other was convicted' },
    ],
    tooltip: 'This information will be disclosed in the petition.',
    required: true,
    nextQuestionId: 'legal_decision_making',
  },

  // =====================
  // LEGAL DECISION MAKING (reused, "spouse" → "significant other")
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
        label: 'My significant other should have sole legal decision making',
        description: 'My significant other will make all major decisions about the children.',
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
      { value: 'respondent', label: 'My significant other should have final say' },
    ],
    required: true,
    nextQuestionId: 'parenting_time_schedule',
  },

  // =====================
  // PARENTING TIME (reused)
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
    description: 'Include which days/times each parent will have the children, weekend arrangements, and any other specifics about how parenting time should be divided. Use our AI Assist feature to help refine your answer for the Petition.',
    placeholder: 'Describe your preferred parenting time schedule...',
    tooltip: 'Be as specific as possible. The court will use this to establish the parenting time order.',
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
  // HOLIDAY SCHEDULE (reused)
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
  // SCHOOL BREAKS (reused)
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
  // SUMMER BREAK (reused)
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
  // EXCHANGE OF CHILDREN (reused)
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
  // PHONE/VIDEO CONTACT (reused)
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
    question: 'Please describe your desired phone/video contact schedule.',
    description: 'Include specific days, times, and any restrictions for phone or video calls between the children and the non-custodial parent. Use our AI Assist feature to help refine your answer for the Petition.',
    placeholder: 'Describe your preferred phone/video contact schedule...',
    tooltip: 'Be specific about when and how phone/video contact should occur.',
    required: true,
    nextQuestionId: 'vacation_time_check',
  },

  // =====================
  // VACATION TIME (reused)
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
  // TRAVEL OUTSIDE ARIZONA (reused)
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
      { value: 'respondent', label: 'My significant other (Respondent) needs consent to travel' },
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
  // EXTRACURRICULAR ACTIVITIES (reused)
  // =====================
  {
    id: 'extracurricular_activities',
    type: 'select',
    question: 'How would you like to handle extracurricular activities for the children?',
    options: [
      {
        value: 'none',
        label: 'No extracurricular activities at this time',
        description: 'I do not wish to include the involvement of the children in any extracurricular activities at this time.',
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
    description: 'Use our AI Assist feature to help refine your answer for the Petition.',
    placeholder: 'Describe your preferred arrangement...',
    required: true,
    nextQuestionId: 'right_of_first_refusal',
  },

  // =====================
  // RIGHT OF FIRST REFUSAL (reused)
  // =====================
  {
    id: 'right_of_first_refusal',
    type: 'yesno',
    question: 'Do you want to incorporate right of first refusal?',
    description: 'Right of first refusal means if a parent cannot engage in parenting time for 24+ hours, they must offer that time to the other parent before arranging alternative care.',
    tooltip: 'This gives each parent the opportunity to spend additional time with the children instead of using babysitters or other childcare.',
    required: true,
    nextQuestionId: 'health_insurance_provider',
  },

  // =====================
  // HEALTH INSURANCE (NEW)
  // =====================
  {
    id: 'health_insurance_provider',
    type: 'select',
    question: 'Who will be providing medical/health insurance for the minor child/children?',
    options: [
      { value: 'petitioner', label: 'I (Petitioner) will provide health insurance' },
      { value: 'respondent', label: 'My significant other (Respondent) will provide health insurance' },
      { value: 'both', label: 'Both parties shall provide medical insurance for the minor child/children' },
    ],
    tooltip: 'The court will order the designated parent to maintain health insurance coverage for the minor child(ren).',
    required: true,
    nextQuestionId: 'parent_info_program',
  },

  // =====================
  // PARENT INFORMATION PROGRAM (NEW)
  // =====================
  {
    id: 'parent_info_program',
    type: 'yesno',
    question: 'The Parent Information Program is required for persons seeking legal decision making authority or parenting time. Have you already attended the Parent Information Program?',
    tooltip: 'Under A.R.S. §25-352, all parties in cases involving legal decision making or parenting time must complete the Parent Information Program.',
    required: true,
    nextQuestionId: 'other_orders_check',
  },

  // =====================
  // OTHER ORDERS
  // =====================
  {
    id: 'other_orders_check',
    type: 'yesno',
    question: 'Are there any other orders that you are seeking from the court?',
    description: 'For example, a request for temporary restraining order, request to attend mediation, etc.',
    required: true,
    nextQuestionMap: {
      'yes': 'other_orders',
      'no': 'complete',
    },
  },
  {
    id: 'other_orders',
    type: 'textarea',
    question: 'Please describe the additional orders you are seeking from the court.',
    description: 'Please use our AI assist feature to refine your answer for the Petition.',
    placeholder: 'e.g., Request for temporary restraining order, request to attend mediation, etc.',
    required: true,
    nextQuestionId: 'complete',
  },

  // =====================
  // COMPLETION
  // =====================
  {
    id: 'complete',
    type: 'info',
    question: "Thank you! You've completed the Petition to Establish Paternity questionnaire. Your responses have been saved and we're ready to generate your petition documents.\n\nClick the button below to review your answers and generate your documents.",
  },
];

// Helper to get question by ID
export function getQuestionById(id: string): ChatQuestion | undefined {
  return PATERNITY_QUESTIONS.find(q => q.id === id);
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
  const currentIndex = PATERNITY_QUESTIONS.findIndex(q => q.id === currentQuestion.id);
  if (currentIndex >= 0 && currentIndex < PATERNITY_QUESTIONS.length - 1) {
    return PATERNITY_QUESTIONS[currentIndex + 1].id;
  }

  return null;
}
