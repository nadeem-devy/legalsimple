import { Document, Page, View, Text } from '@react-pdf/renderer';
import { nvComplaintStyles as styles } from '@/lib/court-forms/NvComplaintStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface NvComplaintDocumentProps {
  data: NormalizedPDFData;
  caseNumber?: string;
  signature?: string;
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={checked ? styles.checkboxChecked : styles.checkbox}>
      {checked && <Text style={styles.checkmark}>X</Text>}
    </View>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '___________';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDivisionOption(option: string): string {
  switch (option) {
    case 'i_keep': return 'Plaintiff';
    case 'spouse_keeps': return 'Defendant';
    case 'sell_split': return 'Sell & Split';
    default: return option || '';
  }
}

function formatTitledTo(titledTo: string): string {
  switch (titledTo) {
    case 'me': return 'Plaintiff';
    case 'spouse': return 'Defendant';
    case 'both': return 'Both';
    default: return titledTo || '';
  }
}

function formatLegalCustody(option: string): string {
  switch (option) {
    case 'joint': return 'Joint legal custody to both parties';
    case 'plaintiff_sole': return 'Sole legal custody to Plaintiff';
    case 'defendant_sole': return 'Sole legal custody to Defendant';
    default: return option || '';
  }
}

function formatPhysicalCustody(option: string): string {
  switch (option) {
    case 'joint': return 'Joint physical custody to both parties';
    case 'plaintiff_primary': return 'Primary physical custody to Plaintiff';
    case 'defendant_primary': return 'Primary physical custody to Defendant';
    default: return option || '';
  }
}

