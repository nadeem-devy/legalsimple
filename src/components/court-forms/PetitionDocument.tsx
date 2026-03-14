import { Document, Page, View, Text } from '@react-pdf/renderer';
import { petitionStyles as styles } from '@/lib/court-forms/PetitionStyles';
import { NormalizedPDFData, formatMaintenanceReason } from '@/lib/court-forms/data-mapper';

interface PetitionDocumentProps {
  data: NormalizedPDFData;
  caseNumber?: string;
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={checked ? styles.checkboxChecked : styles.checkbox}>
      {checked && <Text style={styles.checkmark}>X</Text>}
    </View>
  );
}

function parseAddress(address: string): { street: string; cityStateZip: string } {
  if (!address) return { street: '', cityStateZip: '' };
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return { street: parts[0], cityStateZip: parts.slice(1).join(', ') };
  }
  return { street: address, cityStateZip: '' };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    // Parse date parts directly to avoid timezone issues
    const parts = dateStr.split(/[-/T]/);
    if (parts.length >= 3) {
      const month = parts[1].padStart(2, '0');
      const day = parts[2].substring(0, 2).padStart(2, '0');
      const year = parts[0];
      return `${month}/${day}/${year}`;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'America/Phoenix' });
  } catch {
    return dateStr;
  }
}

function formatDivisionOption(option: string): string {
  switch (option) {
    case 'i_keep': return 'Petitioner';
    case 'spouse_keeps': return 'Respondent';
    case 'sell_split': return 'Sell & Split';
    default: return option || '';
  }
}

function formatTitledTo(titledTo: string): string {
  switch (titledTo) {
    case 'me': return 'Petitioner';
    case 'spouse': return 'Respondent';
    case 'both': return 'Both';
    default: return titledTo || '';
  }
}

// Format bank account description: "Bank of America 4564" → "the Bank of America bank account ending in 4564"
function formatBankAccountDescription(description: string): string {
  const parts = description.trim().split(/\s+/);
  if (parts.length === 0) return description;
  const lastPart = parts[parts.length - 1];
  const isAccountNumber = /^\d+$/.test(lastPart) || /^[Xx]+$/.test(lastPart);
  if (isAccountNumber && parts.length > 1) {
    const bankName = parts.slice(0, -1).join(' ');
    if (/^[Xx]+$/.test(lastPart)) {
      return `${bankName} bank account (account number unknown)`;
    }
    return `${bankName} bank account ending in ${lastPart}`;
  }
  return `${description} bank account`;
}

// Format maintenance reason as a complete sentence with party context
function formatMaintenanceReasonSentence(reason: string, party: string): string {
  switch (reason) {
    case 'lack_property': return `${party} lacks sufficient property to provide for reasonable needs`;
    case 'lack_earning': return `${party} lacks earning ability adequate to be self-sufficient`;
    case 'contributed_spouse': return `${party} made significant contributions to the other party's education or career`;
    case 'contributed_me': return `The other party made significant contributions to ${party}'s education or career`;
    case 'long_marriage': return `The long duration of the marriage and ${party}'s age preclude adequate employment`;
    case 'parent_child': return `${party} is the custodial parent of a child whose age or condition is such that ${party} should not be required to seek employment outside the home`;
    default: return formatMaintenanceReason(reason);
  }
}

// Check if "other orders" is a negative/empty response
function hasActualOtherOrders(otherOrders: string | undefined): boolean {
  if (!otherOrders) return false;
  const normalized = otherOrders.toLowerCase().trim();
  if (normalized.length === 0) return false;
  return !['no', 'none', 'n/a', 'na', 'nothing', 'no.', 'none.', 'nope', 'not at this time'].includes(normalized);
}

