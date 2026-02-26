import { Document, Page, View, Text } from '@react-pdf/renderer';
import { sensitiveDataStyles as styles } from '@/lib/court-forms/SensitiveDataStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface SensitiveDataCoversheetProps {
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

// Table row: label | petitioner value | respondent value
function TableRow({ label, petValue, resValue }: { label: string; petValue: React.ReactNode; resValue: React.ReactNode }) {
  return (
    <View style={styles.tableRow}>
      <View style={styles.tableLabel}>
        <Text>{label}</Text>
      </View>
      <View style={styles.tableValue}>
        {typeof petValue === 'string' ? <Text>{petValue}</Text> : petValue}
      </View>
      <View style={styles.tableValueLast}>
        {typeof resValue === 'string' ? <Text>{resValue}</Text> : resValue}
      </View>
    </View>
  );
}

// Gender checkboxes for table cells
function GenderCheckboxes({ gender }: { gender?: string }) {
  return (
    <View style={styles.tableGenderRow}>
      <Checkbox checked={gender === 'male'} />
      <Text style={styles.checkboxLabel}>Male  or</Text>
      <Checkbox checked={gender === 'female'} />
      <Text style={styles.checkboxLabel}>Female</Text>
    </View>
  );
}

// Text checkboxes for table cells
function TextCheckboxes() {
  return (
    <View style={styles.tableGenderRow}>
      <Checkbox checked={false} />
      <Text style={styles.checkboxLabel}>Yes</Text>
      <Checkbox checked={false} />
      <Text style={styles.checkboxLabel}>No texts</Text>
    </View>
  );
}

// Parse address
function parseAddress(address: string): { street: string; cityStateZip: string } {
  if (!address) return { street: '', cityStateZip: '' };
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return { street: parts[0], cityStateZip: parts.slice(1).join(', ') };
  }
  return { street: address, cityStateZip: '' };
}

// Format date as MM/DD/YYYY
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return dateStr;
  }
}

