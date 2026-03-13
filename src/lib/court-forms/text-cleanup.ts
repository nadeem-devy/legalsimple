// Auto-correct and text cleanup utility for intake data before PDF generation
// Fixes common spelling/formatting issues without changing meaning

// Common legal misspellings → corrections
const LEGAL_CORRECTIONS: Record<string, string> = {
  'petioner': 'petitioner',
  'petitoner': 'petitioner',
  'peitioner': 'petitioner',
  'respondant': 'respondent',
  'respondent': 'respondent',
  'dissoultion': 'dissolution',
  'dissoluton': 'dissolution',
  'disolve': 'dissolve',
  'divoce': 'divorce',
  'divorse': 'divorce',
  'divorve': 'divorce',
  'maintanence': 'maintenance',
  'maintainence': 'maintenance',
  'maintenace': 'maintenance',
  'alimoney': 'alimony',
  'alimonay': 'alimony',
  'custidy': 'custody',
  'cusotdy': 'custody',
  'custady': 'custody',
  'visiation': 'visitation',
  'visitaion': 'visitation',
  'seperate': 'separate',
  'seperately': 'separately',
  'seperation': 'separation',
  'comunity': 'community',
  'communtiy': 'community',
  'proprety': 'property',
  'propery': 'property',
  'properity': 'property',
  'vehical': 'vehicle',
  'vehicel': 'vehicle',
  'vehichle': 'vehicle',
  'insurence': 'insurance',
  'insurace': 'insurance',
  'insuranse': 'insurance',
  'morgage': 'mortgage',
  'mortage': 'mortgage',
  'mortgae': 'mortgage',
  'retirment': 'retirement',
  'retiremnt': 'retirement',
  'benificiary': 'beneficiary',
  'beneficary': 'beneficiary',
  'guardianshp': 'guardianship',
  'gaurdian': 'guardian',
  'gaurdianship': 'guardianship',
  'juristiction': 'jurisdiction',
  'jurisdicion': 'jurisdiction',
  'afidavit': 'affidavit',
  'affadavit': 'affidavit',
  'warantee': 'warranty',
  'warrantee': 'warranty',
  'defendent': 'defendant',
  'defendat': 'defendant',
  'plainitff': 'plaintiff',
  'plantiff': 'plaintiff',
  'plaintif': 'plaintiff',
  'attourney': 'attorney',
  'attourny': 'attorney',
  'attorny': 'attorney',
  'agrrement': 'agreement',
  'agreemnt': 'agreement',
  'agreeement': 'agreement',
  'recieve': 'receive',
  'reciept': 'receipt',
  'acccount': 'account',
  'acount': 'account',
  'adress': 'address',
  'addres': 'address',
  'adddress': 'address',
  'appartment': 'apartment',
  'apratment': 'apartment',
  'certifcate': 'certificate',
  'certificat': 'certificate',
  'employmnet': 'employment',
  'employement': 'employment',
  'goverment': 'government',
  'governmnet': 'government',
  'necesary': 'necessary',
  'neccessary': 'necessary',
  'neccesary': 'necessary',
  'occured': 'occurred',
  'occurrance': 'occurrence',
  'occurence': 'occurrence',
  'posession': 'possession',
  'possesion': 'possession',
  'untill': 'until',
  'wihtout': 'without',
  'whihc': 'which',
  'thier': 'their',
  'reccomend': 'recommend',
  'recomend': 'recommend',
  'accomodate': 'accommodate',
  'acommodate': 'accommodate',
  'judgement': 'judgment',
  'forclose': 'foreclose',
  'forecloser': 'foreclosure',
  'forclosure': 'foreclosure',
  'liabilty': 'liability',
  'liablity': 'liability',
  'deductable': 'deductible',
  'deductibe': 'deductible',
  'depencent': 'dependent',
  'dependant': 'dependent',
  'equitible': 'equitable',
  'equiteable': 'equitable',
  'furnature': 'furniture',
  'furiture': 'furniture',
  'furnitures': 'furniture',
  'jewlery': 'jewelry',
  'jewelery': 'jewelry',
  'jewerly': 'jewelry',
  'applience': 'appliance',
  'appliances': 'appliances',
  'appliane': 'appliance',
  'refridgerator': 'refrigerator',
  'refrigeator': 'refrigerator',
  'washer/dryer': 'washer/dryer',
  'vehicals': 'vehicles',
  'televison': 'television',
  'televsion': 'television',
};

// Arizona county names for proper capitalization
const AZ_COUNTIES = [
  'Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee',
  'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal',
  'Santa Cruz', 'Yavapai', 'Yuma',
];

// US state abbreviations
const STATE_ABBREVS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

/**
 * Clean up a single text string:
 * - Fix common misspellings
 * - Normalize whitespace (double spaces, leading/trailing)
 * - Capitalize first letter of sentences
 */
function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return text;

  let cleaned = text;

  // Fix multiple spaces → single space
  cleaned = cleaned.replace(/  +/g, ' ');

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  // Fix common misspellings (case-insensitive word replacement)
  for (const [wrong, correct] of Object.entries(LEGAL_CORRECTIONS)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    cleaned = cleaned.replace(regex, (match) => {
      // Preserve original capitalization pattern
      if (match[0] === match[0].toUpperCase()) {
        return correct.charAt(0).toUpperCase() + correct.slice(1);
      }
      return correct;
    });
  }

  // Capitalize first letter of the string if it starts with a letter
  if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Capitalize after periods (sentence starts)
  cleaned = cleaned.replace(/\.\s+([a-z])/g, (match, letter) => {
    return '. ' + letter.toUpperCase();
  });

  return cleaned;
}

