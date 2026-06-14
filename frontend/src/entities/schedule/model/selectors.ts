import type {RootState} from "@shared/store";

export const selectSelectedScheduleId = (state: RootState) => state.schedule.selectedScheduleId;
