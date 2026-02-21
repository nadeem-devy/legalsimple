import { View, Text } from '@react-pdf/renderer';
import { styles } from '@/lib/court-forms/PDFStyles';

interface CaseCaptionProps {
  petitionerName: string;
  respondentName: string;
  caseNumber?: string;
}

export function CaseCaption({ petitionerName, respondentName, caseNumber }: CaseCaptionProps) {
  return (
    <View style={styles.caseCaption} wrap={false}>
      <View style={styles.captionLeft}>
        <Text style={styles.captionPartyName}>In re the Marriage of:</Text>
        <Text style={{ fontSize: 11, marginTop: 8 }}></Text>
        <Text style={styles.captionPartyName}>{petitionerName?.toUpperCase() || '[PETITIONER NAME]'},</Text>
        <Text style={styles.captionPartyRole}>Petitioner,</Text>
        <Text style={styles.captionAnd}>and</Text>
        <Text style={styles.captionPartyName}>{respondentName?.toUpperCase() || '[RESPONDENT NAME]'},</Text>
        <Text style={styles.captionPartyRole}>Respondent.</Text>
      </View>
      <View style={styles.captionRight}>
        <Text style={styles.captionCaseNumber}>Case No.</Text>
        <View style={styles.captionCaseNumberValue}>
          <Text style={{ fontSize: 10 }}>{caseNumber || ''}</Text>
        </View>
      </View>
    </View>
  );
}
