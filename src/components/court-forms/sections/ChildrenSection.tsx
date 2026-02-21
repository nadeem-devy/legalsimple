import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData, formatDate, formatYesNo, formatGender } from '@/lib/court-forms/data-mapper';

interface ChildrenSectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function ChildrenSection({ data, sectionNumber }: ChildrenSectionProps) {
  const { children, caseType } = data;
  const hasChildren = caseType === 'divorce_with_children' && children;

  if (!hasChildren) {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. MINOR CHILDREN</Text>
        <View style={styles.indented}>
          <View style={styles.numberedParagraph}>
            <Text style={styles.paragraphNumber}>1.</Text>
            <Text style={styles.paragraphContent}>
              There are no minor children born of, adopted by, or currently expected by the parties to this marriage.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const resideWithText = {
    petitioner: 'with the Petitioner',
    respondent: 'with the Respondent',
    both: 'with both parties',
  };

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. MINOR CHILDREN</Text>

      <View style={styles.indented}>
        <View style={styles.numberedParagraph}>
          <Text style={styles.paragraphNumber}>1.</Text>
          <Text style={styles.paragraphContent}>
            The following minor children were born of or adopted by the parties to this marriage:
          </Text>
        </View>

        {/* List of children */}
        {children.list.map((child, index) => (
          <View key={child.id || index} style={styles.childCard}>
            <Text style={styles.childName}>Child {index + 1}: {child.name}</Text>
            <Text style={styles.childDetail}>Date of Birth: {formatDate(child.dateOfBirth)}</Text>
            <Text style={styles.childDetail}>Gender: {formatGender(child.gender)}</Text>
            {child.bornBeforeMarriage && (
              <Text style={styles.childDetail}>Born before marriage: Yes</Text>
            )}
          </View>
        ))}

        <View style={styles.numberedParagraph}>
          <Text style={styles.paragraphNumber}>2.</Text>
          <Text style={styles.paragraphContent}>
            The minor child(ren) have resided in the State of Arizona for at least six (6) months immediately prior to the filing of this Petition.
          </Text>
        </View>

        <View style={styles.questionRow}>
          <Text style={styles.questionLabel}>Meets 6-month residency:</Text>
          <Text style={styles.questionAnswer}>{formatYesNo(children.meetResidency)}</Text>
        </View>

        <View style={styles.numberedParagraph}>
          <Text style={styles.paragraphNumber}>3.</Text>
          <Text style={styles.paragraphContent}>
            The minor child(ren) currently reside {resideWithText[children.resideWith] || 'N/A'}.
          </Text>
        </View>

        {children.bornBeforeMarriage && (
          <View style={styles.numberedParagraph}>
            <Text style={styles.paragraphNumber}>4.</Text>
            <Text style={styles.paragraphContent}>
              The following child(ren) were born prior to the marriage: {children.bornBeforeMarriageNames || 'N/A'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
