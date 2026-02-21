import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData, formatYesNo } from '@/lib/court-forms/data-mapper';

interface JurisdictionSectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function JurisdictionSection({ data, sectionNumber }: JurisdictionSectionProps) {
  const { petitioner, marriage } = data;

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. JURISDICTION AND VENUE</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Residency */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>Residency Requirement</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Meets 90-day:</Text>
            <Text style={{ ...styles.infoValue, fontWeight: 'bold', color: marriage.meetsResidency ? '#4CAF50' : '#f44336' }}>
              {formatYesNo(marriage.meetsResidency)}
            </Text>
          </View>
          <Text style={{ fontSize: 8, marginTop: 4, fontStyle: 'italic' }}>
            Petitioner or Respondent has been domiciled in Arizona and resided in {petitioner.county || '____'} County for 90+ days.
          </Text>
        </View>

        {/* Jurisdiction */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>Jurisdiction</Text>
          <Text style={{ fontSize: 8 }}>
            This Court has jurisdiction pursuant to A.R.S. § 25-312.
          </Text>
        </View>

        {/* Venue */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>Venue</Text>
          <Text style={{ fontSize: 8 }}>
            Venue is proper in {petitioner.county || '____'} County pursuant to A.R.S. § 25-313.
          </Text>
        </View>
      </View>
    </View>
  );
}