/**
 * Clean up a name string:
 * - Capitalize each word
 * - Fix double spaces
 */
function cleanName(name: string): string {
  if (!name || typeof name !== 'string') return name;

  return name
    .trim()
    .replace(/  +/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Clean up an address string:
 * - Capitalize appropriately
 * - Fix state abbreviation capitalization
 * - Fix common issues
 */
function cleanAddress(address: string): string {
  if (!address || typeof address !== 'string') return address;

  let cleaned = address.trim().replace(/  +/g, ' ');

  // Capitalize AZ county names properly
  for (const county of AZ_COUNTIES) {
    const regex = new RegExp(`\\b${county}\\b`, 'gi');
    cleaned = cleaned.replace(regex, county);
  }

  // Capitalize state abbreviations
  for (const abbrev of STATE_ABBREVS) {
    const regex = new RegExp(`\\b${abbrev.toLowerCase()}\\b`, 'g');
    cleaned = cleaned.replace(regex, abbrev);
  }

  // Capitalize first letter of each major word in the address
  // but keep small words like "of", "the" lowercase (unless first)
  const smallWords = new Set(['of', 'the', 'in', 'at', 'to', 'for', 'and', 'or']);
  const words = cleaned.split(' ');
  cleaned = words.map((word, i) => {
    // Don't touch state abbreviations or numbers
    if (/^[A-Z]{2}$/.test(word) || /^\d/.test(word) || /^#/.test(word)) return word;
    // Don't lowercase small words at position 0
    if (i > 0 && smallWords.has(word.toLowerCase())) return word.toLowerCase();
    // Capitalize first letter
    if (word.length > 0 && /^[a-z]/.test(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  }).join(' ');

  return cleaned;
}

// Keys that contain names
const NAME_KEYS = new Set([
  'fullName', 'spouseFullName', 'maidenName', 'spouseMaidenName',
  'otherBioParentName', 'administrator',
]);

// Keys that contain addresses
const ADDRESS_KEYS = new Set([
  'mailingAddress', 'spouseMailingAddress', 'otherBioParentAddress',
  'deploymentLocation',
]);

// Keys that should NOT be cleaned (non-text, structured, boolean, or enum/select values)
const SKIP_KEYS = new Set([
  // Identity fields
  'id', 'gender', 'spouseGender', 'otherPartyGender', 'ssn4', 'spouseSsn4', 'otherPartySsn4',
  'phone', 'spousePhone', 'otherPartyPhone',
  'email', 'spouseEmail', 'otherPartyEmail',
  'dateOfBirth', 'spouseDateOfBirth', 'otherPartyDateOfBirth',
  'dateOfMarriage', 'pregnancyDueDate', 'county',
  // Enum/select values — must not be capitalized or they break switch/comparison logic
  'biologicalFather', 'legalDecisionMaking', 'finalSayParty',
  'parentingTimeSchedule', 'exchangeMethod', 'phoneContactOption',
  'extracurricularOption', 'extracurricularLimit',
  'healthInsuranceProvider', 'drugConvictionParty',
  'domesticViolenceCommittedBy', 'domesticViolenceOption',
  'paternityReason', 'injunctionDocumentType',
  'pastSupportOwedBy', 'pastSupportPeriod', 'voluntaryPaymentWho',
  'childrenResideWith', 'vacationPriorityYears', 'restrictedTravelParty',
  // Divorce enum fields
  'divorceReason', 'maintenanceEntitlement', 'propertyDivisionMethod',
  'debtDivisionMethod', 'petitionerBiologicalRole',
  'currentYearTaxFiling', 'previousTaxOption',
  // Modification enum fields
  'role', 'modificationsSelected',
  'ldm_modificationType', 'ldm_courtName', 'ldm_pageNumber', 'ldm_paragraphNumber', 'ldm_orderDate',
  'pt_newSchedule', 'pt_courtName', 'pt_pageNumber', 'pt_paragraphNumber', 'pt_orderDate',
  'cs_courtName', 'cs_pageNumber', 'cs_paragraphNumber', 'cs_orderDate',
]);

/**
 * Auto-correct all free-text fields in intake data.
 * Returns a new object with corrected text fields.
 * Does NOT modify the original object.
 */
export function autoCorrectIntakeData<T extends Record<string, unknown>>(data: T): T {
  const corrected = { ...data };

  for (const [key, value] of Object.entries(corrected)) {
    if (SKIP_KEYS.has(key)) continue;

    if (typeof value === 'string' && value.trim().length > 0) {
      if (NAME_KEYS.has(key)) {
        (corrected as Record<string, unknown>)[key] = cleanName(value);
      } else if (ADDRESS_KEYS.has(key)) {
        (corrected as Record<string, unknown>)[key] = cleanAddress(value);
      } else {
        (corrected as Record<string, unknown>)[key] = cleanText(value);
      }
    }

    // Handle arrays of objects (homes, vehicles, retirement, etc.)
    if (Array.isArray(value)) {
      (corrected as Record<string, unknown>)[key] = value.map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return autoCorrectIntakeData(item as Record<string, unknown>);
        }
        return item;
      });
    }
  }

  return corrected;
}
