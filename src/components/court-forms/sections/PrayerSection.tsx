import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface PrayerSectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function PrayerSection({ data, sectionNumber }: PrayerSectionProps) {
  const { caseType, nameRestoration, maintenance, otherOrders } = data;
  const hasChildren = caseType === 'divorce_with_children';

  const prayers: string[] = [];

  // Build prayer list
  prayers.push('That the marriage between Petitioner and Respondent be dissolved.');
  prayers.push('That community property and debts be divided fairly and equitably as set forth herein, or as determined just and proper by the Court.');

  if (maintenance.entitlement === 'neither') {
    prayers.push('That the Court determine neither party is entitled to spousal maintenance and bar any future claims.');
  } else if (maintenance.entitlement === 'me') {
    prayers.push('That the Court award spousal maintenance to Petitioner in an amount and for a duration the court deems just and proper.');
  } else {
    prayers.push('That the Court award spousal maintenance to Respondent in an amount and for a duration the court deems just and proper.');
  }

  if (nameRestoration?.petitionerWants && nameRestoration.petitionerName) {
    prayers.push(`That Petitioner's former name be restored to: ${nameRestoration.petitionerName}`);
  }

  if (hasChildren) {
    prayers.push('That the Court establish legal decision-making and parenting time as set forth herein.');
    prayers.push('That the Court order child support in accordance with Arizona Child Support Guidelines.');
  }

  prayers.push('For such other and further relief as the Court deems just and proper.');

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. PRAYER FOR RELIEF</Text>

      <View style={{ ...styles.infoBox, backgroundColor: '#fff8e1' }}>
        <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 6 }}>
          WHEREFORE, Petitioner prays that this Court grant the following relief:
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {prayers.map((prayer, index) => (
            <View key={index} style={{ flexDirection: 'row', width: '100%', marginBottom: 3 }}>
              <Text style={{ fontSize: 9, width: 15, fontWeight: 'bold' }}>{index + 1}.</Text>
              <Text style={{ fontSize: 9, flex: 1 }}>{prayer}</Text>
            </View>
          ))}
        </View>

        {otherOrders && (
          <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#ddd' }}>
            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Additional Requests:</Text>
            <Text style={{ fontSize: 8 }}>{otherOrders}</Text>
          </View>
        )}
      </View>

      {/* Respectfully submitted */}
      <View style={{ marginTop: 10, textAlign: 'right' }}>
        <Text style={{ fontSize: 9 }}>
          RESPECTFULLY SUBMITTED this _______ day of _________________, 20_____.
        </Text>
      </View>
    </View>
  );
}
