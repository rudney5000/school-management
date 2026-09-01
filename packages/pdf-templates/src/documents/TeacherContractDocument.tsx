import { Document, Page, View, Image, Text, StyleSheet } from '@react-pdf/renderer';
import { SignatureBlock, type SignatureBlockProps } from '../components/SignatureBlock';
import { getPdfLabels, type PdfLocale } from '../i18n/labels';
import { theme } from '../theme';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type ContractType = 'permanent' | 'fixed_term' | 'part_time';

export interface TeacherContractDocumentProps {
  locale: PdfLocale;
  schoolName: string;
  teacherFullName: string;
  teacherImageUrl: string | null;
  gender: 'male' | 'female';
  age: number;
  dateOfBirth: string;
  maritalStatus: MaritalStatus | null;
  hasChildren: boolean;
  childrenCount: number;
  yearsOfExperience: number;
  hireDate: string;
  contractEndDate: string | null;
  contractType: ContractType;
  salary: number | null;
  weeklyHours: number | null;
  subjectsTaught: string | null;
  contractClauses: string | null;
  qualification: string | null;
  specialization: string | null;
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
  clausesBox: {
    backgroundColor: theme.colors.rowAlt,
    padding: 10,
    borderRadius: 4,
  },
  clausesText: {
    fontSize: 9.5,
    color: theme.colors.text,
    lineHeight: 1.5,
  },
});

function formatSalary(salary: number | null, locale: PdfLocale): string {
  if (salary === null) return '—';
  return new Intl.NumberFormat(locale).format(salary);
}

export function TeacherContractDocument({
  locale,
  schoolName,
  teacherFullName,
  teacherImageUrl,
  gender,
  age,
  dateOfBirth,
  maritalStatus,
  hasChildren,
  childrenCount,
  yearsOfExperience,
  hireDate,
  contractEndDate,
  contractType,
  salary,
  weeklyHours,
  subjectsTaught,
  contractClauses,
  qualification,
  specialization,
  signature,
}: TeacherContractDocumentProps) {
  const t = getPdfLabels(locale);

  const formattedDob = new Date(dateOfBirth).toLocaleDateString(locale);
  const formattedHireDate = new Date(hireDate).toLocaleDateString(locale);
  const formattedEndDate = contractEndDate
    ? new Date(contractEndDate).toLocaleDateString(locale)
    : null;
  const genderLabel = gender === 'male' ? t.male : t.female;

  const maritalStatusLabel = maritalStatus
    ? { single: t.single, married: t.married, divorced: t.divorced, widowed: t.widowed }[
        maritalStatus
      ]
    : '—';

  const contractTypeLabel = {
    permanent: t.permanent,
    fixed_term: t.fixedTerm,
    part_time: t.partTime,
  }[contractType];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.schoolName}>{schoolName}</Text>
            <Text style={styles.documentTitle}>{t.contractTitle}</Text>
          </View>
          {teacherImageUrl && <Image style={styles.photo} src={teacherImageUrl} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.teacherInformation}</Text>
          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>{t.employee}</Text>
              <Text style={styles.value}>{teacherFullName}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.gender}</Text>
              <Text style={styles.value}>{genderLabel}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.dateOfBirth}</Text>
              <Text style={styles.value}>{formattedDob}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.age}</Text>
              <Text style={styles.value}>
                {age} {t.years}
              </Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.maritalStatus}</Text>
              <Text style={styles.value}>{maritalStatusLabel}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.hasChildren}</Text>
              <Text style={styles.value}>{hasChildren ? `${t.yes} (${childrenCount})` : t.no}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.yearsOfExperience}</Text>
              <Text style={styles.value}>
                {yearsOfExperience} {t.years}
              </Text>
            </View>
            {qualification && (
              <View style={styles.field}>
                <Text style={styles.label}>{t.position}</Text>
                <Text style={styles.value}>{qualification}</Text>
              </View>
            )}
            {specialization && (
              <View style={styles.field}>
                <Text style={styles.label}>{t.specialization}</Text>
                <Text style={styles.value}>{specialization}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.contractInformation}</Text>
          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>{t.employer}</Text>
              <Text style={styles.value}>{schoolName}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.contractType}</Text>
              <Text style={styles.value}>{contractTypeLabel}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t.hireDate}</Text>
              <Text style={styles.value}>{formattedHireDate}</Text>
            </View>
            {formattedEndDate && (
              <View style={styles.field}>
                <Text style={styles.label}>{t.contractEndDate}</Text>
                <Text style={styles.value}>{formattedEndDate}</Text>
              </View>
            )}
            {salary !== null && (
              <View style={styles.field}>
                <Text style={styles.label}>{t.salary}</Text>
                <Text style={styles.value}>{formatSalary(salary, locale)}</Text>
              </View>
            )}
            {weeklyHours !== null && (
              <View style={styles.field}>
                <Text style={styles.label}>{t.weeklyHours}</Text>
                <Text style={styles.value}>
                  {weeklyHours} {t.hoursPerWeek}
                </Text>
              </View>
            )}
            {subjectsTaught && (
              <View style={styles.field}>
                <Text style={styles.label}>{t.subjectsTaught}</Text>
                <Text style={styles.value}>{subjectsTaught}</Text>
              </View>
            )}
          </View>
        </View>

        {contractClauses && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.clauses}</Text>
            <View style={styles.clausesBox}>
              <Text style={styles.clausesText}>{contractClauses}</Text>
            </View>
          </View>
        )}

        {signature && <SignatureBlock {...signature} />}
      </Page>
    </Document>
  );
}
