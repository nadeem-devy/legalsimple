import { View, Text } from '@react-pdf/renderer';
import { styles } from '@/lib/court-forms/PDFStyles';

interface CourtHeaderProps {
  county: string;
}

export function CourtHeader({ county }: CourtHeaderProps) {
  return (
    <View style={styles.courtHeader} wrap={false}>
      <Text style={styles.courtHeaderLine}>IN THE SUPERIOR COURT OF THE STATE OF ARIZONA</Text>
      <Text style={styles.courtHeaderLine}>IN AND FOR THE COUNTY OF {county?.toUpperCase() || '____________'}</Text>
    </View>
  );
}
