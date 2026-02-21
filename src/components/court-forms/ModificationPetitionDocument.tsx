import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { pleadingStyles as styles } from '@/lib/court-forms/PleadingStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface ModificationPetitionDocumentProps {
  data: NormalizedPDFData;
  caseNumber?: string;
  signature?: string;
}

// Line numbers component - renders 25 line numbers on left margin
function LineNumbers() {
  return (
    <View style={styles.lineNumbersColumn} fixed>
      {Array.from({ length: 25 }, (_, i) => (
        <Text key={i + 1} style={styles.lineNumber}>
          {i + 1}
        </Text>
      ))}
    </View>
  );
}

// Format date as MM/DD/YYYY for court documents
function courtDate(dateStr: string | undefined): string {
  if (!dateStr) return '___________';
  try {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return dateStr;
  }
}

// Helper: numbered paragraph
function NumberedParagraph({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <View style={styles.numberedParagraph} wrap={false}>
      <Text style={styles.paragraphNumber}>{num}.</Text>
      <Text style={styles.paragraphContent}>{children}</Text>
    </View>
  );
}

// Helper: prayer item
function PrayerItem({ letter, children }: { letter: string; children: React.ReactNode }) {
  return (
    <View style={styles.prayerItem} wrap={false}>
      <Text style={styles.prayerBullet}>{letter}.</Text>
      <Text style={styles.prayerContent}>{children}</Text>
    </View>
  );
}

// Extract county from court name like "Maricopa County Superior Court"
function extractCounty(courtName: string): string {
  const match = courtName.match(/^(.+?)\s+County/i);
  return match ? match[1] : '';
}

// Format modification type for legal decision making
function formatLdmModificationType(type: string, role: 'petitioner' | 'respondent'): string {
  const filingParty = role === 'petitioner' ? 'Petitioner' : 'Respondent';
  switch (type) {
    case 'sole_to_me':
      return `sole legal decision-making authority be awarded to ${filingParty}`;
    case 'joint':
      return 'joint legal decision-making authority be awarded to both parents';
    case 'joint_with_final_say':
      return `joint legal decision-making be awarded to both parents, with ${filingParty} having final say authority`;
    default:
      return type;
  }
}

// Format parenting time schedule
function formatPtSchedule(schedule: string, customDetails: string): string {
  switch (schedule) {
    case '3-2-2-3':
      return 'equal parenting time following a 3-2-2-3 schedule';
    case '5-2-2-5':
      return 'equal parenting time following a 5-2-2-5 schedule';
    case 'alternating_weeks':
      return 'equal parenting time following an alternating weeks schedule';
    case 'no_parenting_time':
      return 'no parenting time be awarded to the other parent';
    case 'custom':
      return customDetails || 'a modified parenting time schedule';
    default:
      return schedule || 'a modified parenting time schedule';
  }
}

