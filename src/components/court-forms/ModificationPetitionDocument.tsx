import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { pleadingStyles as styles } from '@/lib/court-forms/PleadingStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';
import type { OrderContentBlock } from '@/lib/modification-chat/types';

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

// Format page reference: "Pg. 3" → "page 3"
function formatPageRef(value: string | undefined): string {
  if (!value) return '___';
  const cleaned = value.replace(/^(Pg\.?|Page)\s*/i, '').trim();
  return `page ${cleaned}`;
}

// Format paragraph reference: "4" → "paragraph/section 4", but "paragraph 4" stays as-is
function formatParagraphRef(value: string | undefined): string {
  if (!value) return '___';
  const lower = value.toLowerCase();
  if (lower.includes('paragraph') || lower.includes('section') || lower.includes('par.') || lower.includes('sec.')) {
    return value;
  }
  return `paragraph/section ${value}`;
}

// Format modification type for legal decision making
function formatLdmModificationType(type: string, role: 'petitioner' | 'respondent', context: 'request' | 'prayer' = 'prayer'): string {
  const filingParty = role === 'petitioner' ? 'Petitioner' : 'Respondent';
  const normalized = type.toLowerCase();

  if (context === 'request') {
    switch (normalized) {
      case 'sole_to_me':
        return `sole legal decision-making to ${filingParty}`;
      case 'joint':
        return 'joint legal decision-making';
      case 'joint_with_final_say':
        return `joint legal decision-making, with ${filingParty} having final say authority`;
      default:
        return type.replace(/_/g, ' ');
    }
  }

  switch (normalized) {
    case 'sole_to_me':
      return `sole legal decision-making authority be awarded to ${filingParty}`;
    case 'joint':
      return 'joint legal decision-making be awarded to both parents';
    case 'joint_with_final_say':
      return `joint legal decision-making be awarded to both parents, with ${filingParty} having final say authority`;
    default:
      return type.replace(/_/g, ' ');
  }
}

// Format parenting time schedule
function formatPtSchedule(schedule: string): string {
  switch (schedule.toLowerCase()) {
    case '3-2-2-3':
      return 'equal parenting time following a 3-2-2-3 schedule';
    case '5-2-2-5':
      return 'equal parenting time following a 5-2-2-5 schedule';
    case 'alternating_weeks':
      return 'equal parenting time following an alternating weeks schedule';
    case 'no_parenting_time':
      return 'no parenting time be awarded to the other parent';
    case 'custom':
      return 'a parenting time schedule that provides meaningful, substantial, and continuing parenting time to both parties, that is in the best interests of the children';
    default:
      return schedule?.replace(/_/g, ' ') || 'a modified parenting time schedule';
  }
}

// Generate replacement text for a modified section
function getModifiedText(
  block: OrderContentBlock,
  modification: NonNullable<NormalizedPDFData['modification']>
): string | null {
  const mods = modification.modificationsSelected;

  if (block.type === 'legal_decision_making' && mods.includes('legal_decision_making') && modification.ldm) {
    const filingParty = modification.role === 'petitioner' ? 'Petitioner' : 'Respondent';
    const ldmType = formatLdmModificationType(modification.ldm.modificationType, modification.role, 'request');
    return `[MODIFIED] ${block.heading ? block.heading + ': ' : ''}The Court orders ${ldmType}. ${filingParty} requests this modification because: ${modification.ldm.whyChange || '___'}.`;
  }

  if (block.type === 'parenting_time' && mods.includes('parenting_time') && modification.pt) {
    const filingParty = modification.role === 'petitioner' ? 'Petitioner' : 'Respondent';
    const schedule = formatPtSchedule(modification.pt.newSchedule);
    let text = `[MODIFIED] ${block.heading ? block.heading + ': ' : ''}The Court orders ${schedule}. ${filingParty} requests this modification because: ${modification.pt.whyChange || '___'}.`;
    if (modification.pt.supervised) {
      text += ` Parenting time shall be supervised${modification.pt.supervisedReason ? ` because: ${modification.pt.supervisedReason}` : ''}.`;
    }
    return text;
  }

  if (block.type === 'child_support' && mods.includes('child_support') && modification.cs) {
    const filingParty = modification.role === 'petitioner' ? 'Petitioner' : 'Respondent';
    return `[MODIFIED] ${block.heading ? block.heading + ': ' : ''}Child support shall be recalculated and paid in accordance with the Arizona Child Support Guidelines pursuant to A.R.S. §25-320. ${filingParty} requests this modification because: ${modification.cs.whyChange || '___'}.`;
  }

  return null;
}

