import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { pleadingStyles as styles } from '@/lib/court-forms/PleadingStyles';
import { NormalizedPDFData, formatMaintenanceReason } from '@/lib/court-forms/data-mapper';

interface PleadingDocumentProps {
  data: NormalizedPDFData;
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

// Helper: lettered sub-item
function LetteredItem({ letter, children }: { letter: string; children: React.ReactNode }) {
  return (
    <View style={styles.letteredItem} wrap={false}>
      <Text style={styles.letteredBullet}>{letter}.</Text>
      <Text style={styles.letteredContent}>{children}</Text>
    </View>
  );
}

// Helper: bullet point sub-item
function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletItem} wrap={false}>
      <Text style={styles.bulletDot}>{'\u2022'}</Text>
      <Text style={styles.bulletContent}>{children}</Text>
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

// Format bank account description: "Bank of America 4564" → "the Bank of America bank account ending in 4564"
function formatBankAccountDescription(description: string): string {
  const parts = description.trim().split(/\s+/);
  if (parts.length === 0) return description;
  const lastPart = parts[parts.length - 1];
  const isAccountNumber = /^\d+$/.test(lastPart) || /^[Xx]+$/.test(lastPart);
  if (isAccountNumber && parts.length > 1) {
    const bankName = parts.slice(0, -1).join(' ');
    if (/^[Xx]+$/.test(lastPart)) {
      return `the ${bankName} bank account (account number unknown)`;
    }
    return `the ${bankName} bank account ending in ${lastPart}`;
  }
  return `the ${description} bank account`;
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
  return !['no', 'none', 'n/a', 'na', 'nothing', 'no.', 'none.'].includes(normalized);
}

