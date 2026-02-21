import { StyleSheet } from '@react-pdf/renderer';

// Arizona Court-compliant PDF styles
// Based on Arizona Rules of Family Law Procedure and Maricopa County Local Rules
export const styles = StyleSheet.create({
  // Page layout - 0.75 inch margins for more content, Letter size
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    paddingTop: 54,
    paddingBottom: 54,
    paddingLeft: 54,
    paddingRight: 54,
    lineHeight: 1.3,
  },

  // Court header section
  courtHeader: {
    textAlign: 'center',
    marginBottom: 20,
  },
  courtHeaderLine: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  // Case caption box
  caseCaption: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
    flexDirection: 'row',
  },
  captionLeft: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  captionRight: {
    width: 150,
    padding: 10,
  },
  captionPartyName: {
    fontSize: 11,
    marginBottom: 4,
  },
  captionPartyRole: {
    fontSize: 10,
    marginLeft: 40,
    marginBottom: 8,
  },
  captionAnd: {
    fontSize: 11,
    marginVertical: 4,
  },
  captionCaseNumber: {
    fontSize: 10,
    marginBottom: 4,
  },
  captionCaseNumberValue: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minWidth: 100,
    paddingBottom: 2,
    marginBottom: 8,
  },

  // Document title
  documentTitle: {
    textAlign: 'center',
    marginBottom: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  documentTitleText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  documentSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },

  // Section styling
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },

  // Paragraph styling
  paragraph: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  numberedParagraph: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  paragraphNumber: {
    width: 30,
    fontSize: 11,
  },
  paragraphContent: {
    flex: 1,
    fontSize: 11,
  },

  // Question and answer format
  questionRow: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 10,
  },
  questionLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginRight: 4,
    color: '#444',
  },
  questionAnswer: {
    fontSize: 10,
    flex: 1,
  },

  // Indented content
  indented: {
    marginLeft: 15,
    marginBottom: 4,
  },
  doubleIndented: {
    marginLeft: 30,
    marginBottom: 3,
  },

  // Two column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 15,
  },
  column: {
    flex: 1,
  },

  // Compact info box
  infoBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 6,
    backgroundColor: '#fafafa',
  },
  infoBoxTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 8,
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 9,
    flex: 1,
  },

  // List styling
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 20,
  },
  listBullet: {
    width: 15,
    fontSize: 11,
  },
  listContent: {
    flex: 1,
    fontSize: 11,
  },

  // Table styling for property/assets
  table: {
    marginTop: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    paddingHorizontal: 4,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },

  // Signature block
  signatureSection: {
    marginTop: 40,
  },
  signatureBlock: {
    marginTop: 20,
  },
  respectfullySubmitted: {
    fontSize: 11,
    marginBottom: 30,
  },
  signatureLine: {
    marginBottom: 16,
  },
  signatureBlank: {
    fontSize: 11,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  dateLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 11,
    marginRight: 10,
  },
  dateUnderline: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },

  // Verification block
  verificationSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 20,
  },
  verificationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  verificationText: {
    fontSize: 11,
    marginBottom: 20,
    textAlign: 'justify',
  },

  // Page number - positioned in footer area below content
  pageNumber: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#333',
  },

  // Bold text
  bold: {
    fontWeight: 'bold',
  },

  // Italic text
  italic: {
    fontStyle: 'italic',
  },

  // Underline (simulated with border)
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },

  // Checkbox style
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
    backgroundColor: '#000',
  },

  // Yes/No answer format
  yesNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 20,
  },
  yesNoLabel: {
    fontSize: 11,
    marginRight: 20,
    flex: 1,
  },
  yesNoValue: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 50,
  },

  // Property item card
  propertyItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  propertyItemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyItemDetail: {
    fontSize: 10,
    marginLeft: 10,
    marginBottom: 2,
  },

  // Child info card (for divorce with children)
  childCard: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginBottom: 10,
  },
  childName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  childDetail: {
    fontSize: 10,
    marginLeft: 15,
    marginBottom: 2,
  },

  // Holiday schedule table
  holidayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 3,
  },
  holidayName: {
    width: 150,
    fontSize: 10,
  },
  holidayAssignment: {
    flex: 1,
    fontSize: 10,
  },
});

// Helper to format section numbers (I, II, III, etc.)
export function toRomanNumeral(num: number): string {
  const romanNumerals: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let result = '';
  let remaining = num;

  for (const [value, numeral] of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}
