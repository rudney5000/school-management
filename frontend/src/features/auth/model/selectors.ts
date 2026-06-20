import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from "@shared/store";
import type { UserRole } from "@features/auth/model/dto/RegisterDto.ts";

export const selectRole = (state: RootState) => state.auth.role

export const selectIsAdminOrDirector: (state: RootState) => boolean = createSelector(
    selectRole,
    (role) => role === 'admin' || role === 'director'
)

export const selectAttendancePermission: (state: RootState) => {
    canEdit: boolean
    canView: boolean
} = createSelector(
    selectRole,
    (role) => ({
        canEdit: role === 'teacher',
        canView: role !== null && (
            ['admin', 'director', 'teacher', 'student', 'parent'] as UserRole[]
        ).includes(role),
    })
)