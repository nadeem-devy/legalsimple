import { StyleSheet } from '@react-pdf/renderer';

// Arizona Petition for Dissolution Styles (DRDC15f format)
export const petitionStyles = StyleSheet.create({
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

  // Inline checkbox (used in form body)
  inlineCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 20,
  },

  inlineCheckboxLabel: {
    fontSize: 10,
    flex: 1,
    lineHeight: 1.4,
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
    width: 280,
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

  documentTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },

  documentSubtitle: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Section numbering
  sectionRow: {
    flexDirection: 'row',
    marginBottom: 6,
    marginTop: 12,
  },

  sectionNumber: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 20,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
    textDecoration: 'underline',
  },

  // Subsection items
  subsectionRow: {
    flexDirection: 'row',
    marginBottom: 6,
    marginLeft: 20,
  },

  subsectionLabel: {
    fontSize: 10,
    width: 16,
  },

  subsectionContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Body text
  bodyText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 6,
    marginLeft: 20,
  },

  bodyTextNoIndent: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 4,
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

  // Form field rows
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 20,
    alignItems: 'flex-end',
  },

  fieldLabel: {
    fontSize: 10,
    width: 110,
  },

  fieldLabelWide: {
    fontSize: 10,
    width: 170,
  },

  fieldLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 10,
    paddingBottom: 1,
    minHeight: 16,
  },

  fieldLineShort: {
    width: 130,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 10,
    paddingBottom: 1,
    minHeight: 16,
  },

  // Two-column layout
  twoColumnRow: {
    flexDirection: 'row',
    marginBottom: 6,
    marginLeft: 20,
    gap: 20,
  },

  twoColumnItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  // Children table
  childrenTable: {
    marginLeft: 20,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#000',
  },

  childrenTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    padding: 4,
  },

  childrenTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    padding: 4,
    minHeight: 18,
  },

  childrenTableCell: {
    fontSize: 9,
    paddingHorizontal: 3,
  },

  childrenTableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 3,
  },

  childColName: { width: '30%' },
  childColDob: { width: '20%' },
  childColAddress: { width: '30%' },
  childColBorn: { width: '20%' },

  // Property/Debt tables
  tableRow: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    paddingBottom: 3,
  },

  tableLabel: {
    fontSize: 10,
    width: 110,
  },

  tableValue: {
    flex: 1,
    fontSize: 10,
  },

  // Description table for debts
  debtTable: {
    marginLeft: 20,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#000',
  },

  debtTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    padding: 4,
  },

  debtTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    padding: 4,
    minHeight: 18,
  },

  debtTableCell: {
    fontSize: 9,
    paddingHorizontal: 3,
  },

  debtTableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 3,
  },

  debtColCreditor: { width: '25%' },
  debtColPurpose: { width: '25%' },
  debtColAmount: { width: '15%' },
  debtColPayment: { width: '15%' },
  debtColWho: { width: '20%' },

  // Vehicle table
  vehicleTable: {
    marginLeft: 20,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#000',
  },

  vehicleTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    padding: 4,
    minHeight: 18,
  },

  vehicleColDesc: { width: '40%' },
  vehicleColTitled: { width: '20%' },
  vehicleColLoan: { width: '20%' },
  vehicleColAward: { width: '20%' },

  // Requests section (numbered list at end)
  requestRow: {
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 20,
  },

  requestNumber: {
    fontSize: 10,
    width: 16,
  },

  requestContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Signature/oath section
  oathText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 8,
  },

  signatureBlock: {
    marginTop: 16,
    marginLeft: 260,
  },

  signatureRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },

  signatureLabel: {
    fontSize: 10,
    width: 70,
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

  // Warning/notice boxes
  warningBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginVertical: 6,
    marginLeft: 20,
  },

  warningText: {
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Indent levels
  indent1: {
    marginLeft: 20,
  },

  indent2: {
    marginLeft: 40,
  },

  indent3: {
    marginLeft: 60,
  },

  // Horizontal rule
  horizontalRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    marginVertical: 6,
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
