# Complete Intake Field Mapping

This document maps every questionnaire question to its corresponding data field for DocSpring template creation.

## Personal Information (Petitioner)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| What is your full legal name? | `fullName` | text | John Michael Smith |
| What is your email address? | `email` | email | john@example.com |
| What are the last 4 digits of your SSN? | `ssn4` | text | 1234 |
| What Arizona county do you live in? | `county` | select | Maricopa |
| What is your gender? | `gender` | select | male / female |
| What is your current mailing address? | `mailingAddress` | text | 123 Main St, Phoenix, AZ 85001 |
| What is your best contact phone number? | `phone` | phone | (602) 555-0123 |
| What is your date of birth? | `dateOfBirth` | date | 01/15/1985 |
| What is the date of your marriage? | `dateOfMarriage` | date | 06/20/2015 |

## Spouse Information (Respondent)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| What is your spouse's full legal name? | `spouseFullName` | text | Jane Marie Smith |
| What is your spouse's date of birth? | `spouseDateOfBirth` | date | 03/22/1987 |
| What is your spouse's current mailing address? | `spouseMailingAddress` | text | 456 Oak Ave, Phoenix, AZ 85002 |
| What are the last 4 digits of your spouse's SSN? | `spouseSsn4` | text | 5678 |
| What is your spouse's phone number? | `spousePhone` | phone | (602) 555-0456 |
| What is your spouse's email address? | `spouseEmail` | email | jane@example.com |

## Residency & Status

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Do you have minor children together? | `hasChildren` | boolean | true / false |
| Did you reside in county for 90 days? | `meetsResidencyRequirement` | boolean | true / false |
| Are either you or spouse pregnant? | `isPregnant` | boolean | true / false |
| Want to restore maiden name? | `wantsMaidenName` | boolean | true / false |
| What name should be restored? | `maidenName` | text | Jane Marie Johnson |

## Property Agreement

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Have you agreed on property division? | `hasPropertyAgreement` | boolean | true / false |
| What agreements have you reached? | `propertyAgreementDetails` | textarea | We agreed to split assets 50/50... |
| Does this cover all property? | `allPropertyCovered` | boolean | true / false |

## Real Estate (Array - can have multiple)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Did you purchase a home during marriage? | `hasHome` | boolean | true / false |
| What is the property address? | `homes[].address` | text | 789 Desert Lane, Scottsdale, AZ |
| Did either sign a disclaimer deed? | `homes[].hasDisclaimerDeed` | boolean | true / false |
| Did you use community funds? | `homes[].usedCommunityFunds` | boolean | true / false |
| Request equitable lien? | `homes[].requestEquitableLien` | boolean | true / false |
| How to divide ownership? | `homes[].divisionOption` | select | i_keep / spouse_keeps / sell_split |

**For DocSpring:** Use `home1Address`, `home1Division`, `home2Address`, etc. for multiple properties.

## Furniture & Appliances

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Have furniture over $200 to divide? | `hasFurnitureOver200` | boolean | true / false |
| How to divide furniture? | `furnitureDivision` | textarea | I keep living room, spouse keeps bedroom... |
| Have appliances over $200 to divide? | `hasAppliancesOver200` | boolean | true / false |
| How to divide appliances? | `applianceDivision` | textarea | I keep refrigerator, spouse keeps washer... |

## Bank Accounts (Array - can have multiple)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Name of the bank? | `bankAccounts[].bankName` | text | Chase Bank |
| Last 4 digits of account? | `bankAccounts[].last4Digits` | text | 1234 |
| How to divide this account? | `bankAccounts[].proposedDivision` | textarea | Split 50/50 |

**For DocSpring:** Use `bank1Name`, `bank1Last4`, `bank1Division`, etc.

## Retirement Accounts (Array - can have multiple)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Have retirement accounts? | `hasRetirement` | boolean | true / false |
| What type of account? | `retirementAccounts[].accountType` | select | 401k / ira / roth_ira / pension / 403b |
| Whose name is it in? | `retirementAccounts[].ownerName` | select | me / spouse |
| Who administers it? | `retirementAccounts[].administrator` | text | Fidelity |
| How to divide? | `retirementAccounts[].proposedDivision` | textarea | Split community portion 50/50 |

**For DocSpring:** Use `retirement1Type`, `retirement1Owner`, `retirement1Admin`, `retirement1Division`, etc.

## Vehicles (Array - can have multiple)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Purchased vehicles during marriage? | `hasVehicles` | boolean | true / false |
| Year, make, model? | `vehicles[].year`, `vehicles[].make`, `vehicles[].model` | text | 2020, Toyota, Camry |
| In whose name is it titled? | `vehicles[].titledTo` | select | me / spouse / both |
| Outstanding loan balance? | `vehicles[].hasLoan` | boolean | true / false |
| Loan balance amount? | `vehicles[].loanBalance` | currency | 15000 |
| How to dispose of vehicle? | `vehicles[].divisionOption` | select | i_keep / spouse_keeps / sell_split |

