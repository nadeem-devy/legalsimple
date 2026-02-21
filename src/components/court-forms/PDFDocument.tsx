import { Document, Page, View, Text } from '@react-pdf/renderer';
import { styles } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

// Section components
import { CourtHeader } from './sections/CourtHeader';
import { CaseCaption } from './sections/CaseCaption';
import { DocumentTitle } from './sections/DocumentTitle';
import { PartiesSection } from './sections/PartiesSection';
import { JurisdictionSection } from './sections/JurisdictionSection';
import { MarriageSection } from './sections/MarriageSection';
import { ChildrenSection } from './sections/ChildrenSection';
import { CustodySection } from './sections/CustodySection';
import { PropertySection } from './sections/PropertySection';
import { DebtSection } from './sections/DebtSection';
import { MaintenanceSection } from './sections/MaintenanceSection';
import { PrayerSection } from './sections/PrayerSection';
import { SignatureBlock } from './sections/SignatureBlock';

interface PDFDocumentProps {
  data: NormalizedPDFData;
  caseNumber?: string;
  signature?: string;
}

export function PDFDocument({ data, caseNumber, signature }: PDFDocumentProps) {
  const hasChildren = data.caseType === 'divorce_with_children';

  // Calculate section numbers dynamically based on case type
  let sectionNum = 0;

  return (
    <Document
      title={`Petition for Dissolution of Marriage - ${data.petitioner.name}`}
      author="LegalSimple"
      subject="Petition for Dissolution of Marriage"
      creator="LegalSimple Court Forms"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Court Header */}
        <CourtHeader county={data.petitioner.county} />

        {/* Case Caption */}
        <CaseCaption
          petitionerName={data.petitioner.name}
          respondentName={data.respondent.name}
          caseNumber={caseNumber}
        />

        {/* Document Title */}
        <DocumentTitle caseType={data.caseType} />

        {/* Section I: Parties */}
        <PartiesSection data={data} sectionNumber={++sectionNum} />

        {/* Section II: Jurisdiction */}
        <JurisdictionSection data={data} sectionNumber={++sectionNum} />

        {/* Section III: Marriage */}
        <MarriageSection data={data} sectionNumber={++sectionNum} />

        {/* Section IV: Children (only for with-children cases) */}
        {hasChildren && data.children && (
          <ChildrenSection data={data} sectionNumber={++sectionNum} />
        )}

        {/* Section V (or IV): Custody (only for with-children cases) */}
        {hasChildren && (
          <CustodySection data={data} sectionNumber={++sectionNum} />
        )}

        {/* Property Section */}
        <PropertySection data={data} sectionNumber={++sectionNum} />

        {/* Debt Section */}
        <DebtSection data={data} sectionNumber={++sectionNum} />

        {/* Maintenance Section */}
        <MaintenanceSection data={data} sectionNumber={++sectionNum} />

        {/* Prayer Section */}
        <PrayerSection data={data} sectionNumber={++sectionNum} />

        {/* Signature Block */}
        <SignatureBlock data={data} signature={signature} />

        {/* Page Number - fixed at bottom of every page */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

export default PDFDocument;
