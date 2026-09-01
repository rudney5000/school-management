import type { RootState } from '@shared/store';

export const selectSelectedSignatureId = (state: RootState) =>
  state.documentSignature.selectedSignatureId;

export const selectActiveDocumentType = (state: RootState) =>
  state.documentSignature.activeDocumentType;