export function ModificationPetitionDocument({ data, caseNumber, signature }: ModificationPetitionDocumentProps) {
  const { petitioner, respondent, modification } = data;

  if (!modification) {
    return (
      <Document>
        <Page size="LETTER" style={styles.page}>
          <Text>Error: No modification data available.</Text>
        </Page>
      </Document>
    );
  }

  const filingParty = modification.role === 'petitioner' ? 'Petitioner' : 'Respondent';
  const otherParty = modification.role === 'petitioner' ? 'Respondent' : 'Petitioner';
  const filingPartyName = modification.role === 'petitioner' ? petitioner.name : respondent.name;
  const filingPartyAddress = modification.role === 'petitioner' ? petitioner.address : respondent.address;

  // Determine county from the first available court name
  const firstCourtName = modification.ldm?.courtName || modification.pt?.courtName || modification.cs?.courtName || '';
  const county = extractCounty(firstCourtName);

  // Auto-incrementing paragraph counter
  let paraNum = 0;

  // Build children text
  const childCount = modification.children.length;
  const childrenText = modification.children.map((child, i) => {
    const name = child.name?.toUpperCase() || `CHILD ${i + 1}`;
    const dob = courtDate(child.dateOfBirth);
    return `${name}, (D.O.B. ${dob})`;
  }).join('; ') || '';

  // Build title based on selected modifications
  const modTitleParts: string[] = [];
  if (modification.modificationsSelected.includes('legal_decision_making')) modTitleParts.push('LEGAL DECISION MAKING');
  if (modification.modificationsSelected.includes('parenting_time')) modTitleParts.push('PARENTING TIME');
  if (modification.modificationsSelected.includes('child_support')) modTitleParts.push('CHILD SUPPORT');
  const modTitle = modTitleParts.join(', ');

  const displayCaseNumber = caseNumber || modification.caseNumber || '';

  return (
    <Document
      title={`Petition to Modify - ${filingPartyName}`}
      author="LegalSimple"
      subject={`Petition to Modify ${modTitle}`}
      creator="LegalSimple Court Forms"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Line Numbers */}
        <LineNumbers />

        {/* Pro-Per Identification Block */}
        <View style={styles.proPerBlock}>
          <Text style={styles.proPerLine}>{filingPartyName || '[FILING PARTY NAME]'}</Text>
          <Text style={styles.proPerLine}>{filingPartyAddress || '[ADDRESS]'}</Text>
          <Text style={styles.proPerLabel}>Appearing pro-per</Text>
        </View>

        {/* Court Header */}
        <View style={styles.courtHeader} wrap={false}>
          <Text style={styles.courtHeaderLine}>IN THE SUPERIOR COURT OF THE STATE OF ARIZONA</Text>
          <Text style={styles.courtHeaderLine}>IN AND FOR THE COUNTY OF {county?.toUpperCase() || '____________'}</Text>
        </View>

        {/* Case Caption */}
        <View style={styles.caseCaption} wrap={false}>
          <View style={styles.captionLeft}>
            <Text style={styles.captionPartyName}>In re the matter of:</Text>
            <Text style={styles.captionPartyName}>{petitioner.name?.toUpperCase() || '[PETITIONER NAME]'},</Text>
            <Text style={styles.captionPartyRole}>Petitioner,</Text>
            <Text style={styles.captionAnd}>and</Text>
            <Text style={styles.captionPartyName}>{respondent.name?.toUpperCase() || '[RESPONDENT NAME]'},</Text>
            <Text style={styles.captionPartyRole}>Respondent.</Text>
          </View>

          {/* Parentheses Column */}
          <View style={styles.captionParentheses}>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
          </View>

          {/* Right Side - Case Number and Title */}
          <View style={styles.captionRight}>
            <Text style={styles.captionCaseNumber}>Case No.:</Text>
            <Text style={styles.captionCaseNumberValue}> {displayCaseNumber || '_______________'}</Text>
            <Text style={styles.captionTitle}>
              {`PETITION TO MODIFY ${modTitle}`}
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <Text style={styles.paragraph}>
          {filingPartyName?.toUpperCase() || '[FILING PARTY NAME]'} (&ldquo;{filingParty}&rdquo;), for {modification.role === 'petitioner' ? 'his/her' : 'his/her'} Petition to Modify {modTitle} (&ldquo;Petition&rdquo;) pursuant to A.R.S. &sect;25-411 alleges as follows:
        </Text>

        {/* PARAGRAPH 1: Filing party identity */}
        <NumberedParagraph num={++paraNum}>
          {filingParty}&apos;s name is {filingPartyName || '[NAME]'}. {filingParty} was the {modification.role === 'petitioner' ? 'Petitioner' : 'Respondent'} in the original action.
        </NumberedParagraph>

        {/* PARAGRAPH 2: Other party identity */}
        <NumberedParagraph num={++paraNum}>
          {otherParty}&apos;s name is {modification.role === 'petitioner' ? respondent.name : petitioner.name || '[NAME]'}. {otherParty}&apos;s sensitive information is listed in the Sensitive Data Cover Sheet filed herewith under seal.
        </NumberedParagraph>

        {/* PARAGRAPH 3: Original case */}
        <NumberedParagraph num={++paraNum}>
          The parties are subject to existing court orders entered in Case No. {displayCaseNumber || '_______________'}.
        </NumberedParagraph>

        {/* PARAGRAPH 4: Children */}
        <NumberedParagraph num={++paraNum}>
          The parties are the parents of {childCount === 1 ? 'one minor child' : `${childCount} minor children`}, namely: {childrenText}.
        </NumberedParagraph>

        {/* === LEGAL DECISION MAKING MODIFICATION === */}
        {modification.ldm && (
          <>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>MODIFICATION OF LEGAL DECISION MAKING</Text>
            </View>

            <NumberedParagraph num={++paraNum}>
              On {courtDate(modification.ldm.orderDate)}, {modification.ldm.courtName || 'the Court'} entered orders regarding Legal Decision Making, found at {modification.ldm.pageNumber || '___'}, {modification.ldm.sectionParagraph || '___'} of the existing orders.
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} alleges that a substantial and continuing change in circumstance has occurred since entry of the previous orders regarding Legal Decision Making, specifically: {modification.ldm.changeInCircumstance || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} believes this order should be changed because: {modification.ldm.whyChange || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} requests that {formatLdmModificationType(modification.ldm.modificationType, modification.role)} pursuant to A.R.S. &sect;25-403 and A.R.S. &sect;25-411.
            </NumberedParagraph>
          </>
        )}

        {/* === PARENTING TIME MODIFICATION === */}
        {modification.pt && (
          <>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>MODIFICATION OF PARENTING TIME</Text>
            </View>

            <NumberedParagraph num={++paraNum}>
              On {courtDate(modification.pt.orderDate)}, {modification.pt.courtName || 'the Court'} entered orders regarding Parenting Time, found at {modification.pt.pageNumber || '___'}, {modification.pt.sectionParagraph || '___'} of the existing orders.
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} alleges that a substantial and continuing change in circumstance has occurred since entry of the previous orders regarding Parenting Time, specifically: {modification.pt.changeInCircumstance || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} believes this order should be changed because: {modification.pt.whyChange || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} requests that the Court order {formatPtSchedule(modification.pt.newSchedule, modification.pt.customScheduleDetails)} pursuant to A.R.S. &sect;25-408 and A.R.S. &sect;25-411.
            </NumberedParagraph>

            {modification.pt.supervised && (
              <NumberedParagraph num={++paraNum}>
                {filingParty} further requests that parenting time be supervised{modification.pt.supervisedReason ? ` because: ${modification.pt.supervisedReason}` : '.'} It is in the best interests of the minor {childCount === 1 ? 'child' : 'children'} that parenting time be supervised.
              </NumberedParagraph>
            )}
          </>
        )}

        {/* === CHILD SUPPORT MODIFICATION === */}
        {modification.cs && (
          <>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>MODIFICATION OF CHILD SUPPORT</Text>
            </View>

            <NumberedParagraph num={++paraNum}>
              On {courtDate(modification.cs.orderDate)}, {modification.cs.courtName || 'the Court'} entered orders regarding Child Support, found at {modification.cs.pageNumber || '___'}, {modification.cs.sectionParagraph || '___'} of the existing orders.
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} alleges that a substantial and continuing change in circumstance has occurred since entry of the previous orders regarding Child Support, specifically: {modification.cs.changeInCircumstance || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} believes this order should be changed because: {modification.cs.whyChange || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} requests that the Court modify child support in accordance with the Arizona Child Support Guidelines pursuant to A.R.S. &sect;25-320 and A.R.S. &sect;25-327.
            </NumberedParagraph>
          </>
        )}

        {/* WHEREFORE PRAYER */}
        <View wrap={false}>
          <Text style={{ ...styles.paragraph, marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>WHEREFORE</Text> {filingParty} prays that this Court will grant the following orders:
          </Text>
        </View>

        {(() => {
          let prayerLetter = 65; // ASCII 'A'
          return (
            <>
              {modification.ldm && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Modify the existing Legal Decision Making orders so that {formatLdmModificationType(modification.ldm.modificationType, modification.role)};
                </PrayerItem>
              )}

              {modification.pt && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Modify the existing Parenting Time orders to award {formatPtSchedule(modification.pt.newSchedule, modification.pt.customScheduleDetails)};
                </PrayerItem>
              )}

              {modification.cs && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Modify the existing Child Support orders in accordance with the Arizona Child Support Guidelines;
                </PrayerItem>
              )}

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                Such other and further relief as the Court deems just and proper.
              </PrayerItem>
            </>
          );
        })()}

        {/* RESPECTFULLY SUBMITTED */}
        <Text style={styles.respectfullySubmitted}>
          RESPECTFULLY SUBMITTED this ___ day of _________________, 20_____.
        </Text>

        {/* SIGNATURE BLOCK */}
        <View style={styles.signatureSection} wrap={false}>
          <View style={{ textAlign: 'right', marginBottom: 8 }}>
            <Text style={{ fontSize: 12, marginBottom: 12 }}>
              {filingPartyName || '_____________________'}
            </Text>
            {signature ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>By: </Text>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 200, paddingBottom: 4 }}>
                  <Image src={signature} style={{ height: 40, objectFit: 'contain' }} />
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>By: ___________________________</Text>
              </View>
            )}
            <Text style={{ fontSize: 12 }}>{filingPartyName || '_____________________'}</Text>
            <Text style={{ fontSize: 12, fontStyle: 'italic' }}>Appearing Pro-Per</Text>
          </View>
        </View>

        {/* FILING BLOCK */}
        <View style={styles.filingBlock} wrap={false}>
          <Text style={styles.filingLine}>Original of the foregoing</Text>
          <Text style={styles.filingLine}>filed this ___ day of _________________ 20____</Text>
          <Text style={{ ...styles.filingLine, marginTop: 8 }}>Clerk of Court</Text>
          <Text style={styles.filingLine}>{county || '_____'} County Superior Court</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* VERIFICATION PAGE */}
      <Page size="LETTER" style={styles.page}>
        <LineNumbers />

        <View style={styles.courtHeader} wrap={false}>
          <Text style={{ ...styles.courtHeaderLine, fontSize: 14, fontWeight: 'bold', marginBottom: 16 }}>VERIFICATION</Text>
        </View>

        <Text style={styles.paragraph}>
          STATE OF ARIZONA{'\t\t\t\t'})
        </Text>
        <Text style={styles.paragraph}>
          {'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'}) ss.
        </Text>
        <Text style={styles.paragraph}>
          County of {county || '_____________'}{'\t\t'})
        </Text>

        <Text style={{ ...styles.paragraph, marginTop: 16 }}>
          I, {filingPartyName || '___________________________'}, the {filingParty} herein, being first duly sworn upon his/her oath, deposes and says:
        </Text>

        <Text style={{ ...styles.paragraph, marginTop: 12 }}>
          That I have read the foregoing Petition to Modify and know the contents thereof, and the same is true and correct to the best of my knowledge and belief.
        </Text>

        {/* Signature */}
        <View style={{ marginTop: 40, marginLeft: 240 }} wrap={false}>
          {signature ? (
            <View>
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 200, paddingBottom: 4 }}>
                <Image src={signature} style={{ height: 40, objectFit: 'contain' }} />
              </View>
              <Text style={{ fontSize: 12 }}>{filingPartyName}</Text>
            </View>
          ) : (
            <View>
              <Text style={{ fontSize: 12 }}>___________________________</Text>
              <Text style={{ fontSize: 12 }}>{filingPartyName || filingParty}</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 20, marginLeft: 240 }}>
          <Text style={{ fontSize: 12 }}>Date: ___________________________</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

export default ModificationPetitionDocument;
