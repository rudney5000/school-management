import { createSlice, type PayloadAction, type Slice } from '@reduxjs/toolkit'
import type { DocumentType } from '@entities/document-signature/model/types'

type DocumentSignatureState = {
    selectedSignatureId: string | null
    activeDocumentType:  DocumentType | null
}

const initialState: DocumentSignatureState = {
    selectedSignatureId: null,
    activeDocumentType:  null,
}

export const documentSignatureSlice: Slice<DocumentSignatureState> = createSlice({
    name: 'documentSignature',
    initialState,
    reducers: {
        setSelectedSignatureId: (state, action: PayloadAction<string | null>) => {
            state.selectedSignatureId = action.payload
        },
        setActiveDocumentType: (state, action: PayloadAction<DocumentType | null>) => {
            state.activeDocumentType = action.payload
        },
    },
})

export const {
    setSelectedSignatureId,
    setActiveDocumentType,
} = documentSignatureSlice.actions
