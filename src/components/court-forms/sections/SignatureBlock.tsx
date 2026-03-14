import { View, Text, Image } from '@react-pdf/renderer';
import { styles } from '@/lib/court-forms/PDFStyles';
import { NormalizedPDFData } from '@/lib/court-forms/data-mapper';

interface SignatureBlockProps {
  data: NormalizedPDFData;
  signature?: string;
}

export function SignatureBlock({ data, signature }: SignatureBlockProps) {
  const { petitioner } = data;
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Phoenix',
  });

  return (
    <View style={styles.section} wrap={false}>
      {/* Verification */}
      <Text style={{ ...styles.sectionTitle, textAlign: 'center' }}>VERIFICATION</Text>

      <View style={{ ...styles.infoBox, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 9, lineHeight: 1.6, marginBottom: 8 }}>
          I, <Text style={{ fontWeight: 'bold' }}>{petitioner.name || '_______________________'}</Text>, declare under penalty of perjury that I am the Petitioner in the above-entitled action, that I have read the foregoing Petition for Dissolution of Marriage and know the contents thereof, and that the same is true of my own knowledge, except as to those matters which are therein stated on information and belief, and as to those matters, I believe them to be true.
        </Text>
        <Text style={{ fontSize: 9, fontStyle: 'italic' }}>
          I declare under penalty of perjury under the laws of the State of Arizona that the foregoing is true and correct.
        </Text>
      </View>

      {/* Two Column Layout for Signature and Info */}
      <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
        {/* Signature Column */}
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: 10 }}>
            {signature ? (
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 4, minHeight: 50 }}>
                <Image
                  src={signature}
                  style={{ height: 45, objectFit: 'contain' }}
                />
              </View>
            ) : (
              <Text style={{ fontSize: 10, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 40 }}></Text>
            )}
            <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>Signature of Petitioner</Text>
          </View>
          <View>
            {signature ? (
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 4, paddingTop: 4 }}>
                <Text style={{ fontSize: 10 }}>{currentDate}</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 10, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 20 }}></Text>
            )}
            <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>Date</Text>
          </View>
        </View>

        {/* Petitioner Info Column */}
        <View style={{ flex: 1, ...styles.infoBox }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{petitioner.name?.toUpperCase() || '_______________'}</Text>
          <Text style={{ fontSize: 9, marginTop: 6, fontStyle: 'italic', color: '#666' }}>Pro Se Petitioner</Text>
        </View>
      </View>

      {/* Certificate of Service */}
      <View style={{ marginTop: 15 }}>
        <Text style={{ ...styles.sectionTitle, textAlign: 'center' }}>CERTIFICATE OF SERVICE</Text>

        <View style={{ ...styles.infoBox }}>
          <Text style={{ fontSize: 9, marginBottom: 6 }}>
            I certify that on _____________, 20____, I served a copy of this Petition on the Respondent by:
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '45%' }}>
              <View style={{ width: 10, height: 10, borderWidth: 1, borderColor: '#000', marginRight: 4 }} />
              <Text style={{ fontSize: 9 }}>Personal service</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '45%' }}>
              <View style={{ width: 10, height: 10, borderWidth: 1, borderColor: '#000', marginRight: 4 }} />
              <Text style={{ fontSize: 9 }}>Acceptance of service</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '45%' }}>
              <View style={{ width: 10, height: 10, borderWidth: 1, borderColor: '#000', marginRight: 4 }} />
              <Text style={{ fontSize: 9 }}>Certified mail</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '45%' }}>
              <View style={{ width: 10, height: 10, borderWidth: 1, borderColor: '#000', marginRight: 4 }} />
              <Text style={{ fontSize: 9 }}>Other: ___________</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              {signature ? (
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 2, minHeight: 35 }}>
                  <Image
                    src={signature}
                    style={{ height: 30, objectFit: 'contain' }}
                  />
                </View>
              ) : (
                <Text style={{ fontSize: 10, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 15 }}></Text>
              )}
              <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>Signature</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 15 }}></Text>
              <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>Date</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
