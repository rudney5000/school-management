import type { RootState } from "@shared/store";

export const selectSelectedReportId = (state: RootState) => state.report.selectedReportId;
export const selectCreateModalOpen = (state: RootState) => state.report.isCreateModalOpen;
export const selectDetailModalOpen = (state: RootState) => state.report.isDetailModalOpen;
