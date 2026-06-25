import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit"

type AcademicPeriodsState = {
    selectedPeriodId:  string | null
    currentPeriodId:   string | null
}

const initialState: AcademicPeriodsState = {
    selectedPeriodId: null,
    currentPeriodId:  null,
}

export const academicPeriodSlice: Slice<AcademicPeriodsState> = createSlice({
    name: 'academicPeriods',
    initialState,
    reducers: {
        setSelectedPeriodId: (state, action: PayloadAction<string | null>) => {
            state.selectedPeriodId = action.payload
        },
        setCurrentPeriodId: (state, action: PayloadAction<string | null>) => {
            state.currentPeriodId = action.payload
        },
    },
})

export const {
    setSelectedPeriodId,
    setCurrentPeriodId,
} = academicPeriodSlice.actions