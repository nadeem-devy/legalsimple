import { Document, Page, View, Text } from '@react-pdf/renderer';
import { summonsStyles as styles } from '@/lib/court-forms/SummonsStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface SummonsDocumentProps {
  data: NormalizedPDFData;
}

// Checkbox component
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={checked ? styles.checkboxChecked : styles.checkbox}>
      {checked && <Text style={styles.checkmark}>X</Text>}
    </View>
  );
}

// Clerk office addresses by county
const CLERK_OFFICES: Record<string, { address: string; cityStateZip: string }[]> = {
  Maricopa: [
    { address: '201 West Jefferson Street', cityStateZip: 'Phoenix, Arizona 85003-2205' },
    { address: '18380 North 40th Street', cityStateZip: 'Phoenix, Arizona 85032' },
    { address: '222 East Javelina Avenue', cityStateZip: 'Mesa, Arizona 85210-6201' },
    { address: '14264 West Tierra Buena Lane', cityStateZip: 'Surprise, Arizona 85374' },
  ],
  Pima: [
    { address: '110 West Congress Street', cityStateZip: 'Tucson, Arizona 85701' },
  ],
  Pinal: [
    { address: '971 North Jason Lopez Circle, Building A', cityStateZip: 'Florence, Arizona 85132' },
  ],
  Yavapai: [
    { address: '120 South Cortez Street', cityStateZip: 'Prescott, Arizona 86303' },
  ],
  Mohave: [
    { address: '401 East Spring Street', cityStateZip: 'Kingman, Arizona 86401' },
  ],
  Coconino: [
    { address: '200 North San Francisco Street', cityStateZip: 'Flagstaff, Arizona 86001' },
  ],
};

function getClerkOffices(county: string) {
  return CLERK_OFFICES[county] || [
    { address: `${county} County Superior Court`, cityStateZip: `${county} County, Arizona` },
  ];
}

