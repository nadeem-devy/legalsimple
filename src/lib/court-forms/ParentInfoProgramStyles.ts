import { StyleSheet } from '@react-pdf/renderer';

// Arizona Order and Notice to Attend Parent Information Program Class Styles
export const parentInfoProgramStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 50,
    paddingLeft: 54,
    paddingRight: 54,
  },

  // Top section with person filing + clerk box
  topSection: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  personFilingBlock: {
    flex: 1,
    marginRight: 20,
  },

  personFilingRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },

  personFilingLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 140,
  },

  personFilingValue: {
    flex: 1,
    fontSize: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 1,
  },

  clerkBox: {
    width: 120,
    height: 95,
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
  },

  clerkBoxLabel: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
  },

  // Representing row
  representingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 4,
  },

  representingLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginRight: 4,
  },

  // Checkboxes
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  checkmark: {
    fontSize: 7,
    color: '#fff',
    fontWeight: 'bold',
  },

  checkboxLabel: {
    fontSize: 9,
    marginRight: 8,
  },

  // Court header
  courtHeader: {
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 4,
  },

  courtHeaderLine: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  // Case caption
  captionSection: {
    marginBottom: 8,
  },

  captionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  captionLeft: {
    flex: 1,
  },

  captionRight: {
    width: 220,
    paddingLeft: 16,
  },

  captionUnderline: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    width: 250,
    marginBottom: 2,
    paddingBottom: 2,
    fontSize: 10,
  },

  captionSmallLabel: {
    fontSize: 8,
    color: '#333',
    marginBottom: 4,
  },

  captionAnd: {
    fontSize: 10,
    marginVertical: 3,
  },

  caseNoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  caseNoValue: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    minWidth: 120,
    paddingBottom: 1,
    fontSize: 10,
  },

  // Document title
  documentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 1.4,
  },

  // Warning box
  warningBox: {
    borderWidth: 1.5,
    borderColor: '#000',
    padding: 10,
    marginBottom: 12,
  },

  warningText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.4,
  },

  // Section headings
  sectionHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginTop: 10,
    marginBottom: 6,
  },

  // Inline checkbox rows for case type
  inlineCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 20,
  },

  inlineCheckboxLabel: {
    fontSize: 10,
    flex: 1,
    lineHeight: 1.4,
  },

  // Numbered items
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 10,
  },

  itemNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 20,
  },

  itemContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Body text
  bodyText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 8,
  },

  bodyTextIndent: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 8,
    marginLeft: 30,
  },

  bold: {
    fontWeight: 'bold',
  },

  italic: {
    fontStyle: 'italic',
  },

  underline: {
    textDecoration: 'underline',
  },

  // Signature block
  signatureBlock: {
    marginTop: 20,
  },

  signatureRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-end',
  },

  signatureLabel: {
    fontSize: 10,
    width: 50,
  },

  signatureLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 10,
    paddingBottom: 1,
    minHeight: 18,
  },

  // Page top case number (pages 2+)
  pageTopCaseNo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },

  // Bullet items
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 20,
    paddingRight: 10,
  },

  bulletDot: {
    fontSize: 10,
    width: 14,
  },

  bulletContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Provider section
  providerBox: {
    borderWidth: 0.5,
    borderColor: '#000',
    padding: 8,
    marginBottom: 6,
    marginLeft: 10,
  },

  providerName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  providerDetail: {
    fontSize: 9,
    lineHeight: 1.4,
  },

  // Two-column providers
  providerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },

  providerCol: {
    flex: 1,
  },

  // Section title for info pages
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textDecoration: 'underline',
  },

  // Sub-section headings
  subHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },

  // Small text
  smallText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 6,
  },

  // Horizontal rule
  horizontalRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    marginVertical: 8,
  },

  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 9,
    textAlign: 'center',
    color: '#666',
  },
});