export function PetitionDocument({ data, caseNumber }: PetitionDocumentProps) {
  const { petitioner, respondent, marriage, property, debts, taxFiling, maintenance } = data;
  const hasChildren = data.caseType === 'divorce_with_children';
  const children = data.children;
  const custody = data.custody;
  const parentingTime = data.parentingTime;
  const childSupport = data.childSupport;
  const safetyIssues = data.safetyIssues;
  const nameRestoration = data.nameRestoration;
  const county = petitioner.county || 'Maricopa';
  const petAddr = parseAddress(petitioner.address);
  const resAddr = parseAddress(respondent.address);

  // Build section numbers dynamically based on variant
  let sectionNum = 0;
  const nextSection = () => ++sectionNum;

  return (
    <Document
      title={`Petition for Dissolution - ${petitioner.name} v. ${respondent.name}`}
      author="LegalSimple"
      subject="Petition for Dissolution of Marriage"
      creator="LegalSimple Court Forms"
    >
      {/* ==================== PAGE 1 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Top section: Person Filing + Clerk Box */}
        <View style={styles.topSection}>
          <View style={styles.personFilingBlock}>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Person Filing:</Text>
              <Text style={styles.personFilingValue}>{petitioner.name || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Address (if not protected):</Text>
              <Text style={styles.personFilingValue}>{petAddr.street}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>City, State, Zip Code:</Text>
              <Text style={styles.personFilingValue}>{petAddr.cityStateZip}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Telephone:</Text>
              <Text style={styles.personFilingValue}>{petitioner.phone || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Email Address:</Text>
              <Text style={styles.personFilingValue}>{petitioner.email || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>ATLAS Number:</Text>
              <Text style={styles.personFilingValue}>{''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Lawyer&apos;s Bar Number:</Text>
              <Text style={styles.personFilingValue}>{''}</Text>
            </View>
          </View>

          <View style={styles.clerkBox}>
            <Text style={styles.clerkBoxLabel}>For Clerk&apos;s Use Only</Text>
          </View>
        </View>

        {/* Representing Row */}
        <View style={styles.representingRow}>
          <Text style={styles.representingLabel}>Representing</Text>
          <Checkbox checked={true} />
          <Text style={styles.checkboxLabel}>Self, without a Lawyer</Text>
          <Text style={styles.checkboxLabel}>OR</Text>
          <Checkbox checked={false} />
          <Text style={styles.checkboxLabel}>Attorney for</Text>
          <Checkbox checked={true} />
          <Text style={styles.checkboxLabel}>Petitioner</Text>
          <Text style={styles.checkboxLabel}>OR</Text>
          <Checkbox checked={false} />
          <Text style={styles.checkboxLabel}>Respondent</Text>
        </View>

        {/* Court Header */}
        <View style={styles.courtHeader}>
          <Text style={styles.courtHeaderLine}>SUPERIOR COURT OF ARIZONA</Text>
          <Text style={styles.courtHeaderLine}>IN {county.toUpperCase()} COUNTY</Text>
        </View>

        {/* Case Caption */}
        <View style={styles.captionSection}>
          <View style={styles.captionRow}>
            <View style={styles.captionLeft}>
              <Text style={styles.captionUnderline}>{petitioner.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Petitioner/Party A</Text>
              <Text style={styles.captionAnd}>{''}</Text>
              <Text style={styles.captionUnderline}>{respondent.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Respondent/Party B</Text>
            </View>

            <View style={styles.captionRight}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.caseNoLabel}>Case Number: </Text>
                <Text style={[styles.caseNoValue, { borderBottomWidth: 1, borderBottomColor: '#000', minWidth: 140, paddingBottom: 2 }]}>{caseNumber || ''}</Text>
              </View>
              <Text style={styles.documentTitle}>
                PETITION FOR DISSOLUTION OF {hasChildren ? 'A NON-COVENANT MARRIAGE (DIVORCE) WITH MINOR CHILDREN' : 'A NON-COVENANT MARRIAGE (DIVORCE) WITHOUT CHILDREN'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 1: Information About Me */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>INFORMATION ABOUT ME (THE PETITIONER/PARTY A)</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Name:</Text>
          <Text style={styles.fieldLine}>{petitioner.name}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date of Birth:</Text>
          <Text style={styles.fieldLine}>{formatDate(petitioner.dateOfBirth)}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Address:</Text>
          <Text style={styles.fieldLine}>{petitioner.address}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Telephone:</Text>
          <Text style={styles.fieldLineShort}>{petitioner.phone || ''}</Text>
          <Text style={{ fontSize: 10, width: 50, textAlign: 'right' }}>Email:</Text>
          <Text style={styles.fieldLine}>{petitioner.email || ''}</Text>
        </View>

        {/* Section 2: Information About My Spouse */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>INFORMATION ABOUT MY SPOUSE (THE RESPONDENT/PARTY B)</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Name:</Text>
          <Text style={styles.fieldLine}>{respondent.name}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date of Birth:</Text>
          <Text style={styles.fieldLine}>{formatDate(respondent.dateOfBirth)}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Address:</Text>
          <Text style={styles.fieldLine}>{respondent.address}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Telephone:</Text>
          <Text style={styles.fieldLineShort}>{respondent.phone || ''}</Text>
          <Text style={{ fontSize: 10, width: 50, textAlign: 'right' }}>Email:</Text>
          <Text style={styles.fieldLine}>{respondent.email || ''}</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 2 ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case Number: </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        {/* Section 3: Information About the Marriage */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>INFORMATION ABOUT THE MARRIAGE</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date of Marriage:</Text>
          <Text style={styles.fieldLine}>{formatDate(marriage.date)}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Place of Marriage:</Text>
          <Text style={styles.fieldLine}>
            {marriage.county && marriage.state
              ? `${marriage.county} County, State of ${marriage.state}`
              : marriage.county || ''}
          </Text>
        </View>

        <View style={styles.bodyText}>
          <Text>The marriage is irretrievably broken and there is no reasonable prospect of reconciliation.</Text>
        </View>

        {/* Section 4: Venue */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>VENUE</Text>
        </View>

        <View style={styles.bodyText}>
          <Text>This Petition is filed in {county} County because:</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={true} />
          <Text style={styles.inlineCheckboxLabel}>Petitioner is a resident of {county} County.</Text>
        </View>

        {/* Section 5: 90-Day Requirement */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>90-DAY REQUIREMENT</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={marriage.meetsResidency} />
          <Text style={styles.inlineCheckboxLabel}>
            At the time of filing, {petitioner.name || 'Petitioner'} has been domiciled in the State of Arizona or has been stationed at a military facility in Arizona for at least 90 days prior to filing this petition.
          </Text>
        </View>

        {/* Section 6: Domestic Violence */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>DOMESTIC VIOLENCE</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!safetyIssues?.hasDomesticViolence} />
          <Text style={styles.inlineCheckboxLabel}>There are no domestic violence issues.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={safetyIssues?.hasDomesticViolence || false} />
          <Text style={styles.inlineCheckboxLabel}>
            There is a history of domestic violence.{safetyIssues?.domesticViolenceExplanation ? ` ${safetyIssues.domesticViolenceExplanation}` : ''}
          </Text>
        </View>

        {/* Section 7: Children (only for with-children variant) */}
        {hasChildren && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionNumber}>{nextSection()}.</Text>
              <Text style={styles.sectionTitle}>CHILDREN</Text>
            </View>

            <View style={styles.inlineCheckboxRow}>
              <Checkbox checked={true} />
              <Text style={styles.inlineCheckboxLabel}>
                {marriage.isPregnant
                  ? `${marriage.pregnantParty === 'petitioner' ? 'Petitioner' : 'Respondent'} IS pregnant.`
                  : 'Neither party is currently pregnant.'}
              </Text>
            </View>

            <View style={styles.bodyText}>
              <Text>
                The minor child(ren) of both parties or born during the marriage are listed below:
              </Text>
            </View>
          </>
        )}

        {!hasChildren && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionNumber}>{nextSection()}.</Text>
              <Text style={styles.sectionTitle}>CHILDREN / PREGNANCY</Text>
            </View>

            <View style={styles.inlineCheckboxRow}>
              <Checkbox checked={true} />
              <Text style={styles.inlineCheckboxLabel}>
                There are no minor children of this marriage.
              </Text>
            </View>
            <View style={styles.inlineCheckboxRow}>
              <Checkbox checked={!marriage.isPregnant} />
              <Text style={styles.inlineCheckboxLabel}>
                Neither party is currently pregnant.
              </Text>
            </View>
            <View style={styles.inlineCheckboxRow}>
              <Checkbox checked={marriage.isPregnant} />
              <Text style={styles.inlineCheckboxLabel}>
                {marriage.pregnantParty === 'petitioner' ? 'Petitioner' : 'Respondent'} IS currently pregnant.
              </Text>
            </View>
          </>
        )}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 3 (Children Table - only with children) ==================== */}
      {hasChildren && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.pageTopCaseNo}>
            <Text style={styles.caseNoLabel}>Case Number: </Text>
            <Text style={styles.caseNoValue}>{''}</Text>
          </View>

          <View style={styles.bodyText}>
            <Text style={styles.bold}>Children of this Marriage:</Text>
          </View>

          {/* Children Table */}
          <View style={styles.childrenTable}>
            <View style={styles.childrenTableHeader}>
              <Text style={[styles.childrenTableCellHeader, styles.childColName]}>Name of Child</Text>
              <Text style={[styles.childrenTableCellHeader, styles.childColDob]}>Date of Birth</Text>
              <Text style={[styles.childrenTableCellHeader, styles.childColAddress]}>Address</Text>
              <Text style={[styles.childrenTableCellHeader, styles.childColBorn]}>Born Prior to Marriage?</Text>
            </View>
            {children?.list && children.list.length > 0 ? (
              children.list.map((child, i) => (
                <View key={i} style={styles.childrenTableRow}>
                  <Text style={[styles.childrenTableCell, styles.childColName]}>{child.name}</Text>
                  <Text style={[styles.childrenTableCell, styles.childColDob]}>{formatDate(child.dateOfBirth)}</Text>
                  <Text style={[styles.childrenTableCell, styles.childColAddress]}>{petitioner.address}</Text>
                  <Text style={[styles.childrenTableCell, styles.childColBorn]}>{child.bornBeforeMarriage ? 'Yes' : 'No'}</Text>
                </View>
              ))
            ) : (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View key={i} style={styles.childrenTableRow}>
                    <Text style={[styles.childrenTableCell, styles.childColName]}>{''}</Text>
                    <Text style={[styles.childrenTableCell, styles.childColDob]}>{''}</Text>
                    <Text style={[styles.childrenTableCell, styles.childColAddress]}>{''}</Text>
                    <Text style={[styles.childrenTableCell, styles.childColBorn]}>{''}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Residency of children */}
          <View style={styles.bodyText}>
            <Text>
              The child(ren) {children?.meetResidency ? 'have' : 'have not'} resided in Arizona for at least six (6) months prior to filing this Petition.
            </Text>
          </View>

          <View style={styles.bodyText}>
            <Text>
              The child(ren) currently reside with:{' '}
              {children?.resideWith === 'petitioner' ? petitioner.name :
               children?.resideWith === 'respondent' ? respondent.name :
               'Both parties'}
            </Text>
          </View>

          {/* Born before marriage */}
          {children?.bornBeforeMarriage && (
            <View style={styles.bodyText}>
              <Text>
                The following children were born prior to the marriage: {children.bornBeforeMarriageNames || 'See table above'}
              </Text>
            </View>
          )}

          {/* Pregnancy */}
          <View style={styles.bodyText}>
            <Text>
              {marriage.isPregnant
                ? `${marriage.pregnantParty === 'petitioner' ? 'Petitioner' : 'Respondent'} IS currently pregnant.`
                : 'Neither party is currently pregnant.'}
            </Text>
          </View>

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      )}

      {/* ==================== PAGE 4: Property and Debts Intro / Real Estate ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case Number: </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        {/* Section: Property and Debts */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>PROPERTY AND DEBTS</Text>
        </View>

        <View style={styles.bodyText}>
          <Text>
            The Petitioner states that the following community, joint, and separate property and debts are known to the Petitioner:
          </Text>
        </View>

        {/* Written Agreement */}
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={property.hasAgreement} />
          <Text style={styles.inlineCheckboxLabel}>
            The parties have a written agreement for division of all property and debts.
          </Text>
        </View>
        {property.hasAgreement && property.agreementDetails && (
          <View style={styles.bodyText}>
            <Text><Text style={styles.bold}>Agreement Details:</Text> {property.agreementDetails}</Text>
          </View>
        )}
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!property.hasAgreement} />
          <Text style={styles.inlineCheckboxLabel}>
            The parties do NOT have a written agreement for division of all property and debts.
          </Text>
        </View>

        {/* Community Property - Real Estate */}
        <View style={styles.subsectionRow}>
          <Text style={styles.subsectionLabel}>a.</Text>
          <Text style={[styles.subsectionContent, styles.bold]}>Community/Joint Property — Real Estate</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!property.hasRealEstate} />
          <Text style={styles.inlineCheckboxLabel}>We do NOT own any real estate.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={property.hasRealEstate} />
          <Text style={styles.inlineCheckboxLabel}>We own the following real estate:</Text>
        </View>

        {property.hasRealEstate && property.realEstate.length > 0 && (
          property.realEstate.map((home, i) => (
            <View key={i} style={[styles.fieldRow, { marginLeft: 36 }]}>
              <Text style={styles.fieldLabel}>Property {i + 1}:</Text>
              <Text style={styles.fieldLine}>
                {home.address} — {home.divisionOption === 'i_keep' ? 'Awarded to Petitioner, and any debt attached thereto as sole and separate property and debt' : home.divisionOption === 'spouse_keeps' ? 'Awarded to Respondent, and any debt attached thereto as sole and separate property and debt' : 'Sell and divide proceeds equally'}
              </Text>
            </View>
          ))
        )}

        {/* Personal Property */}
        <View style={styles.subsectionRow}>
          <Text style={styles.subsectionLabel}>b.</Text>
          <Text style={[styles.subsectionContent, styles.bold]}>Personal Property (Furniture, Furnishings, Appliances &gt;$200)</Text>
        </View>

        {property.personalPropertyPreference === 'keep_in_possession' ? (
          <View style={styles.inlineCheckboxRow}>
            <Checkbox checked={true} />
            <Text style={styles.inlineCheckboxLabel}>Each party shall keep the personal property currently in his/her possession as sole and separate property.</Text>
          </View>
        ) : property.personalPropertyPreference === 'itemize' ? (
          <>
            <View style={styles.inlineCheckboxRow}>
              <Checkbox checked={true} />
              <Text style={styles.inlineCheckboxLabel}>The parties wish to itemize the allocation of personal property:</Text>
            </View>
            {property.personalPropertyMine && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text><Text style={styles.bold}>Petitioner&apos;s items:</Text> {property.personalPropertyMine}</Text>
              </View>
            )}
            {property.personalPropertySpouse && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text><Text style={styles.bold}>Respondent&apos;s items:</Text> {property.personalPropertySpouse}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.inlineCheckboxRow}>
              <Checkbox checked={!property.hasFurniture && !property.hasAppliances} />
              <Text style={styles.inlineCheckboxLabel}>We do NOT own any household items valued over $200.</Text>
            </View>
            <View style={styles.inlineCheckboxRow}>
              <Checkbox checked={property.hasFurniture || property.hasAppliances} />
              <Text style={styles.inlineCheckboxLabel}>We own household items valued over $200.</Text>
            </View>
          </>
        )}

        {/* Bank Accounts */}
        <View style={styles.subsectionRow}>
          <Text style={styles.subsectionLabel}>c.</Text>
          <Text style={[styles.subsectionContent, styles.bold]}>Bank Accounts</Text>
        </View>

        {property.bankAccountsStructured && property.bankAccountsStructured.length > 0 ? (
          <>
            <View style={styles.inlineCheckboxRow}>
              <Checkbox checked={true} />
              <Text style={styles.inlineCheckboxLabel}>The parties opened the following bank accounts during the marriage:</Text>
            </View>
            {property.bankAccountsStructured.map((acct, i) => (
              <View key={i} style={[styles.fieldRow, { marginLeft: 36 }]}>
                <Text style={styles.fieldLabel}>{formatBankAccountDescription(acct.description)}:</Text>
                <Text style={styles.fieldLine}>
                  {acct.division === 'i_keep' ? 'Awarded to Petitioner' : acct.division === 'spouse_keeps' ? 'Awarded to Respondent' : 'Divided equally'}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.inlineCheckboxRow}>
            <Checkbox checked={true} />
            <Text style={styles.inlineCheckboxLabel}>The parties did not open any bank accounts during the marriage.</Text>
          </View>
        )}

        {/* Pension/Retirement/Life Insurance */}
        <View style={styles.subsectionRow}>
          <Text style={styles.subsectionLabel}>d.</Text>
          <Text style={[styles.subsectionContent, styles.bold]}>Pension, Retirement, and Life Insurance</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!property.hasRetirement} />
          <Text style={styles.inlineCheckboxLabel}>Neither party has retirement, pension, or life insurance.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={property.hasRetirement} />
          <Text style={styles.inlineCheckboxLabel}>The parties have the following retirement/pension accounts:</Text>
        </View>

        {property.hasRetirement && property.retirement.length > 0 && (
          property.retirement.map((acct, i) => (
            <View key={i} style={[styles.fieldRow, { marginLeft: 36 }]}>
              <Text style={styles.fieldLabel}>Account {i + 1}:</Text>
              <Text style={styles.fieldLine}>
                {acct.accountType}{acct.accountTypeOther ? ` (${acct.accountTypeOther})` : ''} — Owner: {acct.ownerName === 'me' ? 'Petitioner' : 'Respondent'} — Admin: {acct.administrator} — Division: {acct.proposedDivision === 'i_keep' ? 'Awarded to Petitioner' : acct.proposedDivision === 'spouse_keeps' ? 'Awarded to Respondent' : acct.proposedDivision === 'split_50_50' ? 'Community portion divided equally' : acct.proposedDivision}
              </Text>
            </View>
          ))
        )}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 5: Vehicles / Separate Property ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case Number: </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        {/* Motor Vehicles */}
        <View style={styles.subsectionRow}>
          <Text style={styles.subsectionLabel}>e.</Text>
          <Text style={[styles.subsectionContent, styles.bold]}>Motor Vehicles</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!property.hasVehicles} />
          <Text style={styles.inlineCheckboxLabel}>The parties do NOT own any motor vehicles.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={property.hasVehicles} />
          <Text style={styles.inlineCheckboxLabel}>The parties own the following motor vehicles:</Text>
        </View>

        {property.hasVehicles && property.vehicles.length > 0 && (
          <View style={styles.vehicleTable}>
            <View style={[styles.childrenTableHeader]}>
              <Text style={[styles.childrenTableCellHeader, styles.vehicleColDesc]}>Year / Make / Model</Text>
              <Text style={[styles.childrenTableCellHeader, styles.vehicleColTitled]}>Titled To</Text>
              <Text style={[styles.childrenTableCellHeader, styles.vehicleColLoan]}>Loan?</Text>
              <Text style={[styles.childrenTableCellHeader, styles.vehicleColAward]}>Award To</Text>
            </View>
            {property.vehicles.map((v, i) => (
              <View key={i} style={styles.vehicleTableRow}>
                <Text style={[styles.childrenTableCell, styles.vehicleColDesc]}>{v.year} {v.make} {v.model}</Text>
                <Text style={[styles.childrenTableCell, styles.vehicleColTitled]}>{formatTitledTo(v.titledTo)}</Text>
                <Text style={[styles.childrenTableCell, styles.vehicleColLoan]}>{v.hasLoan ? `Yes${v.loanBalance ? ` ($${v.loanBalance})` : ''}` : 'No'}</Text>
                <Text style={[styles.childrenTableCell, styles.vehicleColAward]}>{formatDivisionOption(v.divisionOption)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Separate Property */}
        <View style={styles.subsectionRow}>
          <Text style={styles.subsectionLabel}>f.</Text>
          <Text style={[styles.subsectionContent, styles.bold]}>Separate Property</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!property.hasSeparateProperty} />
          <Text style={styles.inlineCheckboxLabel}>Neither party has separate property.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={property.hasSeparateProperty} />
          <Text style={styles.inlineCheckboxLabel}>The parties have the following separate property:</Text>
        </View>

        {property.hasSeparateProperty && (
          <>
            {property.petitionerSeparateProperty && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text><Text style={styles.bold}>Petitioner&apos;s:</Text> {property.petitionerSeparateProperty}</Text>
              </View>
            )}
            {property.respondentSeparateProperty && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text><Text style={styles.bold}>Respondent&apos;s:</Text> {property.respondentSeparateProperty}</Text>
              </View>
            )}
          </>
        )}

        {/* Community Debts */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>COMMUNITY DEBTS</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!debts.hasCommunityDebt} />
          <Text style={styles.inlineCheckboxLabel}>The parties do NOT have any community debts.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={debts.hasCommunityDebt} />
          <Text style={styles.inlineCheckboxLabel}>The parties have the following community debts:</Text>
        </View>

        {debts.hasCommunityDebt && debts.communityDebtPreference === 'keep_in_name' && (
          <View style={[styles.bodyText, { marginLeft: 36 }]}>
            <Text>Each party shall keep the debts in his/her name as their sole and separate debt.</Text>
          </View>
        )}

        {debts.hasCommunityDebt && debts.communityDebtPreference === 'itemize' && (
          <>
            {debts.creditCards && debts.creditCards.length > 0 && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text style={styles.bold}>Credit Cards:</Text>
                {debts.creditCards.map((card, i) => (
                  <Text key={i}>
                    {card.description} — {card.awardedTo === 'me' ? 'Petitioner' : card.awardedTo === 'spouse' ? 'Respondent' : card.awardedTo === 'split' ? 'Divided equally' : card.otherDetails || 'Other'}
                  </Text>
                ))}
              </View>
            )}

            {debts.hasStudentLoanDebt && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text>
                  <Text style={styles.bold}>Student Loan Debt:</Text>{' '}
                  {debts.studentLoanDivision === 'me' ? 'Awarded to Petitioner' : debts.studentLoanDivision === 'spouse' ? 'Awarded to Respondent' : debts.studentLoanDivision === 'split' ? 'Divided equally' : debts.studentLoanOtherDetails || 'Other arrangement'}
                </Text>
              </View>
            )}

            {debts.hasMedicalDebt && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text>
                  <Text style={styles.bold}>Medical Debt:</Text>{' '}
                  {debts.medicalDebtDivision === 'me' ? 'Awarded to Petitioner' : debts.medicalDebtDivision === 'spouse' ? 'Awarded to Respondent' : debts.medicalDebtDivision === 'split' ? 'Divided equally' : debts.medicalDebtOtherDetails || 'Other arrangement'}
                </Text>
              </View>
            )}

            {debts.hasOtherCommunityDebt && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text>
                  <Text style={styles.bold}>Other Debt:</Text> {debts.otherCommunityDebtDescription || 'Community debt'} —{' '}
                  {debts.otherCommunityDebtDivision === 'me' ? 'Awarded to Petitioner' : debts.otherCommunityDebtDivision === 'spouse' ? 'Awarded to Respondent' : debts.otherCommunityDebtDivision === 'split' ? 'Divided equally' : debts.otherCommunityDebtOtherDetails || 'Other arrangement'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Legacy fallback for old data */}
        {debts.hasCommunityDebt && !debts.communityDebtPreference && debts.communityDebtList && (
          <View style={[styles.bodyText, { marginLeft: 36 }]}>
            <Text>{debts.communityDebtList}</Text>
          </View>
        )}
        {debts.hasCommunityDebt && !debts.communityDebtPreference && debts.communityDebtDivision && (
          <View style={[styles.bodyText, { marginLeft: 36 }]}>
            <Text><Text style={styles.bold}>Proposed Division:</Text> {debts.communityDebtDivision}</Text>
          </View>
        )}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 6: Separate Debts / Tax Returns ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case Number: </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        {/* Separate Debts */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>SEPARATE DEBTS</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!debts.hasSeparateDebt} />
          <Text style={styles.inlineCheckboxLabel}>Neither party has separate debts.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={debts.hasSeparateDebt} />
          <Text style={styles.inlineCheckboxLabel}>The parties have the following separate debts:</Text>
        </View>

        {debts.hasSeparateDebt && (
          <>
            {debts.petitionerSeparateDebt && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text><Text style={styles.bold}>Petitioner&apos;s Separate Debt:</Text> {debts.petitionerSeparateDebt}</Text>
              </View>
            )}
            {debts.respondentSeparateDebt && (
              <View style={[styles.bodyText, { marginLeft: 36 }]}>
                <Text><Text style={styles.bold}>Respondent&apos;s Separate Debt:</Text> {debts.respondentSeparateDebt}</Text>
              </View>
            )}
          </>
        )}

        {/* Tax Returns */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>TAX RETURNS</Text>
        </View>

        <View style={styles.bodyText}>
          <Text>For the current tax year, the parties intend to file:</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={taxFiling.currentYear === 'jointly'} />
          <Text style={styles.inlineCheckboxLabel}>Joint return</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={taxFiling.currentYear === 'separately'} />
          <Text style={styles.inlineCheckboxLabel}>Separate returns</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={taxFiling.hasPreviousUnfiled} />
          <Text style={styles.inlineCheckboxLabel}>There are unfiled tax returns from previous years.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!taxFiling.hasPreviousUnfiled} />
          <Text style={styles.inlineCheckboxLabel}>All prior tax returns have been filed.</Text>
        </View>

        {taxFiling.hasPreviousUnfiled && taxFiling.previousYearOption && (
          <View style={[styles.bodyText, { marginLeft: 36 }]}>
            <Text>
              {taxFiling.previousYearOption === 'file_jointly'
                ? 'For previous years, the parties shall file joint federal and state income tax returns. Both parties will pay and hold the other harmless.'
                : 'For previous years, the parties shall file separate federal and state income tax returns. Each party will pay and hold the other harmless from any income taxes incurred as a result of the filing of that party\'s tax return and each party will be awarded 100% of any refund received.'}
            </Text>
          </View>
        )}

        {/* Spousal Maintenance */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>SPOUSAL MAINTENANCE (ALIMONY)</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={maintenance.entitlement === 'neither'} />
          <Text style={styles.inlineCheckboxLabel}>Neither party is requesting spousal maintenance.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={maintenance.entitlement === 'me'} />
          <Text style={styles.inlineCheckboxLabel}>Petitioner is requesting spousal maintenance.</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={maintenance.entitlement === 'spouse'} />
          <Text style={styles.inlineCheckboxLabel}>Respondent is requesting spousal maintenance.</Text>
        </View>

        {maintenance.entitlement !== 'neither' && maintenance.reasons && maintenance.reasons.length > 0 && (
          <View style={[styles.bodyText, { marginLeft: 36 }]}>
            <Text>
              <Text style={styles.bold}>Reasons: </Text>
              {maintenance.reasons.map(r => formatMaintenanceReasonSentence(r, maintenance.entitlement === 'me' ? 'Petitioner' : 'Respondent')).join('. ')}.
            </Text>
          </View>
        )}

        {/* Name Restoration */}
        {nameRestoration?.petitionerWants && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionNumber}>{nextSection()}.</Text>
              <Text style={styles.sectionTitle}>NAME RESTORATION</Text>
            </View>
            <View style={styles.bodyText}>
              <Text>
                {petitioner.name || 'Petitioner'} requests that {petitioner.gender === 'male' ? 'his' : 'her'} former name of {nameRestoration.petitionerName || ''} be restored.
              </Text>
            </View>
          </>
        )}

        {/* Written Agreement */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>WRITTEN AGREEMENT</Text>
        </View>

        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={property.hasAgreement} />
          <Text style={styles.inlineCheckboxLabel}>
            The parties have reached a written agreement resolving all issues.
          </Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!property.hasAgreement} />
          <Text style={styles.inlineCheckboxLabel}>
            The parties have NOT reached a written agreement resolving all issues.
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== PAGE 7: Other Statements / Parenting Info (with children) ==================== */}
      {hasChildren && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.pageTopCaseNo}>
            <Text style={styles.caseNoLabel}>Case Number: </Text>
            <Text style={styles.caseNoValue}>{''}</Text>
          </View>

          {/* Parent Information Program */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionNumber}>{nextSection()}.</Text>
            <Text style={styles.sectionTitle}>OTHER STATEMENTS</Text>
          </View>

          <View style={styles.subsectionRow}>
            <Text style={styles.subsectionLabel}>a.</Text>
            <Text style={styles.subsectionContent}>
              <Text style={styles.bold}>Parent Information Program:</Text> Both parties are aware of and will comply with the requirement to attend the Parent Information Program as required by local court rules.
            </Text>
          </View>

          {/* Domestic Violence Details */}
          {safetyIssues?.hasDomesticViolence && (
            <View style={styles.subsectionRow}>
              <Text style={styles.subsectionLabel}>b.</Text>
              <Text style={styles.subsectionContent}>
                <Text style={styles.bold}>Domestic Violence:</Text>{' '}
                {safetyIssues.domesticViolenceOption === 'no_joint_decision'
                  ? `A history of domestic violence exists between the parties. Pursuant to A.R.S. §25-403.03, no joint legal decision-making should be awarded to ${safetyIssues.domesticViolenceCommittedBy === 'respondent' ? 'Respondent' : safetyIssues.domesticViolenceCommittedBy === 'petitioner' ? 'Petitioner' : 'the party who committed domestic violence'}.`
                  : safetyIssues.domesticViolenceOption === 'joint_despite_violence'
                  ? `Domestic violence has occurred in the relationship committed by ${safetyIssues.domesticViolenceCommittedBy === 'respondent' ? 'Respondent' : safetyIssues.domesticViolenceCommittedBy === 'petitioner' ? 'Petitioner' : 'a party'}, but Petitioner avers that it would still be in the best interests of the children for the parties to share joint legal decision-making.`
                  : 'A history of domestic violence exists between the parties.'}
              </Text>
            </View>
          )}

          {/* Drug/Alcohol Conviction */}
          <View style={styles.subsectionRow}>
            <Text style={styles.subsectionLabel}>{safetyIssues?.hasDomesticViolence ? 'c.' : 'b.'}</Text>
            <Text style={styles.subsectionContent}>
              <Text style={styles.bold}>Drug/Alcohol Conviction:</Text>{' '}
              {safetyIssues?.hasDrugConviction
                ? `${safetyIssues.drugConvictionParty === 'me' ? 'Petitioner' : safetyIssues.drugConvictionParty === 'spouse' ? 'Respondent' : safetyIssues.drugConvictionParty || 'A party'} has a conviction related to drug or alcohol abuse.`
                : safetyIssues?.drugConvictionUnaware
                ? `Petitioner alleges that ${data.petitioner.gender === 'female' ? 'she' : 'he'} does not have sufficient information to either affirm or deny whether Respondent has been convicted of a drug offense or driving under the influence of drugs or alcohol in the last 12 months, and affirmatively avers that ${data.petitioner.gender === 'female' ? 'she' : 'he'} has not.`
                : 'Neither party has a drug or alcohol-related conviction.'
              }
            </Text>
          </View>

          {/* Child Support */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionNumber}>{nextSection()}.</Text>
            <Text style={styles.sectionTitle}>CHILD SUPPORT</Text>
          </View>

          <View style={styles.inlineCheckboxRow}>
            <Checkbox checked={childSupport?.seeking || false} />
            <Text style={styles.inlineCheckboxLabel}>Petitioner is requesting that child support be ordered.</Text>
          </View>
          <View style={styles.inlineCheckboxRow}>
            <Checkbox checked={!childSupport?.seeking} />
            <Text style={styles.inlineCheckboxLabel}>Petitioner is NOT requesting child support at this time.</Text>
          </View>

          {childSupport?.hasVoluntaryPayments && (
            <View style={[styles.bodyText, { marginLeft: 36 }]}>
              <Text>
                <Text style={styles.bold}>Voluntary Payments:</Text> {childSupport.voluntaryPaymentsDetails || 'Voluntary child support payments have been made.'}
              </Text>
            </View>
          )}

          {childSupport?.pastSupportPeriod && (
            <View style={[styles.bodyText, { marginLeft: 36 }]}>
              <Text>
                <Text style={styles.bold}>Past Support Period:</Text> {childSupport.pastSupportPeriod}
              </Text>
            </View>
          )}

          {/* Health Insurance */}
          {childSupport?.healthInsuranceProvider && (
            <View style={styles.bodyText}>
              <Text>
                <Text style={styles.bold}>Health Insurance:</Text>{' '}
                {childSupport.healthInsuranceProvider === 'petitioner'
                  ? 'Petitioner shall provide medical/health insurance for the minor child/children.'
                  : childSupport.healthInsuranceProvider === 'respondent'
                  ? 'Respondent shall provide medical/health insurance for the minor child/children.'
                  : 'Both parties shall provide medical insurance for the minor child/children.'}
              </Text>
            </View>
          )}

          {/* Extracurricular Activities */}
          {data.extracurricular && data.extracurricular.option !== 'none' && (
            <View style={styles.bodyText}>
              <Text style={styles.bold}>Extracurricular Activities:</Text>
              <Text>
                {data.extracurricular.option === 'both_agree_split'
                  ? 'Both parties must agree to any extracurricular activities for the children, and costs shall be split equally between the parties.'
                  : data.extracurricular.option === 'each_selects_pays'
                  ? 'Each parent may select and enroll the children in extracurricular activities during their parenting time, and each parent shall be responsible for the costs of activities they select.'
                  : data.extracurricular.option === 'each_selects_limit_split'
                  ? `Each parent may select and enroll the children in extracurricular activities, up to ${data.extracurricular.limit || 'a reasonable number'} activities per year. Costs shall be split equally between the parties.`
                  : data.extracurricular.option === 'other' && data.extracurricular.otherDetails
                  ? data.extracurricular.otherDetails
                  : 'Extracurricular activities shall be determined in the best interests of the children.'}
              </Text>
            </View>
          )}
          {data.extracurricular && data.extracurricular.option === 'none' && (
            <View style={styles.bodyText}>
              <Text style={styles.bold}>Extracurricular Activities:</Text>
              <Text>
                The Petitioner does not wish to include the involvement of the children in any extracurricular activities at this time.
              </Text>
            </View>
          )}

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      )}

      {/* ==================== REQUESTS TO THE COURT ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case Number: </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>REQUESTS TO THE COURT</Text>
        </View>

        <View style={styles.bodyText}>
          <Text>I respectfully request that the Court grant the following:</Text>
        </View>

        {(() => {
          let reqNum = 1;
          return (
            <>
              {/* Request: Dissolution */}
              <View style={styles.requestRow}>
                <Text style={styles.requestNumber}>{reqNum++}.</Text>
                <Text style={styles.requestContent}>
                  Dissolve the marriage of Petitioner and Respondent.
                </Text>
              </View>

              {/* Restore Petitioner's Name */}
              {nameRestoration?.petitionerWants && (
                <View style={styles.requestRow}>
                  <Text style={styles.requestNumber}>{reqNum++}.</Text>
                  <Text style={styles.requestContent}>
                    Restore Petitioner&apos;s former name: {nameRestoration.petitionerName || ''}.
                  </Text>
                </View>
              )}

              {/* Restore Respondent's Name */}
              {nameRestoration?.respondentWants && (
                <View style={styles.requestRow}>
                  <Text style={styles.requestNumber}>{reqNum++}.</Text>
                  <Text style={styles.requestContent}>
                    Restore Respondent&apos;s former name: {nameRestoration.respondentName || ''}.
                  </Text>
                </View>
              )}

              {/* Children-specific requests */}
              {hasChildren && (
                <>
                  {/* Paternity */}
                  {children?.bornBeforeMarriage && (
                    <View style={styles.requestRow}>
                      <Text style={styles.requestNumber}>{reqNum++}.</Text>
                      <Text style={styles.requestContent}>
                        Establish paternity of the children born prior to marriage: {children.bornBeforeMarriageNames || '(see children listed above)'}.
                      </Text>
                    </View>
                  )}

                  {/* Primary Residence */}
                  <View style={styles.requestRow}>
                    <Text style={styles.requestNumber}>{reqNum++}.</Text>
                    <Text style={styles.requestContent}>
                      The primary residence of the minor child(ren) be with{' '}
                      {children?.resideWith === 'petitioner' ? 'Petitioner' :
                       children?.resideWith === 'respondent' ? 'Respondent' :
                       'Both parties (equal parenting time)'}.
                    </Text>
                  </View>

                  {/* Parenting Time */}
                  <View style={styles.requestRow}>
                    <Text style={styles.requestNumber}>{reqNum++}.</Text>
                    <Text style={styles.requestContent}>
                      The non-custodial parent be granted reasonable parenting time.
                      {parentingTime?.schedule && ` Proposed schedule: ${
                        parentingTime.schedule === '3-2-2-3' ? 'Equal parenting time (3-2-2-3 schedule)' :
                        parentingTime.schedule === '5-2-2-5' ? 'Equal parenting time (5-2-2-5 schedule)' :
                        parentingTime.schedule === 'alternating_weeks' ? 'Equal parenting time (alternating weeks)' :
                        parentingTime.schedule === 'custom' ? (parentingTime.customDetails || 'Custom parenting time schedule as agreed by the parties') :
                        parentingTime.schedule
                      }.`}
                      {parentingTime?.schedule !== 'custom' && parentingTime?.customDetails ? ` ${parentingTime.customDetails}` : ''}
                    </Text>
                  </View>

                  {/* Legal Decision-Making */}
                  <View style={styles.requestRow}>
                    <Text style={styles.requestNumber}>{reqNum++}.</Text>
                    <Text style={styles.requestContent}>
                      {custody?.legalDecisionMaking === 'joint'
                        ? 'Equal legal decision-making authority be awarded to both parents.'
                        : custody?.legalDecisionMaking === 'petitioner_sole'
                        ? 'Sole legal decision-making authority be awarded to Petitioner.'
                        : custody?.legalDecisionMaking === 'respondent_sole'
                        ? 'Sole legal decision-making authority be awarded to Respondent.'
                        : custody?.legalDecisionMaking === 'joint_with_final_say'
                        ? `Equal legal decision-making with ${custody.finalSayParty === 'me' || custody.finalSayParty === 'petitioner' ? 'Petitioner' : 'Respondent'} having final say.`
                        : 'Legal decision-making authority as determined by the Court.'
                      }
                    </Text>
                  </View>

                  {/* Child Support Order */}
                  {childSupport?.seeking && (
                    <View style={styles.requestRow}>
                      <Text style={styles.requestNumber}>{reqNum++}.</Text>
                      <Text style={styles.requestContent}>
                        Order Respondent to pay child support pursuant to the Arizona Child Support Guidelines.
                      </Text>
                    </View>
                  )}

                  {/* Medical/Dental/Vision */}
                  <View style={styles.requestRow}>
                    <Text style={styles.requestNumber}>{reqNum++}.</Text>
                    <Text style={styles.requestContent}>
                      {childSupport?.healthInsuranceProvider === 'petitioner'
                        ? 'Order that Petitioner shall maintain medical, dental, and vision insurance for the minor child(ren) and that unreimbursed expenses be divided between the parties.'
                        : childSupport?.healthInsuranceProvider === 'respondent'
                        ? 'Order that Respondent shall maintain medical, dental, and vision insurance for the minor child(ren) and that unreimbursed expenses be divided between the parties.'
                        : childSupport?.healthInsuranceProvider === 'both'
                        ? 'Order that both parties shall maintain medical, dental, and vision insurance for the minor child(ren) and that unreimbursed expenses be divided between the parties.'
                        : 'Order that medical, dental, and vision insurance be maintained for the minor child(ren) and that unreimbursed expenses be divided between the parties.'}
                    </Text>
                  </View>
                </>
              )}

              {/* Community Property */}
              <View style={styles.requestRow}>
                <Text style={styles.requestNumber}>{reqNum++}.</Text>
                <Text style={styles.requestContent}>
                  The remaining community property and debt shall be divided as follows:
                  {'\n'}
                  {/* Personal Property */}
                  {property.personalPropertyPreference === 'keep_in_possession'
                    ? 'Each party shall retain the personal property currently in his/her possession as sole and separate property.'
                    : property.personalPropertyPreference === 'itemize'
                    ? `Petitioner shall retain: ${property.personalPropertyMine || 'N/A'}. Respondent shall retain: ${property.personalPropertySpouse || 'N/A'}.`
                    : ''}
                  {/* Real Estate */}
                  {property.hasRealEstate && property.realEstate.length > 0 && (
                    ' ' + property.realEstate.map((r) => {
                      const awardedTo = r.divisionOption === 'i_keep' ? 'Petitioner' : r.divisionOption === 'spouse_keeps' ? 'Respondent' : '';
                      return r.divisionOption === 'sell_split'
                        ? `The real property located at ${r.address || 'address to be determined'} shall be sold and proceeds divided equally`
                        : `${awardedTo} shall retain the marital residence located at ${r.address || 'address to be determined'} and any debt attached thereto as their sole and separate property and debt`;
                    }).join('; ') + '.'
                  )}
                  {/* Vehicles */}
                  {property.hasVehicles && property.vehicles.length > 0 && (
                    ' ' + property.vehicles.map((v) => {
                      const awardedTo = v.divisionOption === 'i_keep' ? 'Petitioner' : v.divisionOption === 'spouse_keeps' ? 'Respondent' : '';
                      return v.divisionOption === 'sell_split'
                        ? `The ${v.year} ${v.make} ${v.model} shall be sold and proceeds divided equally`
                        : `${awardedTo} shall retain the ${v.year} ${v.make} ${v.model} and any debt attached thereto as their sole and separate property and debt`;
                    }).join('; ') + '.'
                  )}
                  {/* Bank Accounts */}
                  {property.bankAccountsStructured && property.bankAccountsStructured.length > 0 && (
                    ' ' + property.bankAccountsStructured.map((acct) => {
                      const divText = acct.division === 'i_keep' ? 'awarded to Petitioner' : acct.division === 'spouse_keeps' ? 'awarded to Respondent' : 'divided equally between the parties';
                      return `The ${formatBankAccountDescription(acct.description)} shall be ${divText}`;
                    }).join('; ') + '.'
                  )}
                  {/* Retirement */}
                  {property.hasRetirement && property.retirement.length > 0 && (
                    ' ' + property.retirement.map((acct) => {
                      const type = acct.accountType === 'other' ? (acct.accountTypeOther || 'retirement account') : acct.accountType?.toUpperCase();
                      const owner = acct.ownerName === 'me' ? 'Petitioner' : 'Respondent';
                      const divText = acct.proposedDivision === 'i_keep' ? 'awarded to Petitioner' : acct.proposedDivision === 'spouse_keeps' ? 'awarded to Respondent' : acct.proposedDivision === 'split_50_50' ? 'the community portion divided equally between the parties' : acct.proposedDivision;
                      return `The ${type} account held by ${owner}${acct.administrator ? ` at ${acct.administrator}` : ''} shall be ${divText}`;
                    }).join('; ') + '.'
                  )}
                </Text>
              </View>

              {/* Spousal Maintenance */}
              {maintenance.entitlement !== 'neither' && (
                <View style={styles.requestRow}>
                  <Text style={styles.requestNumber}>{reqNum++}.</Text>
                  <Text style={styles.requestContent}>
                    Award spousal maintenance to {maintenance.entitlement === 'me' ? 'Petitioner' : 'Respondent'} as the Court deems just.
                  </Text>
                </View>
              )}
            </>
          );
        })()}

        {/* Other Orders */}
        {hasActualOtherOrders(data.otherOrders) && (
          <View style={styles.requestRow}>
            <Text style={styles.requestNumber}>{' '}.</Text>
            <Text style={styles.requestContent}>
              {data.otherOrders}
            </Text>
          </View>
        )}

        {/* General catch-all */}
        <View style={styles.requestRow}>
          <Text style={styles.requestNumber}>{' '}.</Text>
          <Text style={styles.requestContent}>
            Grant such other and further relief as the Court deems just and proper.
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* ==================== OATH / VERIFICATION PAGE ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case Number: </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionNumber}>{nextSection()}.</Text>
          <Text style={styles.sectionTitle}>OATH / VERIFICATION</Text>
        </View>

        <View style={styles.bodyText}>
          <Text>
            I swear or affirm under penalty of perjury that the contents of this Petition are true and correct to the best of my knowledge, information, and belief.
          </Text>
        </View>

        {/* Signature block */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <Text style={styles.fieldLabel}>Date:</Text>
              <Text style={styles.fieldLine}>{''}</Text>
            </View>
            <View style={styles.twoColumnItem}>
              <Text style={styles.fieldLabel}>Signature:</Text>
              <Text style={styles.fieldLine}>{''}</Text>
            </View>
          </View>

          <View style={[styles.fieldRow, { marginTop: 8 }]}>
            <Text style={styles.fieldLabel}>Printed Name:</Text>
            <Text style={styles.fieldLine}>{petitioner.name}</Text>
          </View>
        </View>

        {/* Notary section */}
        <View style={{ marginTop: 30 }}>
          <View style={styles.bodyTextNoIndent}>
            <Text style={styles.bold}>
              (Complete below if NOT signed under penalty of perjury)
            </Text>
          </View>

          <View style={{ marginTop: 8 }}>
            <View style={styles.bodyTextNoIndent}>
              <Text>State of Arizona{'\t\t'})</Text>
            </View>
            <View style={styles.bodyTextNoIndent}>
              <Text>{'\t\t\t\t'}    ) ss.</Text>
            </View>
            <View style={styles.bodyTextNoIndent}>
              <Text>County of {county}{'\t\t'})</Text>
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <View style={styles.bodyTextNoIndent}>
              <Text>
                Subscribed and sworn to (or affirmed) before me this _____ day of _______________, 20_____.
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <View style={styles.twoColumnRow}>
              <View style={styles.twoColumnItem}>
                <Text style={styles.fieldLine}>{''}</Text>
              </View>
            </View>
            <View style={styles.bodyTextNoIndent}>
              <Text style={{ fontSize: 9, textAlign: 'right', marginRight: 40 }}>Notary Public / Clerk of the Superior Court</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <View style={styles.twoColumnRow}>
              <View style={styles.twoColumnItem}>
                <Text style={{ fontSize: 10, width: 140 }}>My Commission Expires:</Text>
                <Text style={styles.fieldLine}>{''}</Text>
              </View>
            </View>
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

export default PetitionDocument;
