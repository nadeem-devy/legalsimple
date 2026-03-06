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
    const ldmType = formatLdmModificationType(modification.ldm.modificationType, modification.role, 'request');
    return `[PROPOSED MODIFICATION] The Court orders ${ldmType}. Reason for modification: ${modification.ldm.whyChange || '___'}.`;
  }

  if (block.type === 'parenting_time' && mods.includes('parenting_time') && modification.pt) {
    const schedule = formatPtSchedule(modification.pt.newSchedule);
    let text = `[PROPOSED MODIFICATION] The Court orders ${schedule}. Reason for modification: ${modification.pt.whyChange || '___'}.`;
    if (modification.pt.supervised) {
      text += ` Parenting time shall be supervised${modification.pt.supervisedReason ? ` because: ${modification.pt.supervisedReason}` : ''}.`;
    }
    return text;
  }

  if (block.type === 'child_support' && mods.includes('child_support') && modification.cs) {
    return `[PROPOSED MODIFICATION] Child support shall be recalculated and paid in accordance with the Arizona Child Support Guidelines pursuant to A.R.S. §25-320. Reason for modification: ${modification.cs.whyChange || '___'}.`;
  }

  return null;
}

// Clean up and consolidate line-by-line blocks into paragraphs for PDF rendering
function consolidateBlocks(blocks: OrderContentBlock[]): OrderContentBlock[] {
  // 1. Filter out markdown artifacts, standalone line numbers, and stray parentheses
  const filtered = blocks.filter(block => {
    const text = block.text.trim();
    if (/^\*\*\s*Page\s+\d+\s*:?\s*\*\*$/.test(text)) return false;
    if (/^`{3}\s*$/.test(text)) return false;
    if (/^---PAGE_BREAK---$/i.test(text)) return false;
    if (text.length === 0) return false;
    // Remove standalone line numbers (1-25) from OCR'd pleading pages
    if (/^\d{1,2}$/.test(text) && parseInt(text) >= 1 && parseInt(text) <= 25) return false;
    // Remove standalone parentheses from case caption OCR
    if (/^\)+$/.test(text)) return false;
    return true;
  });

  // 2. Strip leading line numbers from OCR'd pleading text
  //    e.g. "8 In re the matter of:" → "In re the matter of:"
  //    Only strip bare numbers (no period/comma after) followed by uppercase
  const cleaned = filtered.map(block => {
    const stripped = block.text.replace(/^\d{1,2}\s+(?=[A-Z(])/, '');
    return stripped !== block.text ? { ...block, text: stripped } : block;
  });

  // 3. Merge consecutive same-type blocks into paragraphs
  const result: OrderContentBlock[] = [];
  for (const block of cleaned) {
    const prev = result[result.length - 1];
    const canMerge = prev &&
      prev.type === block.type &&
      !looksLikeHeading(block.text) &&
      !looksLikeNumberedItem(block.text) &&
      !looksLikeHeading(prev.text);

    if (canMerge) {
      result[result.length - 1] = {
        ...prev,
        text: prev.text + ' ' + block.text,
      };
    } else {
      result.push({ ...block });
    }
  }

  return result;
}

// Extract attorney/lawyer info from the raw (unconsolidated) blocks of the original court order
function extractAttorneyInfo(rawBlocks: OrderContentBlock[]): string[] {
  if (!rawBlocks || rawBlocks.length === 0) return [];

  const maxSearch = Math.min(rawBlocks.length, 25);
  let barIdx = -1;
  let attorneyForIdx = -1;

  // Find anchors: bar number and "Attorney for"
  for (let i = 0; i < maxSearch; i++) {
    const text = rawBlocks[i].text.trim().replace(/^\d{1,2}\s+(?=[A-Z(])/, '');
    if (/#\d{4,}/.test(text) && barIdx === -1) barIdx = i;
    if (/attorney\s+for/i.test(text)) { attorneyForIdx = i; break; }
    if (/SUPERIOR COURT/i.test(text)) break;
  }

  if (barIdx === -1 && attorneyForIdx === -1) return [];

  const anchor = barIdx >= 0 ? barIdx : attorneyForIdx;
  const startIdx = Math.max(0, anchor - 1);
  const endIdx = attorneyForIdx >= 0 ? attorneyForIdx : Math.min(rawBlocks.length - 1, anchor + 6);

  const lines: string[] = [];
  for (let i = startIdx; i <= endIdx; i++) {
    let text = rawBlocks[i].text.trim();
    text = text.replace(/^\d{1,2}\s+(?=[A-Z(])/, '');
    if (!text || /^\d{1,2}$/.test(text) || /^\*\*/.test(text) || /^`{3}/.test(text) || /^---PAGE_BREAK---$/i.test(text) || /^\)+$/.test(text)) continue;
    if (/SUPERIOR COURT/i.test(text) || /^IN AND FOR/i.test(text.toUpperCase())) break;
    lines.push(text);
  }

  return lines;
}

