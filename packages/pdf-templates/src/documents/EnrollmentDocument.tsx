import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { SignatureBlock, type SignatureBlockProps } from '../components/SignatureBlock';
import { getPdfLabels, type PdfLocale } from '../i18n/labels';
import { theme } from '../theme';

export interface EnrollmentDocumentProps {
  locale: PdfLocale;
  schoolName: string;
  studentFullName: string;
  studentImageUrl: string | null;
  gender: 'male' | 'female';
  age: number;
  className: string;
  enrollmentDate: string;
  dateOfBirth: string;
  parentFullName?: string;
  signature: SignatureBlockProps | null;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: theme.font,
    padding: 40,
    fontSize: 10,
    color: theme.colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: `2px solid ${theme.colors.primary}`,
    paddingBottom: 16,
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  documentTitle: {
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 4,
    objectFit: 'cover',
    border: `1px solid ${theme.colors.border}`,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    borderBottom: `1px solid ${theme.colors.border}`,
    paddingBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  field: {
    width: '50%',
    marginBottom: 10,
    paddingRight: 12,
  },
  label: {
    fontSize: 8.5,
    color: theme.colors.muted,
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export function EnrollmentDocument({
  locale,
  schoolName,
  studentFullName,
  studentImageUrl,
  gender,
  age,
  className,
  enrollmentDate,
  dateOfBirth,
  parentFullName,
  signature,
}: EnrollmentDocumentProps) {
  const t = getPdfLabels(locale);

  const formattedDob = new Date(dateOfBirth).toLocaleDateString(locale);
  const formattedEnrollmentDate = new Date(enrollmentDate).toLocaleDateString(locale);
  const genderLabel = gender === 'male' ? (t.male ?? 'Masculin') : (t.female ?? 'Féminin');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.schoolName}>{schoolName}</Text>
            <Text style={styles.documentTitle}>{t.enrollmentTitle}</Text>
          </View>
          {studentImageUrl && <Image style={styles.photo} src={studentImageUrl} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t.studentInformation ?? "Informations de l'élève"}
          </Text>
          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>{t.student}</Text>
              <Text style={styles.value}>{studentFullName}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.gender ?? 'Sexe'}</Text>
              <Text style={styles.value}>{genderLabel}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.dateOfBirth}</Text>
              <Text style={styles.value}>{formattedDob}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.age ?? 'Âge'}</Text>
              <Text style={styles.value}>
                {age} {t.years ?? 'ans'}
              </Text>
            </View>
            {parentFullName && (
              <View style={styles.field}>
                <Text style={styles.label}>{t.parentOrGuardian}</Text>
                <Text style={styles.value}>{parentFullName}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t.enrollmentInformation ?? "Informations d'inscription"}
          </Text>
          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>{t.class}</Text>
              <Text style={styles.value}>{className}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.enrollmentDate}</Text>
              <Text style={styles.value}>{formattedEnrollmentDate}</Text>
            </View>
          </View>
        </View>

        {signature && <SignatureBlock {...signature} />}
      </Page>
    </Document>
  );
}
