import { StyleSheet } from '@react-pdf/renderer';

// Arizona Notice Regarding Creditors Styles (DR16f format)
export const noticeRegardingCreditorsStyles = StyleSheet.create({
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
    marginBottom: 4,
  },

  personFilingBlock: {
    flex: 1,
    marginRight: 20,
  },

  personFilingRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },

  personFilingLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 130,
  },

  personFilingValue: {
    flex: 1,
    fontSize: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 1,
  },

  clerkBox: {
    width: 110,
    height: 90,
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
  },

  clerkBoxLabel: {
    fontSize: 7,
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
    marginTop: 2,
  },

  courtHeaderLine: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 1,
  },

  // Case caption area
  captionSection: {
    marginBottom: 6,
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
    width: 210,
    paddingLeft: 16,
  },

  captionUnderline: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    width: 250,
    marginBottom: 1,
    paddingBottom: 1,
    fontSize: 10,
  },

  captionSmallLabel: {
    fontSize: 8,
    color: '#333',
    marginBottom: 4,
  },

  captionAnd: {
    fontSize: 10,
    marginVertical: 2,
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
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },

  // Notice box (ARS reference)
  noticeBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginVertical: 8,
  },

  noticeBoxText: {
    fontSize: 9,
    lineHeight: 1.4,
  },

  // Body text
  bodyText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 8,
    textAlign: 'justify',
  },

  bodyTextBold: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 8,
    textAlign: 'justify',
    fontWeight: 'bold',
  },

  bold: {
    fontWeight: 'bold',
  },

  underline: {
    textDecoration: 'underline',
  },

  // Warning box
  warningBox: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 8,
    marginVertical: 10,
  },

  warningText: {
    fontSize: 9,
    lineHeight: 1.4,
  },

  // Info box (sample form notice)
  infoBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },

  infoBoxText: {
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: 'center',
  },

  // Page 2/3 top: Case Number
  pageTopCaseNo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },

  // Page 3: Request form header
  requestHeader: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 6,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },

  requestHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Form fields
  formFieldRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },

  formFieldLabel: {
    fontSize: 10,
    width: 120,
  },

  formFieldLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 10,
    paddingBottom: 1,
  },

  formFieldLabelWide: {
    fontSize: 10,
    width: 160,
  },

  // Regarding section
  regardingRow: {
    flexDirection: 'row',
    marginBottom: 6,
    marginLeft: 40,
  },

  regardingLabel: {
    fontSize: 10,
    width: 80,
  },

  regardingValue: {
    flex: 1,
    fontSize: 10,
  },

  regardingFieldRow: {
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 120,
    alignItems: 'flex-end',
  },

  regardingFieldLabel: {
    fontSize: 10,
    width: 100,
  },

  regardingFieldLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 10,
    paddingBottom: 1,
  },

  // Section headers
  sectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },

  // Address line (second line for address)
  addressLine2: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 120,
    alignItems: 'flex-end',
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