// Find where substantive content begins (skip header/caption blocks)
function findContentStart(blocks: OrderContentBlock[]): number {
  const maxSearch = Math.min(blocks.length, 25);
  let lastHeaderIdx = -1;

  for (let i = 0; i < maxSearch; i++) {
    const text = blocks[i].text.trim();
    const upper = text.toUpperCase();

    // Content start markers take priority — content starts HERE
    if (
      upper.startsWith('THE COURT FINDS') ||
      upper.startsWith('THE COURT FURTHER FINDS') ||
      upper.startsWith('FINDINGS OF FACT') ||
      upper === 'FINDINGS' || upper === 'FINDINGS:' ||
      upper.startsWith('THE COURT ORDERS') ||
      upper.startsWith('IT IS ORDERED') ||
      upper.startsWith('IT IS HEREBY') ||
      upper.startsWith('WHEREAS') ||
      upper.startsWith('RECITALS') ||
      upper.startsWith('COMES NOW')
    ) {
      return i;
    }

    // Detect header/caption patterns
    const isHeader =
      // Attorney info
      /#\d{4,}/.test(text) ||
      /attorney\s+for/i.test(text) ||
      /\bP\.?L\.?L\.?C\.?\b/i.test(text) ||
      /\bappearing\s+pro[\s-]?per/i.test(text) ||
      /\bESQ\.?\b/i.test(text) ||
      // Court header
      /SUPERIOR COURT/i.test(text) ||
      /^IN AND FOR THE COUNTY/i.test(upper) ||
      /^STATE OF ARIZONA/i.test(upper) ||
      (/COUNTY$/i.test(text.trim()) && text.length < 40) ||
      // Case caption
      /^In re the (matter|marriage) of/i.test(text) ||
      /Case\s+No\.?:?\s/i.test(text) ||
      /^(Petitioner|Respondent)[,.\s]*$/i.test(text) ||
      /^(and|vs\.?|v\.)$/i.test(text.trim()) ||
      // Judge name
      (/^\(.*\)$/.test(text) && text.length < 60) ||
      /^(Honorable|Hon\.)\s/i.test(text);

    // Document title (all caps, mentions party role + document type) — last header element
    const isDocTitle = upper === text && /[A-Z]/.test(upper) && text.length > 20 && text.length < 200 &&
      /\b(RESPONDENT'?S?|PETITIONER'?S?|PROPOSED)\b/.test(upper) &&
      /\b(PETITION|ORDER|DECREE|STIPULATION)\b/.test(upper);

    if (isDocTitle) {
      // Document title is always the last header block — content starts right after
      return i + 1;
    }

    if (isHeader) {
      lastHeaderIdx = i;
    }
  }

  // Content starts after the last detected header block
  if (lastHeaderIdx >= 0) {
    return lastHeaderIdx + 1;
  }

  return 0;
}

// Find where substantive content ends (strip verification, certificate of service, notary)
function findContentEnd(blocks: OrderContentBlock[]): number {
  for (let i = 0; i < blocks.length; i++) {
    const upper = blocks[i].text.trim().toUpperCase();
    if (
      upper === 'VERIFICATION' ||
      upper === 'VERIFICATION:' ||
      upper.startsWith('VERIFICATION') ||
      upper.startsWith('CERTIFICATE OF SERVICE') ||
      upper.startsWith('CERTIFICATE OF MAILING') ||
      upper.startsWith('NOTARY PUBLIC')
    ) {
      return i;
    }
  }
  return blocks.length;
}

function looksLikeHeading(text: string): boolean {
  const t = text.trim();
  return t === t.toUpperCase() && t.length >= 4 && t.length < 120 && /[A-Z]/.test(t);
}

