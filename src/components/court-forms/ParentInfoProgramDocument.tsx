import { Document, Page, View, Text } from '@react-pdf/renderer';
import { parentInfoProgramStyles as styles } from '@/lib/court-forms/ParentInfoProgramStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface ParentInfoProgramDocumentProps {
  data: NormalizedPDFData;
  caseNumber?: string;
}

function parseAddress(address: string): { street: string; cityStateZip: string } {
  if (!address) return { street: '', cityStateZip: '' };
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return { street: parts[0], cityStateZip: parts.slice(1).join(', ') };
  }
  return { street: address, cityStateZip: '' };
}

// Checkbox component
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={checked ? styles.checkboxChecked : styles.checkbox}>
      {checked && <Text style={styles.checkmark}>X</Text>}
    </View>
  );
}

export function ParentInfoProgramDocument({ data }: ParentInfoProgramDocumentProps) {
  const { petitioner, respondent, caseType } = data;
  const county = petitioner.county || 'Maricopa';
  const petAddr = parseAddress(petitioner.address);
  const isPaternity = caseType === 'establish_paternity';

  return (
    <Document
      title={`Order and Notice to Attend Parent Information Program Class - ${petitioner.name} v. ${respondent.name}`}
      author="LegalSimple"
      subject="Order and Notice to Attend Parent Information Program Class"
      creator="LegalSimple Court Forms"
    >
      {/* PAGE 1 - Order */}
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

          {/* For Clerk's Use Only Box */}
          <View style={styles.clerkBox}>
            <Text style={styles.clerkBoxLabel}>For Clerk&apos;s Use Only</Text>
          </View>
        </View>

        {/* Representing Row */}
        <View style={styles.representingRow}>
          <Text style={styles.representingLabel}>Representing</Text>
          <Checkbox checked={true} />
          <Text style={styles.checkboxLabel}>Self, without a Lawyer</Text>
          <Text style={styles.checkboxLabel}>or</Text>
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
              <Text style={styles.captionSmallLabel}>Name of Petitioner / Party A</Text>
              <Text style={styles.captionAnd}>And</Text>
              <Text style={styles.captionUnderline}>{respondent.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Respondent / Party B</Text>
            </View>
            <View style={styles.captionRight}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.caseNoLabel}>Case No.:  </Text>
                <Text style={styles.caseNoValue}>{''}</Text>
              </View>
              <Text style={styles.documentTitle}>
                ORDER AND NOTICE TO{'\n'}ATTEND PARENT{'\n'}INFORMATION PROGRAM{'\n'}CLASS
              </Text>
            </View>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            THIS IS AN OFFICIAL COURT ORDER.{'\n'}FAILURE TO OBEY THIS ORDER MAY RESULT IN SANCTIONS BY THE COURT.
          </Text>
        </View>

        {/* THE COURT FINDS */}
        <Text style={[styles.bodyText, styles.bold]}>THE COURT FINDS that the following action is pending before this Court:</Text>

        {/* Case type checkboxes */}
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={!isPaternity} />
          <Text style={styles.inlineCheckboxLabel}>Dissolution of Marriage (Divorce)</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={false} />
          <Text style={styles.inlineCheckboxLabel}>Annulment</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={false} />
          <Text style={styles.inlineCheckboxLabel}>Legal Separation</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={isPaternity} />
          <Text style={styles.inlineCheckboxLabel}>Paternity</Text>
        </View>
        <View style={styles.inlineCheckboxRow}>
          <Checkbox checked={false} />
          <Text style={styles.inlineCheckboxLabel}>Request to Determine Legal Decision-Making and/or Parenting Time</Text>
        </View>

        {/* THE COURT ORDERS */}
        <Text style={[styles.bodyText, styles.bold, { marginTop: 10 }]}>
          THE COURT ORDERS pursuant to A.R.S. &sect; 25-352:
        </Text>

        {/* Item 1 */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>1.</Text>
          <Text style={styles.itemContent}>
            Each party who is a parent or who has legal custody of a minor child must attend a court-approved Parent Information Program class. Read the attached information for a list of approved providers.
          </Text>
        </View>

        {/* Item 2 */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>2.</Text>
          <Text style={styles.itemContent}>
            Each parent must attend a Parent Information Program class within <Text style={styles.bold}>forty-five (45) days</Text> after the service of the Petition upon the Respondent or after the filing of an Appearance in this case, whichever occurs first.
          </Text>
        </View>

        {/* Item 3 */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>3.</Text>
          <Text style={styles.itemContent}>
            Each parent is responsible for paying the fee for the class directly to the provider, unless the parent obtains a fee deferral or waiver from the Court.
          </Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* PAGE 2 - Continued Order + Judge Signature */}
      <Page size="LETTER" style={styles.page}>
        {/* Case No at top */}
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case No.:  </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        {/* Item 4 */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>4.</Text>
          <Text style={styles.itemContent}>
            Each parent must file a Certificate of Completion with the Clerk of the Superior Court and provide a copy to the other party. If you attended an online class, please be sure to print or save a copy of the Certificate of Completion and file the Certificate with the Clerk of the Court. Some online providers may file the certificate electronically on your behalf. Please check with the provider.
          </Text>
        </View>

        {/* Item 5 */}
        <View style={styles.numberedItem}>
          <Text style={styles.itemNumber}>5.</Text>
          <Text style={styles.itemContent}>
            <Text style={styles.bold}>Failure to attend a class and timely file a Certificate of Completion may result in:</Text>
          </Text>
        </View>

        {/* Sub-items for item 5 */}
        <View style={[styles.bulletItem, { marginLeft: 40 }]}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>The Court not considering your requests regarding legal decision-making and parenting time;</Text>
        </View>
        <View style={[styles.bulletItem, { marginLeft: 40 }]}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>The imposition of sanctions, including contempt of court, attorney fees, and/or costs;</Text>
        </View>
        <View style={[styles.bulletItem, { marginLeft: 40 }]}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Striking of pleadings;</Text>
        </View>
        <View style={[styles.bulletItem, { marginLeft: 40, marginBottom: 14 }]}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Any other sanctions the Court deems just and appropriate.</Text>
        </View>

        {/* Judge Signature Block */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureRow}>
            <View style={{ flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#000', minHeight: 24 }} />
          </View>
          <Text style={{ fontSize: 9, textAlign: 'center', marginBottom: 2 }}>Presiding Judge, Family Department</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* PAGE 3 - Parent Information Program Notice */}
      <Page size="LETTER" style={styles.page}>
        {/* Case No at top */}
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case No.:  </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        <Text style={styles.infoTitle}>Parent Information Program Notice</Text>

        <Text style={styles.bodyText}>
          The law requires that <Text style={styles.bold}>BOTH PARENTS</Text> attend a parent information program class within <Text style={styles.bold}>forty-five (45) days</Text> after the service of the Petition upon the Respondent or after the filing of an Appearance in this case, whichever occurs first. (A.R.S. &sect; 25-352)
        </Text>

        <Text style={styles.bodyText}>
          This requirement applies to the following types of actions:
        </Text>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Dissolution of Marriage (Divorce) with minor children</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Annulment with minor children</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Legal Separation with minor children</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Paternity cases</Text>
        </View>
        <View style={[styles.bulletItem, { marginBottom: 10 }]}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Any petition to establish or modify legal decision-making and/or parenting time</Text>
        </View>

        <Text style={[styles.bodyText, styles.bold]}>NOTICE TO THE OTHER PARENT:</Text>
        <Text style={styles.bodyText}>
          The other parent (Respondent) must also attend a parent information program class even if the other parent does not file a Response. Both parents must attend a class and file a Certificate of Completion.
        </Text>

        <View style={styles.horizontalRule} />

        <Text style={[styles.bodyText, styles.bold]}>COURT LOCATIONS:</Text>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Central Court Building</Text> &ndash; 201 West Jefferson Street, Phoenix, AZ 85003
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Southeast Court Complex</Text> &ndash; 222 East Javelina Avenue, Mesa, AZ 85210
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Northwest Court Complex</Text> &ndash; 14264 West Tierra Buena Lane, Surprise, AZ 85374
          </Text>
        </View>
        <View style={[styles.bulletItem, { marginBottom: 10 }]}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Northeast Regional Court Center</Text> &ndash; 18380 North 40th Street, Phoenix, AZ 85032
          </Text>
        </View>

        <View style={styles.horizontalRule} />

        <Text style={[styles.bodyText, styles.bold]}>APPROVED PROVIDERS:</Text>
        <Text style={styles.bodyText}>
          Each parent must attend a class offered by one of the court-approved providers listed on the following page. Parents do not have to attend the same class or use the same provider. Some providers offer classes in languages other than English. Contact the provider for details.
        </Text>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* PAGE 4 - Providers, Cost, Special Needs, Classroom Procedures */}
      <Page size="LETTER" style={styles.page}>
        {/* Case No at top */}
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case No.:  </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        <Text style={[styles.bodyText, { fontStyle: 'italic', marginBottom: 10 }]}>
          <Text style={styles.bold}>Disclaimer:</Text> The Court does not endorse any specific provider. The providers listed below have been approved by the Court to offer parent information program classes. The Court does not guarantee the quality of any provider&apos;s program. Contact the provider directly for scheduling, pricing, and other details.
        </Text>

        {/* Provider Listings */}
        <Text style={[styles.subHeading, { textDecoration: 'underline' }]}>Court-Approved Providers:</Text>

        <View style={styles.providerBox}>
          <Text style={styles.providerName}>1. Families in Transition</Text>
          <Text style={styles.providerDetail}>Website: www.familiesintransitionaz.com</Text>
          <Text style={styles.providerDetail}>Telephone: (602) 263-0542</Text>
          <Text style={styles.providerDetail}>In-person and online classes available</Text>
        </View>

        <View style={styles.providerBox}>
          <Text style={styles.providerName}>2. Children In-Between Online</Text>
          <Text style={styles.providerDetail}>Website: www.divorce-education.com</Text>
          <Text style={styles.providerDetail}>Online classes available</Text>
        </View>

        <View style={styles.providerBox}>
          <Text style={styles.providerName}>3. AZ Online Parenting Programs</Text>
          <Text style={styles.providerDetail}>Website: www.AZ.OnlineParentingPrograms.com</Text>
          <Text style={styles.providerDetail}>Online classes available</Text>
        </View>

        <View style={styles.providerBox}>
          <Text style={styles.providerName}>4. Certevia Parenting and Divorce</Text>
          <Text style={styles.providerDetail}>Website: www.certevia.com</Text>
          <Text style={styles.providerDetail}>Online classes available</Text>
        </View>

        <View style={styles.providerBox}>
          <Text style={styles.providerName}>5. Positive Parenting Online</Text>
          <Text style={styles.providerDetail}>Website: www.positiveparentingonline.com</Text>
          <Text style={styles.providerDetail}>Online classes available</Text>
        </View>

        <View style={styles.horizontalRule} />

        {/* Cost Section */}
        <Text style={[styles.subHeading, { textDecoration: 'underline' }]}>Cost:</Text>
        <Text style={styles.bodyText}>
          Each parent is responsible for paying the fee for the class directly to the provider. Class fees vary by provider. If you cannot afford the class fee, you may apply to the Court for a fee deferral or waiver. Contact the Self-Service Center for assistance with the fee waiver application.
        </Text>

        {/* Special Needs Section */}
        <Text style={[styles.subHeading, { textDecoration: 'underline' }]}>Special Needs:</Text>
        <Text style={styles.bodyText}>
          If you have a disability or special need that may affect your ability to attend a class, contact the provider to discuss accommodation options. If you need an interpreter, contact the provider in advance.
        </Text>

        {/* Classroom Procedures */}
        <Text style={[styles.subHeading, { textDecoration: 'underline' }]}>Classroom Procedures:</Text>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>You must attend the entire class to receive credit.</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Children are not permitted in the classroom.</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>Both parents are not required to attend the same class or session.</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>You will need to provide your case number when registering for a class.</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>If you feel unsafe attending a class with the other parent, notify the provider to make arrangements.</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* PAGE 5 - Online Procedures */}
      <Page size="LETTER" style={styles.page}>
        {/* Case No at top */}
        <View style={styles.pageTopCaseNo}>
          <Text style={styles.caseNoLabel}>Case No.:  </Text>
          <Text style={styles.caseNoValue}>{''}</Text>
        </View>

        <Text style={[styles.subHeading, { textDecoration: 'underline', fontSize: 11 }]}>Online Class Procedures:</Text>

        <Text style={styles.bodyText}>
          If you choose to take an online class, please be aware of the following:
        </Text>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Checking In and Out:</Text> Some online providers require you to check in and check out at various points throughout the class. Follow all instructions provided by the online provider to ensure you receive credit for the class.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Finding a Time and Place:</Text> Online classes can often be completed at your own pace and from any location with internet access. Some providers may have specific time requirements.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Case Number and Payment:</Text> You will need to provide your case number when registering. You will also need a credit card, debit card, or other accepted payment method to pay the class fee at the time of registration.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Technical Requirements:</Text> You will need a computer, tablet, or smartphone with internet access. Some providers may require specific software or browser versions. Check the provider&apos;s website for technical requirements before registering.
          </Text>
        </View>

        <View style={[styles.bulletItem, { marginBottom: 14 }]}>
          <Text style={styles.bulletDot}>&bull;</Text>
          <Text style={styles.bulletContent}>
            <Text style={styles.bold}>Breaking Up the Class:</Text> Some online providers allow you to complete the class over multiple sessions. You may be able to log out and resume the class at a later time. Check with the provider regarding their specific policy on completing the class over multiple sessions.
          </Text>
        </View>

        <View style={styles.horizontalRule} />

        <Text style={styles.bodyText}>
          <Text style={styles.bold}>Certificate of Completion: </Text>
          After completing the class, each parent must file a Certificate of Completion with the Clerk of the Superior Court and provide a copy to the other party. Some online providers may file the certificate electronically on your behalf. Please check with the provider.
        </Text>

        <Text style={styles.bodyText}>
          <Text style={styles.bold}>Questions? </Text>
          Contact the Self-Service Center at the courthouse for assistance. You may also visit the Court&apos;s website for additional information and resources.
        </Text>

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

export default ParentInfoProgramDocument;
