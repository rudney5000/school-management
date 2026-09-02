import { createSlice, type PayloadAction, type Slice } from '@reduxjs/toolkit';

type ReportState = {
  selectedReportId: string | null;
  isCreateModalOpen: boolean;
  isDetailModalOpen: boolean;
};

const initialState: ReportState = {
  selectedReportId: null,
  isCreateModalOpen: false,
  isDetailModalOpen: false,
};

export const reportSlice: Slice<ReportState> = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setSelectedReportId: (state, action: PayloadAction<string | null>) => {
      state.selectedReportId = action.payload;
    },
    setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalOpen = action.payload;
    },
    setDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload;
    },
  },
});

export const { setSelectedReportId, setCreateModalOpen, setDetailModalOpen } = reportSlice.actions;
