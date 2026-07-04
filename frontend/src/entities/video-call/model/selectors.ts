import type { RootState } from "@shared/store";

export const selectIsMuted = (state: RootState) => state.callUi.isMuted;
export const selectIsCameraOff = (state: RootState) => state.callUi.isCameraOff;
export const selectIsScreenSharing = (state: RootState) => state.callUi.isScreenSharing;
export const selectSelectedAudioDeviceId = (state: RootState) => state.callUi.selectedAudioDeviceId;
export const selectSelectedVideoDeviceId = (state: RootState) => state.callUi.selectedVideoDeviceId;
export const selectActiveSessionId = (state: RootState) => state.callUi.activeSessionId;