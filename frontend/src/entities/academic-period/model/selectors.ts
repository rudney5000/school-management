import type { RootState } from "@shared/store"

export const selectSelectedPeriodId = (state: RootState) => state.academicPeriod.selectedPeriodId
export const selectCurrentPeriodId  = (state: RootState) => state.academicPeriod.currentPeriodId