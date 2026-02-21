export type PracticeAreaCode = 'family_law' | 'business_formation' | 'estate_planning' | 'personal_injury'

export interface SubType {
  code: string
  name: string
  description: string
  documentTypes: string[]
}

export interface PracticeArea {
  code: PracticeAreaCode
  name: string
  description: string
  icon: string
  subTypes: SubType[]
  commonDocuments: string[]
  complexityFactors: string[]
  lawyerRecommendedThreshold: number // complexity score above which lawyer is recommended
}

export const PRACTICE_AREAS: Record<PracticeAreaCode, PracticeArea> = {
  family_law: {
    code: 'family_law',
    name: 'Family Law',
    description: 'Divorce, child custody, child support, adoption, and domestic relations matters',
    icon: 'Users',
    subTypes: [
      {
        code: 'divorce',
        name: 'Divorce',
        description: 'Dissolution of marriage',
        documentTypes: ['petition_for_divorce', 'divorce_settlement', 'marital_settlement_agreement'],
      },
      {
        code: 'child_custody',
        name: 'Establishing First Court Orders',
        description: 'Legal and physical custody arrangements',
        documentTypes: ['custody_petition', 'parenting_plan', 'custody_modification'],
      },
      {
        code: 'child_support',
        name: 'Modification of Existing Court Orders',
        description: 'Financial support for children',
        documentTypes: ['child_support_petition', 'child_support_worksheet', 'support_modification'],
      },
      {
        code: 'adoption',
        name: 'Adoption',
        description: 'Legal adoption proceedings',
        documentTypes: ['adoption_petition', 'consent_to_adoption', 'adoption_agreement'],
      },
      {
        code: 'domestic_violence',
        name: 'Domestic Violence',
        description: 'Protective orders and restraining orders',
        documentTypes: ['protective_order_petition', 'restraining_order'],
      },
      {
        code: 'paternity',
        name: 'Paternity',
        description: 'Establishing legal parentage',
        documentTypes: ['paternity_petition', 'acknowledgment_of_paternity'],
      },
    ],
    commonDocuments: [
      'petition_for_divorce',
      'custody_petition',
      'child_support_worksheet',
      'parenting_plan',
      'marital_settlement_agreement',
    ],
    complexityFactors: [
      'contested_custody',
      'high_asset_divorce',
      'domestic_violence_involved',
      'interstate_issues',
      'business_ownership',
      'complex_property_division',
    ],
    lawyerRecommendedThreshold: 6,
  },
  business_formation: {
    code: 'business_formation',
    name: 'Business Formation',
    description: 'LLC formation, corporation setup, partnership agreements, and business registration',
    icon: 'Building',
    subTypes: [
      {
        code: 'llc',
        name: 'LLC Formation',
        description: 'Limited Liability Company setup',
        documentTypes: ['articles_of_organization', 'operating_agreement', 'ein_application'],
      },
      {
        code: 'corporation',
        name: 'Corporation',
        description: 'C-Corp or S-Corp formation',
        documentTypes: ['articles_of_incorporation', 'bylaws', 'shareholder_agreement'],
      },
      {
        code: 'partnership',
        name: 'Partnership',
        description: 'General or Limited Partnership',
        documentTypes: ['partnership_agreement', 'certificate_of_partnership'],
      },
      {
        code: 'sole_proprietorship',
        name: 'Sole Proprietorship',
        description: 'Individual business registration',
        documentTypes: ['dba_registration', 'business_license'],
      },
      {
        code: 'nonprofit',
        name: 'Nonprofit Organization',
        description: '501(c)(3) and other nonprofit entities',
        documentTypes: ['articles_of_incorporation_nonprofit', 'bylaws_nonprofit', 'irs_form_1023'],
      },
    ],
    commonDocuments: [
      'articles_of_organization',
      'operating_agreement',
      'articles_of_incorporation',
      'bylaws',
      'partnership_agreement',
    ],
    complexityFactors: [
      'multiple_owners',
      'complex_ownership_structure',
      'foreign_investors',
      'intellectual_property',
      'regulatory_requirements',
      'tax_elections',
    ],
    lawyerRecommendedThreshold: 5,
  },
  estate_planning: {
    code: 'estate_planning',
    name: 'Estate Planning',
    description: 'Wills, trusts, powers of attorney, and healthcare directives',
    icon: 'FileText',
    subTypes: [
      {
        code: 'will',
        name: 'Last Will & Testament',
        description: 'Distribution of assets after death',
        documentTypes: ['last_will_testament', 'codicil'],
      },
      {
        code: 'living_trust',
        name: 'Living Trust',
        description: 'Revocable trust for asset management',
        documentTypes: ['revocable_living_trust', 'trust_amendment', 'trust_certification'],
      },
      {
        code: 'power_of_attorney',
        name: 'Power of Attorney',
        description: 'Financial decision-making authority',
        documentTypes: ['durable_power_of_attorney', 'limited_power_of_attorney'],
      },
      {
        code: 'healthcare_directive',
        name: 'Healthcare Directive',
        description: 'Medical decision-making and living will',
        documentTypes: ['healthcare_poa', 'living_will', 'advance_directive'],
      },
      {
        code: 'beneficiary_designation',
        name: 'Beneficiary Designation',
        description: 'Naming beneficiaries for accounts and policies',
        documentTypes: ['beneficiary_form', 'transfer_on_death_deed'],
      },
    ],
    commonDocuments: [
      'last_will_testament',
      'revocable_living_trust',
      'durable_power_of_attorney',
      'healthcare_poa',
      'advance_directive',
    ],
    complexityFactors: [
      'blended_family',
      'business_succession',
      'high_net_worth',
      'special_needs_beneficiary',
      'real_estate_in_multiple_states',
      'tax_planning_needed',
    ],
    lawyerRecommendedThreshold: 6,
  },
  personal_injury: {
    code: 'personal_injury',
    name: 'Personal Injury',
    description: 'Auto accidents, slip and fall, workplace injuries, medical malpractice, and wrongful death claims',
    icon: 'AlertTriangle',
    subTypes: [
      {
        code: 'auto_accident',
        name: 'Auto Accident',
        description: 'Vehicle collision claims and insurance disputes',
        documentTypes: ['demand_letter', 'complaint'],
      },
      {
        code: 'slip_and_fall',
        name: 'Slip and Fall',
        description: 'Premises liability claims for injuries on someone else\'s property',
        documentTypes: ['demand_letter', 'complaint'],
      },
      {
        code: 'workplace_injury',
        name: 'Workplace Injury',
        description: 'Workers compensation and employer negligence claims',
        documentTypes: ['workers_comp_claim', 'complaint'],
      },
      {
        code: 'medical_malpractice',
        name: 'Medical Malpractice',
        description: 'Claims against healthcare providers for negligent treatment',
        documentTypes: ['demand_letter', 'complaint'],
      },
    ],
    commonDocuments: [
      'demand_letter',
      'complaint',
      'settlement_agreement',
    ],
    complexityFactors: [
      'multiple_defendants',
      'severe_injuries',
      'disputed_liability',
      'insurance_bad_faith',
      'expert_testimony_needed',
    ],
    lawyerRecommendedThreshold: 5,
  },
}