**For DocSpring:** Use `vehicle1Year`, `vehicle1Make`, `vehicle1Model`, `vehicle1Division`, etc.

## Separate Property (Array - can have multiple)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Own any separate property? | `hasSeparateProperty` | boolean | true / false |
| Describe the property | `separateProperty[].description` | text | Antique jewelry from grandmother |
| Approximate value? | `separateProperty[].value` | currency | 5000 |
| Who should be awarded it? | `separateProperty[].awardedTo` | select | me / spouse |

**For DocSpring:** Use `sepProp1Desc`, `sepProp1Value`, `sepProp1AwardedTo`, etc.

## Community Debts (Array - can have multiple)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Incurred debts during marriage? | `hasCommunityDebt` | boolean | true / false |
| Describe this debt | `communityDebts[].description` | text | Chase credit card |
| How much is owed? | `communityDebts[].amountOwed` | currency | 5000 |
| Who is responsible? | `communityDebts[].responsibleParty` | select | me / spouse |

**For DocSpring:** Use `commDebt1Desc`, `commDebt1Amount`, `commDebt1Responsible`, etc.

## Separate Debts (Array - can have multiple)

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Have separate debts? | `hasSeparateDebt` | boolean | true / false |
| Describe this debt | `separateDebts[].description` | text | Student loan from before marriage |
| How much is owed? | `separateDebts[].amountOwed` | currency | 15000 |
| Who is responsible? | `separateDebts[].responsibleParty` | select | me / spouse |

**For DocSpring:** Use `sepDebt1Desc`, `sepDebt1Amount`, `sepDebt1Responsible`, etc.

## Tax Filing

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| How to file taxes this year? | `currentYearTaxFiling` | select | jointly / separately |
| Have unfiled previous taxes? | `hasPreviousUnfiledTaxes` | boolean | true / false |
| How to handle previous taxes? | `previousTaxOption` | select | file_separately / file_jointly |

## Spousal Maintenance

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Who is entitled to maintenance? | `maintenanceEntitlement` | select | neither / me / spouse |
| Reasons for maintenance | `maintenanceReasons` | array | ["lack_property", "lack_earning"] |

## Other

| Question | Data Field | Type | Example Value |
|----------|------------|------|---------------|
| Any other orders requested? | `otherOrders` | textarea | Request for temporary restraining order... |

---

## Computed/Derived Fields

These are automatically calculated and available for DocSpring:

| Field Name | Description | Example Value |
|------------|-------------|---------------|
| `petitionerRole` | Husband/Wife based on gender | Husband |
| `respondentRole` | Opposite of petitionerRole | Wife |
| `currentDate` | Today's date | 01/30/2026 |
| `caseNumber` | Auto-generated case number | LS-20260130-0001 |
| `isPregnantText` | Yes/No text | Yes |
| `wantsMaidenNameText` | Yes/No text | No |
| `hasPropertyAgreementText` | Yes/No text | Yes |

---

## DocSpring Field Naming Convention

When creating fields in DocSpring, use this naming convention:

### Single Value Fields
Use the exact field name: `fullName`, `email`, `county`, etc.

### Array Fields (Multiple Items)
Use numbered suffixes:
- First item: `home1Address`, `vehicle1Make`, `bank1Name`
- Second item: `home2Address`, `vehicle2Make`, `bank2Name`
- And so on...

### Boolean Fields for Checkboxes
For checkboxes, you can use:
- `isPregnant` (true/false)
- `isPregnantYes` / `isPregnantNo` (for separate Yes/No checkboxes)

### Example DocSpring Template Fields

```
petitioner_name        → fullName
petitioner_address     → mailingAddress
petitioner_dob         → dateOfBirth
petitioner_ssn4        → ssn4
petitioner_phone       → phone
petitioner_email       → email

respondent_name        → spouseFullName
respondent_address     → spouseMailingAddress
respondent_dob         → spouseDateOfBirth
respondent_ssn4        → spouseSsn4

marriage_date          → dateOfMarriage
county                 → county
filing_date            → currentDate
case_number            → caseNumber

wife_checkbox          → (check if gender === 'female')
husband_checkbox       → (check if gender === 'male')

pregnant_yes           → isPregnant
pregnant_no            → !isPregnant

property_agreement     → propertyAgreementDetails
furniture_division     → furnitureDivision
appliance_division     → applianceDivision

vehicle_1_description  → vehicle1Year + vehicle1Make + vehicle1Model
vehicle_1_to_petitioner → (vehicle1Division === 'i_keep')
vehicle_1_to_respondent → (vehicle1Division === 'spouse_keeps')
```
