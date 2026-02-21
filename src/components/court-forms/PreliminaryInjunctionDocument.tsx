import { Document, Page, View, Text } from '@react-pdf/renderer';
import { preliminaryInjunctionStyles as styles } from '@/lib/court-forms/PreliminaryInjunctionStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface PreliminaryInjunctionDocumentProps {
  data: NormalizedPDFData;
  caseNumber?: string;
}

// Checkbox component
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

export function PreliminaryInjunctionDocument({ data, caseNumber }: PreliminaryInjunctionDocumentProps) {
  const { petitioner, respondent, caseType } = data;
  const county = petitioner.county || 'Maricopa';
  const hasChildren = caseType === 'divorce_with_children' || caseType === 'establish_paternity';
  const isPaternity = caseType === 'establish_paternity';
  const petAddr = parseAddress(petitioner.address);

  return (
    <Document
      title={`Preliminary Injunction - ${petitioner.name} v. ${respondent.name}`}
      author="LegalSimple"
      subject="Family Law Preliminary Injunction"
      creator="LegalSimple Court Forms"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Top section: Person Filing + Clerk Box */}
        <View style={styles.topSection}>
          {/* Person Filing Block */}
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
            {/* Left - Parties */}
            <View style={styles.captionLeft}>
              <Text style={styles.captionUnderline}>{petitioner.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Petitioner/Party A</Text>

              <Text style={styles.captionAnd}>AND</Text>

              <Text style={styles.captionUnderline}>{respondent.name || ''}</Text>
              <Text style={styles.captionSmallLabel}>Name of Respondent/Party B</Text>
            </View>

            {/* Right - Case No + Title */}
            <View style={styles.captionRight}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.caseNoLabel}>Case Number:</Text>
                <Text style={styles.caseNoValue}>{''}</Text>
              </View>
              <Text style={styles.documentTitle}>PRELIMINARY INJUNCTION</Text>
            </View>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Warning: This is an official Order from the court. It affects your rights. Read this Order immediately and carefully. If you do not understand it, contact a lawyer for help.
          </Text>
        </View>

        {/* Introductory Paragraph */}
        <Text style={styles.introText}>
          {isPaternity
            ? `The other party has filed a Petition to Establish Paternity, Legal Decision Making, Parenting Time and Child Support with the court. This Order is made at the direction of the Presiding Judge of the Superior Court of Arizona in ${county} County. This Order has the same force and effect as any order signed by the judge. You and the other party must obey this Order. This Order may be enforced by any remedy available under the law, including an Order of Contempt of Court. To help you understand this Order, we have provided this explanation. Read the explanation and then read the statute itself. If you have any questions, you should contact a lawyer for help.`
            : `Your spouse has filed a Petition for Dissolution (Divorce) or Petition for Annulment or Petition for Legal Separation with the court. This Order is made at the direction of the Presiding Judge of the Superior Court of Arizona in ${county} County. This Order has the same force and effect as any order signed by the judge. You and your spouse must obey this Order. This Order may be enforced by any remedy available under the law, including an Order of Contempt of Court. To help you understand this Order, we have provided this explanation. Read the explanation and then read the statute itself. If you have any questions, you should contact a lawyer for help.`}
        </Text>

        {/* EXPLANATION Section */}
        <Text style={styles.sectionTitle}>EXPLANATION: (What does this Order mean to you?)</Text>

        {isPaternity ? (
          <>
            {/* PATERNITY: ACTIONS FORBIDDEN BY THIS ORDER */}
            <Text style={styles.subsectionTitle}>
              1.{'\t'}ACTIONS FORBIDDEN BY THIS ORDER: From the time the Petition to Establish Paternity is filed with the court, until further order of the court, both the Petitioner and the Respondent shall not do any of the following things:
            </Text>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not bother, harass, or disturb the peace of the other party or any minor child of the parties, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not remove any natural or adopted minor child(ren) of the parties from the State of Arizona without the prior written consent of the other party or an Order of the Court, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not hide or secrete any minor child(ren) of the parties from the other party, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not make any changes to any insurance covering the minor child(ren), including health, medical, hospital, dental, automobile, or disability insurance coverage.
              </Text>
            </View>

            {/* Statute Reference - Paternity */}
            <View style={styles.statuteBox} wrap={false}>
              <Text style={styles.statuteTitle}>A.R.S. &sect;25-315 &ndash; PRELIMINARY INJUNCTION</Text>
              <Text style={styles.statuteText}>
                B. Upon the filing of a petition to establish paternity pursuant to chapter 6, article 1 of this title and upon personal service of the petition and summons on the respondent or upon the waiver and acceptance of service by the respondent, and upon a showing by the petitioner of documentary evidence establishing a parent-child relationship as described in section 25-814, the court shall issue a preliminary injunction, as follows:
              </Text>
              <Text style={styles.statuteText}>
                {'\n'}1. Both parties are enjoined from molesting, harassing, disturbing the peace of, or committing an assault or battery on, the other party or any natural or adopted child of the parties.
              </Text>
              <Text style={styles.statuteText}>
                {'\n'}2. Both parties are restrained from removing any natural or adopted minor child of the parties from the state without the prior written consent of the other party or an order of the court.
              </Text>
              <Text style={styles.statuteText}>
                {'\n'}3. Both parties are restrained from making any material changes in the existing coverage of insurance policies covering the minor child(ren), including, but not limited to, health insurance, medical insurance, hospital insurance, dental insurance, automobile insurance, and disability insurance coverage.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* DIVORCE: ACTIONS FORBIDDEN BY THIS ORDER */}
            <Text style={styles.subsectionTitle}>
              1.{'\t'}ACTIONS FORBIDDEN BY THIS ORDER: From the time the Petition for Dissolution (Divorce) or Petition for Annulment or Petition for Legal Separation is filed with the court, until the judge signs the Decree, or until further order of the court, both the Petitioner and the Respondent shall not do any of the following things:
            </Text>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not hide earnings or community property from your spouse, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not take out a loan on the community property, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not sell or give away community property without written permission from the other spouse or the court, except in the usual course of business or for the necessities of life, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not bother, harass, or disturb the peace of the other spouse, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not make any changes to any insurance, including life, health, auto, and disability, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not change who gets money from your life insurance, retirement, pension, or other similar plans, AND
              </Text>
            </View>

            <View style={styles.checkmarkItem} wrap={false}>
              <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
              <Text style={styles.checkmarkContent}>
                You may not destroy, hide, or throw away any financial records, documents, or other property relevant to the case.
              </Text>
            </View>

            {/* 2. CHILDREN - conditional on case type */}
            {hasChildren && (
              <>
                <Text style={styles.subsectionTitle}>
                  2.{'\t'}ADDITIONAL ORDERS REGARDING CHILDREN: In addition to the restrictions in Section 1, neither the Petitioner nor the Respondent shall:
                </Text>

                <View style={styles.checkmarkItem} wrap={false}>
                  <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
                  <Text style={styles.checkmarkContent}>
                    Remove any natural or adopted minor child(ren) of the parties from the State of Arizona without the prior written consent of the other party or an Order of the Court, AND
                  </Text>
                </View>

                <View style={styles.checkmarkItem} wrap={false}>
                  <Text style={styles.checkmarkSymbol}>{'\u2713'}</Text>
                  <Text style={styles.checkmarkContent}>
                    Hide or secrete any minor child(ren) of the parties from the other party.
                  </Text>
                </View>
              </>
            )}

            {/* Statute Reference - Divorce */}
            <View style={styles.statuteBox} wrap={false}>
              <Text style={styles.statuteTitle}>A.R.S. &sect;25-315 &ndash; PRELIMINARY INJUNCTION</Text>
              <Text style={styles.statuteText}>
                A. Upon the filing of a petition for dissolution of marriage, legal separation, or annulment, and upon personal service of the petition and summons on the respondent or upon the waiver and acceptance of service by the respondent, the court shall issue a preliminary injunction, as follows:
              </Text>
              <Text style={styles.statuteText}>
                {'\n'}1. Both parties are enjoined from transferring, encumbering, concealing, selling, or otherwise disposing of any of the joint, common, or community property of the parties, without the written consent of the other party or an order of the court, except in the usual course of business or for the necessities of life. Each party shall ensure that the other party is notified of any proposed extraordinary expenditures and shall make a reasonable accounting of such to the court.
              </Text>
              <Text style={styles.statuteText}>
                {'\n'}2. Both parties are enjoined from molesting, harassing, disturbing the peace of, or committing an assault or battery on, the other party or any natural or adopted child of the parties.
              </Text>
              <Text style={styles.statuteText}>
                {'\n'}3. Both parties are restrained from removing any natural or adopted minor child of the parties from the state without the prior written consent of the other party or an order of the court.
              </Text>
              <Text style={styles.statuteText}>
                {'\n'}4. Both parties are restrained from making any material changes in the existing coverage of insurance policies, including, but not limited to, life insurance, health insurance, auto insurance, and disability insurance coverage.
              </Text>
            </View>
          </>
        )}

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

export default PreliminaryInjunctionDocument;