export function SensitiveDataCoversheet({ data }: SensitiveDataCoversheetProps) {
  const { petitioner, respondent, caseType, children, modification } = data;
  const isModification = caseType === 'modification';
  const hasChildren = caseType === 'divorce_with_children' || caseType === 'establish_paternity' || isModification;
  const county = petitioner.county || (isModification ? '' : 'Maricopa');

  const petAddr = parseAddress(petitioner.address);
  const resAddr = parseAddress(respondent.address);
  const respondentGender = respondent.gender || (petitioner.gender === 'male' ? 'female' : 'male');

  // Build children rows - render all children, pad to minimum 4
  const childRows = [];
  if (hasChildren) {
    // Use modification children or standard children list
    const childList = isModification
      ? (modification?.children || []).map(c => ({ name: c.name, gender: '', dateOfBirth: c.dateOfBirth }))
      : (children?.list || []);
    for (let i = 0; i < childList.length; i++) {
      const child = childList[i];
      childRows.push({
        name: child?.name || '',
        gender: (child as { gender?: string })?.gender || '',
        ssn: '',
        dob: child?.dateOfBirth ? formatDate(child.dateOfBirth) : '',
      });
    }
    // Pad to minimum 4 rows
    while (childRows.length < 4) {
      childRows.push({ name: '', gender: '', ssn: '', dob: '' });
    }
  }

  return (
    <Document
      title="Sensitive Data Coversheet"
      author="LegalSimple"
      subject="Family Department Sensitive Data Coversheet"
      creator="LegalSimple Court Forms"
    >
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
          <Checkbox checked={!isModification || modification?.role === 'petitioner'} />
          <Text style={styles.checkboxLabel}>Petitioner</Text>
          <Text style={styles.checkboxLabel}>OR</Text>
          <Checkbox checked={isModification && modification?.role === 'respondent'} />
          <Text style={styles.checkboxLabel}>Respondent</Text>
        </View>

        {/* Court Header */}
        <View style={styles.courtHeader}>
          <Text style={styles.courtHeaderLine}>SUPERIOR COURT OF ARIZONA</Text>
          <Text style={styles.courtHeaderLine}>IN {county.toUpperCase()} COUNTY</Text>
        </View>

        {/* Case Caption */}
        <View style={styles.captionSection}>
          <View style={styles.captionLeft}>
            <Text style={styles.captionUnderline}>{petitioner.name || ''}</Text>
            <Text style={styles.captionSmallLabel}>Petitioner / Party A</Text>
            <Text style={styles.captionUnderline}>{respondent.name || ''}</Text>
            <Text style={styles.captionSmallLabel}>Respondent / Party B</Text>
          </View>
          <View style={styles.captionRight}>
            <View style={styles.caseNoRow}>
              <Text style={styles.caseNoLabel}>Case No.</Text>
              <Text style={styles.caseNoValue}>{''}</Text>
            </View>
            <View style={styles.caseNoRow}>
              <Text style={styles.caseNoLabel}>ATLAS No.</Text>
              <Text style={styles.caseNoValue}>{''}</Text>
            </View>
            <Text style={styles.captionTitle}>
              FAMILY DEPARTMENT SENSITIVE DATA{'\n'}COVERSHEET {hasChildren ? 'WITH CHILDREN' : 'WITHOUT CHILDREN'}
            </Text>
            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>(CONFIDENTIAL RECORD)</Text>
          </View>
        </View>

        {/* Notice Box */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            Fill out. File with Clerk of Superior Court. Social Security Numbers should appear on this form only and{'\n'}should be omitted from other court forms.  Access Confidential pursuant to ARFLP 43.1(f).
          </Text>
        </View>

        {/* Section A: Personal Information - 3-column table */}
        <View style={styles.tableSection}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeaderLabel}>A.  Personal Information:</Text>
            <Text style={styles.tableHeaderCol}>Petitioner / Party A</Text>
            <Text style={styles.tableHeaderColLast}>Respondent / Party B</Text>
          </View>

          {/* Name */}
          <TableRow label="Name" petValue={petitioner.name || ''} resValue={respondent.name || ''} />

          {/* Gender */}
          <TableRow
            label="Gender"
            petValue={<GenderCheckboxes gender={petitioner.gender} />}
            resValue={<GenderCheckboxes gender={respondentGender} />}
          />

          {/* Date of Birth */}
          <TableRow
            label="Date of Birth (Month/Day/Year)"
            petValue={formatDate(petitioner.dateOfBirth)}
            resValue={formatDate(respondent.dateOfBirth)}
          />

          {/* Social Security Number */}
          <TableRow
            label="Social Security Number"
            petValue={petitioner.ssn4 ? `XXX-XX-${petitioner.ssn4}` : ''}
            resValue={respondent.ssn4 && respondent.ssn4 !== '0000' ? `XXX-XX-${respondent.ssn4}` : respondent.ssn4 === '0000' ? 'Unknown' : ''}
          />

          {/* Warning about mailing address */}
          <View style={styles.warningRow}>
            <Text style={styles.warningRowText}>
              Warning: DO NOT INCLUDE MAILING ADDRESS ON THIS FORM IF REQUESTING ADDRESS PROTECTION
            </Text>
          </View>

          {/* Mailing Address */}
          <TableRow label="Mailing Address" petValue={petAddr.street} resValue={respondent.address?.toLowerCase() === 'unknown' ? 'Unknown' : resAddr.street} />

          {/* City, State, Zip */}
          <TableRow label="City, State, Zip Code" petValue={petAddr.cityStateZip} resValue={respondent.address?.toLowerCase() === 'unknown' ? '' : resAddr.cityStateZip} />

          {/* Contact Phone */}
          <TableRow label="Contact Phone" petValue={petitioner.phone || ''} resValue={respondent.phone || ''} />

          {/* Receive texts */}
          <TableRow
            label="Receive texts from Court to contact phone number above?"
            petValue={<TextCheckboxes />}
            resValue={<TextCheckboxes />}
          />

          {/* Email Address */}
          <TableRow label="Email Address" petValue={petitioner.email || ''} resValue={respondent.email?.toLowerCase() === 'unknown' ? 'Unknown' : (respondent.email || '')} />

          {/* Current Employer Name */}
          <TableRow label="Current Employer Name" petValue={''} resValue={''} />

          {/* Employer Address */}
          <TableRow label="Employer Address" petValue={''} resValue={''} />

          {/* Employer City, State, Zip */}
          <TableRow label="Employer City, State, Zip Code" petValue={''} resValue={''} />

          {/* Employer Telephone */}
          <TableRow label="Employer Telephone Number" petValue={''} resValue={''} />

          {/* Employer Fax */}
          <TableRow label="Employer Fax Number" petValue={''} resValue={''} />
        </View>

        {/* Section B: Child(ren) Information - only for WITH CHILDREN */}
        {hasChildren && (
          <>
            <Text style={styles.childrenHeader}>B.  Child(ren) Information:</Text>
            <View style={styles.childrenTable}>
              {/* Children table header */}
              <View style={styles.childrenHeaderRow}>
                <Text style={styles.childrenCol}>Child Name</Text>
                <Text style={styles.childrenColSmall}>Gender</Text>
                <Text style={styles.childrenCol}>Child Social Security Number</Text>
                <Text style={styles.childrenColLast}>Child Date of Birth</Text>
              </View>

              {/* Children data rows (up to 4) */}
              {childRows.map((child, i) => (
                <View key={i} style={styles.childrenDataRow}>
                  <Text style={styles.childrenDataCol}>{child.name}</Text>
                  <Text style={styles.childrenDataColSmall}>{child.gender ? child.gender.charAt(0).toUpperCase() + child.gender.slice(1) : ''}</Text>
                  <Text style={styles.childrenDataCol}>{child.ssn}</Text>
                  <Text style={styles.childrenDataColLast}>{child.dob}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Section C (or B if no children): Type of Case */}
        <View style={styles.caseTypeSection}>
          <Text style={styles.caseTypeSectionTitle}>
            {hasChildren ? 'C' : 'B'}.  Type of Case being filed:  <Text style={{ fontSize: 7, fontWeight: 'normal' }}>Mark only one (1) category below.  (*) Mark this box only if no other case type applies.</Text>
          </Text>

          {hasChildren ? (
            <>
              {/* WITH CHILDREN: 3 rows x 3 columns */}
              <View style={styles.caseTypeRow}>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={caseType === 'divorce_with_children'} />
                  <Text style={styles.checkboxLabel}>Dissolution (Divorce)</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={caseType === 'establish_paternity'} />
                  <Text style={styles.checkboxLabel}>Paternity</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Order of Protection</Text>
                </View>
              </View>
              <View style={styles.caseTypeRow}>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Legal Separation</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={isModification && (modification?.modificationsSelected?.includes('legal_decision_making') || modification?.modificationsSelected?.includes('parenting_time') || false)} />
                  <Text style={styles.checkboxLabel}>*Legal Decision-Making / Parenting Time</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Register Foreign Order</Text>
                </View>
              </View>
              <View style={styles.caseTypeRow}>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Annulment</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={isModification && (modification?.modificationsSelected?.includes('child_support') || false)} />
                  <Text style={styles.checkboxLabel}>*Child Support</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Other</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* WITHOUT CHILDREN: simpler layout */}
              <View style={styles.caseTypeRow}>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={true} />
                  <Text style={styles.checkboxLabel}>Dissolution (Divorce)</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Annulment</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Order of Protection</Text>
                </View>
              </View>
              <View style={styles.caseTypeRow}>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Legal Separation</Text>
                </View>
                <View style={styles.caseTypeItem}>
                  <Checkbox checked={false} />
                  <Text style={styles.checkboxLabel}>Other: _______________</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Section D (or C if no children): Interpreter */}
        <View style={styles.interpreterRow}>
          <Text style={styles.interpreterLabel}>
            {hasChildren ? 'D' : 'C'}.  Do you need an interpreter?
          </Text>
          <Checkbox checked={false} />
          <Text style={styles.checkboxLabel}>Yes</Text>
          <Text style={{ fontSize: 8, marginRight: 4 }}>or</Text>
          <Checkbox checked={true} />
          <Text style={styles.checkboxLabel}>No.</Text>
          <Text style={styles.interpreterLangLabel}>If Yes, what language?</Text>
          <Text style={styles.interpreterLangValue}>{''}</Text>
        </View>

        {/* DO NOT COPY Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            DO NOT COPY this document.  DO NOT SERVE THIS DOCUMENT to the other party.
          </Text>
        </View>

        {/* Page footer */}
        <Text
          style={styles.pageFooterCenter}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

export default SensitiveDataCoversheet;