function looksLikeNumberedItem(text: string): boolean {
  return /^(\d+[\.\),:]|[A-Z][\.\)]|\([a-z]+[\.)]*\))\s/.test(text.trim());
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

  const rawBlocks = modification.fullOrderContent || [];
  const attorneyInfo = extractAttorneyInfo(rawBlocks);
  const consolidated = consolidateBlocks(rawBlocks);
  const contentStart = findContentStart(consolidated);
  const contentEnd = findContentEnd(consolidated);
  const fullContent = consolidated.slice(contentStart, contentEnd);
  const displayCaseNumber = modification.caseNumber || caseNumber || '';
  const firstCourtName = modification.ldm?.courtName || modification.pt?.courtName || modification.cs?.courtName || '';
  const county = extractCounty(firstCourtName);
  const filingPartyName = modification.role === 'petitioner' ? petitioner.name : respondent.name;
  const filingPartyAddress = modification.role === 'petitioner' ? petitioner.address : respondent.address;
  const filingPartyPhone = modification.role === 'petitioner' ? petitioner.phone : respondent.phone;
  const filingPartyEmail = modification.role === 'petitioner' ? petitioner.email : respondent.email;
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

        {/* Top row: Attorney/Filing party info (left) + FILED stamp (right) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            {attorneyInfo.length > 0 ? (
              attorneyInfo.map((line, idx) => (
                <Text key={idx} style={styles.proPerLine}>{line}</Text>
              ))
            ) : (
              <>
                <Text style={styles.proPerLine}>{filingPartyName || '[FILING PARTY NAME]'}</Text>
                <Text style={styles.proPerLine}>{filingPartyAddress || '[ADDRESS]'}</Text>
                {filingPartyPhone ? <Text style={styles.proPerLine}>Phone: {filingPartyPhone}</Text> : null}
                {filingPartyEmail ? <Text style={styles.proPerLine}>E-mail: {filingPartyEmail}</Text> : null}
                <Text style={styles.proPerLabel}>Appearing pro-per</Text>
              </>
            )}
          </View>
          <View style={{ width: 160, alignItems: 'center', borderWidth: 1, borderColor: '#000', padding: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>FILED</Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 130, marginBottom: 6, height: 14 }} />
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 130, marginBottom: 2, height: 14 }} />
            <Text style={{ fontSize: 7, fontStyle: 'italic' }}>Clerk of Superior Court</Text>
          </View>
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

        {/* Render full order content with proper pleading format */}
        {(() => {
          const appliedMods = new Set<string>();
          return fullContent.map((block, idx) => {
            // Only apply modification to the FIRST block of each type
            let modifiedText: string | null = null;
            if (!appliedMods.has(block.type)) {
              modifiedText = getModifiedText(block, modification);
              if (modifiedText) {
                appliedMods.add(block.type);
              }
            }

            if (modifiedText) {
              return (
                <View key={idx} style={{ marginBottom: 24 }}>
                  <Text style={{ ...styles.paragraph, textDecoration: 'line-through', color: '#999', fontSize: 9, marginBottom: 4 }}>
                    {block.text}
                  </Text>
                  <Text style={{ ...styles.paragraph, fontWeight: 'bold', marginBottom: 0 }}>
                    {modifiedText}
                  </Text>
                </View>
              );
            }

            // Headings: bold, centered
            if (looksLikeHeading(block.text)) {
              return (
                <Text key={idx} style={{ ...styles.paragraph, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
                  {block.text}
                </Text>
              );
            }

            // Standard paragraph — double-spaced pleading format
            return (
              <Text key={idx} style={styles.paragraph}>
                {block.text}
              </Text>
            );
          });
        })()}

        {/* Signature lines */}
        <View style={{ marginTop: 48 }} wrap={false}>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 250, marginBottom: 4 }} />
          <Text style={{ fontSize: 12, marginBottom: 24 }}>{filingPartyName || '_____________________'}, Appearing Pro-Per</Text>

          <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 250, marginBottom: 4 }} />
          <Text style={{ fontSize: 12 }}>Date</Text>
        </View>
      </Page>

    </Document>
  );
}