export function PleadingDocument({ data, signature }: PleadingDocumentProps) {
  const { petitioner, respondent, marriage, military, property, debts, maintenance, nameRestoration, caseType, children, custody, safetyIssues, childSupport, parentingTime, vacationTravel } = data;
  const hasChildren = caseType === 'divorce_with_children';
  const isMale = petitioner.gender === 'male';
  const petitionerAlias = hasChildren ? (isMale ? 'Father' : 'Mother') : 'Petitioner';
  const respondentAlias = hasChildren ? (isMale ? 'Mother' : 'Father') : 'Respondent';
  const pronoun = isMale ? 'his' : 'her';
  // Covenant marriage: only asked in divorce_with_children flow, defaults to false for divorce_no_children
  const covenantLabel = (marriage.isCovenantMarriage === true) ? 'covenant' : 'non-covenant';

  // Auto-incrementing paragraph counter
  let paraNum = 0;

  // Build children text inline: "CHILD1 NAME, (D.O.B. MM/DD/YYYY) and CHILD2 NAME, (D.O.B. MM/DD/YYYY)"
  const childrenText = children?.list?.map((child, i) => {
    const name = child.name?.toUpperCase() || `CHILD ${i + 1}`;
    const dob = courtDate(child.dateOfBirth);
    return `${name}, (D.O.B. ${dob})`;
  }).join(' and ') || '';

  const childCount = children?.list?.length || 0;

  return (
    <Document
      title={`Petition for Dissolution of Marriage - ${petitioner.name}`}
      author="LegalSimple"
      subject="Petition for Dissolution of Marriage"
      creator="LegalSimple Court Forms"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Line Numbers */}
        <LineNumbers />

        {/* Pro-Per Identification Block */}
        <View style={styles.proPerBlock}>
          <Text style={styles.proPerLine}>{petitioner.name || '[PETITIONER NAME]'}</Text>
          <Text style={styles.proPerLine}>{petitioner.address || '[ADDRESS]'}</Text>
          <Text style={styles.proPerLine}>Phone: {petitioner.phone || '[PHONE]'}</Text>
          <Text style={styles.proPerLine}>E-mail: {petitioner.email || '[EMAIL]'}</Text>
          <Text style={styles.proPerLabel}>Appearing pro-per</Text>
        </View>

        {/* Court Header */}
        <View style={styles.courtHeader} wrap={false}>
          <Text style={styles.courtHeaderLine}>IN THE SUPERIOR COURT OF THE STATE OF ARIZONA</Text>
          <Text style={styles.courtHeaderLine}>IN AND FOR THE COUNTY OF {petitioner.county?.toUpperCase() || '____________'}</Text>
        </View>

        {/* Case Caption */}
        <View style={styles.caseCaption} wrap={false}>
          <View style={styles.captionLeft}>
            <Text style={styles.captionPartyName}>In re the Marriage of:</Text>
            <Text style={styles.captionPartyName}>{petitioner.name?.toUpperCase() || '[PETITIONER NAME]'}.</Text>
            <Text style={styles.captionPartyRole}>Petitioner,</Text>
            <Text style={styles.captionAnd}>and</Text>
            <Text style={styles.captionPartyName}>{respondent.name?.toUpperCase() || '[RESPONDENT NAME]'}</Text>
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

          {/* Right Side - Title */}
          <View style={styles.captionRight}>
            <Text style={styles.captionTitle}>
              {`PETITIONER'S VERIFIED PETITION FOR DISSOLUTION OF A ${covenantLabel.toUpperCase()} MARRIAGE ${hasChildren ? 'WITH MINOR CHILDREN' : 'WITHOUT MINOR CHILDREN'}`}
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <Text style={styles.paragraph}>
          {petitioner.name?.toUpperCase() || '[PETITIONER NAME]'} {hasChildren ? `(\u201c${petitionerAlias}\u201d or \u201cPetitioner\u201d)` : '(\u201cPetitioner\u201d)'} for {pronoun} Petition for Dissolution of Marriage (&ldquo;Petition&rdquo;) against {respondent.name?.toUpperCase() || '[RESPONDENT NAME]'} {hasChildren ? `(\u201c${respondentAlias}\u201d or \u201cRespondent\u201d)` : '(\u201cRespondent\u201d)'} avers as follows:
        </Text>

        {/* PARAGRAPH 1: Domicile */}
        <NumberedParagraph num={++paraNum}>
          Petitioner&apos;s domicile is {petitioner.county || '_____'} County, Arizona, and Petitioner has lived in {petitioner.county || '_____'} County for at least ninety (90) days prior to the filing of the Petition.
        </NumberedParagraph>

        {/* PARAGRAPH: Military Service */}
        {military?.isMilitary && (
          <NumberedParagraph num={++paraNum}>
            {military.isDeployed
              ? `A party to this action is a member of the U.S. Armed Forces and is currently deployed${military.deploymentLocation ? ` at ${military.deploymentLocation}` : ''}.`
              : 'A party to this action is a member of the U.S. Armed Forces and is not currently deployed.'}
          </NumberedParagraph>
        )}

        {/* PARAGRAPH: Addresses */}
        <NumberedParagraph num={++paraNum}>
          Petitioner and Respondent&apos;s sensitive information is listed in the Sensitive Data Cover Sheet filed herewith under seal.
        </NumberedParagraph>

        {/* PARAGRAPH 3: Marriage */}
        <NumberedParagraph num={++paraNum}>
          Petitioner and Respondent were married on {courtDate(marriage.date)}{marriage.separationDate ? ` and separated on ${courtDate(marriage.separationDate)}` : ''}. This is a {covenantLabel} marriage.
        </NumberedParagraph>

        {/* PARAGRAPH 4: Irretrievably broken */}
        <NumberedParagraph num={++paraNum}>
          The marriage is irretrievably broken, and there is no reasonable prospect for reconciliation.
        </NumberedParagraph>

        {/* Conciliation */}
        {marriage.wantsConciliation && (
          <NumberedParagraph num={++paraNum}>
            Petitioner requests that the Court refer the parties to conciliation services pursuant to A.R.S. &sect;25-381.09.
          </NumberedParagraph>
        )}

        {/* CHILDREN SECTION */}
        {hasChildren && children ? (
          <>
            {/* Children list */}
            <NumberedParagraph num={++paraNum}>
              The parties have {childCount === 1 ? 'one child' : childCount === 2 ? 'two children' : `${childCount} children`} in common, namely {childrenText}.
            </NumberedParagraph>

            {/* Biological parents of children born before marriage */}
            {children.bornBeforeMarriage && (
              <NumberedParagraph num={++paraNum}>
                {children.areBothBiologicalParents
                  ? 'Petitioner avers that Petitioner and Respondent are the biological parents of all of the minor children, including those children born prior to the marriage.'
                  : children.otherBioParentName
                  ? `Petitioner is the biological ${children.petitionerBiologicalRole || 'parent'} of the children born prior to the marriage. The biological ${children.petitionerBiologicalRole === 'mother' ? 'father' : 'mother'} of said children is ${children.otherBioParentName}${children.otherBioParentAddress ? `, residing at ${children.otherBioParentAddress}` : ''}.`
                  : `Some of the minor children were born prior to the date of marriage, specifically: ${children.bornBeforeMarriageNames || 'as identified above'}.`}
              </NumberedParagraph>
            )}

            {/* Pregnancy */}
            <NumberedParagraph num={++paraNum}>
              {marriage.isPregnant
                ? `${marriage.pregnantParty === 'petitioner' ? 'Petitioner' : 'Respondent'} is now pregnant${marriage.pregnancyDueDate ? `, with an anticipated due date of ${courtDate(marriage.pregnancyDueDate)}` : ''}. ${marriage.isBiologicalFather === true ? 'Petitioner is the biological father of the unborn child.' : marriage.isBiologicalFather === false ? 'Petitioner is not the biological father of the unborn child.' : ''}`
                : 'Neither party is currently pregnant.'}
            </NumberedParagraph>

            {/* Children residency */}
            <NumberedParagraph num={++paraNum}>
              {children.meetResidency
                ? `The minor ${childCount === 1 ? 'child has' : 'children have'} resided in the State of Arizona for at least six (6) months prior to the filing of this Petition.`
                : `The minor ${childCount === 1 ? 'child' : 'children'} currently ${children.resideWith === 'petitioner' ? 'reside with Petitioner' : children.resideWith === 'respondent' ? 'reside with Respondent' : 'reside with both parties'}.`}
            </NumberedParagraph>

            {/* Jurisdiction for children */}
            <NumberedParagraph num={++paraNum}>
              This Court has jurisdiction to determine legal decision-making and parenting time of the minor children in common to the parties pursuant to A.R.S. &sect;&sect;25-402 and 25-1031.
            </NumberedParagraph>

            {/* Domestic violence disclosure */}
            <NumberedParagraph num={++paraNum}>
              Petitioner alleges that {safetyIssues?.hasDomesticViolence ? 'there has been an act of domestic violence as defined in A.R.S. §13-3601 involving the parties or a household member' : 'there has not been an act of domestic violence as defined in A.R.S. §13-3601 involving the parties or a household member'}.{safetyIssues?.hasDomesticViolence && safetyIssues.domesticViolenceOption === 'no_joint_decision' ? ' Pursuant to A.R.S. §25-403.03, no joint legal decision-making should be awarded to the party who committed domestic violence.' : ''}{safetyIssues?.hasDomesticViolence && safetyIssues.domesticViolenceOption === 'joint_despite_violence' ? ' Despite the history of domestic violence, Petitioner avers that it would still be in the best interests of the children for the parties to share joint legal decision-making.' : ''}
            </NumberedParagraph>

            {/* Drug/DUI disclosure */}
            <NumberedParagraph num={++paraNum}>
              {safetyIssues?.hasDrugConviction && safetyIssues.drugConvictionParty === 'me'
                ? 'Petitioner has been convicted for a drug offense or driving under the influence of drugs or alcohol in the last twelve (12) months.'
                : safetyIssues?.hasDrugConviction && safetyIssues.drugConvictionParty === 'spouse'
                ? 'Respondent has been convicted for a drug offense or driving under the influence of drugs or alcohol in the last twelve (12) months.'
                : 'Neither party has been convicted for a drug offense or driving under the influence of drugs or alcohol in the last twelve (12) months.'}
            </NumberedParagraph>

            {/* Legal decision-making */}
            <NumberedParagraph num={++paraNum}>
              {custody?.legalDecisionMaking === 'joint'
                ? `Petitioner requests that the parties be awarded equal legal decision-making authority for the minor children.`
                : custody?.legalDecisionMaking === 'petitioner_sole'
                ? `Petitioner avers that pursuant to Arizona Revised Statutes §25-403 it is in the children's best interests that sole legal decision-making authority be awarded to Petitioner for the minor children.`
                : custody?.legalDecisionMaking === 'respondent_sole'
                ? `Petitioner requests that sole legal decision-making authority be awarded to Respondent for the minor children.`
                : custody?.legalDecisionMaking === 'joint_with_final_say'
                ? `Petitioner requests equal legal decision-making authority with ${custody.finalSayParty === 'petitioner' ? 'Petitioner' : custody.finalSayParty === 'me' ? 'Petitioner' : 'Respondent'} having final say authority for the minor children.`
                : `The parties have not reached any agreements on legal decision-making, parenting time and child support.`}
            </NumberedParagraph>

            {/* Parenting time schedule */}
            {parentingTime && (
              <>
                <NumberedParagraph num={++paraNum}>
                  {parentingTime.schedule === 'no_parenting_time'
                    ? 'Petitioner requests that Respondent have no parenting time with the minor children.'
                    : parentingTime.isSupervised
                    ? `Petitioner requests that Respondent have supervised parenting time with the minor children.${parentingTime.customDetails ? ` ${parentingTime.customDetails}` : ''}`
                    : parentingTime.schedule === 'custom'
                    ? `As for parenting time, ${parentingTime.customDetails || 'the parties shall establish a parenting time schedule in the best interests of the children.'}`
                    : parentingTime.schedule === '3-2-2-3'
                    ? `Petitioner requests that parenting time follow an equal 3-2-2-3 schedule where one parent has the children for three days (Monday-Wednesday), the other parent has them for two days (Thursday-Friday), then the first parent for two days (Saturday-Sunday), and the other parent for three days, alternating weekly. This provides equal parenting time to both parties.`
                    : parentingTime.schedule === '5-2-2-5'
                    ? `Petitioner requests that parenting time follow an equal 5-2-2-5 schedule where one parent has the children for five days, the other parent has them for two days, then the first parent for two days, and the other parent for five days, alternating every two weeks. This provides equal parenting time to both parties.`
                    : parentingTime.schedule === 'alternating_weeks'
                    ? `Petitioner requests that parenting time follow an alternating week schedule where children spend one full week with each parent, alternating weekly. This provides equal parenting time to both parties.`
                    : `Petitioner requests that parenting time follow a ${parentingTime.schedule} schedule in the best interests of the children.`}
                </NumberedParagraph>

                {/* Exchange method */}
                {parentingTime.exchangeMethod && ['pickup', 'dropoff', 'midway'].includes(parentingTime.exchangeMethod) && (
                  <NumberedParagraph num={++paraNum}>
                    {parentingTime.exchangeMethod === 'pickup'
                      ? 'The parent receiving parenting time shall pick up the children at the other parent\'s residence at the agreed-upon time.'
                      : parentingTime.exchangeMethod === 'dropoff'
                      ? 'The parent ending parenting time shall drop off the children at the other parent\'s residence at the agreed-upon time.'
                      : 'The parties shall meet at a mutually agreed midway location to exchange the children.'}
                  </NumberedParagraph>
                )}

                {/* Phone/video contact */}
                {parentingTime.phoneContact && (
                  <NumberedParagraph num={++paraNum}>
                    {parentingTime.phoneContact === 'normal_hours'
                      ? 'Each parent shall have reasonable phone and video contact with the children during normal waking hours when the children are with the other parent.'
                      : parentingTime.phoneContact === 'custom' && parentingTime.phoneContactCustom
                      ? `Phone and video contact schedule: ${parentingTime.phoneContactCustom}`
                      : 'Each parent shall have reasonable phone and video contact with the children when they are with the other parent.'}
                  </NumberedParagraph>
                )}
              </>
            )}

            {/* Holiday schedule */}
            {parentingTime?.holidaySchedule && (() => {
              const schedule = parentingTime.holidaySchedule;
              const formatHoliday = (name: string, option: string) => {
                if (option === 'petitioner_even') return `${name} with Petitioner in even years, Respondent in odd years`;
                if (option === 'respondent_even') return `${name} with Respondent in even years, Petitioner in odd years`;
                if (option === 'petitioner_every') return `${name} with Petitioner every year`;
                if (option === 'respondent_every') return `${name} with Respondent every year`;
                if (option === 'regular_schedule') return `${name} follows regular parenting schedule`;
                return '';
              };

              const holidays = [
                schedule.newYearsEve && formatHoliday('New Year\'s Eve', schedule.newYearsEve),
                schedule.newYearsDay && formatHoliday('New Year\'s Day', schedule.newYearsDay),
                schedule.easter && formatHoliday('Easter', schedule.easter),
                schedule.fourthOfJuly && formatHoliday('Fourth of July', schedule.fourthOfJuly),
                schedule.halloween && formatHoliday('Halloween', schedule.halloween),
                schedule.thanksgiving && formatHoliday('Thanksgiving', schedule.thanksgiving),
                schedule.hanukkah && formatHoliday('Hanukkah', schedule.hanukkah),
                schedule.christmasEve && formatHoliday('Christmas Eve', schedule.christmasEve),
                schedule.christmasDay && formatHoliday('Christmas Day', schedule.christmasDay),
                schedule.childBirthday && formatHoliday('Child\'s Birthday', schedule.childBirthday),
                schedule.motherBirthday && formatHoliday('Mother\'s Birthday', schedule.motherBirthday),
                schedule.fatherBirthday && formatHoliday('Father\'s Birthday', schedule.fatherBirthday),
                schedule.mothersDay && formatHoliday('Mother\'s Day', schedule.mothersDay),
                schedule.fathersDay && formatHoliday('Father\'s Day', schedule.fathersDay),
                // Parse and include custom/other holidays
                ...(schedule.otherHolidays ? schedule.otherHolidays.split(';').map(entry => entry.trim()).filter(Boolean) : []),
              ].filter(Boolean);

              if (holidays.length === 0) return null;

              return (
                <View style={styles.numberedParagraph} wrap={false}>
                  <Text style={styles.paragraphNumber}>{++paraNum}.</Text>
                  <View style={styles.paragraphContent}>
                    <Text style={{ marginBottom: 4 }}>Holiday parenting time shall be allocated as follows:</Text>
                    {holidays.map((holiday, i) => (
                      <View key={i} style={{ flexDirection: 'row', marginLeft: 8, marginBottom: 2 }}>
                        <Text style={{ width: 16 }}>{String.fromCharCode(97 + i)}.</Text>
                        <Text style={{ flex: 1 }}>{holiday}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* School breaks */}
            {parentingTime?.breakSchedule && (() => {
              const breaks = parentingTime.breakSchedule;
              const formatBreak = (name: string, option: string) => {
                if (option === 'petitioner_even') return `${name} with Petitioner in even years, Respondent in odd years`;
                if (option === 'respondent_even') return `${name} with Respondent in even years, Petitioner in odd years`;
                if (option === 'petitioner_every') return `${name} with Petitioner every year`;
                if (option === 'respondent_every') return `${name} with Respondent every year`;
                if (option === 'regular_schedule') return `${name} follows regular parenting schedule`;
                return '';
              };

              const schedules = [
                breaks.springBreak && formatBreak('Spring Break', breaks.springBreak),
                breaks.fallBreak && formatBreak('Fall Break', breaks.fallBreak),
                breaks.winterBreak && formatBreak('Winter Break', breaks.winterBreak),
              ].filter(Boolean);

              if (schedules.length === 0) return null;

              return (
                <View style={styles.numberedParagraph} wrap={false}>
                  <Text style={styles.paragraphNumber}>{++paraNum}.</Text>
                  <View style={styles.paragraphContent}>
                    <Text style={{ marginBottom: 4 }}>School break parenting time shall be allocated as follows:</Text>
                    {schedules.map((schedule, i) => (
                      <View key={i} style={{ flexDirection: 'row', marginLeft: 8, marginBottom: 2 }}>
                        <Text style={{ width: 16 }}>{String.fromCharCode(97 + i)}.</Text>
                        <Text style={{ flex: 1 }}>{schedule}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* Summer schedule */}
            {parentingTime?.summerDeviation !== undefined && (
              <NumberedParagraph num={++paraNum}>
                {parentingTime.summerDeviation && parentingTime.summerDeviationDetails
                  ? `Summer parenting time schedule: ${parentingTime.summerDeviationDetails}`
                  : 'During summer break, the regular parenting time schedule shall continue to apply.'}
              </NumberedParagraph>
            )}

            {/* Vacation time */}
            {vacationTravel?.hasVacationTime && (
              <NumberedParagraph num={++paraNum}>
                Each parent shall be entitled to {vacationTravel.vacationDuration || 'reasonable'} vacation time with the children per year{vacationTravel.vacationNotice ? `, with ${vacationTravel.vacationNotice} advance notice to the other parent` : ''}.{vacationTravel.vacationPriority ? ` In the event of conflicting vacation dates, Petitioner shall have priority for vacation selection in ${vacationTravel.vacationPriority} years.` : ''}
              </NumberedParagraph>
            )}

            {/* Travel restrictions */}
            {vacationTravel && !vacationTravel.bothCanTravel && (
              <NumberedParagraph num={++paraNum}>
                {vacationTravel.restrictedParty === 'petitioner'
                  ? 'Petitioner shall not be permitted'
                  : vacationTravel.restrictedParty === 'respondent'
                  ? 'Respondent shall not be permitted'
                  : 'Neither party shall be permitted'} to take the children out of the State of Arizona without the prior written consent of the other party{vacationTravel.maxTravelDays ? ` for more than ${vacationTravel.maxTravelDays} days` : ''}.{vacationTravel.itineraryNotice ? ` If travel is approved, the traveling party must provide a complete itinerary ${vacationTravel.itineraryNotice} days in advance.` : ''} Such consent shall not be unreasonably withheld.
              </NumberedParagraph>
            )}

            {/* Extracurricular activities */}
            {data.extracurricular && (
              <NumberedParagraph num={++paraNum}>
                {data.extracurricular.option === 'both_agree_split'
                  ? 'Both parties must agree to any extracurricular activities for the children, and costs shall be split equally between the parties.'
                  : data.extracurricular.option === 'each_selects_pays'
                  ? 'Each parent may select and enroll the children in extracurricular activities during their parenting time, and each parent shall be responsible for the costs of activities they select.'
                  : data.extracurricular.option === 'each_selects_limit_split'
                  ? `Each parent may select and enroll the children in extracurricular activities, up to ${data.extracurricular.limit || 'a reasonable number'} activities per year. Costs shall be split equally between the parties.`
                  : data.extracurricular.option === 'other' && data.extracurricular.otherDetails
                  ? `The parties agree to the following arrangement for extracurricular activities: ${data.extracurricular.otherDetails}`
                  : 'Extracurricular activities shall be determined in the best interests of the children.'}
              </NumberedParagraph>
            )}

            {/* Right of first refusal */}
            {data.rightOfFirstRefusal && (
              <NumberedParagraph num={++paraNum}>
                Each parent shall have a right of first refusal if the other parent is unable to care for the children for a period exceeding twenty-four (24) consecutive hours during their scheduled parenting time. The parent shall notify the other parent and offer them the opportunity to care for the children before arranging alternative childcare.
              </NumberedParagraph>
            )}

            {/* Child support */}
            <NumberedParagraph num={++paraNum}>
              {childSupport?.seeking
                ? `The Court should award child support in accordance with the Arizona Child Support Guidelines.${childSupport.pastSupportPeriod === 'from_filing' ? ' Petitioner requests that child support be calculated from the date of filing of this Petition.' : childSupport.pastSupportPeriod === 'from_separation' ? ' Petitioner requests that child support be calculated from the date of separation, up to three (3) years prior to the filing of this Petition pursuant to A.R.S. §25-320.' : ''}${childSupport.hasVoluntaryPayments ? ` Voluntary child support payments have been made${childSupport.voluntaryPaymentsDetails ? `: ${childSupport.voluntaryPaymentsDetails}` : ''}.` : ''}`
                : 'The Court should award child support, however at this time Petitioner is willing to waive any child support.'}
            </NumberedParagraph>
          </>
        ) : (
          <>
            {/* No children */}
            <NumberedParagraph num={++paraNum}>
              There are no minor children born of, adopted by, or currently expected by the parties to this marriage.
            </NumberedParagraph>

            {/* Pregnancy */}
            <NumberedParagraph num={++paraNum}>
              {marriage.isPregnant
                ? `${marriage.pregnantParty === 'petitioner' ? 'Petitioner' : 'Respondent'} is currently pregnant${marriage.pregnancyDueDate ? `, with an anticipated due date of ${courtDate(marriage.pregnancyDueDate)}` : ''}.`
                : 'Neither party is currently pregnant.'}
            </NumberedParagraph>
          </>
        )}

        {/* SPOUSAL MAINTENANCE */}
        <NumberedParagraph num={++paraNum}>
          {maintenance.entitlement === 'neither'
            ? 'Petitioner avers that neither party is entitled to spousal maintenance.'
            : maintenance.entitlement === 'me'
            ? `Petitioner requests that the Court award spousal maintenance to Petitioner in an amount and for a duration deemed just and proper pursuant to A.R.S. §25-319.${maintenance.reasons && maintenance.reasons.length > 0 ? ` Petitioner is entitled to maintenance because: ${maintenance.reasons.map(r => formatMaintenanceReasonSentence(r, 'Petitioner')).join('. ')}.` : ''}`
            : `Petitioner requests that the Court award spousal maintenance to Respondent in an amount and for a duration deemed just and proper pursuant to A.R.S. §25-319.${maintenance.reasons && maintenance.reasons.length > 0 ? ` Respondent is entitled to maintenance because: ${maintenance.reasons.map(r => formatMaintenanceReasonSentence(r, 'Respondent')).join('. ')}.` : ''}`}
        </NumberedParagraph>

        {/* PROPERTY AND DEBTS - Combined with lettered sub-items */}
        <NumberedParagraph num={++paraNum}>
          The parties have acquired certain community and jointly owned property and community or joint debts during the marriage. {property.hasAgreement && property.allCovered
            ? 'The parties have reached an agreement regarding the division of community property and debts, which is incorporated herein by reference.'
            : property.hasAgreement
            ? 'The parties have reached a partial agreement regarding the division of community property and debt. The remaining community property and debt shall be divided as follows:'
            : 'There is no agreement as to the division of community property and debt, but all community property and debt shall be divided and a fair and just allocation of such property and responsibility for payment of such debts should be made by the Court as follows:'}
        </NumberedParagraph>

        {!property.hasAgreement && property.divisionPreference !== 'court_decides' && (() => {
          let letterNum = 97; // ASCII 'a'
          return (
            <>
              {/* Personal property */}
              <LetteredItem letter={String.fromCharCode(letterNum++)}>
                {property.personalPropertyPreference === 'itemize'
                  ? `The following personal property should be awarded to Petitioner: ${property.personalPropertyMine || 'N/A'}. The following personal property should be awarded to Respondent: ${property.personalPropertySpouse || 'N/A'};`
                  : 'Each party should keep the personal property in his/her possession as their sole and separate property;'}
              </LetteredItem>

              {/* Real estate */}
              {property.hasRealEstate && property.realEstate.length > 0 && (
                <LetteredItem letter={String.fromCharCode(letterNum++)}>
                  {property.realEstate.map((r, i) => {
                    const awardedTo = r.divisionOption === 'i_keep' ? 'Petitioner' : r.divisionOption === 'spouse_keeps' ? 'Respondent' : '';
                    const disclaimerNote = r.hasDisclaimerDeed
                      ? (r.usedCommunityFunds
                        ? `${r.requestEquitableLien ? ' Petitioner requests an equitable lien for community funds used toward this property.' : ' Community funds were used toward this property.'}`
                        : ' A disclaimer deed was executed and no community funds were used; this property is the sole and separate property of the titled party.')
                      : '';
                    return `${i > 0 ? '; ' : ''}${r.divisionOption === 'sell_split' ? `The real property located at ${r.address || 'address to be determined'} should be sold and proceeds divided equally between the parties` : `${awardedTo} should be awarded the real property located at ${r.address || 'address to be determined'} as ${awardedTo}'s sole and separate property`}${disclaimerNote}`;
                  }).join('')};
                </LetteredItem>
              )}

              {/* Bank accounts */}
              {property.bankAccountsStructured && property.bankAccountsStructured.length > 0 ? (
                <LetteredItem letter={String.fromCharCode(letterNum++)}>
                  {property.bankAccountsStructured.map((acct, i) => {
                    const divText = acct.division === 'i_keep' ? 'Petitioner' : acct.division === 'spouse_keeps' ? 'Respondent' : 'the parties, divided equally';
                    return `${i > 0 ? '; ' : ''}${formatBankAccountDescription(acct.description)} should be awarded to ${divText}`;
                  }).join('')};
                </LetteredItem>
              ) : (
                <LetteredItem letter={String.fromCharCode(letterNum++)}>
                  Each party should keep any checking/savings accounts in their individual names, and any funds therein as their sole and separate property without any offsets;
                </LetteredItem>
              )}

              {/* Vehicles */}
              {property.hasVehicles && property.vehicles.length > 0 && (
                <LetteredItem letter={String.fromCharCode(letterNum++)}>
                  {property.vehicles.map((v, i) => {
                    const titledTo = v.titledTo === 'me' ? 'Petitioner' : v.titledTo === 'spouse' ? 'Respondent' : 'both parties';
                    return `${i > 0 ? '; ' : ''}${titledTo} should be awarded the ${v.year} ${v.make} ${v.model}${v.loanBalance ? `, and all debt attached thereto,` : ''} as ${v.titledTo === 'both' ? 'it should be sold and proceeds divided' : 'his/her sole and separate property and debt without any offsets'}`;
                  }).join('')};
                </LetteredItem>
              )}

              {/* Retirement */}
              {property.hasRetirement && (
                <LetteredItem letter={String.fromCharCode(letterNum++)}>
                  {property.retirement && property.retirement.length > 0
                    ? property.retirement.map((acct, i) => {
                        const owner = acct.ownerName === 'me' ? 'Petitioner' : 'Respondent';
                        const type = acct.accountType === 'other' ? (acct.accountTypeOther || 'retirement account') : acct.accountType?.toUpperCase();
                        return `${i > 0 ? '; ' : ''}The ${type} account held by ${owner}${acct.administrator ? ` at ${acct.administrator}` : ''} — ${acct.proposedDivision || 'to be divided as the court deems just and proper'}`;
                      }).join('')
                    : 'Each party should be awarded any retirement account, pension plans, or other deferred compensation in his/her separate name as their sole and separate property without any offsets'};
                </LetteredItem>
              )}

            </>
          );
        })()}

        {/* COMMUNITY DEBTS - shown independently of property agreement */}
        {debts.hasCommunityDebt && (
          <NumberedParagraph num={++paraNum}>
            {debts.communityDebtPreference === 'keep_in_name'
              ? 'The parties have community debts. Each party should be responsible for the debts in his/her individual name as their sole and separate debt.'
              : debts.communityDebtPreference === 'itemize'
              ? `The parties have the following community debts that should be divided as follows: ${[
                  ...(debts.creditCards || []).map(c => `${c.description} — awarded to ${c.awardedTo === 'me' ? 'Petitioner' : c.awardedTo === 'spouse' ? 'Respondent' : c.awardedTo === 'split' ? 'divided equally' : c.otherDetails || 'other arrangement'}`),
                  ...(debts.hasStudentLoanDebt ? [`Student loan debt — ${debts.studentLoanDivision === 'me' ? 'awarded to Petitioner' : debts.studentLoanDivision === 'spouse' ? 'awarded to Respondent' : debts.studentLoanDivision === 'split' ? 'divided equally' : debts.studentLoanOtherDetails || 'other arrangement'}`] : []),
                  ...(debts.hasMedicalDebt ? [`Medical debt — ${debts.medicalDebtDivision === 'me' ? 'awarded to Petitioner' : debts.medicalDebtDivision === 'spouse' ? 'awarded to Respondent' : debts.medicalDebtDivision === 'split' ? 'divided equally' : debts.medicalDebtOtherDetails || 'other arrangement'}`] : []),
                  ...(debts.hasOtherCommunityDebt ? [`${debts.otherCommunityDebtDescription || 'Other debt'} — ${debts.otherCommunityDebtDivision === 'me' ? 'awarded to Petitioner' : debts.otherCommunityDebtDivision === 'spouse' ? 'awarded to Respondent' : debts.otherCommunityDebtDivision === 'split' ? 'divided equally' : debts.otherCommunityDebtOtherDetails || 'other arrangement'}`] : []),
                ].join('; ')}.`
              : 'The parties have community debts. Each party should be allocated any credit card debt in his/her separate name as their sole and separate debt. For any credit card which is assigned under both parties\' names, the parties should equally divide the debt.'
            }
          </NumberedParagraph>
        )}

        {/* SEPARATE PROPERTY */}
        {property.hasSeparateProperty && (() => {
          let sepLetterNum = 97; // ASCII 'a'
          const allItems: { text: string; key: string }[] = [];

          if (property.courtDecidesSeparateProperty) {
            const parts = property.courtDecidesSeparateProperty.split(',').map(s => s.trim());
            for (let i = 0; i < parts.length; i += 2) {
              allItems.push({ text: `${parts[i]}${parts[i + 1] ? ` - awarded to ${parts[i + 1]}` : ''}`, key: `sp-court-${i}` });
            }
          } else {
            if (property.petitionerSeparateProperty) {
              property.petitionerSeparateProperty.split(',').forEach((item, i) => {
                allItems.push({ text: `${item.trim()} - awarded to Petitioner`, key: `sp-pet-${i}` });
              });
            }
            if (property.respondentSeparateProperty) {
              property.respondentSeparateProperty.split(',').forEach((item, i) => {
                allItems.push({ text: `${item.trim()} - awarded to Respondent`, key: `sp-res-${i}` });
              });
            }
          }

          return (
            <View wrap={false}>
              <NumberedParagraph num={++paraNum}>
                The parties have the following separate property that should be confirmed to each party:
              </NumberedParagraph>
              {allItems.map((item) => (
                <LetteredItem key={item.key} letter={String.fromCharCode(sepLetterNum++)}>
                  {item.text}
                </LetteredItem>
              ))}
              <View style={{ marginLeft: 36, marginTop: 8, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, lineHeight: 2 }}>
                  Each party should be confirmed as the sole owner of his/her separate property.
                </Text>
              </View>
            </View>
          );
        })()}

        {/* SEPARATE DEBTS */}
        {debts.hasSeparateDebt && (debts.petitionerSeparateDebt || debts.respondentSeparateDebt) && (() => {
          let sepDebtLetterNum = 97; // ASCII 'a'
          return (
            <View wrap={false}>
              <NumberedParagraph num={++paraNum}>
                The parties have the following separate debts that should be confirmed to each party:
              </NumberedParagraph>
              {debts.petitionerSeparateDebt && debts.petitionerSeparateDebt.split(',').map((item, i) => (
                <LetteredItem key={`sd-pet-${i}`} letter={String.fromCharCode(sepDebtLetterNum++)}>
                  {item.trim()} - responsibility of Petitioner
                </LetteredItem>
              ))}
              {debts.respondentSeparateDebt && debts.respondentSeparateDebt.split(',').map((item, i) => (
                <LetteredItem key={`sd-res-${i}`} letter={String.fromCharCode(sepDebtLetterNum++)}>
                  {item.trim()} - responsibility of Respondent
                </LetteredItem>
              ))}
              <View style={{ marginLeft: 36, marginTop: 8, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, lineHeight: 2 }}>
                  Each party shall be solely responsible for his/her own separate debts.
                </Text>
              </View>
            </View>
          );
        })()}

        {/* TAX FILING */}
        {data.taxFiling && (
          <NumberedParagraph num={++paraNum}>
            {data.taxFiling.currentYear === 'jointly'
              ? 'The parties agree to file their current year tax returns jointly.'
              : 'The parties shall file their current year tax returns separately.'}
            {data.taxFiling.hasPreviousUnfiled
              ? data.taxFiling.previousYearOption === 'file_jointly'
                ? ' The parties have previously unfiled tax returns which shall be filed jointly.'
                : ' The parties have previously unfiled tax returns which shall be filed separately.'
              : ''}
          </NumberedParagraph>
        )}

        {/* OTHER ORDERS */}
        {hasActualOtherOrders(data.otherOrders) && (
          <NumberedParagraph num={++paraNum}>
            Petitioner further requests: {data.otherOrders}
          </NumberedParagraph>
        )}

        {/* ATTORNEY FEES */}
        <NumberedParagraph num={++paraNum}>
          Each party should pay his or her own attorney&apos;s fees and costs unless Petitioner is entitled to {pronoun} attorney&apos;s fees pursuant to A.R.S. &sect;25-324.
        </NumberedParagraph>

        {/* WHEREFORE PRAYER */}
        <View wrap={false}>
          <Text style={{ ...styles.paragraph, marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>WHEREFORE</Text> Petitioner prays that this court will enter its Decree of Dissolution of Marriage and grant the following orders:
          </Text>
        </View>

        {(() => {
          let prayerLetter = 65; // ASCII 'A'
          return (
            <>
              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                An Order for a Decree of the Dissolution of Marriage and restoring each party to the status of single person;
              </PrayerItem>

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                {maintenance.entitlement === 'neither'
                  ? 'An Order denying spousal maintenance to either party;'
                  : maintenance.entitlement === 'me'
                  ? 'An Order for spousal maintenance to Petitioner in an amount and for a duration the court deems just and proper;'
                  : 'An Order for spousal maintenance to Respondent in an amount and for a duration the court deems just and proper;'}
              </PrayerItem>

              {hasChildren && (
                <>
                  <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                    {custody?.legalDecisionMaking === 'joint'
                      ? 'Grant equal legal decision-making authority for the minor children;'
                      : custody?.legalDecisionMaking === 'petitioner_sole'
                      ? 'Grant sole legal decision-making authority to Petitioner for the minor children;'
                      : custody?.legalDecisionMaking === 'respondent_sole'
                      ? 'Grant sole legal decision-making authority to Respondent for the minor children;'
                      : custody?.legalDecisionMaking === 'joint_with_final_say'
                      ? `Grant equal legal decision-making authority with ${custody.finalSayParty === 'petitioner' || custody.finalSayParty === 'me' ? 'Petitioner' : 'Respondent'} having final say for the minor children;`
                      : 'Determine legal decision-making authority for the minor children as the Court deems just and proper;'}
                  </PrayerItem>

                  <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                    Establish a parenting time schedule as enumerated in this Petition;
                  </PrayerItem>

                  {childSupport?.seeking && (
                    <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                      Order child support in accordance with the Arizona Child Support Guidelines;
                    </PrayerItem>
                  )}
                </>
              )}

              {nameRestoration?.petitionerWants && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Restore Petitioner&apos;s former name to {nameRestoration.petitionerName || '_____________________'};
                </PrayerItem>
              )}

              {nameRestoration?.respondentWants && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Restore Respondent&apos;s former name to {nameRestoration.respondentName || '_____________________'};
                </PrayerItem>
              )}

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                Divide and allocate all community property and debts as enumerated in this Petition;
              </PrayerItem>

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                Allocation of all separate owned property and/or liability for separately held debts as enumerated in this Petition;
              </PrayerItem>

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                Each party shall pay his or her own attorney&apos;s fees and costs, unless Petitioner is entitled to fees and costs to be paid by Respondent pursuant to A.R.S. 25-324;
              </PrayerItem>

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                Such other and further relief as the court deems just.
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
          {/* Signature area */}
          <View style={{ textAlign: 'right', marginBottom: 8 }}>
            <Text style={{ fontSize: 12, marginBottom: 12 }}>
              {petitioner.name || '_____________________'}
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
            <Text style={{ fontSize: 12 }}>{petitioner.name || '_____________________'}</Text>
            <Text style={{ fontSize: 12, fontStyle: 'italic' }}>Appearing Pro-Per</Text>
          </View>
        </View>

        {/* FILING BLOCK */}
        <View style={styles.filingBlock} wrap={false}>
          <Text style={styles.filingLine}>Original of the foregoing</Text>
          <Text style={styles.filingLine}>filed this ___ day of _________________ 20____</Text>
          <Text style={{ ...styles.filingLine, marginTop: 8 }}>Clerk of Court</Text>
          <Text style={styles.filingLine}>{petitioner.county || '_____'} County Superior Court</Text>
        </View>

        {/* Page Number - fixed at bottom of every page */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => `${pageNumber}`}
          fixed
        />
      </Page>
    </Document>
  );
}

export default PleadingDocument;
