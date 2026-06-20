import { createSlice, type PayloadAction, type Slice } from '@reduxjs/toolkit';
import type { AttendanceStatus } from '@entities/attendances';

type AttendanceTab = 'students' | 'teachers' | 'staff';

type PendingChange = {
    personId: string
    date: string
    status: AttendanceStatus
    courseId?: string
}

type AttendanceFilters = {
    from:   string | null;
    to:     string | null;
    status: AttendanceStatus | null;
    page:   number;
    limit:  number;
};

type AttendanceState = {
    activeTab:                   AttendanceTab;
    selectedStudentAttendanceId: string | null;
    selectedTeacherAttendanceId: string | null;
    filters:                     AttendanceFilters;
    pendingChanges:              PendingChange[];
    editingDate:                 string | null
};

const initialState: AttendanceState = {
    activeTab:                   'students',
    selectedStudentAttendanceId: null,
    selectedTeacherAttendanceId: null,
    filters: {
        from:   null,
        to:     null,
        status: null,
        page:   1,
        limit:  20,
    },
    pendingChanges: [],
    editingDate: null
};

export const attendanceSlice: Slice<AttendanceState> = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<AttendanceTab>) => {
            state.activeTab = action.payload;
            state.selectedStudentAttendanceId = null;
            state.selectedTeacherAttendanceId = null;
        },

        setSelectedStudentAttendanceId: (state, action: PayloadAction<string | null>) => {
            state.selectedStudentAttendanceId = action.payload;
        },

        setSelectedTeacherAttendanceId: (state, action: PayloadAction<string | null>) => {
            state.selectedTeacherAttendanceId = action.payload;
        },

        setFilters: (state, action: PayloadAction<Partial<AttendanceFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        markPendingAttendance: (state, action: PayloadAction<PendingChange>) => {
            const { personId, date, courseId } = action.payload
            const idx = state.pendingChanges.findIndex(
                (c) => c.personId === personId && c.date === date && c.courseId === courseId
            )
            if (idx !== -1) {
                state.pendingChanges[idx] = action.payload
            } else {
                state.pendingChanges.push(action.payload)
            }
        },

        clearPendingChanges: (state) => {
            state.pendingChanges = []
        },
        setEditingDate: (state, action: PayloadAction<string | null>) => {
            state.editingDate = action.payload
            state.pendingChanges = []
        },
    },
});

export const {
    setActiveTab,
    setSelectedStudentAttendanceId,
    setSelectedTeacherAttendanceId,
    setFilters,
    resetFilters,
    markPendingAttendance,
    clearPendingChanges,
    setEditingDate
} = attendanceSlice.actions;