// ============================================================
// PROPOSED MODIFIED ORDER — Full order reproduction with edits
// ============================================================
function ProposedModifiedOrder({
  data,
  caseNumber,
  signature,
}: ModificationPetitionDocumentProps) {
  const { petitioner, respondent, modification } = data;
  if (!modification) return null;

  const fullContent = modification.fullOrderContent || [];
  const displayCaseNumber = caseNumber || modification.caseNumber || '';
  const firstCourtName = modification.ldm?.courtName || modification.pt?.courtName || modification.cs?.courtName || '';
  const county = extractCounty(firstCourtName);
  const filingPartyName = modification.role === 'petitioner' ? petitioner.name : respondent.name;
  const filingParty = modification.role === 'petitioner' ? 'Petitioner' : 'Respondent';
  const orderTitle = modification.orderTitle || 'COURT ORDER';

  return (
    <Document
      title={`Proposed Modified Order - ${filingPartyName}`}
      author="LegalSimple"
      subject="Proposed Modified Order"
      creator="LegalSimple Court Forms"
    >
      <Page size="LETTER" style={styles.page}>
        <LineNumbers />

        {/* Pro-Per Identification Block */}
        <View style={styles.proPerBlock}>
          <Text style={styles.proPerLine}>{filingPartyName || '[FILING PARTY NAME]'}</Text>
          <Text style={styles.proPerLine}>{modification.role === 'petitioner' ? petitioner.address : respondent.address || '[ADDRESS]'}</Text>
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
            <Text style={styles.captionPartyName}>In re the Matter of:</Text>
            <Text style={styles.captionPartyName}>{petitioner.name?.toUpperCase() || '[PETITIONER NAME]'},</Text>
            <Text style={styles.captionPartyRole}>Petitioner,</Text>
            <Text style={styles.captionAnd}>and</Text>
            <Text style={styles.captionPartyName}>{respondent.name?.toUpperCase() || '[RESPONDENT NAME]'},</Text>
            <Text style={styles.captionPartyRole}>Respondent.</Text>
          </View>

          <View style={styles.captionParentheses}>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
          </View>

          <View style={styles.captionRight}>
            <Text style={styles.captionCaseNumber}>Case No.: {displayCaseNumber || '_______________'}</Text>
            <Text style={styles.captionTitle}>
              PROPOSED MODIFIED {orderTitle.toUpperCase()}
            </Text>
            {modification.judgeName && (
              <Text style={{ fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                ({modification.judgeName})
              </Text>
            )}
          </View>
        </View>

        {/* Render full order content — replace modified sections */}
        {fullContent.map((block, idx) => {
          // Section group headers (e.g., "THE COURT FINDS:", "THE COURT ORDERS:")
          if (block.paragraphId === 'header') {
            return (
              <View key={idx} style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>{block.text}</Text>
              </View>
            );
          }

          // Check if this block should be replaced with modified text
          const modifiedText = getModifiedText(block, modification);

          if (modifiedText) {
            // Render modified paragraph
            return (
              <View key={idx} style={styles.numberedParagraph} wrap={false}>
                <Text style={styles.paragraphNumber}>{block.paragraphId}.</Text>
                <Text style={styles.paragraphContent}>
                  <Text style={{ fontWeight: 'bold' }}>{block.heading ? block.heading + '.  ' : ''}</Text>
                  {modifiedText}
                </Text>
              </View>
            );
          }

          // Render original paragraph unchanged
          return (
            <View key={idx} style={styles.numberedParagraph} wrap={false}>
              <Text style={styles.paragraphNumber}>{block.paragraphId}.</Text>
              <Text style={styles.paragraphContent}>
                {block.heading ? (
                  <>
                    <Text style={{ fontWeight: 'bold' }}>{block.heading}.  </Text>
                    {block.text}
                  </>
                ) : (
                  block.text
                )}
              </Text>
            </View>
          );
        })}

        {/* SIGNATURE / DATE BLOCK */}
        <View style={{ marginTop: 24 }} wrap={false}>
          <Text style={styles.paragraph}>
            Dated this ___ day of _________________, 20_____.
          </Text>
        </View>

        <View style={styles.signatureSection} wrap={false}>
          <View style={{ textAlign: 'right', marginBottom: 8 }}>
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
          That I have read the foregoing Proposed Modified Order and know the contents thereof, and the same is true and correct to the best of my knowledge and belief.
        </Text>

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

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

// ===========================================================
// PETITION TO MODIFY — Generic template (no uploaded order)
// ===========================================================
function PetitionToModify({
  data,
  caseNumber,
  signature,
}: ModificationPetitionDocumentProps) {
  const { petitioner, respondent, modification } = data;
  if (!modification) return null;

  const filingParty = modification.role === 'petitioner' ? 'Petitioner' : 'Respondent';
  const otherParty = modification.role === 'petitioner' ? 'Respondent' : 'Petitioner';
  const filingPartyName = modification.role === 'petitioner' ? petitioner.name : respondent.name;
  const filingPartyAddress = modification.role === 'petitioner' ? petitioner.address : respondent.address;
  const firstCourtName = modification.ldm?.courtName || modification.pt?.courtName || modification.cs?.courtName || '';
  const county = extractCounty(firstCourtName);

  let paraNum = 0;
  const childCount = modification.children.length;
  const childrenText = modification.children.map((child, i) => {
    const name = child.name?.toUpperCase() || `CHILD ${i + 1}`;
    const dob = courtDate(child.dateOfBirth);
    return `${name}, (D.O.B. ${dob})`;
  }).join('; ') || '';

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
        <LineNumbers />

        <View style={styles.proPerBlock}>
          <Text style={styles.proPerLine}>{filingPartyName || '[FILING PARTY NAME]'}</Text>
          <Text style={styles.proPerLine}>{filingPartyAddress || '[ADDRESS]'}</Text>
          <Text style={styles.proPerLabel}>Appearing pro-per</Text>
        </View>

        <View style={styles.courtHeader} wrap={false}>
          <Text style={styles.courtHeaderLine}>IN THE SUPERIOR COURT OF THE STATE OF ARIZONA</Text>
          <Text style={styles.courtHeaderLine}>IN AND FOR THE COUNTY OF {county?.toUpperCase() || '____________'}</Text>
        </View>

        <View style={styles.caseCaption} wrap={false}>
          <View style={styles.captionLeft}>
            <Text style={styles.captionPartyName}>In re the matter of:</Text>
            <Text style={styles.captionPartyName}>{petitioner.name?.toUpperCase() || '[PETITIONER NAME]'},</Text>
            <Text style={styles.captionPartyRole}>Petitioner,</Text>
            <Text style={styles.captionAnd}>and</Text>
            <Text style={styles.captionPartyName}>{respondent.name?.toUpperCase() || '[RESPONDENT NAME]'},</Text>
            <Text style={styles.captionPartyRole}>Respondent.</Text>
          </View>

          <View style={styles.captionParentheses}>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
            <Text style={styles.captionParen}>)</Text>
          </View>

          <View style={styles.captionRight}>
            <Text style={styles.captionCaseNumber}>Case No.: {displayCaseNumber || '_______________'}</Text>
            <Text style={styles.captionTitle}>
              {`PETITION TO MODIFY ${modTitle}`}
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          {filingPartyName?.toUpperCase() || '[FILING PARTY NAME]'} (&ldquo;{filingParty}&rdquo;), for {modification.role === 'petitioner' ? 'his/her' : 'his/her'} Petition to Modify {modTitle} (&ldquo;Petition&rdquo;) pursuant to A.R.S. &sect;25-411 alleges as follows:
        </Text>

        <NumberedParagraph num={++paraNum}>
          {filingParty}&apos;s name is {filingPartyName || '[NAME]'}. {filingParty} was the {modification.role === 'petitioner' ? 'Petitioner' : 'Respondent'} in the original action.
        </NumberedParagraph>

        <NumberedParagraph num={++paraNum}>
          {otherParty}&apos;s name is {modification.role === 'petitioner' ? respondent.name : petitioner.name || '[NAME]'}.
        </NumberedParagraph>

        <NumberedParagraph num={++paraNum}>
          The parties are subject to existing court orders entered in Case No. {displayCaseNumber || '_______________'}.
        </NumberedParagraph>

        <NumberedParagraph num={++paraNum}>
          The parties are the parents of {childCount === 1 ? 'one minor child' : `${childCount} minor children`}, namely: {childrenText}.
        </NumberedParagraph>

        {/* === LEGAL DECISION MAKING === */}
        {modification.ldm && (
          <>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>MODIFICATION OF LEGAL DECISION MAKING</Text>
            </View>

            <NumberedParagraph num={++paraNum}>
              On {courtDate(modification.ldm.orderDate)}, {modification.ldm.courtName || 'the Court'} entered orders regarding Legal Decision Making, found at {formatPageRef(modification.ldm.pageNumber)}, {formatParagraphRef(modification.ldm.paragraphNumber)} of the existing orders.
            </NumberedParagraph>

            {modification.ldm.currentOrderText && (
              <NumberedParagraph num={++paraNum}>
                The current order states: &ldquo;{modification.ldm.currentOrderText}&rdquo;
              </NumberedParagraph>
            )}

            <NumberedParagraph num={++paraNum}>
              {filingParty} alleges that a substantial and continuing change in circumstance has occurred since entry of the previous orders.
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              Specifically, {filingParty} alleges that this Legal Decision Making Order should be modified because: {modification.ldm.whyChange || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} requests that the Court order {formatLdmModificationType(modification.ldm.modificationType, modification.role, 'request')} pursuant to A.R.S. &sect;25-403 and A.R.S. &sect;25-411.
            </NumberedParagraph>
          </>
        )}

        {/* === PARENTING TIME === */}
        {modification.pt && (
          <>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>MODIFICATION OF PARENTING TIME</Text>
            </View>

            <NumberedParagraph num={++paraNum}>
              On {courtDate(modification.pt.orderDate)}, {modification.pt.courtName || 'the Court'} entered orders regarding Parenting Time, found at {formatPageRef(modification.pt.pageNumber)}, {formatParagraphRef(modification.pt.paragraphNumber)} of the existing orders.
            </NumberedParagraph>

            {modification.pt.currentOrderText && (
              <NumberedParagraph num={++paraNum}>
                The current order states: &ldquo;{modification.pt.currentOrderText}&rdquo;
              </NumberedParagraph>
            )}

            <NumberedParagraph num={++paraNum}>
              {filingParty} alleges that a substantial and continuing change in circumstance has occurred since entry of the previous orders.
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              Specifically, {filingParty} alleges that this Parenting Time Order should be modified because: {modification.pt.whyChange || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} requests that the Court order {formatPtSchedule(modification.pt.newSchedule)} pursuant to A.R.S. &sect;25-408 and A.R.S. &sect;25-411.
            </NumberedParagraph>

            {modification.pt.supervised && (
              <NumberedParagraph num={++paraNum}>
                {filingParty} further requests that parenting time be supervised{modification.pt.supervisedReason ? ` because: ${modification.pt.supervisedReason}` : '.'} It is in the best interests of the minor {childCount === 1 ? 'child' : 'children'} that parenting time be supervised.
              </NumberedParagraph>
            )}
          </>
        )}

        {/* === CHILD SUPPORT === */}
        {modification.cs && (
          <>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>MODIFICATION OF CHILD SUPPORT</Text>
            </View>

            <NumberedParagraph num={++paraNum}>
              On {courtDate(modification.cs.orderDate)}, {modification.cs.courtName || 'the Court'} entered orders regarding Child Support, found at {formatPageRef(modification.cs.pageNumber)}, {formatParagraphRef(modification.cs.paragraphNumber)} of the existing orders.
            </NumberedParagraph>

            {modification.cs.currentOrderText && (
              <NumberedParagraph num={++paraNum}>
                The current order states: &ldquo;{modification.cs.currentOrderText}&rdquo;
              </NumberedParagraph>
            )}

            <NumberedParagraph num={++paraNum}>
              {filingParty} alleges that a substantial and continuing change in circumstance has occurred since entry of the previous orders.
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              Specifically, {filingParty} alleges that this Child Support Order should be modified because: {modification.cs.whyChange || '___'}
            </NumberedParagraph>

            <NumberedParagraph num={++paraNum}>
              {filingParty} requests that the Court modify child support in accordance with the Arizona Child Support Guidelines pursuant to A.R.S. &sect;25-320 and A.R.S. &sect;25-327.
            </NumberedParagraph>
          </>
        )}

        {/* WHEREFORE */}
        <View wrap={false}>
          <Text style={{ ...styles.paragraph, marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>WHEREFORE</Text> {filingParty} prays that this Court will grant the following orders:
          </Text>
        </View>

        {(() => {
          let prayerLetter = 65;
          return (
            <>
              {modification.ldm && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Modify the existing Legal Decision Making orders so that {formatLdmModificationType(modification.ldm.modificationType, modification.role, 'prayer')};
                </PrayerItem>
              )}
              {modification.pt && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Modify the existing Parenting Time orders to award {formatPtSchedule(modification.pt.newSchedule)};
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

        <Text style={styles.respectfullySubmitted}>
          RESPECTFULLY SUBMITTED this ___ day of _________________, 20_____.
        </Text>

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

        <View style={styles.filingBlock} wrap={false}>
          <Text style={styles.filingLine}>Original of the foregoing</Text>
          <Text style={styles.filingLine}>filed this ___ day of _________________ 20____</Text>
          <Text style={{ ...styles.filingLine, marginTop: 8 }}>Clerk of Court</Text>
          <Text style={styles.filingLine}>{county || '_____'} County Superior Court</Text>
        </View>

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

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

// ===========================================================
// MAIN COMPONENT — Chooses between full order or petition
// ===========================================================
export function ModificationPetitionDocument({ data, caseNumber, signature }: ModificationPetitionDocumentProps) {
  const { modification } = data;

  if (!modification) {
    return (
      <Document>
        <Page size="LETTER" style={styles.page}>
          <Text>Error: No modification data available.</Text>
        </Page>
      </Document>
    );
  }

  // If we have full order content from an uploaded PDF, render the proposed modified order
  if (modification.fullOrderContent && modification.fullOrderContent.length > 0) {
    return <ProposedModifiedOrder data={data} caseNumber={caseNumber} signature={signature} />;
  }

  // Otherwise, use the standard petition template
  return <PetitionToModify data={data} caseNumber={caseNumber} signature={signature} />;
}

export default ModificationPetitionDocument;
