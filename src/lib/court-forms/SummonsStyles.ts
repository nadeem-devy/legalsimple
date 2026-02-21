import { StyleSheet } from '@react-pdf/renderer';

// Arizona Family Law Summons Styles (DR11f format)
export const summonsStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 54,
    paddingRight: 54,
  },

  // Top section with person filing + clerk box
  topSection: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  // Person filing block (left side)
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
    width: 120,
    height: 100,
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
    marginTop: 6,
    marginBottom: 16,
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
    marginBottom: 20,
    marginTop: 4,
  },

  courtHeaderLine: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  // Case caption area
  captionSection: {
    marginBottom: 16,
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
    width: 200,
    paddingLeft: 16,
  },

  captionUnderline: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    width: 250,
    marginBottom: 2,
    paddingBottom: 2,
    fontSize: 11,
  },

  captionSmallLabel: {
    fontSize: 8,
    color: '#333',
    marginBottom: 6,
  },

  captionAnd: {
    fontSize: 11,
    marginVertical: 4,
  },

  caseNoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  caseNoValue: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    minWidth: 120,
    paddingBottom: 1,
    fontSize: 11,
  },

  summonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },

  // Warning box
  warningBox: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 10,
    marginVertical: 16,
    textAlign: 'center',
  },

  warningText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // FROM THE STATE section
  fromStateRow: {
    flexDirection: 'row',
    marginBottom: 2,
    marginTop: 12,
  },

  fromStateLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  fromStateLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    marginLeft: 4,
    fontSize: 11,
    paddingBottom: 1,
  },

  fromStateSubLabel: {
    fontSize: 8,
    textAlign: 'right',
    color: '#333',
    marginBottom: 10,
  },

  // Numbered items
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  itemNumber: {
    width: 24,
    fontSize: 11,
    fontWeight: 'bold',
  },

  itemContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
  },

  // Bullet points
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 24,
    paddingRight: 10,
  },

  bulletDot: {
    width: 16,
    fontSize: 10,
    marginTop: -1,
  },

  bulletContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Bold text
  bold: {
    fontWeight: 'bold',
  },

  // Italic text
  italic: {
    fontStyle: 'italic',
  },

  // Bold italic
  boldItalic: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  // After filing text
  afterFilingText: {
    fontSize: 10,
    lineHeight: 1.5,
    marginLeft: 24,
    marginTop: 6,
    marginBottom: 10,
  },

  // Page footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 54,
    right: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    borderTopWidth: 0.5,
    borderTopColor: '#999',
    paddingTop: 4,
  },

  footerLeft: {
    fontSize: 7,
    color: '#666',
  },

  footerCenter: {
    fontSize: 7,
    color: '#666',
  },

  footerRight: {
    fontSize: 7,
    color: '#666',
  },

  // Page 2 styles

  // Section header for page 2
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginTop: 12,
    marginBottom: 6,
  },

  // Preliminary injunction box
  injunctionBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginVertical: 8,
  },

  injunctionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textDecoration: 'underline',
  },

  injunctionText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 6,
  },

  injunctionSubItem: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 12,
  },

  injunctionBullet: {
    width: 20,
    fontSize: 9,
    fontWeight: 'bold',
  },

  injunctionBulletContent: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },

  // Clerk signature area
  clerkSignatureSection: {
    marginTop: 20,
  },

  clerkSignatureRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },

  clerkSignatureLabel: {
    fontSize: 10,
    width: 120,
  },

  clerkSignatureLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 10,
    paddingBottom: 1,
  },

  // Normal paragraph
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
    marginLeft: 24,
  },
});
