import { StyleSheet } from '@react-pdf/renderer';

// Arizona Notice of Rights About Health Insurance Coverage Styles (DRD16f format)
export const healthInsuranceNoticeStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    paddingTop: 36,
    paddingBottom: 60,
    paddingLeft: 60,
    paddingRight: 60,
  },

  // Clerk box (top right)
  clerkBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },

  clerkBox: {
    width: 140,
    height: 70,
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
  },

  clerkBoxLabel: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },

  // Title section
  titleSection: {
    textAlign: 'center',
    marginBottom: 16,
  },

  titleLine: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.4,
  },

  titleStatute: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },

  // Party / Case fields
  partyRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },

  partyLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 140,
  },

  partyLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 11,
    paddingBottom: 1,
    minHeight: 16,
  },

  caseLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 55,
    marginLeft: 20,
  },

  caseLine: {
    width: 100,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    fontSize: 11,
    paddingBottom: 1,
    minHeight: 16,
  },

  // Warning box
  warningBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginBottom: 14,
  },

  warningText: {
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Section headings (bold inline with text)
  sectionText: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: 'justify',
  },

  bold: {
    fontWeight: 'bold',
  },

  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    fontSize: 9,
    textAlign: 'center',
    color: '#666',
  },
});
