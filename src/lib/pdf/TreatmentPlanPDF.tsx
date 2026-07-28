import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a standard font if needed, or stick to built-in Helvetica
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2pt solid #0d9488', // Rise & Shine Teal
    paddingBottom: 20,
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#0d9488',
    color: '#ffffff',
    textAlign: 'center',
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d9488',
    borderBottom: '1pt solid #e5e7eb',
    paddingBottom: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 140,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
  },
  textBlock: {
    fontSize: 10,
    color: '#111827',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  goalBox: {
    border: '1pt solid #e5e7eb',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  goalDomain: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 4,
  },
  signatureBox: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signLine: {
    width: 200,
    borderTop: '1pt solid #111827',
    paddingTop: 8,
  },
  signLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 8,
  }
});

export const TreatmentPlanPDF = ({ client, treatmentPlan }: { client: any, treatmentPlan: any }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoPlaceholder}>
          <Text>R&S</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Comprehensive ABA Treatment Plan</Text>
          <Text style={styles.subtitle}>Rise and Shine ABA LLC</Text>
          <Text style={styles.subtitle}>Date: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Client Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Patient Name:</Text>
          <Text style={styles.value}>{client.firstName} {client.lastName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>{client.dob || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Diagnosis Code:</Text>
          <Text style={styles.value}>{client.diagnosisCode || 'F84.0'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Primary Insurance:</Text>
          <Text style={styles.value}>{client.insuranceProvider || 'N/A'}</Text>
        </View>
      </View>

      {/* Provider Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Provider Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Assessing BCBA:</Text>
          <Text style={styles.value}>{treatmentPlan.assessorName || 'N/A'} {treatmentPlan.assessorCredentials || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Referring Provider:</Text>
          <Text style={styles.value}>{treatmentPlan.referringProvider || 'N/A'}</Text>
        </View>
      </View>

      {/* Assessment Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background & Assessment Summary</Text>
        <Text style={styles.textBlock}>
          {treatmentPlan.backgroundNotes || 'No background notes provided.'}
        </Text>
        <Text style={styles.label}>Assessment Tool(s) Used:</Text>
        <Text style={styles.textBlock}>{treatmentPlan.assessmentTool || 'N/A'}</Text>
        <Text style={styles.label}>Scores / Results:</Text>
        <Text style={styles.textBlock}>{treatmentPlan.toolScores || 'N/A'}</Text>
      </View>

      {/* Requested Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requested Services (Per Week)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>97153 Direct Therapy:</Text>
          <Text style={styles.value}>{treatmentPlan.hoursDirect || '0'} hrs</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>97155 Protocol Mod:</Text>
          <Text style={styles.value}>{treatmentPlan.hoursSupervision || '0'} hrs</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>97156 Parent Training:</Text>
          <Text style={styles.value}>{treatmentPlan.hoursParentTraining || '0'} hrs</Text>
        </View>
      </View>

    </Page>

    {/* Goals Page */}
    <Page size="LETTER" style={styles.page}>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skill Acquisition Goals</Text>
        {treatmentPlan.skillGoals && treatmentPlan.skillGoals.length > 0 ? (
          treatmentPlan.skillGoals.map((goal: any, index: number) => (
            <View style={styles.goalBox} key={index}>
              <Text style={styles.goalDomain}>[{goal.domain}]</Text>
              <Text style={styles.textBlock}>{goal.description}</Text>
              <Text style={styles.textBlock}><Text style={{fontWeight: 'bold'}}>Mastery: </Text>{goal.mastery}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.textBlock}>No skill goals specified.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Behavior Reduction Plan (BRP)</Text>
        {treatmentPlan.brp && treatmentPlan.brp.length > 0 ? (
          treatmentPlan.brp.map((b: any, index: number) => (
            <View style={styles.goalBox} key={index}>
              <Text style={styles.goalDomain}>Target Behavior: {b.behavior}</Text>
              <Text style={styles.textBlock}><Text style={{fontWeight: 'bold'}}>Topography: </Text>{b.topography}</Text>
              <Text style={styles.textBlock}><Text style={{fontWeight: 'bold'}}>Function: </Text>{b.function}</Text>
              <Text style={styles.textBlock}><Text style={{fontWeight: 'bold'}}>Antecedent Intervention: </Text>{b.antecedent}</Text>
              <Text style={styles.textBlock}><Text style={{fontWeight: 'bold'}}>Consequence Intervention: </Text>{b.consequence}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.textBlock}>No behavior reduction targets specified.</Text>
        )}
      </View>

      {/* Signatures */}
      <View style={[styles.section, { marginTop: 40 }]}>
        <Text style={styles.sectionTitle}>Signatures & Consents</Text>
        <View style={styles.signatureBox}>
          
          <View>
            <Text style={{ fontFamily: 'Helvetica-Oblique', fontSize: 16, marginBottom: 8, color: '#0d9488' }}>
              {treatmentPlan.signature || ''}
            </Text>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>Board Certified Behavior Analyst (BCBA)</Text>
              <Text style={{ fontSize: 8, marginTop: 4 }}>Date: {treatmentPlan.assessmentEndDate ? new Date(treatmentPlan.assessmentEndDate).toLocaleDateString() : 'N/A'}</Text>
            </View>
          </View>

          <View>
            <Text style={{ fontFamily: 'Helvetica-Oblique', fontSize: 16, marginBottom: 8, color: '#0d9488' }}>
              {treatmentPlan.parentSignature || ''}
            </Text>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>Parent / Guardian Consent</Text>
              <Text style={{ fontSize: 8, marginTop: 4 }}>Date: {treatmentPlan.parentSignatureDate ? new Date(treatmentPlan.parentSignatureDate).toLocaleDateString() : 'N/A'}</Text>
            </View>
          </View>

        </View>
      </View>

      <Text style={styles.footer}>
        Rise and Shine ABA LLC • CONFIDENTIAL • Page 2
      </Text>
    </Page>
  </Document>
);
