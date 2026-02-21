import { View, Text } from '@react-pdf/renderer';
import { styles, toRomanNumeral } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData, formatYesNo, formatDivisionOption, formatParty } from '@/lib/court-forms/data-mapper';

interface PropertySectionProps {
  data: NormalizedPDFData;
  sectionNumber: number;
}

export function PropertySection({ data, sectionNumber }: PropertySectionProps) {
  const { property, petitioner, respondent } = data;

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{toRomanNumeral(sectionNumber)}. COMMUNITY PROPERTY AND ASSETS</Text>

      {/* Property Agreement Status */}
      <View style={{ flexDirection: 'row', marginBottom: 6, padding: 6, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 9, color: '#666' }}>Property Agreement:</Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{property.hasAgreement ? 'Yes - Agreement Reached' : 'No - Court to Decide'}</Text>
        </View>
        {!property.hasAgreement && property.divisionPreference && (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, color: '#666' }}>Division Preference:</Text>
            <Text style={{ fontSize: 10 }}>
              {property.divisionPreference === 'court_decides' ? 'Court determines allocation' : 'Specified below'}
            </Text>
          </View>
        )}
      </View>

      {property.hasAgreement && property.agreementDetails && (
        <View style={{ marginBottom: 6, padding: 6, borderLeftWidth: 2, borderLeftColor: '#4CAF50', backgroundColor: '#f9fff9' }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>Agreement Details:</Text>
          <Text style={{ fontSize: 9 }}>{property.agreementDetails}</Text>
        </View>
      )}

      {/* Two Column Grid for Property Categories */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
        {/* Left Column */}
        <View style={{ flex: 1 }}>
          {/* Real Estate */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>A. Real Estate</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Has Real Estate:</Text>
              <Text style={{ ...styles.infoValue, fontWeight: property.hasRealEstate ? 'bold' : 'normal' }}>
                {formatYesNo(property.hasRealEstate)}
              </Text>
            </View>
            {property.hasRealEstate && property.realEstate.map((home, index) => (
              <View key={home.id || index} style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#eee' }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Property {index + 1}</Text>
                <Text style={{ fontSize: 8 }}>{home.address}</Text>
                <Text style={{ fontSize: 8 }}>Division: {formatDivisionOption(home.divisionOption)}</Text>
              </View>
            ))}
          </View>

          {/* Bank Accounts */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>C. Bank Accounts</Text>
            {property.bankAccountsDuringMarriage ? (
              <>
                <Text style={{ fontSize: 8, marginBottom: 2 }}>{property.bankAccountsDuringMarriage}</Text>
                {property.bankAccountsDivision && (
                  <Text style={{ fontSize: 8, fontStyle: 'italic' }}>Division: {property.bankAccountsDivision}</Text>
                )}
              </>
            ) : (
              <Text style={{ fontSize: 9, color: '#666' }}>None specified</Text>
            )}
          </View>

          {/* Vehicles */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>E. Motor Vehicles</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Has Vehicles:</Text>
              <Text style={{ ...styles.infoValue, fontWeight: property.hasVehicles ? 'bold' : 'normal' }}>
                {formatYesNo(property.hasVehicles)}
              </Text>
            </View>
            {property.hasVehicles && property.vehicles.map((vehicle, index) => (
              <View key={vehicle.id || index} style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#eee' }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{vehicle.year} {vehicle.make} {vehicle.model}</Text>
                <Text style={{ fontSize: 8 }}>Titled to: {formatParty(vehicle.titledTo, petitioner.name, respondent.name)}</Text>
                {vehicle.hasLoan && <Text style={{ fontSize: 8 }}>Loan: ${vehicle.loanBalance?.toLocaleString() || 'N/A'}</Text>}
                <Text style={{ fontSize: 8 }}>Division: {formatDivisionOption(vehicle.divisionOption)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Column */}
        <View style={{ flex: 1 }}>
          {/* Furniture & Appliances */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>B. Furniture & Appliances</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Furniture (&gt;$200):</Text>
              <Text style={styles.infoValue}>{formatYesNo(property.hasFurniture)}</Text>
            </View>
            {property.hasFurniture && property.furnitureDivision && (
              <Text style={{ fontSize: 8, marginTop: 2 }}>{property.furnitureDivision}</Text>
            )}
            <View style={{ ...styles.infoRow, marginTop: 4 }}>
              <Text style={styles.infoLabel}>Appliances (&gt;$200):</Text>
              <Text style={styles.infoValue}>{formatYesNo(property.hasAppliances)}</Text>
            </View>
            {property.hasAppliances && property.applianceDivision && (
              <Text style={{ fontSize: 8, marginTop: 2 }}>{property.applianceDivision}</Text>
            )}
          </View>

          {/* Retirement Accounts */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>D. Retirement Accounts</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Has Retirement:</Text>
              <Text style={{ ...styles.infoValue, fontWeight: property.hasRetirement ? 'bold' : 'normal' }}>
                {formatYesNo(property.hasRetirement)}
              </Text>
            </View>
            {property.hasRetirement && property.retirement.map((account, index) => (
              <View key={account.id || index} style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#eee' }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>
                  {account.accountType === 'other' ? account.accountTypeOther : account.accountType?.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 8 }}>Owner: {formatParty(account.ownerName, petitioner.name, respondent.name)}</Text>
                <Text style={{ fontSize: 8 }}>Division: {account.proposedDivision}</Text>
              </View>
            ))}
          </View>

          {/* Separate Property */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>F. Separate Property</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Has Separate:</Text>
              <Text style={styles.infoValue}>{formatYesNo(property.hasSeparateProperty)}</Text>
            </View>
            {property.hasSeparateProperty && (
              <>
                {property.petitionerSeparateProperty && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Petitioner:</Text>
                    <Text style={{ fontSize: 8 }}>{property.petitionerSeparateProperty}</Text>
                  </View>
                )}
                {property.respondentSeparateProperty && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Respondent:</Text>
                    <Text style={{ fontSize: 8 }}>{property.respondentSeparateProperty}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
