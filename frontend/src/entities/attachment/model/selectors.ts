import type { RootState } from '@shared/store'

export const selectSelectedAttachmentId = (state: RootState) =>
    state.attachment.selectedAttachmentId
