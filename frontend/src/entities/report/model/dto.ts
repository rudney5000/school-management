import type { ReportCategory, ReportStatus, InvolvedPersonRole } from './types';

export type CreateReportDto = {
    category: ReportCategory;
    otherCategoryLabel?: string;
    description: string;
    involvedPersonName?: string;
    involvedPersonRole?: InvolvedPersonRole;
    relatedStudentId?: string;
    isAnonymous: boolean;
};

export type UpdateReportStatusDto = {
    status: ReportStatus;
    note?: string;
};

export type AssignReportDto = {
    assignedToId: string;
};

export type ReportParamsDto = {
    id: string;
};

export type ReportFiltersDto = {
    status?: ReportStatus;
    category?: ReportCategory;
    from?: string;
    to?: string;
};

export type TrackReportParamsDto = {
    token: string;
};
