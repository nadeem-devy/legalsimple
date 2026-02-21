import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData, formatYesNo } from '@/lib/court-forms/data-mapper';

interface DebtSectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function DebtSection({ data, sectionNumber }: DebtSectionProps) {
  const { debts, taxFiling } = data;

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. DEBTS AND TAX FILING</Text>

      {/* Three Column Grid */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Community Debts */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>A. Community Debts</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Has Debts:</Text>
            <Text style={{ ...styles.infoValue, fontWeight: debts.hasCommunityDebt ? 'bold' : 'normal' }}>
              {formatYesNo(debts.hasCommunityDebt)}
            </Text>
          </View>
          {debts.hasCommunityDebt && debts.communityDebtList && (
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold' }}>List:</Text>
              <Text style={{ fontSize: 8 }}>{debts.communityDebtList}</Text>
            </View>
          )}
          {debts.hasCommunityDebt && debts.communityDebtDivision && (
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Division:</Text>
              <Text style={{ fontSize: 8 }}>{debts.communityDebtDivision}</Text>
            </View>
          )}
        </View>

        {/* Separate Debts */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>B. Separate Debts</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Has Separate:</Text>
            <Text style={styles.infoValue}>{formatYesNo(debts.hasSeparateDebt)}</Text>
          </View>
          {debts.hasSeparateDebt && (
            <>
              {debts.petitionerSeparateDebt && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Petitioner:</Text>
                  <Text style={{ fontSize: 8 }}>{debts.petitionerSeparateDebt}</Text>
                </View>
              )}
              {debts.respondentSeparateDebt && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Respondent:</Text>
                  <Text style={{ fontSize: 8 }}>{debts.respondentSeparateDebt}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Tax Filing */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>C. Tax Filing</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Year:</Text>
            <Text style={{ ...styles.infoValue, fontWeight: 'bold' }}>
              {taxFiling.currentYear === 'jointly' ? 'Jointly' : 'Separately'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unfiled Taxes:</Text>
            <Text style={styles.infoValue}>{formatYesNo(taxFiling.hasPreviousUnfiled)}</Text>
          </View>
          {taxFiling.hasPreviousUnfiled && taxFiling.previousYearOption && (
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 8 }}>Plan: {taxFiling.previousYearOption}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
