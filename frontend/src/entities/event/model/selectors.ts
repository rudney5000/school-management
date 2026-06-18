import type {RootState} from "@shared/store";

export const selectSelectedEventId = (state: RootState) => state.event.selectedEventId;