function formatCurrency(amount: string | number | undefined): string {
  if (!amount) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
  if (isNaN(num)) return '$0.00';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPayFrequency(freq: string): string {
  switch (freq) {
    case 'hourly': return 'per hour';
    case 'weekly': return 'per week';
    case 'biweekly': return 'every two weeks';
    case 'monthly': return 'per month';
    case 'annually': return 'per year';
    case 'unknown': return '(unknown)';
    default: return freq || '';
  }
}

function formatNvHolidayOption(option: string): string {
  switch (option) {
    case 'plaintiff_even': return 'Plaintiff in even years, Defendant in odd years';
    case 'defendant_even': return 'Defendant in even years, Plaintiff in odd years';
    case 'plaintiff_every': return 'Plaintiff every year';
    case 'defendant_every': return 'Defendant every year';
    case 'regular_schedule': return 'Per regular parenting schedule';
    default: return option || '';
  }
}

function formatTaxDeductionOption(option: string): string {
  switch (option) {
    case 'plaintiff_all': return 'Plaintiff claims all children';
    case 'defendant_all': return 'Defendant claims all children';
    case 'alternate': return 'Parents alternate years';
    case 'per_federal_law': return 'Per federal law (custodial parent claims)';
    case 'split': return 'Parents split children';
    default: return option || '';
  }
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatChildSupportFactor(factor: string): string {
  switch (factor) {
    case 'special_education_needs': return 'The child(ren) have special educational needs';
    case 'legal_responsibility_others': return 'A party has a legal responsibility to support others';
    case 'public_support_services': return 'The cost of transportation is a factor';
    case 'transportation_costs': return 'The cost of transportation of the child(ren) for visitation';
    case 'significantly_higher_income': return 'One party has a significantly higher income than the other';
    case 'other_necessary_expenses': return 'Other necessary expenses for the child(ren)';
    case 'ability_to_pay': return 'The relative ability of each party to pay';
    default: return factor;
  }
}

export function NvComplaintDocument({ data, caseNumber }: NvComplaintDocumentProps) {
  const { petitioner, respondent, marriage, children, property, debts } = data;
  const nv = data.nevada;
  const county = petitioner.county || '________';

  let paraNum = 0;
  const nextPara = () => ++paraNum;

  const holidayNames: Record<string, string> = {
    newYearsEve: "New Year's Eve",
    newYearsDay: "New Year's Day",
    easter: 'Easter',
    fourthOfJuly: 'Fourth of July',
    halloween: 'Halloween',
    thanksgiving: 'Thanksgiving',
    hanukkah: 'Hanukkah',
    christmasEve: 'Christmas Eve',
    christmasDay: 'Christmas Day',
    childBirthday: "Child's Birthday",
    fatherBirthday: "Father's Birthday",
    motherBirthday: "Mother's Birthday",
    mothersDay: "Mother's Day",
    fathersDay: "Father's Day",
  };

  const breakNames: Record<string, string> = {
    springBreak: 'Spring Break',
    fallBreak: 'Fall Break',
    winterBreak: 'Winter Break',
  };

  return (
    <Document
      title={`Complaint for Divorce - ${petitioner.name} v. ${respondent.name}`}
      author="LegalSimple"
      subject="Complaint for Divorce (With Children) and UCCJEA Declaration"
      creator="LegalSimple Court Forms"
    >
      {/* ==================== PAGE 1 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Person Filing Info */}
        <View style={styles.topSection}>
          <View style={styles.personFilingRow}>
            <Text style={styles.personFilingLabel}>Name:</Text>
            <Text style={styles.personFilingValue}>{petitioner.name}</Text>
          </View>
          <View style={styles.personFilingRow}>
            <Text style={styles.personFilingLabel}>Address:</Text>
            <Text style={styles.personFilingValue}>{petitioner.address}</Text>
          </View>
          <View style={styles.personFilingRow}>
            <Text style={styles.personFilingLabel}>Telephone:</Text>
            <Text style={styles.personFilingValue}>{petitioner.phone}</Text>
          </View>
          <View style={styles.personFilingRow}>
            <Text style={styles.personFilingLabel}>Email:</Text>
            <Text style={styles.personFilingValue}>{petitioner.email}</Text>
          </View>
          <View style={styles.personFilingRow}>
            <Text style={styles.personFilingLabel}>Self-Represented</Text>
            <Text style={styles.personFilingValue}></Text>
          </View>
        </View>

        {/* Court Header */}
        <View style={styles.courtHeader}>
          <Text style={styles.courtHeaderLine}>DISTRICT COURT</Text>
          <Text style={styles.courtHeaderLine}>{county.toUpperCase()} COUNTY, NEVADA</Text>
        </View>

        {/* Case Caption */}
        <View style={styles.captionSection}>
          <View style={styles.captionRow}>
            <View style={styles.captionLeft}>
              <Text style={styles.captionName}>{petitioner.name},</Text>
              <Text style={styles.captionLabel}>          Plaintiff,</Text>
              <Text style={styles.captionVs}>vs.</Text>
              <Text style={styles.captionName}>{respondent.name},</Text>
              <Text style={styles.captionLabel}>          Defendant.</Text>
            </View>
            <View style={styles.captionDivider} />
            <View style={styles.captionRight}>
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={styles.caseNoLabel}>Case No.: </Text>
                <Text style={styles.caseNoValue}>{caseNumber || ''}</Text>
              </View>
              <Text style={styles.deptLabel}>Dept. No.: ___________</Text>
            </View>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.documentTitle}>COMPLAINT FOR DIVORCE</Text>
        <Text style={styles.documentSubtitle}>(With Minor Children)</Text>

        {/* SECTION: PARTIES AND JURISDICTION */}
        <Text style={styles.sectionTitle}>PARTIES AND JURISDICTION</Text>

        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            Plaintiff, {petitioner.name}, is a resident of {county} County, Nevada{nv?.residencyWho === 'plaintiff' || nv?.residencyWho === 'both'
              ? ', and has been domiciled in the State of Nevada for at least six (6) weeks immediately preceding the filing of this Complaint.'
              : '.'}
          </Text>
        </View>

        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            Defendant&apos;s name is {respondent.name}.
          </Text>
        </View>

        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            Plaintiff and Defendant were married on {formatDate(marriage.date)} in {nv?.marriageLocation || '___________'}.
          </Text>
        </View>

        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            Incompatibility has existed and continues to exist between the parties, and there is no possibility of reconciliation.
          </Text>
        </View>

        {/* Pregnancy */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            {nv?.pregnancyStatus === 'yes'
              ? `The ${marriage.pregnantParty === 'petitioner' ? 'Plaintiff' : 'Defendant'} is currently pregnant with an expected due date of ${formatDate(marriage.pregnancyDueDate || '')}.`
              : nv?.pregnancyStatus === 'unknown'
                ? 'It is unknown whether either party is currently pregnant.'
                : 'Neither party is currently pregnant.'}
          </Text>
        </View>

        {/* SECTION: MINOR CHILDREN */}
        <Text style={styles.sectionTitle}>MINOR CHILDREN</Text>

        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            The following minor child(ren) were born of or adopted during this marriage:
          </Text>
        </View>

        {/* Children Table */}
        {children && children.list.length > 0 && (
          <View style={styles.childrenTable}>
            <View style={styles.childrenTableHeader}>
              <Text style={[styles.childrenTableCellHeader, styles.childColName]}>Name</Text>
              <Text style={[styles.childrenTableCellHeader, styles.childColDob]}>Date of Birth</Text>
              <Text style={[styles.childrenTableCellHeader, styles.childColAge]}>Age</Text>
            </View>
            {children.list.map((child, idx) => (
              <View key={idx} style={styles.childrenTableRow}>
                <Text style={[styles.childrenTableCell, styles.childColName]}>{child.name}</Text>
                <Text style={[styles.childrenTableCell, styles.childColDob]}>{formatDate(child.dateOfBirth)}</Text>
                <Text style={[styles.childrenTableCell, styles.childColAge]}>{calculateAge(child.dateOfBirth)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 2: UCCJEA DECLARATION ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case No.: </Text>
          <Text style={{ fontSize: 10 }}>{caseNumber || '___________'}</Text>
        </View>

        <Text style={styles.sectionTitle}>UCCJEA DECLARATION</Text>

        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            {nv?.childrenLivedInNevada6Months
              ? 'The minor child(ren) have lived in the State of Nevada for at least six (6) consecutive months immediately preceding the filing of this action. Nevada is the home state of the minor child(ren).'
              : 'The minor child(ren) have a significant connection with the State of Nevada.'}
          </Text>
        </View>

        {/* Current Residence */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            The child(ren) currently reside at: {nv?.childResidenceAddress || '___________'} and have lived at this address for {nv?.childResidenceDuration || '___________'}.
          </Text>
        </View>

        {/* Prior Residences */}
        {nv && nv.childResidenceHistory.length > 0 && (
          <>
            <View style={styles.numberedRow}>
              <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
              <Text style={styles.paragraphContent}>
                The child(ren)&apos;s prior addresses within the last five (5) years are as follows:
              </Text>
            </View>
            <View style={styles.residenceTable}>
              <View style={styles.childrenTableHeader}>
                <Text style={[styles.childrenTableCellHeader, styles.residenceColAddress]}>Address</Text>
                <Text style={[styles.childrenTableCellHeader, styles.residenceColDuration]}>Duration</Text>
              </View>
              {nv.childResidenceHistory.map((hist, idx) => (
                <View key={idx} style={styles.residenceTableRow}>
                  <Text style={[styles.childrenTableCell, styles.residenceColAddress]}>{hist.address}</Text>
                  <Text style={[styles.childrenTableCell, styles.residenceColDuration]}>{hist.durationMonths} months</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Prior Custody Cases */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            {nv?.hasPriorCustodyCases
              ? 'The following custody proceedings have previously been filed concerning the minor child(ren):'
              : 'No party has participated in any other litigation concerning the custody of the minor child(ren) in this or any other state.'}
          </Text>
        </View>

        {nv && nv.hasPriorCustodyCases && nv.priorCustodyCases.map((pc, idx) => (
          <View key={idx} style={styles.bodyTextIndent}>
            <Text style={styles.bodyText}>
              {String.fromCharCode(97 + idx)}) State: {pc.state}, Children: {pc.childrenInvolved}, Case No.: {pc.caseNumber}
              {pc.hasChildCustodyOrder ? `, Custody Order Date: ${formatDate(pc.custodyOrderDate || '')}` : ', No custody order entered'}
            </Text>
          </View>
        ))}

        {/* Affecting Cases */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            {nv?.hasAffectingCases
              ? 'The following court actions could affect the current proceeding:'
              : 'No party knows of any proceeding that could affect the current proceeding, including proceedings for enforcement and proceedings relating to domestic violence, protective orders, termination of parental rights, and adoptions.'}
          </Text>
        </View>

        {nv && nv.hasAffectingCases && nv.affectingCases.map((ac, idx) => (
          <View key={idx} style={styles.bodyTextIndent}>
            <Text style={styles.bodyText}>
              {String.fromCharCode(97 + idx)}) State: {ac.state}, Parties: {ac.partiesInvolved}, Case No.: {ac.caseNumber}, Type: {ac.caseType}
            </Text>
          </View>
        ))}

        {/* Other Custody Claimants */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            {nv?.hasOtherCustodyClaimants
              ? 'The following persons, not a party to this proceeding, have physical custody of the child(ren) or claim custody or visitation rights:'
              : 'No person other than the parties to this action has physical custody of the minor child(ren) or claims to have custody or visitation rights with respect to the minor child(ren).'}
          </Text>
        </View>

        {nv && nv.hasOtherCustodyClaimants && nv.otherCustodyClaimants.map((oc, idx) => (
          <View key={idx} style={styles.bodyTextIndent}>
            <Text style={styles.bodyText}>
              {String.fromCharCode(97 + idx)}) Name: {oc.fullName}, Address: {oc.address}
            </Text>
          </View>
        ))}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 3: CUSTODY, PARENTING, CHILD SUPPORT ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case No.: </Text>
          <Text style={{ fontSize: 10 }}>{caseNumber || '___________'}</Text>
        </View>

        <Text style={styles.sectionTitle}>CUSTODY AND PARENTING TIME</Text>

        {/* Legal Custody */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            <Text style={styles.bold}>Legal Custody: </Text>
            {formatLegalCustody(nv?.legalCustody || 'joint')}.
          </Text>
        </View>

        {/* Physical Custody */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            <Text style={styles.bold}>Physical Custody: </Text>
            {formatPhysicalCustody(nv?.physicalCustody || 'joint')}.
          </Text>
        </View>

        {/* Regular Parenting Schedule */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            <Text style={styles.bold}>Regular Parenting Schedule: </Text>
            {nv?.regularScheduleDetails || 'To be determined by the Court.'}
          </Text>
        </View>

        {/* Summer Schedule */}
        {nv && !nv.summerSameAsRegular && nv.summerScheduleDetails && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              <Text style={styles.bold}>Summer Schedule: </Text>
              {nv.summerScheduleDetails}
            </Text>
          </View>
        )}

        {/* Holiday Schedule */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            <Text style={styles.bold}>Holiday and Break Schedule:</Text>
          </Text>
        </View>

        {nv?.holidaySchedule && Object.entries(nv.holidaySchedule).map(([key, value]) => {
          if (key === 'otherHolidays') return null;
          const name = holidayNames[key] || key;
          return (
            <View key={key} style={styles.checkboxRow}>
              <Text style={styles.checkboxLabel}>
                {name}: {formatNvHolidayOption(value as string)}
              </Text>
            </View>
          );
        })}

        {nv?.breakSchedule && Object.entries(nv.breakSchedule).map(([key, value]) => {
          const name = breakNames[key] || key;
          return (
            <View key={key} style={styles.checkboxRow}>
              <Text style={styles.checkboxLabel}>
                {name}: {formatNvHolidayOption(value as string)}
              </Text>
            </View>
          );
        })}

        {/* CHILD SUPPORT */}
        <Text style={styles.sectionTitle}>CHILD SUPPORT</Text>

        {/* Income Info */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            <Text style={styles.bold}>Plaintiff&apos;s Income: </Text>
            {nv?.plaintiffIncome ? `${formatCurrency(nv.plaintiffIncome)} ${formatPayFrequency(nv.plaintiffPayFrequency)}` : 'Not provided'}
            {nv?.plaintiffMonthlyIncome ? ` (${formatCurrency(nv.plaintiffMonthlyIncome)}/month)` : ''}
            {nv?.plaintiffBelowMinimum ? ' — Below minimum wage threshold ($1,995/month)' : ''}
          </Text>
        </View>

        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            <Text style={styles.bold}>Defendant&apos;s Income: </Text>
            {nv?.defendantPayFrequency === 'unknown'
              ? 'Unknown to Plaintiff'
              : nv?.defendantIncome
                ? `${formatCurrency(nv.defendantIncome)} ${formatPayFrequency(nv.defendantPayFrequency)}`
                : 'Not provided'}
            {nv?.defendantMonthlyIncome ? ` (${formatCurrency(nv.defendantMonthlyIncome)}/month)` : ''}
            {nv?.defendantBelowMinimum ? ' — Below minimum wage threshold ($1,995/month)' : ''}
          </Text>
        </View>

        {/* Existing CSE Order */}
        {nv?.hasExistingCseOrder && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              There is an existing child support enforcement (CSE) order. Case No.: {nv.cseCaseNumber || '___________'}.
              {nv.csePayingParent === 'plaintiff' ? ' Plaintiff' : ' Defendant'} is the paying parent, in the amount of {formatCurrency(nv.cseMonthlyAmount)}/month.
            </Text>
          </View>
        )}

        {/* Seeking Child Support */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            {nv?.seekingChildSupport
              ? 'Plaintiff requests that the Court order child support pursuant to NRS Chapter 125B.'
              : 'Plaintiff is not seeking a child support order at this time.'}
          </Text>
        </View>

        {/* Public Assistance */}
        {nv?.hasPublicAssistance && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              The minor child(ren) are currently receiving public assistance.
            </Text>
          </View>
        )}

        {/* Back Child Support */}
        {nv?.seekingBackChildSupport && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              Plaintiff requests back child support from {nv.backCsPayingParent === 'plaintiff' ? 'Plaintiff' : 'Defendant'} beginning {nv.backCsStartDate ? formatDate(nv.backCsStartDate) : '___________'}.
              {nv.backCsDaHandling ? ` The District Attorney is handling this matter under Case No. ${nv.backCsDaCaseNumber || '___________'}.` : ''}
            </Text>
          </View>
        )}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 4: CHILD SUPPORT CONT, PROPERTY, DEBTS ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case No.: </Text>
          <Text style={{ fontSize: 10 }}>{caseNumber || '___________'}</Text>
        </View>

        {/* Child Care */}
        {nv?.hasChildCareExpenses && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              Child care expenses are {formatCurrency(nv.childCareMonthlyAmount)}/month, currently paid by {nv.childCarePaidBy === 'me' ? 'Plaintiff' : nv.childCarePaidBy === 'defendant' ? 'Defendant' : 'both parties'}.
            </Text>
          </View>
        )}

        {/* Medical Insurance */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            {nv?.medicalInsuranceType === 'medicaid'
              ? 'The minor child(ren) are currently covered by Medicaid.'
              : `The minor child(ren) have private health insurance. The children-only premium is ${formatCurrency(nv?.medicalPremiumAmount)}/month, paid by ${nv?.medicalPremiumPaidBy === 'me' ? 'Plaintiff' : nv?.medicalPremiumPaidBy === 'defendant' ? 'Defendant' : 'both parties'}.`}
          </Text>
        </View>

        {/* Special Factors */}
        {nv && nv.childSupportFactors.length > 0 && (
          <>
            <View style={styles.numberedRow}>
              <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
              <Text style={styles.paragraphContent}>
                The following special factors should be considered in determining child support:
              </Text>
            </View>
            {nv.childSupportFactors.map((factor, idx) => (
              <View key={idx} style={styles.checkboxRow}>
                <Checkbox checked={true} />
                <Text style={styles.checkboxLabel}>{formatChildSupportFactor(factor)}</Text>
              </View>
            ))}
            {nv.deviationAmount && (
              <View style={styles.bodyTextIndent}>
                <Text style={styles.bodyText}>
                  Plaintiff requests a deviation in the amount of {formatCurrency(nv.deviationAmount)}/month from the presumptive child support amount.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Tax Deductions */}
        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            <Text style={styles.bold}>Tax Dependency Exemptions: </Text>
            {formatTaxDeductionOption(nv?.taxDeductionOption || 'per_federal_law')}
            {nv?.taxDeductionOption === 'split' && nv?.taxDeductionPlaintiffChildren ? `. Plaintiff claims: ${nv.taxDeductionPlaintiffChildren}` : ''}
            {nv?.taxDeductionOption === 'split' && nv?.taxDeductionDefendantChildren ? `. Defendant claims: ${nv.taxDeductionDefendantChildren}` : ''}
            {nv?.taxDeductionOption === 'alternate' && nv?.taxDeductionPlaintiffYears ? `. Plaintiff claims in ${nv.taxDeductionPlaintiffYears} years.` : ''}
            .
          </Text>
        </View>

        {/* COMMUNITY PROPERTY */}
        <Text style={styles.sectionTitle}>COMMUNITY PROPERTY AND DEBTS</Text>

        {/* Real Estate */}
        {property.hasRealEstate && property.realEstate.length > 0 && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              <Text style={styles.bold}>Real Property: </Text>
              The parties own the following real property:
              {property.realEstate.map((home, idx) => (
                ` ${idx + 1}) ${home.address} — ${formatDivisionOption(home.divisionOption)}`
              )).join(';')}.
            </Text>
          </View>
        )}

        {/* Bank Accounts */}
        {property.bankAccountsStructured && property.bankAccountsStructured.length > 0 && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              <Text style={styles.bold}>Bank Accounts: </Text>
              {property.bankAccountsStructured.map((acct, idx) => (
                `${idx + 1}) ${acct.description} — ${acct.division === 'i_keep' ? 'Plaintiff' : acct.division === 'spouse_keeps' ? 'Defendant' : 'Split 50/50'}`
              )).join('; ')}.
            </Text>
          </View>
        )}

        {/* Retirement */}
        {property.hasRetirement && property.retirement.length > 0 && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              <Text style={styles.bold}>Retirement Accounts: </Text>
              {property.retirement.map((ret, idx) => (
                `${idx + 1}) ${ret.accountType}${ret.accountTypeOther ? ` (${ret.accountTypeOther})` : ''}, Owner: ${formatTitledTo(ret.ownerName)}, Admin: ${ret.administrator}, Proposed: ${ret.proposedDivision}`
              )).join('; ')}.
            </Text>
          </View>
        )}

        {/* Vehicles */}
        {property.hasVehicles && property.vehicles.length > 0 && (
          <>
            <View style={styles.numberedRow}>
              <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
              <Text style={styles.paragraphContent}>
                <Text style={styles.bold}>Vehicles: </Text>
              </Text>
            </View>
            <View style={styles.vehicleTable}>
              <View style={styles.childrenTableHeader}>
                <Text style={[styles.childrenTableCellHeader, styles.vehicleColDesc]}>Vehicle</Text>
                <Text style={[styles.childrenTableCellHeader, styles.vehicleColTitled]}>Titled To</Text>
                <Text style={[styles.childrenTableCellHeader, styles.vehicleColLoan]}>Loan</Text>
                <Text style={[styles.childrenTableCellHeader, styles.vehicleColAward]}>Awarded To</Text>
              </View>
              {property.vehicles.map((v, idx) => (
                <View key={idx} style={styles.vehicleTableRow}>
                  <Text style={[styles.childrenTableCell, styles.vehicleColDesc]}>{v.year} {v.make} {v.model}</Text>
                  <Text style={[styles.childrenTableCell, styles.vehicleColTitled]}>{formatTitledTo(v.titledTo)}</Text>
                  <Text style={[styles.childrenTableCell, styles.vehicleColLoan]}>{v.hasLoan ? `$${v.loanBalance || '?'}` : 'None'}</Text>
                  <Text style={[styles.childrenTableCell, styles.vehicleColAward]}>{formatDivisionOption(v.divisionOption)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Personal Property */}
        {property.personalPropertyPreference && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              <Text style={styles.bold}>Personal Property: </Text>
              {property.personalPropertyPreference === 'keep_in_possession'
                ? 'Each party shall keep the personal property currently in their possession.'
                : `Plaintiff keeps: ${property.personalPropertyMine || 'N/A'}. Defendant keeps: ${property.personalPropertySpouse || 'N/A'}.`}
            </Text>
          </View>
        )}

        {/* Separate Property */}
        {property.hasSeparateProperty && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              <Text style={styles.bold}>Separate Property: </Text>
              {property.petitionerSeparateProperty ? `Plaintiff's separate property: ${property.petitionerSeparateProperty}. ` : ''}
              {property.respondentSeparateProperty ? `Defendant's separate property: ${property.respondentSeparateProperty}.` : ''}
              {' '}Each party requests confirmation of their separate property.
            </Text>
          </View>
        )}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 5: DEBTS, SPOUSAL SUPPORT, WHEREFORE, VERIFICATION ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case No.: </Text>
          <Text style={{ fontSize: 10 }}>{caseNumber || '___________'}</Text>
        </View>

        {/* Community Debts */}
        {debts.hasCommunityDebt && (
          <>
            <View style={styles.numberedRow}>
              <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
              <Text style={styles.paragraphContent}>
                <Text style={styles.bold}>Community Debts: </Text>
                The parties have the following community debts:
              </Text>
            </View>

            {debts.creditCards && debts.creditCards.map((card, idx) => (
              <View key={idx} style={styles.bodyTextIndent}>
                <Text style={styles.bodyText}>
                  {String.fromCharCode(97 + idx)}) {card.description} — Awarded to: {card.awardedTo === 'me' ? 'Plaintiff' : card.awardedTo === 'spouse' ? 'Defendant' : card.awardedTo === 'split' ? 'Split equally' : card.otherDetails || 'Other'}
                </Text>
              </View>
            ))}

            {debts.hasStudentLoanDebt && (
              <View style={styles.bodyTextIndent}>
                <Text style={styles.bodyText}>
                  Student Loan Debt — {debts.studentLoanDivision === 'me' ? 'Plaintiff' : debts.studentLoanDivision === 'spouse' ? 'Defendant' : debts.studentLoanDivision === 'split' ? 'Split equally' : debts.studentLoanOtherDetails || 'Other'}
                </Text>
              </View>
            )}

            {debts.hasMedicalDebt && (
              <View style={styles.bodyTextIndent}>
                <Text style={styles.bodyText}>
                  Medical Debt — {debts.medicalDebtDivision === 'me' ? 'Plaintiff' : debts.medicalDebtDivision === 'spouse' ? 'Defendant' : debts.medicalDebtDivision === 'split' ? 'Split equally' : debts.medicalDebtOtherDetails || 'Other'}
                </Text>
              </View>
            )}

            {debts.hasOtherCommunityDebt && (
              <View style={styles.bodyTextIndent}>
                <Text style={styles.bodyText}>
                  {debts.otherCommunityDebtDescription || 'Other Debt'} — {debts.otherCommunityDebtDivision === 'me' ? 'Plaintiff' : debts.otherCommunityDebtDivision === 'spouse' ? 'Defendant' : debts.otherCommunityDebtDivision === 'split' ? 'Split equally' : debts.otherCommunityDebtOtherDetails || 'Other'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Separate Debts */}
        {debts.hasSeparateDebt && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              <Text style={styles.bold}>Separate Debts: </Text>
              {debts.petitionerSeparateDebt ? `Plaintiff's separate debts: ${debts.petitionerSeparateDebt}. ` : ''}
              {debts.respondentSeparateDebt ? `Defendant's separate debts: ${debts.respondentSeparateDebt}. ` : ''}
              Each party shall be responsible for their own separate debts.
            </Text>
          </View>
        )}

        {/* Spousal Support */}
        <Text style={styles.sectionTitle}>SPOUSAL SUPPORT</Text>

        <View style={styles.numberedRow}>
          <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
          <Text style={styles.paragraphContent}>
            {nv?.seekingSpousalSupport
              ? `Plaintiff requests that the Court order ${nv.spousalSupportPayer === 'defendant' ? 'Defendant' : 'Plaintiff'} to pay spousal support (alimony) in the amount of ${formatCurrency(nv.spousalSupportAmount)}/month.`
              : 'Neither party is seeking spousal support (alimony) at this time.'}
          </Text>
        </View>

        {/* Name Restoration */}
        {nv?.wantsNameRestoration && (
          <View style={styles.numberedRow}>
            <Text style={styles.paragraphNumber}>{nextPara()}.</Text>
            <Text style={styles.paragraphContent}>
              Plaintiff requests restoration of their former name: <Text style={styles.bold}>{nv.formerName || '___________'}</Text>.
            </Text>
          </View>
        )}

        {/* WHEREFORE */}
        <View style={styles.horizontalRule} />
        <Text style={styles.whereforeTitle}>WHEREFORE</Text>

        <Text style={styles.bodyText}>
          WHEREFORE, Plaintiff prays for judgment against Defendant as follows:
        </Text>

        <View style={styles.whereforeItem}>
          <Text style={styles.whereforeNumber}>1.</Text>
          <Text style={styles.whereforeContent}>
            That the bonds of matrimony heretofore existing between Plaintiff and Defendant be dissolved and that each party be restored to the status of an unmarried person.
          </Text>
        </View>

        <View style={styles.whereforeItem}>
          <Text style={styles.whereforeNumber}>2.</Text>
          <Text style={styles.whereforeContent}>
            That the Court grant Plaintiff the relief requested herein regarding custody, parenting time, child support, division of community property and debts, and all other matters set forth in this Complaint.
          </Text>
        </View>

        <View style={styles.whereforeItem}>
          <Text style={styles.whereforeNumber}>3.</Text>
          <Text style={styles.whereforeContent}>
            For such other and further relief as the Court deems just and proper.
          </Text>
        </View>

        {/* VERIFICATION */}
        <View style={styles.horizontalRule} />
        <Text style={styles.verificationTitle}>VERIFICATION</Text>

        <Text style={styles.oathText}>
          I, {petitioner.name}, am the Plaintiff in the above-entitled action. I have read the foregoing Complaint for Divorce and know the contents thereof. The same is true of my own knowledge, except as to those matters which are therein stated on information and belief, and as to those matters, I believe them to be true.
        </Text>

        <Text style={styles.oathText}>
          I declare under penalty of perjury under the laws of the State of Nevada that the foregoing is true and correct.
        </Text>

        {/* Signature Block */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>Dated: </Text>
            <Text style={styles.signatureLine}>{new Date().toLocaleDateString('en-US')}</Text>
          </View>
          <View style={{ marginTop: 24 }}>
            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}></Text>
              <Text style={styles.signatureLine}></Text>
            </View>
            <Text style={{ fontSize: 10, textAlign: 'right' }}>{petitioner.name}, Plaintiff</Text>
          </View>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
