import { useState, useMemo, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGrades, type StudentBulletin } from '@entities/grades';
import { useClasses } from '@entities/class';
import { useStudents } from '@entities/student';
import { useAcademicPeriods } from '@entities/academic-period';
import { useTranslation } from '@shared/lib';
import { useSignBulletin } from '@entities/document-signature/lib/useSignBulletin';
import { useBulletinSignatureStatuses } from '@entities/document-signature/lib/useBulletinSignatureStatuses';
import type { SignatureStatusResult } from '@entities/document-signature/model/types';
import type { PdfLocale } from '@entities/document-signature/model/types';
import { useDownloadDocumentPdf, useOpenDocumentPdf } from '@entities/document-signature';

export type SortBy = 'average' | 'weighted' | 'name';

function toPdfLocale(lng: string | undefined): PdfLocale {
  switch (lng) {
    case 'en':
      return 'en';
    case 'ru':
      return 'ru';
    case 'ln':
      return 'ln';
    default:
      return 'ru';
  }
}

export function useResultsBulletin() {
  const { subSchoolId } = useParams({ strict: false });
  const { locale } = useTranslation();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('weighted');

  const { data: classes = [] } = useClasses(subSchoolId);
  const { data: students = [] } = useStudents(subSchoolId);
  const { data: academicPeriods = [] } = useAcademicPeriods(
    subSchoolId ? { subSchoolId } : undefined,
  );

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const isPeriodSelected = selectedPeriod !== 'all';

  const { data: grades = [], isLoading: gradesLoading } = useGrades({
    classId: selectedClassId,
    subSchoolId,
    ...(isPeriodSelected && { academicPeriodId: selectedPeriod }),
  });

  const studentLookup = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  const studentResults = useMemo(() => {
    const studentMap = new Map<string, StudentBulletin>();

    grades.forEach((grade) => {
      const student = studentLookup.get(grade.studentId);
      const existing = studentMap.get(grade.studentId);

      if (existing) {
        existing.grades.push(grade);
      } else {
        studentMap.set(grade.studentId, {
          studentId: grade.studentId,
          studentFirstName: student?.firstName ?? '',
          studentLastName: student?.lastName ?? '',
          studentName: student
            ? `${student.firstName} ${student.lastName}`
            : grade.studentId.slice(0, 8),
          grades: [grade],
          average: 0,
          weightedAverage: 0,
          totalCoefficient: 0,
          rank: 0,
          classAverage: 0,
        });
      }
    });

    const results = Array.from(studentMap.values()).map((result) => {
      let totalScore = 0;
      let totalMaxScore = 0;
      let weightedSum = 0;
      let totalCoefficient = 0;

      result.grades.forEach((grade) => {
        const score = parseFloat(grade.score);
        const maxScore = parseFloat(grade.maxScore);
        const coeff = parseFloat(grade.coefficient);

        totalScore += score;
        totalMaxScore += maxScore;
        weightedSum += (score / maxScore) * coeff;
        totalCoefficient += coeff;
      });

      const average = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 20 : 0;
      const weightedAverage = totalCoefficient > 0 ? (weightedSum / totalCoefficient) * 20 : 0;

      return { ...result, average, weightedAverage, totalCoefficient };
    });

    const sorted = [...results].sort((a, b) => b.weightedAverage - a.weightedAverage);
    const classAvg =
      sorted.length > 0 ? sorted.reduce((sum, r) => sum + r.weightedAverage, 0) / sorted.length : 0;

    sorted.forEach((result, index) => {
      result.rank = index + 1;
      result.classAverage = classAvg;
    });

    return sorted;
  }, [grades, studentLookup]);

  const sortedResults = useMemo(() => {
    const sorted = [...studentResults];
    switch (sortBy) {
      case 'average':
        return sorted.sort((a, b) => b.average - a.average);
      case 'weighted':
        return sorted.sort((a, b) => b.weightedAverage - a.weightedAverage);
      case 'name':
        return sorted.sort((a, b) => a.studentLastName.localeCompare(b.studentLastName));
      default:
        return sorted;
    }
  }, [studentResults, sortBy]);

  const classStats = useMemo(() => {
    if (studentResults.length === 0) return null;

    const averages = studentResults.map((s) => s.weightedAverage);
    const classAverage = averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
    const maxAverage = Math.max(...averages);
    const minAverage = Math.min(...averages);
    const passCount = studentResults.filter((s) => s.weightedAverage >= 10).length;
    const passRate = (passCount / studentResults.length) * 100;

    return {
      classAverage,
      maxAverage,
      minAverage,
      passCount,
      passRate,
      totalStudents: studentResults.length,
    };
  }, [studentResults]);

  const bulletinStatusParams = useMemo(() => {
    if (!subSchoolId || !selectedClassId || !isPeriodSelected) return [];
    return sortedResults.map((r) => ({
      subSchoolId,
      classId: selectedClassId,
      studentId: r.studentId,
      academicPeriodId: selectedPeriod,
    }));
  }, [subSchoolId, selectedClassId, isPeriodSelected, selectedPeriod, sortedResults]);

  const { statusByStudentId } = useBulletinSignatureStatuses(bulletinStatusParams);

  const resultsWithSignature = useMemo(
    () =>
      sortedResults.map((r) => ({
        ...r,
        signatureStatus: statusByStudentId.get(r.studentId) as SignatureStatusResult | undefined,
      })),
    [sortedResults, statusByStudentId],
  );

  const pdfLocale = toPdfLocale(locale);
  const downloadPdfMutation = useDownloadDocumentPdf();
  const openPdfMutation = useOpenDocumentPdf();

  const buildBulletinPdfParams = (studentId: string) => ({
    subSchoolId: subSchoolId!,
    classId: selectedClassId,
    studentId,
    academicPeriodId: selectedPeriod,
    locale: pdfLocale,
  });

  const canGeneratePdf = isPeriodSelected && !!subSchoolId;

  const handleOpenPdf = (result: StudentBulletin) => {
    if (!canGeneratePdf) return;
    openPdfMutation.mutate({
      documentType: 'bulletin',
      params: buildBulletinPdfParams(result.studentId),
    });
  };

  const handleDownloadPdf = (result: StudentBulletin) => {
    if (!canGeneratePdf) return;
    downloadPdfMutation.mutate({
      documentType: 'bulletin',
      params: buildBulletinPdfParams(result.studentId),
      filename: `bulletin-${result.studentLastName}-${result.studentFirstName}.pdf`,
    });
  };

  const signBulletinMutation = useSignBulletin();

  const handleSignStudent = (studentId: string) => {
    if (!subSchoolId || !isPeriodSelected) return;
    signBulletinMutation.mutate({
      subSchoolId,
      classId: selectedClassId,
      studentId,
      academicPeriodId: selectedPeriod,
    });
  };

  const isOpeningPdfForStudent = (studentId: string) =>
    openPdfMutation.isPending &&
    openPdfMutation.variables?.documentType === 'bulletin' &&
    openPdfMutation.variables.params.studentId === studentId;

  const isDownloadingPdfForStudent = (studentId: string) =>
    downloadPdfMutation.isPending &&
    downloadPdfMutation.variables?.documentType === 'bulletin' &&
    downloadPdfMutation.variables.params.studentId === studentId;

  return {
    classes,
    academicPeriods,
    selectedClassId,
    setSelectedClassId,
    selectedPeriod,
    setSelectedPeriod,
    sortBy,
    setSortBy,
    sortedResults: resultsWithSignature,
    classStats,
    canGeneratePdf,
    gradesLoading,
    handleOpenPdf,
    handleDownloadPdf,
    isOpeningPdfForStudent,
    isDownloadingPdfForStudent,
    handleSignStudent,
    isSigning: signBulletinMutation.isPending,
    subSchoolId,
    selectedPeriodForBatch: selectedPeriod,
    isPeriodSelected,
  };
}
