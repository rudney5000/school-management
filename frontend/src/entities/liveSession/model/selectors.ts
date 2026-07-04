import type { RootState } from "@shared/store";

export const selectSelectedLiveSessionId = (state: RootState) => state.liveSession.selectedLiveSessionId;