export function SummonsDocument({ data }: SummonsDocumentProps) {
  const { petitioner, respondent, modification } = data;
  const isModification = data.caseType === 'modification';

  // For modification: the filing party may be original petitioner or respondent
  const filingParty = isModification && modification?.role === 'respondent'
    ? { name: respondent.name, address: respondent.address, phone: respondent.phone, email: respondent.email }
    : { name: petitioner.name, address: petitioner.address, phone: petitioner.phone, email: petitioner.email };
  const opposingParty = isModification && modification?.role === 'respondent'
    ? { name: petitioner.name }
    : { name: respondent.name };

  // Extract county from court name for modification, or use petitioner.county
  let county = petitioner.county || 'Maricopa';
  if (isModification && !petitioner.county) {
    const courtName = modification?.ldm?.courtName || modification?.pt?.courtName || modification?.cs?.courtName || '';
    const match = courtName.match(/^(.+?)\s+County/i);
    if (match) county = match[1];
  }
  const clerkOffices = getClerkOffices(county);

  return (
    <Document
      title={`Summons - ${petitioner.name} v. ${respondent.name}`}
      author="LegalSimple"
      subject="Family Law Summons"
      creator="LegalSimple Court Forms"
    >
      {/* PAGE 1 */}
      <Page size="LETTER" style={styles.page}>
        {/* Top section: Person Filing + Clerk Box */}
        <View style={styles.topSection}>
          {/* Person Filing Block */}
          <View style={styles.personFilingBlock}>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Person Filing:</Text>
              <Text style={styles.personFilingValue}>{filingParty.name || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Address (if not protected):</Text>
              <Text style={styles.personFilingValue}>{filingParty.address || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Telephone:</Text>
              <Text style={styles.personFilingValue}>{filingParty.phone || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Email Address:</Text>
              <Text style={styles.personFilingValue}>{filingParty.email || ''}</Text>
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

          {/* For Clerk's Use Only Box */}
          <View style={styles.clerkBox}>
            <Text style={styles.clerkBoxLabel}>For Clerk&apos;s Use Only</Text>
          </View>
        </View>

        {/* Representing Row */}
        <View style={styles.representingRow}>
          <Text style={styles.representingLabel}>Representing</Text>
          <Checkbox checked={true} />
          <Text style={styles.checkboxLabel}>Self, without a Lawyer</Text>
          <Text style={styles.checkboxLabel}>or</Text>
          <Checkbox checked={false} />
          <Text style={styles.checkboxLabel}>Attorney for</Text>
          <Checkbox checked={!isModification || modification?.role === 'petitioner'} />
          <Text style={styles.checkboxLabel}>Petitioner</Text>
          <Text style={styles.checkboxLabel}>OR</Text>
          <Checkbox checked={isModification && modification?.role === 'respondent'} />
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
            {/* Left - Parties */}
            <View style={styles.captionLeft}>
              {/* Petitioner line */}
              <Text style={styles.captionUnderline}>{petitioner.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Petitioner / Party A</Text>

              <Text style={styles.captionAnd}>And</Text>

              {/* Respondent line */}
              <Text style={styles.captionUnderline}>{respondent.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Respondent / Party B</Text>
            </View>

            {/* Right - Case No + Title */}
            <View style={styles.captionRight}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.caseNoLabel}>Case No.:  </Text>
                <Text style={styles.caseNoValue}></Text>
              </View>
              <Text style={styles.summonsTitle}>SUMMONS</Text>
            </View>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            WARNING: This is an official document from the court that affects your rights.  Read this carefully.{'\n'}If you do not understand it, contact a lawyer for help.
          </Text>
        </View>

        {/* FROM THE STATE OF ARIZONA TO: */}
        <View style={styles.fromStateRow}>
          <Text style={styles.fromStateLabel}>FROM THE STATE OF ARIZONA TO:  </Text>
          <Text style={styles.fromStateLine}>{opposingParty.name || ''}</Text>
        </View>
        <Text style={styles.fromStateSubLabel}>Name of Opposing Party</Text>

        {/* Item 1 */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>1.</Text>
          <Text style={styles.itemContent}>
            <Text style={styles.bold}>A lawsuit has been filed against you.  A copy of the lawsuit and other court papers are served on you with this </Text>
            <Text style={styles.boldItalic}>&ldquo;Summons.&rdquo;</Text>
          </Text>
        </View>

        {/* Item 2 */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>2.</Text>
          <Text style={styles.itemContent}>
            <Text style={styles.bold}>If you do not want a judgment or order entered against you without your input, you must file a written </Text>
            <Text style={styles.boldItalic}>&ldquo;Answer&rdquo;</Text>
            <Text style={styles.bold}> or a </Text>
            <Text style={styles.boldItalic}>&ldquo;Response&rdquo;</Text>
            <Text style={styles.bold}> with the court, and pay the filing fee.  Also, the other party may be granted their request by the Court if you do not file an </Text>
            <Text style={styles.boldItalic}>&ldquo;Answer&rdquo;</Text>
            <Text style={styles.bold}> or </Text>
            <Text style={styles.boldItalic}>&ldquo;Response&rdquo;,</Text>
            <Text style={styles.bold}> </Text>
            <Text style={styles.boldItalic}>or show up in court.</Text>
            <Text style={styles.bold}>  To file your </Text>
            <Text style={styles.boldItalic}>&ldquo;Answer&rdquo;</Text>
            <Text style={styles.bold}> or </Text>
            <Text style={styles.boldItalic}>&ldquo;Response&rdquo;</Text>
            <Text style={styles.bold}> take, or send, it to the:</Text>
          </Text>
        </View>

        {/* Clerk Office Addresses */}
        {clerkOffices.map((office, index) => (
          <View key={index} style={styles.bulletItem}>
            <Text style={styles.bulletDot}>&bull;</Text>
            <Text style={styles.bulletContent}>
              <Text style={styles.bold}>Office of the Clerk of Superior Court, {office.address}, {office.cityStateZip}</Text>
              {index < clerkOffices.length - 1 ? (
                <Text style={styles.bold}> OR</Text>
              ) : (
                <Text style={styles.bold}>.</Text>
              )}
            </Text>
          </View>
        ))}

        {/* After filing instruction */}
        <Text style={styles.afterFilingText}>
          <Text style={styles.bold}>After filing, mail a copy of your </Text>
          <Text style={styles.boldItalic}>&ldquo;Response&rdquo;</Text>
          <Text style={styles.bold}> or </Text>
          <Text style={styles.boldItalic}>&ldquo;Answer&rdquo;</Text>
          <Text style={styles.bold}> to the other party at their current address.</Text>
        </Text>

        {/* Page 1 Number */}
        <Text
          style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 10 }}
          render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* PAGE 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Item 3 - Deadlines */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>3.</Text>
          <Text style={styles.itemContent}>
            <Text style={styles.bold}>If this </Text>
            <Text style={styles.boldItalic}>&ldquo;Summons&rdquo;</Text>
            <Text style={styles.bold}> and the other court papers were served on you within the State of Arizona, your </Text>
            <Text style={styles.boldItalic}>&ldquo;Response&rdquo;</Text>
            <Text style={styles.bold}> or </Text>
            <Text style={styles.boldItalic}>&ldquo;Answer&rdquo;</Text>
            <Text style={styles.bold}> must be filed within TWENTY (20) CALENDAR DAYS from the date you were served, not counting the day you were served.</Text>
          </Text>
        </View>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>If this </Text>
          <Text style={styles.boldItalic}>&ldquo;Summons&rdquo;</Text>
          <Text style={styles.bold}> and the other court papers were served on you outside the State of Arizona, your </Text>
          <Text style={styles.boldItalic}>&ldquo;Response&rdquo;</Text>
          <Text style={styles.bold}> or </Text>
          <Text style={styles.boldItalic}>&ldquo;Answer&rdquo;</Text>
          <Text style={styles.bold}> must be filed within THIRTY (30) CALENDAR DAYS from the date you were served, not counting the day you were served.</Text>
        </Text>

        {/* Item 4 - Preliminary Injunction */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>4.</Text>
          <Text style={styles.itemContent}>
            <Text style={styles.bold}>You can get a copy of the court papers filed in this case from the Petitioner&apos;s attorney or from the Clerk of the Superior Court&apos;s website at </Text>
            <Text style={styles.italic}>www.superiorcourt.maricopa.gov.</Text>
          </Text>
        </View>

        {/* Item 5 - Preliminary Injunction Notice */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>5.</Text>
          <Text style={styles.itemContent}>
            <Text style={styles.bold}>Requests for reasonable accommodation for persons with disabilities must be made to the division assigned to the case by the party needing accommodation at least three (3) judicial days before a scheduled court proceeding.</Text>
          </Text>
        </View>

        {/* Item 6 - Preliminary Injunction */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>6.</Text>
          <Text style={styles.itemContent}>
            <Text style={styles.bold}>Requests for an interpreter for persons with limited English proficiency must be made to the division assigned to the case by the party needing the interpreter at least three (3) judicial days before a scheduled court proceeding.</Text>
          </Text>
        </View>

        {/* Clerk Signature Section */}
        <View style={styles.clerkSignatureSection}>
          <View style={styles.clerkSignatureRow}>
            <Text style={styles.clerkSignatureLabel}>Date Summons Issued:</Text>
            <Text style={styles.clerkSignatureLine}>{''}</Text>
          </View>

          <View style={{ marginTop: 30 }}>
            <View style={styles.clerkSignatureRow}>
              <Text style={styles.clerkSignatureLabel}>{''}</Text>
              <View style={{ flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#000' }} />
            </View>
            <View style={styles.clerkSignatureRow}>
              <Text style={styles.clerkSignatureLabel}>{''}</Text>
              <Text style={{ fontSize: 9, flex: 1, textAlign: 'center' }}>Clerk of the Superior Court</Text>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <View style={styles.clerkSignatureRow}>
              <Text style={styles.clerkSignatureLabel}>By:</Text>
              <View style={{ flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#000' }} />
            </View>
            <View style={styles.clerkSignatureRow}>
              <Text style={styles.clerkSignatureLabel}>{''}</Text>
              <Text style={{ fontSize: 9, flex: 1, textAlign: 'center' }}>Deputy Clerk</Text>
            </View>
          </View>
        </View>

        {/* Page 2 Number */}
        <Text
          style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 10 }}
          render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

export default SummonsDocument;
