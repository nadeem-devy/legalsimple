import { StyleSheet } from '@react-pdf/renderer';

// Nevada Complaint for Divorce Styles (District Court format)
export const nvComplaintStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    paddingTop: 36,
    paddingBottom: 50,
    paddingLeft: 72,
    paddingRight: 72,
  },

  // Top section with person filing info
  topSection: {
    marginBottom: 8,
  },

  personFilingRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },

  personFilingLabel: {
    fontSize: 10,
    width: 100,
  },

  personFilingValue: {
    flex: 1,
    fontSize: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 1,
  },

  // Court header
  courtHeader: {
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 8,
  },

  courtHeaderLine: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  courtHeaderLineSmall: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  // Case caption
  captionSection: {
    marginBottom: 10,
  },

  captionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  captionLeft: {
    flex: 1,
  },

  captionDivider: {
    width: 1,
    backgroundColor: '#000',
    marginHorizontal: 12,
  },

  captionRight: {
    width: 240,
    paddingLeft: 12,
  },

  captionName: {
    fontSize: 11,
    paddingBottom: 2,
  },

  captionLabel: {
    fontSize: 10,
    marginTop: 4,
    marginBottom: 4,
  },

  captionVs: {
    fontSize: 11,
    marginVertical: 4,
    textAlign: 'center',
  },

  caseNoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  caseNoValue: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    minWidth: 140,
    paddingBottom: 1,
    fontSize: 11,
  },

  deptLabel: {
    fontSize: 10,
    marginTop: 6,
  },

  documentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  documentSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },

  // Section headers
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
  },

  // Numbered paragraphs
  numberedRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  paragraphNumber: {
    fontSize: 11,
    width: 24,
    fontWeight: 'bold',
  },

  paragraphContent: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },

  // Sub-items (a, b, c)
  subItemRow: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 24,
  },

  subItemLabel: {
    fontSize: 11,
    width: 20,
  },

  subItemContent: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },

  // Body text
  bodyText: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 6,
  },

  bodyTextIndent: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 6,
    marginLeft: 24,
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

  // Checkboxes
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  checkmark: {
    fontSize: 7,
    color: '#fff',
    fontWeight: 'bold',
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 24,
  },

  checkboxLabel: {
    fontSize: 11,
    flex: 1,
  },

  // Children table
  childrenTable: {
    marginLeft: 24,
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
    fontSize: 10,
    paddingHorizontal: 4,
  },

  childrenTableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },

  childColName: { width: '50%' },
  childColDob: { width: '25%' },
  childColAge: { width: '25%' },

  // Residence history table
  residenceTable: {
    marginLeft: 24,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#000',
  },

  residenceTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    padding: 4,
    minHeight: 18,
  },

  residenceColAddress: { width: '60%' },
  residenceColDuration: { width: '40%' },

  // Property/debt tables
  tableRow: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 24,
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

  // Vehicle table
  vehicleTable: {
    marginLeft: 24,
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

  // Field row (label + fill-in line)
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 6,
    marginLeft: 24,
    alignItems: 'flex-end',
  },

  fieldLabel: {
    fontSize: 11,
    width: 130,
  },

  fieldLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 11,
    paddingBottom: 1,
    minHeight: 16,
  },

  // Wherefore section
  whereforeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 8,
    textDecoration: 'underline',
  },

  whereforeItem: {
    flexDirection: 'row',
    marginBottom: 6,
    marginLeft: 24,
  },

  whereforeNumber: {
    fontSize: 11,
    width: 20,
  },

  whereforeContent: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },

  // Verification / Oath section
  verificationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 8,
    textDecoration: 'underline',
  },

  oathText: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 8,
  },

  // Signature block
  signatureBlock: {
    marginTop: 20,
  },

  signatureRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },

  signatureLabel: {
    fontSize: 11,
    width: 80,
  },

  signatureLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 11,
    paddingBottom: 1,
    minHeight: 18,
  },

  // Horizontal rule
  horizontalRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    marginVertical: 8,
  },

  // Page top case number (pages 2+)
  pageTopCaseNo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
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
