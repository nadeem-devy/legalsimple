import { Document, Page, View, Text } from '@react-pdf/renderer';
import { noticeRegardingCreditorsStyles as styles } from '@/lib/court-forms/NoticeRegardingCreditorsStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface NoticeRegardingCreditorsDocumentProps {
  data: NormalizedPDFData;
  caseNumber?: string;
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={checked ? styles.checkboxChecked : styles.checkbox}>
      {checked && <Text style={styles.checkmark}>X</Text>}
    </View>
  );
}

function parseAddress(address: string): { street: string; cityStateZip: string } {
  if (!address) return { street: '', cityStateZip: '' };
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return { street: parts[0], cityStateZip: parts.slice(1).join(', ') };
  }
  return { street: address, cityStateZip: '' };
}

export function NoticeRegardingCreditorsDocument({ data, caseNumber }: NoticeRegardingCreditorsDocumentProps) {
  const { petitioner, respondent } = data;
  const county = petitioner.county || 'Maricopa';
  const petAddr = parseAddress(petitioner.address);

  return (
    <Document
      title={`Notice Regarding Creditors - ${petitioner.name} v. ${respondent.name}`}
      author="LegalSimple"
      subject="Notice Regarding Creditors"
      creator="LegalSimple Court Forms"
    >
      {/* PAGE 1 */}
      <Page size="LETTER" style={styles.page}>
        {/* Top section: Person Filing + Clerk Box */}
        <View style={styles.topSection}>
          <View style={styles.personFilingBlock}>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Person Filing:</Text>
              <Text style={styles.personFilingValue}>{petitioner.name || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Address (if not protected):</Text>
              <Text style={styles.personFilingValue}>{petAddr.street}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>City, State, Zip Code:</Text>
              <Text style={styles.personFilingValue}>{petAddr.cityStateZip}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Telephone:</Text>
              <Text style={styles.personFilingValue}>{petitioner.phone || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Email Address:</Text>
              <Text style={styles.personFilingValue}>{petitioner.email || ''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>ATLAS Number:</Text>
              <Text style={styles.personFilingValue}>{''}</Text>
            </View>
            <View style={styles.personFilingRow}>
              <Text style={styles.personFilingLabel}>Lawyer&apos;s Bar Number:</Text>
              <Text style={styles.personFilingValue}>{''}</Text>
            </View>
          </View>

          <View style={styles.clerkBox}>
            <Text style={styles.clerkBoxLabel}>For Clerk&apos;s Use Only</Text>
          </View>
        </View>

        {/* Representing Row */}
        <View style={styles.representingRow}>
          <Text style={styles.representingLabel}>Representing</Text>
          <Checkbox checked={true} />
          <Text style={styles.checkboxLabel}>Self, without a Lawyer</Text>
          <Text style={styles.checkboxLabel}>OR</Text>
          <Checkbox checked={false} />
          <Text style={styles.checkboxLabel}>Attorney for</Text>
          <Checkbox checked={true} />
          <Text style={styles.checkboxLabel}>Petitioner</Text>
          <Text style={styles.checkboxLabel}>OR</Text>
          <Checkbox checked={false} />
          <Text style={styles.checkboxLabel}>Respondent</Text>
        </View>

        {/* Court Header */}
        <View style={styles.courtHeader}>
          <Text style={styles.courtHeaderLine}>SUPERIOR COURT OF ARIZONA</Text>
          <Text style={styles.courtHeaderLine}>IN {county.toUpperCase()} COUNTY</Text>
        </View>

        {/* Case Caption */}
        <View style={styles.captionSection}>
          <View style={styles.captionRow}>
            <View style={styles.captionLeft}>
              <Text style={styles.captionUnderline}>{petitioner.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Petitioner/Party A</Text>
              <Text style={styles.captionAnd}>{''}</Text>
              <Text style={styles.captionUnderline}>{respondent.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Respondent/Party B</Text>
            </View>

            <View style={styles.captionRight}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.caseNoLabel}>Case Number:</Text>
                <Text style={styles.caseNoValue}>{''}</Text>
              </View>
              <Text style={styles.documentTitle}>NOTICE REGARDING CREDITORS</Text>
            </View>
          </View>
        </View>

        {/* ARS Notice Box */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeBoxText}>
            Arizona law requires all actions for Divorce, Annulment, or Legal Separation to include this Notice and for the person filing for Divorce, Annulment, or Legal Separation to serve this Notice on the other party. (ARS &sect; 25-318(H)).
          </Text>
        </View>

        {/* Body Text */}
        <Text style={styles.bodyText}>
          You and your spouse are responsible for community debts. In your property settlement agreement or decree of dissolution, annulment, or legal separation, the court may assign responsibility for certain community debts to one spouse or the other. Please be aware that a court order that does this is binding on the spouses only and does not necessarily relieve either of you from your responsibility for these community debts. These debts are matters of contract between both of you and your creditors (such as banks, credit unions, credit card issuers, finance companies, utility companies, medical providers and retailers). Since your creditors are not parties to this court case, they are not bound by court orders or any agreements you and your spouse reach in this case. On request, the court may impose a lien against the separate property of a spouse to secure payment of debts that the court orders that spouse to pay.
        </Text>

        <Text style={styles.bodyText}>
          <Text style={styles.bold}>Contact creditors:</Text> You may want to contact your creditors to discuss your debts as well as the possible effects of your court case on your debts. To assist you in identifying your creditors, you may obtain a copy of your spouse&apos;s credit report by making a written request to the court for an order requiring a credit reporting agency to release the report to you. Within thirty (30) days after receipt of a request from a spouse who is party to a divorce or legal separation, which includes the court and cause number of the action, creditors are required, by law, to
        </Text>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* PAGE 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Case Number at top */}
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case Number: </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        {/* Continuation of text from page 1 */}
        <Text style={styles.bodyText}>
          provide information as to the balance and account status of any debts for which you or your spouse may be liable to the creditor. You may wish to use the following form, or one that is similar, to contact your creditors:
        </Text>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            <Text style={styles.bold}>Warning!</Text> If you do not understand this notice, you should contact an attorney for advice about your legal rights and obligations.
          </Text>
        </View>

        {/* Info Box about sample form */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            The following page contains a sample form you may choose{'\n'}to mail to creditors to get information about debts owed by{'\n'}you or your spouse.  It is not a required form.{'\n'}Do <Text style={styles.underline}>not</Text> file the <Text style={styles.underline}>next</Text> page with the court.
          </Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* PAGE 3 - Request for Account Information */}
      <Page size="LETTER" style={styles.page}>
        {/* Case Number at top */}
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case Number: </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        {/* Request Header */}
        <View style={styles.requestHeader}>
          <Text style={styles.requestHeaderText}>REQUEST FOR ACCOUNT INFORMATION FROM CREDITORS</Text>
        </View>

        {/* Notice Box */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeBoxText}>
            You <Text style={styles.underline}>may</Text> use this form to request information about debt owed by you or your spouse.{'\n'}If so, send to the creditor.  DO NOT FILE THIS PAGE WITH THE COURT.
          </Text>
        </View>

        {/* Date */}
        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Date:</Text>
          <Text style={[styles.formFieldLine, { maxWidth: 180 }]}>{''}</Text>
        </View>

        {/* Creditor's Name */}
        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Creditor&apos;s Name:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        {/* Creditor's Address */}
        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Creditor&apos;s Address:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        {/* Regarding Section */}
        <View style={styles.regardingRow}>
          <Text style={styles.regardingLabel}>Regarding:</Text>
          <Text style={styles.regardingValue}>{''}</Text>
        </View>

        <View style={styles.regardingFieldRow}>
          <Text style={styles.regardingFieldLabel}>Case Name:</Text>
          <Text style={styles.regardingFieldLine}>{''}</Text>
        </View>

        <View style={styles.regardingFieldRow}>
          <Text style={styles.regardingFieldLabel}>Case Number:</Text>
          <Text style={styles.regardingFieldLine}>{''}</Text>
        </View>

        {/* Request Text */}
        <Text style={[styles.bodyText, { marginTop: 10 }]}>
          Within thirty (30) days after receipt of this notice, you are requested to provide the balance and account status of any debt identified by account number for which the requesting party may be liable to you.
        </Text>

        {/* Information About Debtors/Spouses */}
        <Text style={styles.sectionHeader}>Information About Debtors/Spouses:</Text>

        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Your Name:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Your Address:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        {/* Second address line */}
        <View style={styles.addressLine2}>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Your Phone Number:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Your Spouse&apos;s Name:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabelWide}>Your Spouse&apos;s Address:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        {/* Second address line */}
        <View style={styles.addressLine2}>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        {/* Information About the Account */}
        <Text style={styles.sectionHeader}>Information About the Account:</Text>

        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Account Number(s):</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        {/* Closing */}
        <Text style={[styles.bodyText, { marginTop: 8 }]}>
          If you have any questions or if I can be of further assistance, please feel free to contact me.
        </Text>

        <Text style={[styles.bodyText, { marginTop: 10 }]}>
          Sincerely,
        </Text>

        <View style={[styles.formFieldRow, { marginTop: 16 }]}>
          <Text style={styles.formFieldLabel}>Your name:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        <View style={styles.formFieldRow}>
          <Text style={styles.formFieldLabel}>Your signature:</Text>
          <Text style={styles.formFieldLine}>{''}</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

export default NoticeRegardingCreditorsDocument;
