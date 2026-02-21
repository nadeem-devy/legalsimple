import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData, formatDate, formatYesNo } from '@/lib/court-forms/data-mapper';

interface MarriageSectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function MarriageSection({ data, sectionNumber }: MarriageSectionProps) {
  const { marriage, nameRestoration } = data;

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. MARRIAGE INFORMATION</Text>

      {/* Marriage Details Grid */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
        {/* Marriage Dates */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>Marriage Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Marriage:</Text>
            <Text style={{ ...styles.infoValue, fontWeight: 'bold' }}>{formatDate(marriage.date)}</Text>
          </View>
          {marriage.separationDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Separation Date:</Text>
              <Text style={styles.infoValue}>{formatDate(marriage.separationDate)}</Text>
            </View>
          )}
          {marriage.isCovenantMarriage !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Covenant Marriage:</Text>
              <Text style={styles.infoValue}>{formatYesNo(marriage.isCovenantMarriage)}</Text>
            </View>
          )}
        </View>

        {/* Status */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>Status</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pregnancy:</Text>
            <Text style={styles.infoValue}>{formatYesNo(marriage.isPregnant)}</Text>
          </View>
          <View style={{ marginTop: 4, padding: 4, backgroundColor: '#fff3e0', borderRadius: 2 }}>
            <Text style={{ fontSize: 8, fontStyle: 'italic' }}>
              The marriage is irretrievably broken with no reasonable prospect of reconciliation.
            </Text>
          </View>
        </View>

        {/* Name Restoration */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={styles.infoBoxTitle}>Name Restoration</Text>
          {nameRestoration?.petitionerWants ? (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Petitioner:</Text>
                <Text style={{ ...styles.infoValue, fontWeight: 'bold' }}>Yes</Text>
              </View>
              <Text style={{ fontSize: 8, marginTop: 2 }}>Restore to: {nameRestoration.petitionerName || 'N/A'}</Text>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Petitioner:</Text>
              <Text style={styles.infoValue}>No</Text>
            </View>
          )}
          {nameRestoration?.respondentWants && (
            <View style={{ marginTop: 4 }}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Respondent:</Text>
                <Text style={{ ...styles.infoValue, fontWeight: 'bold' }}>Yes</Text>
              </View>
              <Text style={{ fontSize: 8, marginTop: 2 }}>Restore to: {nameRestoration.respondentName || 'N/A'}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
