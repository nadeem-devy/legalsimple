import { Document, Page, View, Text } from '@react-pdf/renderer';
import { healthInsuranceNoticeStyles as styles } from '@/lib/court-forms/HealthInsuranceNoticeStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface HealthInsuranceNoticeDocumentProps {
  data: NormalizedPDFData;
  caseNumber?: string;
}

export function HealthInsuranceNoticeDocument({ data, caseNumber }: HealthInsuranceNoticeDocumentProps) {
  const { petitioner, respondent } = data;
  const hasChildren = data.caseType === 'divorce_with_children';

  return (
    <Document
      title={`Notice of Rights About Health Insurance Coverage - ${petitioner.name} v. ${respondent.name}`}
      author="LegalSimple"
      subject="Notice of Rights About Health Insurance Coverage"
      creator="LegalSimple Court Forms"
    >
      {/* PAGE 1 */}
      <Page size="LETTER" style={styles.page}>
        {/* Clerk Box */}
        <View style={styles.clerkBoxContainer}>
          <View style={styles.clerkBox}>
            <Text style={styles.clerkBoxLabel}>For Clerk&apos;s Use Only</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleLine}>
            NOTICE OF YOUR RIGHTS ABOUT HEALTH INSURANCE COVERAGE WHEN{'\n'}A PETITION FOR DISSOLUTION (DIVORCE) IS FILED
          </Text>
          <Text style={styles.titleStatute}>(A.R.S. §20-1377 and §20-1408)</Text>
        </View>

        {/* Petitioner / Case # Row */}
        <View style={styles.partyRow}>
          <Text style={styles.partyLabel}>Petitioner/Party A:</Text>
          <Text style={styles.partyLine}>{petitioner.name || ''}</Text>
          <Text style={styles.caseLabel}>Case #:</Text>
          <Text style={styles.caseLine}>{''}</Text>
        </View>

        {/* Respondent Row */}
        <View style={[styles.partyRow, { marginBottom: 14 }]}>
          <Text style={styles.partyLabel}>Respondent/Party B:</Text>
          <Text style={styles.partyLine}>{respondent.name || ''}</Text>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            <Text style={styles.bold}>Warning:</Text> This is an important legal notice. Your rights to health insurance coverage could be affected after your divorce is final. Read this notice carefully. If you do not understand this notice, you should call an attorney for advice about your legal rights and obligations.
          </Text>
        </View>

        {/* IMPORTANT INFORMATION */}
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>IMPORTANT INFORMATION IF YOU ARE ON YOUR SPOUSE&apos;S INSURANCE PLAN:  </Text>
          When a Petition for Dissolution of Marriage (papers for a divorce decree) is filed, you and/or your children may continue to be covered under your spouse&apos;s health insurance policy. Arizona law allows the dependent spouse and/or children to continue to be covered, but you must take some steps to protect your rights.
        </Text>

        {/* WHAT INSURANCE COVERAGE APPLIES */}
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>WHAT INSURANCE COVERAGE APPLIES TO YOU, AND HOW TO GET IT:  </Text>
          If you are covered by your spouse&apos;s health insurance, and you want to continue to be covered after the divorce is final, you must contact the insurance company as soon as possible, and you must start to pay the monthly insurance premium within 31 days of the date the insurance would otherwise stop.
        </Text>

        <Text style={styles.sectionText}>
          If you decide you want to be covered, the insurer can choose whether to continue coverage under the current policy, or to change the policy to your name. If the policy is changed to your name, it is called a &quot;converted&quot; policy. If the policy is converted by the insurer, the insurer must provide you the same or the most similar level of coverage available, unless you ask for a lower level of coverage.
        </Text>

        {/* WHAT COVERAGE APPLIES TO YOUR CHILDREN */}
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>WHAT COVERAGE APPLIES TO YOUR CHILDREN:  </Text>
          If you choose to continue coverage as a dependent spouse, you can also choose to continue coverage for your dependent children if you are responsible for their care or support.
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
        {/* PREEXISTING CONDITIONS */}
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>PREEXISTING CONDITIONS OR EXCLUSIONS FROM INSURANCE COVERAGE:  </Text>
          Whether the insurance is continued or converted, the insurance must be provided to you without proof of insurability and without exclusions for coverage other than what was previously excluded before the insurance was continued or converted.
        </Text>

        {/* LIMITS ON RIGHTS */}
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>LIMITS ON RIGHTS TO INSURANCE COVERAGE FOR YOU AND YOUR CHILDREN:  </Text>
          You may not be entitled to continued or converted coverage if you are eligible for Medicare or for coverage by other similar types of insurance which together with the continued coverage would make you over-insured. However, dependent children of a person who is eligible for Medicare may be covered by a continuance or a conversion. If you have questions about coverage, check with the insurer and/or the spouse&apos;s employer.
        </Text>

        {/* OTHER OPTIONS FOR COVERAGE */}
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>OTHER OPTIONS FOR COVERAGE:  </Text>
          Divorce is considered to be a life changing event that, under the federal Consolidated Omnibus Budget Reconciliation Act (&quot;COBRA&quot;), may qualify you and/or your dependents with the right to continue health coverage under the spouse&apos;s group plan, if the employer has 20 or more employees. To find out more about your COBRA rights, you can visit the United States Department of Labor (&quot;USDOL&quot;) website at https://www.dol.gov/ and search for COBRA, or you can call the USDOL at 1-866-487-2365. Divorce is also a life-changing event under the federal Affordable Care Act, which qualifies you and/or your dependents for a special enrollment period to obtain an individual health insurance policy regardless of any health conditions. Additional information is available at https://www.healthcare.gov/ or by calling 1-800-318-2596.
        </Text>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            <Text style={styles.bold}>Warning to the spouse filing the petition for dissolution (Divorce):</Text> This Notice must be served on your spouse together with the Petition for Dissolution, the Summons, and the Preliminary Injunction.
          </Text>
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

export default HealthInsuranceNoticeDocument;
