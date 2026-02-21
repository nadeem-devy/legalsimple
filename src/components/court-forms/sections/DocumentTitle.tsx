import { View, Text } from '@react-pdf/renderer';
import { styles } from '@/lib/court-forms/PDFStyles';

interface DocumentTitleProps {
  caseType: 'divorce_no_children' | 'divorce_with_children' | 'establish_paternity' | 'modification';
}

export function DocumentTitle({ caseType }: DocumentTitleProps) {
  const hasChildren = caseType === 'divorce_with_children';

  return (
    <View style={styles.documentTitle} wrap={false}>
      <Text style={styles.documentTitleText}>PETITION FOR DISSOLUTION OF MARRIAGE</Text>
      <Text style={styles.documentSubtitle}>
        ({hasChildren ? 'WITH MINOR CHILDREN' : 'WITHOUT MINOR CHILDREN'})
      </Text>
    </View>
  );
}
