import { StyleSheet } from '@react-pdf/renderer';

// Arizona Family Department Sensitive Data Coversheet Styles
export const sensitiveDataStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 40,
    paddingRight: 40,
  },

  // Top section with person filing + clerk box
  topSection: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  // Person filing block (left side)
  personFilingBlock: {
    flex: 1,
    marginRight: 16,
  },

  personFilingRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },

  personFilingLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 120,
  },

  personFilingValue: {
    flex: 1,
    fontSize: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 1,
  },

  // For Clerk's Use Only box (right side)
  clerkBox: {
    width: 100,
    height: 80,
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
  },

  clerkBoxLabel: {
    fontSize: 6,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
  },

  // Representing row
  representingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 3,
  },

  representingLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginRight: 3,
  },

  // Court header
  courtHeader: {
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },

  courtHeaderLine: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 1,
  },

  // Case caption area
  captionSection: {
    flexDirection: 'row',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 4,
  },

  captionLeft: {
    flex: 1,
  },

  captionRight: {
    width: 240,
    paddingLeft: 12,
  },

  captionUnderline: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    width: 200,
    marginBottom: 1,
    paddingBottom: 1,
    fontSize: 9,
  },

  captionSmallLabel: {
    fontSize: 7,
    color: '#333',
    marginBottom: 4,
  },

  caseNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  caseNoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginRight: 4,
  },

  caseNoValue: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 1,
    fontSize: 9,
  },

  captionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },

  // Notice box (SSN/ARFLP)
  noticeBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    marginBottom: 4,
    marginTop: 4,
  },

  noticeText: {
    fontSize: 7.5,
    textAlign: 'center',
    lineHeight: 1.3,
  },

  // Section A: 3-column table layout
  tableSection: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 2,
  },

  // Table header row
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f0f0f0',
  },

  tableHeaderLabel: {
    width: 140,
    fontSize: 8,
    fontWeight: 'bold',
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },

  tableHeaderCol: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },

  tableHeaderColLast: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 3,
  },

  // Table data row
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    minHeight: 16,
  },

  tableLabel: {
    width: 140,
    fontSize: 8,
    fontWeight: 'bold',
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center',
  },

  tableValue: {
    flex: 1,
    fontSize: 8,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center',
  },

  tableValueLast: {
    flex: 1,
    fontSize: 8,
    padding: 3,
    justifyContent: 'center',
  },

  // Gender row inside table
  tableGenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },

  // Warning row (full width)
  warningRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },

  warningRowText: {
    fontSize: 7,
    fontWeight: 'bold',
    padding: 3,
    textAlign: 'center',
    flex: 1,
    textDecoration: 'underline',
  },

  // Checkbox
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 2,
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
    fontSize: 8,
    marginRight: 6,
  },

  // Section B: Children table
  childrenHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },

  childrenTable: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 4,
  },

  childrenHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f0f0f0',
  },

  childrenCol: {
    flex: 2,
    fontSize: 8,
    fontWeight: 'bold',
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },

  childrenColSmall: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },

  childrenColLast: {
    flex: 2,
    fontSize: 8,
    fontWeight: 'bold',
    padding: 3,
  },

  childrenDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    minHeight: 16,
  },

  childrenDataCol: {
    flex: 2,
    fontSize: 8,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },

  childrenDataColSmall: {
    flex: 1,
    fontSize: 8,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },

  childrenDataColLast: {
    flex: 2,
    fontSize: 8,
    padding: 3,
  },

  // Section C: Type of case - 3 column grid
  caseTypeSection: {
    marginBottom: 4,
  },

  caseTypeSectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 3,
  },

  caseTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },

  caseTypeRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 3,
  },

  caseTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '33%',
  },

  // Section D: Interpreter
  interpreterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  interpreterLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginRight: 6,
  },

  interpreterLangLabel: {
    fontSize: 8,
    marginLeft: 4,
    marginRight: 4,
  },

  interpreterLangValue: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    width: 120,
    paddingBottom: 1,
    fontSize: 8,
  },

  // Footer
  footer: {
    textAlign: 'center',
    marginTop: 4,
    paddingTop: 3,
  },

  footerText: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Page footer with copyright
  pageFooter: {
    position: 'absolute',
    bottom: 14,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    borderTopWidth: 0.5,
    borderTopColor: '#999',
    paddingTop: 3,
  },

  pageFooterLeft: {
    fontSize: 7,
    color: '#666',
  },

  pageFooterCenter: {
    fontSize: 7,
    color: '#666',
  },

  // Bold text
  bold: {
    fontWeight: 'bold',
  },
});