export function getPracticeArea(code: PracticeAreaCode): PracticeArea {
  return PRACTICE_AREAS[code]
}

export function getSubTypes(practiceAreaCode: PracticeAreaCode): SubType[] {
  return PRACTICE_AREAS[practiceAreaCode].subTypes
}

export function getSubType(practiceAreaCode: PracticeAreaCode, subTypeCode: string): SubType | undefined {
  return PRACTICE_AREAS[practiceAreaCode].subTypes.find(st => st.code === subTypeCode)
}

export function shouldRecommendLawyer(practiceAreaCode: PracticeAreaCode, complexityScore: number): boolean {
  return complexityScore >= PRACTICE_AREAS[practiceAreaCode].lawyerRecommendedThreshold
}

export const PRACTICE_AREA_OPTIONS = Object.values(PRACTICE_AREAS).map(area => ({
  value: area.code,
  label: area.name,
  description: area.description,
}))

// Document type display names
export const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  // Family Law
  petition_for_divorce: 'Petition for Divorce',
  divorce_settlement: 'Divorce Settlement Agreement',
  marital_settlement_agreement: 'Marital Settlement Agreement',
  custody_petition: 'Petition for Child Custody',
  parenting_plan: 'Parenting Plan',
  custody_modification: 'Motion to Modify Custody',
  child_support_petition: 'Petition for Child Support',
  child_support_worksheet: 'Child Support Calculation Worksheet',
  support_modification: 'Motion to Modify Child Support',
  adoption_petition: 'Petition for Adoption',
  consent_to_adoption: 'Consent to Adoption',
  adoption_agreement: 'Adoption Agreement',
  protective_order_petition: 'Petition for Protective Order',
  restraining_order: 'Restraining Order Application',
  paternity_petition: 'Petition to Establish Paternity',
  acknowledgment_of_paternity: 'Acknowledgment of Paternity',

  // Business Formation
  articles_of_organization: 'Articles of Organization',
  operating_agreement: 'Operating Agreement',
  ein_application: 'EIN Application',
  articles_of_incorporation: 'Articles of Incorporation',
  bylaws: 'Corporate Bylaws',
  shareholder_agreement: 'Shareholder Agreement',
  partnership_agreement: 'Partnership Agreement',
  certificate_of_partnership: 'Certificate of Partnership',
  dba_registration: 'DBA Registration',
  business_license: 'Business License Application',
  articles_of_incorporation_nonprofit: 'Articles of Incorporation (Nonprofit)',
  bylaws_nonprofit: 'Nonprofit Bylaws',
  irs_form_1023: 'IRS Form 1023',

  // Estate Planning
  last_will_testament: 'Last Will and Testament',
  codicil: 'Codicil to Will',
  revocable_living_trust: 'Revocable Living Trust',
  trust_amendment: 'Trust Amendment',
  trust_certification: 'Trust Certification',
  durable_power_of_attorney: 'Durable Power of Attorney',
  limited_power_of_attorney: 'Limited Power of Attorney',
  healthcare_poa: 'Healthcare Power of Attorney',
  living_will: 'Living Will',
  advance_directive: 'Advance Healthcare Directive',
  beneficiary_form: 'Beneficiary Designation Form',
  transfer_on_death_deed: 'Transfer on Death Deed',
}

export function getDocumentTypeName(documentType: string): string {
  return DOCUMENT_TYPE_NAMES[documentType] || documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
