import { createSlice, type PayloadAction, type Slice } from '@reduxjs/toolkit'

type AttachmentState = {
    selectedAttachmentId: string | null
}

const initialState: AttachmentState = {
    selectedAttachmentId: null,
}

export const attachmentSlice: Slice<AttachmentState> = createSlice({
    name: 'attachment',
    initialState,
    reducers: {
        setSelectedAttachmentId: (state, action: PayloadAction<string | null>) => {
            state.selectedAttachmentId = action.payload
        },
    },
})

export const { setSelectedAttachmentId } = attachmentSlice.actions
