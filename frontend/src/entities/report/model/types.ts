export type ReportCategory = 'harassment' | 'behavior' | 'material' | 'security' | 'teacher_absence' | 'other';
export type ReportStatus = 'new' | 'in_review' | 'resolved' | 'dismissed';
export type InvolvedPersonRole = 'teacher' | 'staff' | 'director' | 'student' | 'other';
export type ReporterRole = 'student' | 'parent' | 'teacher' | 'admin' | 'super_admin' | 'director' | 'worker';

export type Report = {
    id: string;
    schoolId: string;
    subSchoolId: string;
    reporterId: string | null;
    reporterRole: ReporterRole;
    isAnonymous: boolean;
    trackingToken: string;
    category: ReportCategory;
    otherCategoryLabel?: string;
    description: string;
    involvedPersonName?: string;
    involvedPersonRole?: InvolvedPersonRole;
    relatedStudentId?: string;
    status: ReportStatus;
    assignedToId?: string;
    resolutionNote?: string;
    resolvedAt?: string;
    resolvedById?: string;
    createdAt: string;
    updatedAt: string;
};

export type ReportStatusHistory = {
    id: string;
    reportId: string;
    fromStatus?: ReportStatus;
    toStatus: ReportStatus;
    changedById: string;
    note?: string;
    createdAt: string;
};
