import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import {
  NormalizedPDFData,
  formatYesNo,
  formatLegalDecisionMaking,
  formatParentingSchedule,
  formatExchangeMethod,
  formatHolidayOption,
} from '@/lib/court-forms/data-mapper';

interface CustodySectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function CustodySection({ data, sectionNumber }: CustodySectionProps) {
  const { custody, parentingTime, safetyIssues, childSupport, vacationTravel, extracurricular, rightOfFirstRefusal, petitioner, respondent } = data;

  if (!custody) return null;

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. CUSTODY AND PARENTING TIME</Text>

      {/* Safety Disclosures */}
      {safetyIssues && (
        <View style={styles.indented}>
          <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>A. Safety Disclosures:</Text>

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Domestic Violence (A.R.S. 25-403.03):</Text>
            <Text style={styles.questionAnswer}>{formatYesNo(safetyIssues.hasDomesticViolence)}</Text>
          </View>

          {safetyIssues.hasDomesticViolence && safetyIssues.domesticViolenceOption && (
            <View style={styles.doubleIndented}>
              <Text style={styles.paragraph}>
                Option selected: {safetyIssues.domesticViolenceOption === 'no_joint_decision'
                  ? 'No joint legal decision-making should be awarded to the party who committed violence'
                  : 'Joint legal decision-making despite violence (explanation provided)'}
              </Text>
              {safetyIssues.domesticViolenceExplanation && (
                <Text style={styles.paragraph}>Explanation: {safetyIssues.domesticViolenceExplanation}</Text>
              )}
            </View>
          )}

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Drug/DUI Conviction (last 12 months):</Text>
            <Text style={styles.questionAnswer}>{formatYesNo(safetyIssues.hasDrugConviction)}</Text>
          </View>

          {safetyIssues.hasDrugConviction && safetyIssues.drugConvictionParty && (
            <View style={styles.doubleIndented}>
              <Text style={styles.paragraph}>
                Party convicted: {safetyIssues.drugConvictionParty === 'me' ? petitioner.name : respondent.name}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Legal Decision Making */}
      <View style={{ ...styles.indented, marginTop: 10 }}>
        <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>B. Legal Decision-Making:</Text>

        <View style={styles.questionRow}>
          <Text style={styles.questionLabel}>Requested arrangement:</Text>
          <Text style={styles.questionAnswer}>{formatLegalDecisionMaking(custody.legalDecisionMaking)}</Text>
        </View>

        {custody.finalSayParty && (
          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Final say authority:</Text>
            <Text style={styles.questionAnswer}>
              {custody.finalSayParty === 'petitioner' ? petitioner.name : respondent.name}
            </Text>
          </View>
        )}
      </View>

      {/* Parenting Time */}
      {parentingTime && (
        <View style={{ ...styles.indented, marginTop: 10 }}>
          <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>C. Parenting Time Schedule:</Text>

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Regular schedule:</Text>
            <Text style={styles.questionAnswer}>{formatParentingSchedule(parentingTime.schedule)}</Text>
          </View>

          {parentingTime.customDetails && (
            <View style={styles.doubleIndented}>
              <Text style={styles.paragraph}>Custom schedule details: {parentingTime.customDetails}</Text>
            </View>
          )}

          {parentingTime.isSupervised && (
            <View style={styles.questionRow}>
              <Text style={styles.questionLabel}>Supervision required:</Text>
              <Text style={styles.questionAnswer}>Yes</Text>
            </View>
          )}

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Exchange method:</Text>
            <Text style={styles.questionAnswer}>{formatExchangeMethod(parentingTime.exchangeMethod)}</Text>
          </View>

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Phone/video contact:</Text>
            <Text style={styles.questionAnswer}>
              {parentingTime.phoneContact === 'normal_hours'
                ? 'During normal waking hours'
                : parentingTime.phoneContactCustom || 'Custom schedule'}
            </Text>
          </View>
        </View>
      )}

      {/* Holiday Schedule */}
      {parentingTime?.holidaySchedule && (
        <View style={{ ...styles.indented, marginTop: 10 }} wrap={false}>
          <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>D. Holiday Schedule:</Text>

          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>New Year&apos;s Eve:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.newYearsEve)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>New Year&apos;s Day:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.newYearsDay)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Easter:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.easter)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>4th of July:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.fourthOfJuly)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Halloween:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.halloween)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Thanksgiving:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.thanksgiving)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Hanukkah:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.hanukkah)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Christmas Eve:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.christmasEve)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Christmas Day:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.christmasDay)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Child&apos;s Birthday:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.childBirthday)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Mother&apos;s Day:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.mothersDay)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Father&apos;s Day:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.holidaySchedule.fathersDay)}</Text>
          </View>

          {parentingTime.holidaySchedule.otherHolidays && (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Other holidays:</Text>
              {parentingTime.holidaySchedule.otherHolidays.split(';').map((entry, i) => (
                <View key={`other-hol-${i}`} style={styles.holidayRow}>
                  <Text style={{ fontSize: 10 }}>{entry.trim()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* School Breaks */}
      {parentingTime?.breakSchedule && (
        <View style={{ ...styles.indented, marginTop: 10 }}>
          <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>E. School Break Schedule:</Text>

          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Spring Break:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.breakSchedule.springBreak)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Fall Break:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.breakSchedule.fallBreak)}</Text>
          </View>
          <View style={styles.holidayRow}>
            <Text style={styles.holidayName}>Winter Break:</Text>
            <Text style={styles.holidayAssignment}>{formatHolidayOption(parentingTime.breakSchedule.winterBreak)}</Text>
          </View>

          {parentingTime.summerDeviation !== undefined && (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Summer schedule:</Text>
              <Text style={{ fontSize: 10 }}>
                {parentingTime.summerDeviation && parentingTime.summerDeviationDetails
                  ? parentingTime.summerDeviationDetails
                  : 'Regular parenting time schedule continues to apply'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Child Support */}
      {childSupport && (
        <View style={{ ...styles.indented, marginTop: 10 }}>
          <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>F. Child Support:</Text>

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Seeking child support:</Text>
            <Text style={styles.questionAnswer}>{formatYesNo(childSupport.seeking)}</Text>
          </View>

          {childSupport.seeking && (
            <>
              {childSupport.hasVoluntaryPayments && (
                <View style={styles.doubleIndented}>
                  <Text style={styles.paragraph}>
                    Voluntary payments made: {childSupport.voluntaryPaymentsDetails || 'Yes'}
                  </Text>
                </View>
              )}

              {childSupport.pastSupportPeriod && (
                <View style={styles.questionRow}>
                  <Text style={styles.questionLabel}>Past support calculation period:</Text>
                  <Text style={styles.questionAnswer}>
                    {childSupport.pastSupportPeriod === 'from_filing'
                      ? 'From petition filing date'
                      : 'From separation date (up to 3 years)'}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Vacation & Travel */}
      {vacationTravel && (
        <View style={{ ...styles.indented, marginTop: 10 }}>
          <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>G. Vacation and Travel:</Text>

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Vacation time requested:</Text>
            <Text style={styles.questionAnswer}>{formatYesNo(vacationTravel.hasVacationTime)}</Text>
          </View>

          {vacationTravel.hasVacationTime && (
            <>
              {vacationTravel.vacationDuration && (
                <View style={styles.questionRow}>
                  <Text style={styles.questionLabel}>Duration:</Text>
                  <Text style={styles.questionAnswer}>{vacationTravel.vacationDuration}</Text>
                </View>
              )}
              {vacationTravel.vacationNotice && (
                <View style={styles.questionRow}>
                  <Text style={styles.questionLabel}>Advance notice required:</Text>
                  <Text style={styles.questionAnswer}>{vacationTravel.vacationNotice}</Text>
                </View>
              )}
            </>
          )}

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Both parents may travel outside AZ:</Text>
            <Text style={styles.questionAnswer}>{formatYesNo(vacationTravel.bothCanTravel)}</Text>
          </View>

          {!vacationTravel.bothCanTravel && vacationTravel.restrictedParty && (
            <View style={styles.questionRow}>
              <Text style={styles.questionLabel}>Restricted party:</Text>
              <Text style={styles.questionAnswer}>
                {vacationTravel.restrictedParty === 'petitioner' ? petitioner.name : respondent.name}
              </Text>
            </View>
          )}

          {vacationTravel.maxTravelDays && (
            <View style={styles.questionRow}>
              <Text style={styles.questionLabel}>Max travel days:</Text>
              <Text style={styles.questionAnswer}>{vacationTravel.maxTravelDays}</Text>
            </View>
          )}
        </View>
      )}

      {/* Extracurricular */}
      {extracurricular && (
        <View style={{ ...styles.indented, marginTop: 10 }}>
          <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>H. Extracurricular Activities:</Text>

          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Arrangement:</Text>
            <Text style={styles.questionAnswer}>
              {extracurricular.option === 'both_agree_split' && 'Both parents must agree, costs split evenly'}
              {extracurricular.option === 'each_selects_pays' && 'Each parent selects and pays for their activities'}
              {extracurricular.option === 'each_selects_limit_split' && `Each parent may select up to ${extracurricular.limit || 'N/A'} activities, costs split`}
              {extracurricular.option === 'other' && (extracurricular.otherDetails || 'Custom arrangement')}
            </Text>
          </View>
        </View>
      )}

      {/* Right of First Refusal */}
      <View style={{ ...styles.indented, marginTop: 10 }}>
        <View style={styles.questionRow}>
          <Text style={styles.questionLabel}>Right of first refusal (24+ hours):</Text>
          <Text style={styles.questionAnswer}>{formatYesNo(rightOfFirstRefusal)}</Text>
        </View>
      </View>
    </View>
  );
}
