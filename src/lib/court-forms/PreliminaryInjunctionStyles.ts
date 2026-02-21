import { StyleSheet } from '@react-pdf/renderer';

// Arizona Preliminary Injunction Styles (A.R.S. §25-315)
export const preliminaryInjunctionStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 54,
    paddingRight: 54,
  },

  // Top section with person filing + clerk box
  topSection: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  // Person filing block (left side)
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

  // For Clerk's Use Only box (right side)
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

  // Checkbox
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
    marginBottom: 12,
    marginTop: 2,
  },

  courtHeaderLine: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 1,
  },

  // Case caption area
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
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    textDecoration: 'underline',
  },

  // Warning box
  warningBox: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 8,
    marginVertical: 8,
  },

  warningText: {
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 1.4,
  },

  // Bold/italic text
  bold: {
    fontWeight: 'bold',
  },

  italic: {
    fontStyle: 'italic',
  },

  boldItalic: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  // Introductory paragraph
  introText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 6,
    textAlign: 'justify',
  },

  // EXPLANATION section title
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 4,
  },

  // Subsection title (1. ACTIONS FORBIDDEN, 2. CHILDREN)
  subsectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 16,
  },

  // Restriction items (a., b., c., etc.)
  restrictionItem: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 32,
    paddingRight: 10,
  },

  restrictionBullet: {
    width: 20,
    fontSize: 9,
  },

  restrictionContent: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
  },

  // Checkmark bullet items
  checkmarkItem: {
    flexDirection: 'row',
    marginBottom: 3,
    marginLeft: 48,
    paddingRight: 10,
  },

  checkmarkSymbol: {
    width: 18,
    fontSize: 9,
  },

  checkmarkContent: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
  },

  // Statute reference box
  statuteBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
  },

  statuteTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    textDecoration: 'underline',
  },

  statuteText: {
    fontSize: 7.5,
    lineHeight: 1.3,
  },

  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    fontSize: 9,
    textAlign: 'center',
    color: '#666',
  },
});
