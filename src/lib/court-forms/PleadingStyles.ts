import { StyleSheet } from '@react-pdf/renderer';

// Arizona Court Pleading Paper Styles
// Standard pleading format with line numbers (25 lines per page)
export const pleadingStyles = StyleSheet.create({
  // Page layout - standard court pleading margins
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    paddingTop: 72, // 1 inch
    paddingBottom: 72, // 1 inch
    paddingLeft: 108, // 1.5 inch (for line numbers)
    paddingRight: 72, // 1 inch
    lineHeight: 2, // Double-spaced
  },

  // Line numbers column - fixed on left
  lineNumbersColumn: {
    position: 'absolute',
    left: 36,
    top: 72,
    bottom: 72,
    width: 36,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },

  lineNumber: {
    fontSize: 10,
    textAlign: 'right',
    paddingRight: 8,
    height: 27, // Line height for 25 lines
    lineHeight: 2,
  },

  // Pro-per identification block at top of page 1
  proPerBlock: {
    marginBottom: 10,
  },

  proPerLine: {
    fontSize: 12,
    lineHeight: 1.2,
  },

  proPerLabel: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 1.2,
  },

  // Court header - centered at top
  courtHeader: {
    textAlign: 'center',
    marginBottom: 24,
  },

  courtHeaderLine: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  // Case caption
  caseCaption: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 12,
  },

  captionLeft: {
    flex: 1,
    paddingRight: 10,
  },

  // Parentheses column between caption left and right
  captionParentheses: {
    width: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  captionParen: {
    fontSize: 12,
    lineHeight: 1.2,
  },

  captionRight: {
    width: 230,
    paddingLeft: 10,
    justifyContent: 'flex-start',
  },

  captionPartyName: {
    fontSize: 12,
    lineHeight: 1.2,
    marginBottom: 1,
  },

  captionPartyRole: {
    fontSize: 12,
    lineHeight: 1.2,
    marginLeft: 40,
    marginBottom: 2,
  },

  captionAnd: {
    fontSize: 12,
    lineHeight: 1.2,
    marginVertical: 1,
  },

  captionCaseNumber: {
    fontSize: 12,
    marginBottom: 8,
  },

  // Document title (shown in caption right area)
  captionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 1.2,
  },

  // Section styling
  section: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    textDecoration: 'underline',
  },

  // Paragraph styling - double spaced
  paragraph: {
    fontSize: 12,
    marginBottom: 24,
    textAlign: 'justify',
    lineHeight: 2,
  },

  numberedParagraph: {
    flexDirection: 'row',
    marginBottom: 24,
  },

  paragraphNumber: {
    width: 30,
    fontSize: 12,
  },

  paragraphContent: {
    flex: 1,
    fontSize: 12,
    textAlign: 'justify',
    lineHeight: 2,
  },

  // Indentation
  indented: {
    marginLeft: 36,
    marginBottom: 12,
  },

  doubleIndented: {
    marginLeft: 72,
    marginBottom: 12,
  },

  // Lettered sub-items (a, b, c...)
  letteredItem: {
    flexDirection: 'row',
    marginBottom: 12,
    marginLeft: 36,
  },

  letteredBullet: {
    width: 24,
    fontSize: 12,
  },

  letteredContent: {
    flex: 1,
    fontSize: 12,
    lineHeight: 2,
    textAlign: 'justify',
  },

  // Bullet point sub-items
  bulletItem: {
    flexDirection: 'row' as const,
    marginBottom: 4,
    marginLeft: 36,
  },

  bulletDot: {
    width: 14,
    fontSize: 12,
  },

  bulletContent: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.8,
  },

  // Prayer items (A, B, C...)
  prayerItem: {
    flexDirection: 'row',
    marginBottom: 12,
    marginLeft: 36,
  },

  prayerBullet: {
    width: 30,
    fontSize: 12,
  },

  prayerContent: {
    flex: 1,
    fontSize: 12,
    lineHeight: 2,
  },

  // Signature block
  signatureSection: {
    marginTop: 48,
  },

  signatureLine: {
    marginTop: 48,
    marginBottom: 8,
  },

  signatureBlank: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: 250,
    marginBottom: 4,
  },

  signatureLabel: {
    fontSize: 12,
    marginBottom: 24,
  },

  // Respectfully submitted
  respectfullySubmitted: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 36,
  },

  // Attorney/Pro Se block
  attorneyBlock: {
    marginTop: 24,
    textAlign: 'right',
  },

  attorneyLine: {
    fontSize: 12,
    marginBottom: 4,
  },

  // Filing block at bottom
  filingBlock: {
    marginTop: 36,
  },

  filingLine: {
    fontSize: 12,
    marginBottom: 2,
  },

  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
  },

  // Bold text
  bold: {
    fontWeight: 'bold',
  },

  // Italic text
  italic: {
    fontStyle: 'italic',
  },

  // Underline
  underline: {
    textDecoration: 'underline',
  },

  // Date line
  dateLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  dateLabel: {
    fontSize: 12,
    marginRight: 10,
  },

  dateUnderline: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
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