// ===========================================================
// PETITION TO MODIFY — Matches standard AZ pleading format
// ===========================================================
function PetitionToModify({
  data,
  caseNumber,
  signature,
}: ModificationPetitionDocumentProps) {
  const { petitioner, respondent, modification } = data;
  if (!modification) return null;

  const filingParty = modification.role === 'petitioner' ? 'Petitioner' : 'Respondent';
  const filingPartyName = modification.role === 'petitioner' ? petitioner.name : respondent.name;
  const filingPartyAddress = modification.role === 'petitioner' ? petitioner.address : respondent.address;
  const filingPartyPhone = modification.role === 'petitioner' ? petitioner.phone : respondent.phone;
  const filingPartyEmail = modification.role === 'petitioner' ? petitioner.email : respondent.email;
  const firstCourtName = modification.ldm?.courtName || modification.pt?.courtName || modification.cs?.courtName || '';
  const county = extractCounty(firstCourtName);

  let paraNum = 0;
  let sectionNum = 0;
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const childCount = modification.children.length;
  const childrenText = modification.children.map((child, i) => {
    const name = child.name || `Child ${i + 1}`;
    const dob = courtDate(child.dateOfBirth);
    return `${name} (D.O.B. ${dob})`;
  }).join('; ') || '';

  const modTitleParts: string[] = [];
  if (modification.modificationsSelected.includes('parenting_time')) modTitleParts.push('PARENTING TIME');
  if (modification.modificationsSelected.includes('legal_decision_making')) modTitleParts.push('LEGAL DECISION MAKING');
  if (modification.modificationsSelected.includes('child_support')) modTitleParts.push('CHILD SUPPORT');
  const modTitle = modTitleParts.join(', AND ');

  const displayCaseNumber = modification.caseNumber || caseNumber || '';

  return (
    <Document
      title={`Petition to Modify - ${filingPartyName}`}
      author="LegalSimple"
      subject={`Petition to Modify ${modTitle}`}
      creator="LegalSimple Court Forms"
    >
      <Page size="LETTER" style={styles.page}>
        <LineNumbers />

        {/* Filing party info (top-left) — always user's info */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.proPerLine}>{filingPartyName || '[FILING PARTY NAME]'}</Text>
          <Text style={styles.proPerLine}>{filingPartyAddress || '[ADDRESS]'}</Text>
          {filingPartyPhone ? <Text style={styles.proPerLine}>Phone: {filingPartyPhone}</Text> : null}
          {filingPartyEmail ? <Text style={styles.proPerLine}>E-mail: {filingPartyEmail}</Text> : null}
          <Text style={styles.proPerLabel}>Appearing pro-per</Text>
        </View>

        {/* Court Header */}
        <View style={styles.courtHeader} wrap={false}>
          <Text style={styles.courtHeaderLine}>SUPERIOR COURT OF THE STATE OF ARIZONA</Text>
          <Text style={styles.courtHeaderLine}>{county?.toUpperCase() || '____________'} COUNTY</Text>
        </View>

        {/* Case Caption */}
        <View style={styles.caseCaption} wrap={false}>
          <View style={styles.captionLeft}>
            <Text style={{ ...styles.captionPartyName, fontStyle: 'italic' }}>In re the matter of:</Text>
            <Text style={styles.captionPartyName}>{petitioner.name?.toUpperCase() || '[PETITIONER NAME]'}</Text>
            <Text style={styles.captionPartyRole}>Petitioner,</Text>
            <Text style={styles.captionAnd}>and</Text>
            <Text style={styles.captionPartyName}>{respondent.name?.toUpperCase() || '[RESPONDENT NAME]'}</Text>
            <Text style={styles.captionPartyRole}>Respondent.</Text>
          </View>

          <View style={styles.captionParentheses}>
            {Array.from({ length: 13 }, (_, i) => (
              <Text key={i} style={styles.captionParen}>)</Text>
            ))}
          </View>

          <View style={styles.captionRight}>
            <Text style={styles.captionCaseNumber}>Case No: {displayCaseNumber || '_______________'}</Text>
            <Text style={{ ...styles.captionTitle, fontWeight: 'bold' }}>
              {`${filingParty.toUpperCase()}\u2019S PETITION TO MODIFY ${modTitle}`}
            </Text>
          </View>
        </View>

        {/* Opening paragraph */}
        <Text style={styles.paragraph}>
          {filingParty} {filingPartyName?.toUpperCase() || '[NAME]'}, appearing pro-per, hereby submits this Petition For Modification pursuant to Rule 91 of the Arizona Rules of Family Law Procedure, and A.R.S. &sect;25-411, and alleges as follows:
        </Text>

        {/* I. PROCEDURAL HISTORY AND RELEVANT FACTS */}
        <Text style={styles.sectionTitle}>
          {romanNumerals[sectionNum++]}. PROCEDURAL HISTORY AND RELEVANT FACTS
        </Text>

        <NumberedParagraph num={++paraNum}>
          The parties have {childCount === 1 ? 'one minor child' : `${childCount} minor children`} in common, namely: {childrenText}. The minor {childCount === 1 ? 'child is' : 'children are'} domiciled in the County of {county || '___'}, State of Arizona, and this court has jurisdiction to decide parenting time matters pursuant to ARS 25-332.
        </NumberedParagraph>

        <NumberedParagraph num={++paraNum}>
          {modification.orderTitle
            ? `A ${modification.orderTitle} was entered`
            : 'Court orders were entered'}{' '}
          {modification.orderDate
            ? `on ${courtDate(modification.orderDate)} and filed with this Court.`
            : 'and filed with this Court.'}
        </NumberedParagraph>

        {modification.pt?.currentOrderText && (
          <NumberedParagraph num={++paraNum}>
            Pursuant to the existing orders, the parties&apos; parenting time was as follows: &ldquo;{modification.pt.currentOrderText}&rdquo;{modification.pt.pageNumber ? ` (See ${formatPageRef(modification.pt.pageNumber)}${modification.pt.paragraphNumber ? ` ${formatParagraphRef(modification.pt.paragraphNumber)}` : ''})` : ''}
          </NumberedParagraph>
        )}

        {modification.cs?.currentOrderText && (
          <NumberedParagraph num={++paraNum}>
            The existing orders further addressed child support as follows: &ldquo;{modification.cs.currentOrderText}&rdquo;{modification.cs.pageNumber ? ` (See ${formatPageRef(modification.cs.pageNumber)}${modification.cs.paragraphNumber ? ` ${formatParagraphRef(modification.cs.paragraphNumber)}` : ''})` : ''}
          </NumberedParagraph>
        )}

        {modification.ldm?.currentOrderText && (
          <NumberedParagraph num={++paraNum}>
            The existing orders addressed legal decision making as follows: &ldquo;{modification.ldm.currentOrderText}&rdquo;{modification.ldm.pageNumber ? ` (See ${formatPageRef(modification.ldm.pageNumber)}${modification.ldm.paragraphNumber ? ` ${formatParagraphRef(modification.ldm.paragraphNumber)}` : ''})` : ''}
          </NumberedParagraph>
        )}

        {/* MODIFICATION OF PARENTING TIME */}
        {modification.pt && (
          <>
            <Text style={styles.sectionTitle}>
              {romanNumerals[sectionNum++]}. MODIFICATION OF PARENTING TIME
            </Text>
            <NumberedParagraph num={++paraNum}>
              Since the parties entered into the existing orders, a significant and ongoing change of circumstance has occurred affecting parenting time.
            </NumberedParagraph>
            <NumberedParagraph num={++paraNum}>
              {modification.pt.whyChange || '___'}
            </NumberedParagraph>
            <NumberedParagraph num={++paraNum}>
              Accordingly, {filingParty} seeks to modify the parties&apos; parenting time schedule to {formatPtSchedule(modification.pt.newSchedule)}.
            </NumberedParagraph>
            {modification.pt.supervised && (
              <NumberedParagraph num={++paraNum}>
                {filingParty} further requests that parenting time be supervised{modification.pt.supervisedReason ? ` because: ${modification.pt.supervisedReason}` : '.'} It is in the best interests of the minor {childCount === 1 ? 'child' : 'children'} that parenting time be supervised.
              </NumberedParagraph>
            )}
            {modification.pt.modifyHolidays && modification.pt.holidayChanges && (
              <NumberedParagraph num={++paraNum}>
                {filingParty} further requests that the holiday parenting time schedule be modified as follows: {modification.pt.holidayChanges}
              </NumberedParagraph>
            )}
            {modification.pt.modifyBreaks && modification.pt.breakChanges && (
              <NumberedParagraph num={++paraNum}>
                {filingParty} further requests that the school break parenting time schedule be modified as follows: {modification.pt.breakChanges}
              </NumberedParagraph>
            )}
            <NumberedParagraph num={++paraNum}>
              {filingParty} avers that the requested schedule is in the {childCount === 1 ? 'child\u2019s' : 'children\u2019s'} best interests.
            </NumberedParagraph>
          </>
        )}

        {/* MODIFICATION OF LEGAL DECISION MAKING */}
        {modification.ldm && (
          <>
            <Text style={styles.sectionTitle}>
              {romanNumerals[sectionNum++]}. MODIFICATION OF LEGAL DECISION MAKING
            </Text>
            <NumberedParagraph num={++paraNum}>
              Since the parties entered into the existing orders, a significant and ongoing change of circumstance has occurred affecting legal decision making.
            </NumberedParagraph>
            <NumberedParagraph num={++paraNum}>
              {modification.ldm.whyChange || '___'}
            </NumberedParagraph>
            <NumberedParagraph num={++paraNum}>
              {filingParty} requests that the Court order {formatLdmModificationType(modification.ldm.modificationType, modification.role, 'request')} pursuant to A.R.S. &sect;25-403 and A.R.S. &sect;25-411.
            </NumberedParagraph>
          </>
        )}

        {/* MODIFICATION OF CHILD SUPPORT */}
        {modification.cs && (
          <>
            <Text style={styles.sectionTitle}>
              {romanNumerals[sectionNum++]}. MODIFICATION OF CHILD SUPPORT
            </Text>
            {modification.pt && (
              <NumberedParagraph num={++paraNum}>
                Should the court determine that it is in the {childCount === 1 ? 'child\u2019s' : 'children\u2019s'} best interests that the parties&apos; parenting time schedule be modified, child support should be modified accordingly pursuant to the Arizona Child Support Guidelines.
              </NumberedParagraph>
            )}
            {modification.cs.whyChange && (
              <NumberedParagraph num={++paraNum}>
                Additionally, {modification.cs.whyChange}
              </NumberedParagraph>
            )}
            {!modification.pt && (
              <>
                <NumberedParagraph num={++paraNum}>
                  Since the parties entered into the existing orders, a significant and ongoing change of circumstance has occurred affecting child support.
                </NumberedParagraph>
                <NumberedParagraph num={++paraNum}>
                  {filingParty} alleges that child support should be modified in accordance with the Arizona Child Support Guidelines pursuant to A.R.S. &sect;25-320 and A.R.S. &sect;25-327.
                </NumberedParagraph>
              </>
            )}
          </>
        )}

        {/* WHEREFORE */}
        <View wrap={false}>
          <Text style={{ ...styles.paragraph, marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>WHEREFORE</Text> {filingParty} prays that the Court grant a hearing and enter the following Orders:
          </Text>
        </View>

        {(() => {
          let prayerLetter = 65;
          return (
            <>
              {modification.pt && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Order that the parties&apos; parenting time schedule be modified to {formatPtSchedule(modification.pt.newSchedule)}{modification.pt.modifyHolidays ? ', including modification of the holiday parenting time schedule' : ''}{modification.pt.modifyBreaks ? `${modification.pt.modifyHolidays ? ',' : ', including'} modification of the school break parenting time schedule` : ''};
                </PrayerItem>
              )}
              {modification.ldm && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Order that {formatLdmModificationType(modification.ldm.modificationType, modification.role, 'prayer')};
                </PrayerItem>
              )}
              {modification.cs && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Order that child support be modified in accordance with the Arizona Child Support Guidelines;
                </PrayerItem>
              )}
              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                For such other relief as the Court deems just and proper.
              </PrayerItem>
            </>
          );
        })()}

        {/* DATED */}
        <Text style={{ ...styles.paragraph, fontWeight: 'bold', marginTop: 16 }}>
          DATED this ___day of _________________, 20_____.
        </Text>

        {/* Signature block — right-aligned */}
        <View style={{ marginTop: 24, marginLeft: 240 }} wrap={false}>
          {signature ? (
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 200, paddingBottom: 4, marginBottom: 2 }}>
              <Image src={signature} style={{ height: 40, objectFit: 'contain' }} />
            </View>
          ) : (
            <View style={{ marginBottom: 2 }}>
              <Text style={{ fontSize: 12 }}>____________________________</Text>
            </View>
          )}
          <Text style={{ fontSize: 12 }}>{filingPartyName || '_____________________'}</Text>
          <Text style={{ fontSize: 12, fontStyle: 'italic' }}>
            Appearing Pro-Per
          </Text>
        </View>

        {/* Filing block */}
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

  // Always use the standard petition format (matches AZ pleading format)
  return <PetitionToModify data={data} caseNumber={caseNumber} signature={signature} />;
}

export default ModificationPetitionDocument;
