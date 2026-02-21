import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData, formatMaintenanceReason } from '@/lib/court-forms/data-mapper';

interface MaintenanceSectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function MaintenanceSection({ data, sectionNumber }: MaintenanceSectionProps) {
  const { maintenance, petitioner, respondent } = data;

  const getEntitlementColor = () => {
    switch (maintenance.entitlement) {
      case 'me': return '#1976D2';
      case 'spouse': return '#7B1FA2';
      default: return '#666';
    }
  };

  const getEntitlementText = () => {
    switch (maintenance.entitlement) {
      case 'me': return `Petitioner (${petitioner.name || 'Petitioner'})`;
      case 'spouse': return `Respondent (${respondent.name || 'Respondent'})`;
      default: return 'Neither party';
    }
  };

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. SPOUSAL MAINTENANCE</Text>

      <View style={{ ...styles.infoBox, flexDirection: 'row', gap: 15 }}>
        {/* Entitlement Status */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>Entitlement:</Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: getEntitlementColor() }}>
            {getEntitlementText()}
          </Text>
          {maintenance.entitlement !== 'neither' && (
            <Text style={{ fontSize: 8, marginTop: 2 }}>is entitled to spousal maintenance</Text>
          )}
        </View>

        {/* Reasons or Waiver */}
        <View style={{ flex: 2 }}>
          {maintenance.entitlement !== 'neither' && maintenance.reasons && maintenance.reasons.length > 0 ? (
            <>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>Basis for Maintenance:</Text>
              {maintenance.reasons.map((reason, index) => (
                <Text key={index} style={{ fontSize: 8, marginBottom: 2 }}>
                  • {formatMaintenanceReason(reason)}
                </Text>
              ))}
            </>
          ) : (
            <View style={{ padding: 6, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
              <Text style={{ fontSize: 8 }}>
                Petitioner requests the Court find that neither party is entitled to spousal maintenance
                and that the decree forever bar any future claims for spousal maintenance.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
