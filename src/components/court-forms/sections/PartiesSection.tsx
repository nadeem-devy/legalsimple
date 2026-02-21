import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData, formatDate, formatGender } from '@/lib/court-forms/data-mapper';

interface PartiesSectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function PartiesSection({ data, sectionNumber }: PartiesSectionProps) {
  const { petitioner, respondent } = data;

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. PARTIES</Text>

      {/* Two Column Layout for Parties */}
      <View style={{ flexDirection: 'row', gap: 20 }}>
        {/* Petitioner Column */}
        <View style={{ flex: 1, borderWidth: 1, borderColor: '#000', padding: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 4 }}>
            PETITIONER
          </Text>

          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 9, color: '#666' }}>Full Legal Name:</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{petitioner.name || 'N/A'}</Text>
          </View>

          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 9, color: '#666' }}>Date of Birth:</Text>
            <Text style={{ fontSize: 10 }}>{formatDate(petitioner.dateOfBirth)}</Text>
          </View>

          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 9, color: '#666' }}>Gender:</Text>
            <Text style={{ fontSize: 10 }}>{formatGender(petitioner.gender)}</Text>
          </View>

          <View>
            <Text style={{ fontSize: 9, color: '#666' }}>County:</Text>
            <Text style={{ fontSize: 10 }}>{petitioner.county || 'N/A'}</Text>
          </View>
        </View>

        {/* Respondent Column */}
        <View style={{ flex: 1, borderWidth: 1, borderColor: '#000', padding: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 4 }}>
            RESPONDENT
          </Text>

          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 9, color: '#666' }}>Full Legal Name:</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{respondent.name || 'N/A'}</Text>
          </View>

          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 9, color: '#666' }}>Date of Birth:</Text>
            <Text style={{ fontSize: 10 }}>{formatDate(respondent.dateOfBirth)}</Text>
          </View>

          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 9, color: '#666' }}>Gender:</Text>
            <Text style={{ fontSize: 10 }}>—</Text>
          </View>

          <View>
            <Text style={{ fontSize: 9, color: '#666' }}>County:</Text>
            <Text style={{ fontSize: 10 }}>—</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
