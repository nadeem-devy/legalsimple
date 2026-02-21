import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { pleadingStyles as styles } from '@/lib/court-forms/PleadingStyles';
import { NormalizedPDFData, formatJurisdictionReason, formatPaternityReason } from '@/lib/court-forms/data-mapper';

interface PaternityPetitionDocumentProps {
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

// Helper: lettered sub-item
function LetteredItem({ letter, children }: { letter: string; children: React.ReactNode }) {
  return (
    <View style={styles.letteredItem} wrap={false}>
      <Text style={styles.letteredBullet}>{letter}.</Text>
      <Text style={styles.letteredContent}>{children}</Text>
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

export function PaternityPetitionDocument({ data, signature }: PaternityPetitionDocumentProps) {
  const { petitioner, respondent, children, custody, safetyIssues, childSupport, parentingTime, vacationTravel, paternity } = data;
  const isMale = petitioner.gender === 'male';
  const petitionerAlias = isMale ? 'Father' : 'Mother';
  const respondentAlias = isMale ? 'Mother' : 'Father';
  const pronoun = isMale ? 'his' : 'her';

  // Auto-incrementing paragraph counter
  let paraNum = 0;

  // Build children text inline
  const childrenText = children?.list?.map((child, i) => {
    const name = child.name?.toUpperCase() || `CHILD ${i + 1}`;
    const dob = courtDate(child.dateOfBirth);
    return `${name}, (D.O.B. ${dob})`;
  }).join(' and ') || '';

  const childCount = children?.list?.length || 0;

  // Calculate child ages for display
  const childrenWithAge = children?.list?.map((child) => {
    const name = child.name || 'Child';
    const dob = child.dateOfBirth;
    let age = '';
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let ageYears = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        ageYears--;
      }
      age = `, age ${ageYears}`;
    }
    return `${name}${age}, born ${courtDate(dob)}`;
  }) || [];

  return (
    <Document
      title={`Petition to Establish Paternity - ${petitioner.name}`}
      author="LegalSimple"
      subject="Petition to Establish Paternity, Legal Decision Making, Parenting Time and Child Support"
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

          {/* Right Side - Title */}
          <View style={styles.captionRight}>
            <Text style={styles.captionTitle}>
              {`PETITIONER'S PETITION FOR FIRST COURT ORDERS FOR LEGAL DECISION MAKING, PARENTING TIME AND CHILD SUPPORT`}
            </Text>
          </View>
        </View>

        {/* Introduction - citing A.R.S. §25-803(2) */}
        <Text style={styles.paragraph}>
          {petitioner.name?.toUpperCase() || '[PETITIONER NAME]'} (&ldquo;{petitionerAlias}&rdquo; or &ldquo;Petitioner&rdquo;) for {pronoun} Petition to Establish Paternity, Legal Decision Making, Parenting Time and Child Support (&ldquo;Petition&rdquo;) against {respondent.name?.toUpperCase() || '[RESPONDENT NAME]'} (&ldquo;{respondentAlias}&rdquo; or &ldquo;Respondent&rdquo;) pursuant to A.R.S. &sect;25-803(2) alleges as follows:
        </Text>

        {/* PARAGRAPH 1: Petitioner Identity */}
        <NumberedParagraph num={++paraNum}>
          Petitioner&apos;s name is {petitioner.name || '[PETITIONER NAME]'}, date of birth {courtDate(petitioner.dateOfBirth)}. Petitioner is the {paternity?.biologicalFather === 'me' ? 'biological father' : 'biological mother'} of the minor {childCount === 1 ? 'child' : 'children'} listed below.
        </NumberedParagraph>

        {/* PARAGRAPH 2: Respondent Identity */}
        <NumberedParagraph num={++paraNum}>
          Respondent&apos;s name is {respondent.name || '[RESPONDENT NAME]'}, date of birth {courtDate(respondent.dateOfBirth)}. Respondent is the {paternity?.biologicalFather === 'me' ? 'biological mother' : 'biological father'} of the minor {childCount === 1 ? 'child' : 'children'} listed below. Petitioner and Respondent&apos;s sensitive information is listed in the Sensitive Data Cover Sheet filed herewith under seal.
        </NumberedParagraph>

        {/* PARAGRAPH 3: Venue/Residency */}
        <NumberedParagraph num={++paraNum}>
          Petitioner has been domiciled in or has been a resident of {petitioner.county || '_____'} County, Arizona for at least ninety (90) days preceding the filing of this Petition.
        </NumberedParagraph>

        {/* PARAGRAPH 4: Children */}
        <NumberedParagraph num={++paraNum}>
          The parties are the parents of {childCount === 1 ? 'one minor child' : `${childCount} minor children`}, namely: {childrenWithAge.join('; ')}.
        </NumberedParagraph>

        {/* Children residency */}
        <NumberedParagraph num={++paraNum}>
          {children?.meetResidency
            ? `The minor ${childCount === 1 ? 'child has' : 'children have'} resided in the State of Arizona for at least six (6) months prior to the filing of this Petition.`
            : `The minor ${childCount === 1 ? 'child' : 'children'} currently ${children?.resideWith === 'petitioner' ? 'resides with Petitioner' : children?.resideWith === 'respondent' ? 'resides with Respondent' : 'resides with both parties'}.`}
          {paternity?.childrenCurrentAddress ? ` The ${childCount === 1 ? 'child\'s' : 'children\'s'} current address is ${paternity.childrenCurrentAddress}.` : ''}
        </NumberedParagraph>

        {/* PARAGRAPH: Paternity basis */}
        <NumberedParagraph num={++paraNum}>
          Petitioner alleges that paternity should be established because: {formatPaternityReason(paternity?.paternityReason || '', paternity?.paternityReasonOther, paternity?.biologicalFather)}.
        </NumberedParagraph>

        {/* PARAGRAPH: Other custody claimants */}
        <NumberedParagraph num={++paraNum}>
          {paternity?.hasOtherCustodyClaimants && paternity.otherCustodyClaimants.length > 0
            ? `Petitioner is aware of the following ${paternity.otherCustodyClaimants.length === 1 ? 'person' : 'persons'} not a party to this proceeding who ${paternity.otherCustodyClaimants.length === 1 ? 'has' : 'have'} physical custody or claim to have custody or visitation rights with respect to the minor ${childCount === 1 ? 'child' : 'children'}:`
            : `Petitioner is not aware of any person, not a party to this proceeding, who has physical custody or claims to have custody or visitation rights with respect to the minor ${childCount === 1 ? 'child' : 'children'}.`}
        </NumberedParagraph>

        {/* List custody claimants if any */}
        {paternity?.hasOtherCustodyClaimants && paternity.otherCustodyClaimants.length > 0 && (() => {
          let claimantLetter = 97; // ASCII 'a'
          return paternity.otherCustodyClaimants.map((claimant) => (
            <LetteredItem key={claimant.id} letter={String.fromCharCode(claimantLetter++)}>
              {claimant.personName}, residing at {claimant.personAddress || 'address unknown'}, claims {claimant.claimNature || 'custody/visitation rights'} regarding {claimant.childName || 'the minor child'}.
            </LetteredItem>
          ));
        })()}

        {/* PARAGRAPH: Parent Information Program */}
        <NumberedParagraph num={++paraNum}>
          {paternity?.hasAttendedParentInfoProgram
            ? 'Petitioner has attended or completed the Parent Information Program as required by A.R.S. §25-352.'
            : 'Petitioner has not yet attended the Parent Information Program as required by A.R.S. §25-352, and requests that both parties be ordered to attend.'}
        </NumberedParagraph>

        {/* PARAGRAPH: Domestic Violence */}
        <NumberedParagraph num={++paraNum}>
          Petitioner alleges that {safetyIssues?.hasDomesticViolence ? 'there has been an act of domestic violence as defined in A.R.S. §13-3601 involving the parties or a household member' : 'there has not been an act of domestic violence as defined in A.R.S. §13-3601 involving the parties or a household member'}.{safetyIssues?.hasDomesticViolence && safetyIssues.domesticViolenceOption === 'no_joint_decision' ? ' Pursuant to A.R.S. §25-403.03, no joint legal decision-making should be awarded to the party who committed domestic violence.' : ''}{safetyIssues?.hasDomesticViolence && safetyIssues.domesticViolenceOption === 'joint_despite_violence' ? ` Petitioner avers that it would still be in the best interests of the ${childCount === 1 ? 'child' : 'children'} for the parties to share joint legal decision-making.` : ''}
        </NumberedParagraph>

        {/* PARAGRAPH: Drug/DUI Conviction */}
        <NumberedParagraph num={++paraNum}>
          {safetyIssues?.hasDrugConviction && safetyIssues.drugConvictionParty === 'me'
            ? 'Petitioner has been convicted for a drug offense or driving under the influence of drugs or alcohol in the last twelve (12) months.'
            : safetyIssues?.hasDrugConviction && safetyIssues.drugConvictionParty === 'significant_other'
            ? 'Respondent has been convicted for a drug offense or driving under the influence of drugs or alcohol in the last twelve (12) months.'
            : 'Neither party has been convicted for a drug offense or driving under the influence of drugs or alcohol in the last twelve (12) months.'}
        </NumberedParagraph>

        {/* PARAGRAPH: Arizona Jurisdiction */}
        <View style={styles.numberedParagraph} wrap={false}>
          <Text style={styles.paragraphNumber}>{++paraNum}.</Text>
          <View style={styles.paragraphContent}>
            <Text style={{ marginBottom: 4 }}>This Court has jurisdiction to determine legal decision-making and parenting time of the minor {childCount === 1 ? 'child' : 'children'} in common to the parties pursuant to A.R.S. §§25-402 and 25-1031 because:</Text>
            {paternity?.jurisdictionReasons && paternity.jurisdictionReasons.length > 0 ? (
              paternity.jurisdictionReasons.map((reason, i) => (
                <View key={i} style={{ flexDirection: 'row', marginLeft: 8, marginBottom: 2 }}>
                  <Text style={{ width: 16 }}>{String.fromCharCode(97 + i)}.</Text>
                  <Text style={{ flex: 1 }}>{formatJurisdictionReason(reason)}</Text>
                </View>
              ))
            ) : (
              <View style={{ flexDirection: 'row', marginLeft: 8, marginBottom: 2 }}>
                <Text style={{ width: 16 }}>a.</Text>
                <Text style={{ flex: 1 }}>Arizona is the child&apos;s home state.</Text>
              </View>
            )}
          </View>
        </View>

        {/* PARAGRAPH: Prior court cases */}
        {paternity?.hasPriorCustodyCases && paternity.priorCustodyCases.length > 0 && (() => {
          let caseLetter = 97;
          return (
            <View wrap={false}>
              <NumberedParagraph num={++paraNum}>
                Petitioner is aware of the following prior custody or parenting time proceedings involving the minor {childCount === 1 ? 'child' : 'children'}:
              </NumberedParagraph>
              {paternity.priorCustodyCases.map((priorCase) => (
                <LetteredItem key={priorCase.id} letter={String.fromCharCode(caseLetter++)}>
                  Regarding {priorCase.childName || 'child'}: {priorCase.proceedingType || 'proceeding'} in {priorCase.stateCounty || 'court'}, Case No. {priorCase.caseNumber || 'unknown'}. {priorCase.courtOrderSummary || ''}
                </LetteredItem>
              ))}
            </View>
          );
        })()}

        {/* PARAGRAPH: Court actions affecting this case */}
        {paternity?.hasAffectingCourtActions && paternity.affectingCourtActions.length > 0 && (() => {
          let actionLetter = 97;
          return (
            <View wrap={false}>
              <NumberedParagraph num={++paraNum}>
                Petitioner is aware of the following court actions that may affect this proceeding (domestic violence, protective orders, termination of parental rights, or adoption proceedings):
              </NumberedParagraph>
              {paternity.affectingCourtActions.map((action) => (
                <LetteredItem key={action.id} letter={String.fromCharCode(actionLetter++)}>
                  Regarding {action.childName || 'child'}: {action.proceedingType || 'proceeding'} in {action.stateCounty || 'court'}, Case No. {action.caseNumber || 'unknown'}. {action.courtOrderSummary || ''}
                </LetteredItem>
              ))}
            </View>
          );
        })()}

        {/* PARAGRAPH: Legal Decision Making */}
        <NumberedParagraph num={++paraNum}>
          {custody?.legalDecisionMaking === 'petitioner_sole'
            ? `Petitioner avers that pursuant to A.R.S. §25-403 it is in the ${childCount === 1 ? 'child\'s' : 'children\'s'} best interests that Petitioner be awarded sole legal decision-making authority for the minor ${childCount === 1 ? 'child' : 'children'}.`
            : custody?.legalDecisionMaking === 'respondent_sole'
            ? `Petitioner requests that Respondent be awarded sole legal decision-making authority for the minor ${childCount === 1 ? 'child' : 'children'} pursuant to A.R.S. §25-403.`
            : custody?.legalDecisionMaking === 'joint_with_final_say'
            ? `Petitioner requests joint legal decision-making with ${custody.finalSayParty === 'petitioner' ? 'Petitioner' : 'Respondent'} having final say authority for the minor ${childCount === 1 ? 'child' : 'children'} pursuant to A.R.S. §25-403.`
            : `Petitioner requests that the parties be awarded joint legal decision-making authority for the minor ${childCount === 1 ? 'child' : 'children'} pursuant to A.R.S. §25-403.`}
        </NumberedParagraph>

        {/* PARAGRAPH: Parenting Time */}
        {parentingTime && (
          <>
            <NumberedParagraph num={++paraNum}>
              {parentingTime.schedule === 'no_parenting_time'
                ? `Petitioner requests that Respondent have no parenting time with the minor ${childCount === 1 ? 'child' : 'children'}.`
                : parentingTime.isSupervised
                ? `Petitioner requests that Respondent have supervised parenting time with the minor ${childCount === 1 ? 'child' : 'children'}.${parentingTime.customDetails ? ` ${parentingTime.customDetails}` : ''}`
                : parentingTime.schedule === 'custom'
                ? `As for parenting time, ${parentingTime.customDetails || `the parties shall establish a parenting time schedule in the best interests of the ${childCount === 1 ? 'child' : 'children'}.`}`
                : parentingTime.schedule === '3-2-2-3'
                ? `Petitioner requests equal parenting time following a 3-2-2-3 schedule.`
                : parentingTime.schedule === '5-2-2-5'
                ? `Petitioner requests equal parenting time following a 5-2-2-5 schedule.`
                : parentingTime.schedule === 'alternating_weeks'
                ? `Petitioner requests equal parenting time following an alternating weeks schedule.`
                : `Petitioner requests that parenting time follow a ${parentingTime.schedule} schedule in the best interests of the ${childCount === 1 ? 'child' : 'children'}.`}
            </NumberedParagraph>

            {/* Exchange method */}
            {parentingTime.exchangeMethod && ['pickup', 'dropoff', 'midway'].includes(parentingTime.exchangeMethod) && (
              <NumberedParagraph num={++paraNum}>
                {parentingTime.exchangeMethod === 'pickup'
                  ? `The parent receiving parenting time shall pick up the ${childCount === 1 ? 'child' : 'children'} at the other parent's residence at the agreed-upon time.`
                  : parentingTime.exchangeMethod === 'dropoff'
                  ? `The parent ending parenting time shall drop off the ${childCount === 1 ? 'child' : 'children'} at the other parent's residence at the agreed-upon time.`
                  : `The parties shall meet at a mutually agreed midway location to exchange the ${childCount === 1 ? 'child' : 'children'}.`}
              </NumberedParagraph>
            )}

            {/* Phone/video contact */}
            {parentingTime.phoneContact && (
              <NumberedParagraph num={++paraNum}>
                {parentingTime.phoneContact === 'normal_hours'
                  ? `Each parent shall have reasonable phone and video contact with the ${childCount === 1 ? 'child' : 'children'} during normal waking hours when the ${childCount === 1 ? 'child is' : 'children are'} with the other parent.`
                  : parentingTime.phoneContact === 'custom' && parentingTime.phoneContactCustom
                  ? `Phone and video contact schedule: ${parentingTime.phoneContactCustom}`
                  : `Each parent shall have reasonable phone and video contact with the ${childCount === 1 ? 'child' : 'children'} when ${childCount === 1 ? 'the child is' : 'they are'} with the other parent.`}
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
            Each parent shall be entitled to {vacationTravel.vacationDuration || 'reasonable'} vacation time with the {childCount === 1 ? 'child' : 'children'} per year{vacationTravel.vacationNotice ? `, with ${vacationTravel.vacationNotice} advance notice to the other parent` : ''}.{vacationTravel.vacationPriority ? ` In the event of conflicting vacation dates, Petitioner shall have priority for vacation selection in ${vacationTravel.vacationPriority} years.` : ''}
          </NumberedParagraph>
        )}

        {/* Travel restrictions */}
        {vacationTravel && !vacationTravel.bothCanTravel && (
          <NumberedParagraph num={++paraNum}>
            {vacationTravel.restrictedParty === 'petitioner'
              ? 'Petitioner shall not be permitted'
              : vacationTravel.restrictedParty === 'respondent'
              ? 'Respondent shall not be permitted'
              : 'Neither party shall be permitted'} to take the {childCount === 1 ? 'child' : 'children'} out of the State of Arizona without the prior written consent of the other party{vacationTravel.maxTravelDays ? ` for more than ${vacationTravel.maxTravelDays} days` : ''}.{vacationTravel.itineraryNotice ? ` If travel is approved, the traveling party must provide a complete itinerary ${vacationTravel.itineraryNotice} days in advance.` : ''} Such consent shall not be unreasonably withheld.
          </NumberedParagraph>
        )}

        {/* Extracurricular activities */}
        {data.extracurricular && (
          <NumberedParagraph num={++paraNum}>
            {data.extracurricular.option === 'both_agree_split'
              ? `Both parties must agree to any extracurricular activities for the ${childCount === 1 ? 'child' : 'children'}, and costs shall be split equally between the parties.`
              : data.extracurricular.option === 'each_selects_pays'
              ? `Each parent may select and enroll the ${childCount === 1 ? 'child' : 'children'} in extracurricular activities during their parenting time, and each parent shall be responsible for the costs of activities they select.`
              : data.extracurricular.option === 'each_selects_limit_split'
              ? `Each parent may select and enroll the ${childCount === 1 ? 'child' : 'children'} in extracurricular activities, up to ${data.extracurricular.limit || 'a reasonable number'} activities per year. Costs shall be split equally between the parties.`
              : data.extracurricular.option === 'other' && data.extracurricular.otherDetails
              ? `The parties agree to the following arrangement for extracurricular activities: ${data.extracurricular.otherDetails}`
              : `Extracurricular activities shall be determined in the best interests of the ${childCount === 1 ? 'child' : 'children'}.`}
          </NumberedParagraph>
        )}

        {/* Right of first refusal */}
        {data.rightOfFirstRefusal && (
          <NumberedParagraph num={++paraNum}>
            {`Each parent shall have a right of first refusal if the other parent is unable to care for the ${childCount === 1 ? 'child' : 'children'} for a period exceeding twenty-four (24) consecutive hours during their scheduled parenting time. The parent shall notify the other parent and offer them the opportunity to care for the ${childCount === 1 ? 'child' : 'children'} before arranging alternative childcare.`}
          </NumberedParagraph>
        )}

        {/* Existing child support order */}
        {paternity?.hasExistingChildSupportOrder && (
          <NumberedParagraph num={++paraNum}>
            There is an existing child support order{paternity.existingOrderCourt ? ` from ${paternity.existingOrderCourt}` : ''}{paternity.existingOrderDate ? `, dated ${courtDate(paternity.existingOrderDate)}` : ''}.{paternity.existingOrderNeedsModification ? ' Petitioner requests that the existing order be modified.' : ''}
          </NumberedParagraph>
        )}

        {/* Past child support */}
        {paternity?.owesPastChildSupport && (
          <NumberedParagraph num={++paraNum}>
            {paternity.pastSupportOwedBy === 'me'
              ? 'Petitioner acknowledges that past child support may be owed.'
              : 'Petitioner alleges that Respondent owes past child support.'}
            {paternity.pastSupportPeriod === 'from_filing'
              ? ' Petitioner requests that child support be calculated from the date of filing of this Petition.'
              : paternity.pastSupportPeriod === 'from_living_apart'
              ? ' Petitioner requests that child support be calculated from the date the parties began living apart, up to three (3) years prior to the filing of this Petition pursuant to A.R.S. §25-320.'
              : ''}
          </NumberedParagraph>
        )}

        {/* Child support */}
        <NumberedParagraph num={++paraNum}>
          {childSupport?.seeking
            ? `The Court should award child support in accordance with the Arizona Child Support Guidelines.${childSupport.hasVoluntaryPayments ? ` Voluntary child support payments have been made${childSupport.voluntaryPaymentsDetails ? `: ${childSupport.voluntaryPaymentsDetails}` : ''}.` : ''}`
            : 'The Court should award child support, however at this time Petitioner is willing to waive any child support.'}
        </NumberedParagraph>

        {/* Health Insurance */}
        <NumberedParagraph num={++paraNum}>
          {paternity?.healthInsuranceProvider === 'respondent'
            ? `The Court should order Respondent to maintain health insurance coverage for the minor ${childCount === 1 ? 'child' : 'children'}, and that the cost be allocated between the parties in accordance with the Arizona Child Support Guidelines.`
            : `The Court should order Petitioner to maintain health insurance coverage for the minor ${childCount === 1 ? 'child' : 'children'}, and that the cost be allocated between the parties in accordance with the Arizona Child Support Guidelines.`}
        </NumberedParagraph>

        {/* OTHER ORDERS */}
        {data.otherOrders && (
          <NumberedParagraph num={++paraNum}>
            Petitioner further requests: {data.otherOrders}
          </NumberedParagraph>
        )}

        {/* WHEREFORE PRAYER */}
        <View wrap={false}>
          <Text style={{ ...styles.paragraph, marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>WHEREFORE</Text> Petitioner prays that this Court will grant the following orders:
          </Text>
        </View>

        {(() => {
          let prayerLetter = 65; // ASCII 'A'
          return (
            <>
              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                Establish that Petitioner and Respondent are the legal parents of the minor {childCount === 1 ? 'child' : 'children'};
              </PrayerItem>

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                {custody?.legalDecisionMaking === 'petitioner_sole'
                  ? `Grant Petitioner sole legal decision-making authority for the minor ${childCount === 1 ? 'child' : 'children'};`
                  : custody?.legalDecisionMaking === 'respondent_sole'
                  ? `Grant Respondent sole legal decision-making authority for the minor ${childCount === 1 ? 'child' : 'children'};`
                  : custody?.legalDecisionMaking === 'joint_with_final_say'
                  ? `Grant joint legal decision-making with ${custody.finalSayParty === 'petitioner' ? 'Petitioner' : 'Respondent'} having final say authority for the minor ${childCount === 1 ? 'child' : 'children'};`
                  : `Grant joint legal decision-making authority for the minor ${childCount === 1 ? 'child' : 'children'};`}
              </PrayerItem>

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                Establish a parenting time schedule as enumerated in this Petition;
              </PrayerItem>

              {childSupport?.seeking && (
                <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                  Order child support in accordance with the Arizona Child Support Guidelines;
                </PrayerItem>
              )}

              <PrayerItem letter={String.fromCharCode(prayerLetter++)}>
                {paternity?.healthInsuranceProvider === 'respondent'
                  ? `Order Respondent to maintain health insurance coverage for the minor ${childCount === 1 ? 'child' : 'children'};`
                  : `Order Petitioner to maintain health insurance coverage for the minor ${childCount === 1 ? 'child' : 'children'};`}
              </PrayerItem>

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
          County of {petitioner.county || '_____________'}{'\t\t'})
        </Text>

        <Text style={{ ...styles.paragraph, marginTop: 16 }}>
          I, {petitioner.name || '___________________________'}, the Petitioner herein, being first duly sworn upon {pronoun} oath, deposes and says:
        </Text>

        <Text style={{ ...styles.paragraph, marginTop: 12 }}>
          That I have read the foregoing Petition and know the contents thereof, and the same is true and correct to the best of my knowledge and belief.
        </Text>

        {/* Signature */}
        <View style={{ marginTop: 40, marginLeft: 240 }} wrap={false}>
          {signature ? (
            <View>
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 200, paddingBottom: 4 }}>
                <Image src={signature} style={{ height: 40, objectFit: 'contain' }} />
              </View>
              <Text style={{ fontSize: 12 }}>{petitioner.name}</Text>
            </View>
          ) : (
            <View>
              <Text style={{ fontSize: 12 }}>___________________________</Text>
              <Text style={{ fontSize: 12 }}>{petitioner.name || 'Petitioner'}</Text>
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

export default PaternityPetitionDocument;
