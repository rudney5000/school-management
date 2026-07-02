import {type ActionCreatorWithoutPayload, createSlice, type PayloadAction, type Slice} from '@reduxjs/toolkit'
import type {UserRole} from "@features/auth/model/dto/RegisterDto.ts";

export interface AuthState {
    accessToken: string | null
    refreshToken: string | null
    role: UserRole | null
    email: string | null
    userId: string | null
    schoolId: string | null
    subSchoolId: string | null
    isAuthenticated: boolean
}

const initialState: AuthState = {
    accessToken:     localStorage.getItem('accessToken'),
    refreshToken:     localStorage.getItem('refreshToken'),
    role:            localStorage.getItem('role') as UserRole || null,
    email:           localStorage.getItem('email'),
    userId:          localStorage.getItem('userId'),
    schoolId:        localStorage.getItem('schoolId'),
    subSchoolId:     localStorage.getItem('subSchoolId'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
}

export const authSlice: Slice<AuthState> = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<AuthState & { refreshToken: string }>,
        ) => {
            const { accessToken, refreshToken, role, email, userId, schoolId, subSchoolId } = action.payload
            state.accessToken     = accessToken
            state.refreshToken    = refreshToken
            state.role            = role
            state.email           = email
            state.userId          = userId
            state.schoolId        = schoolId
            state.subSchoolId     = subSchoolId
            state.isAuthenticated = true

            localStorage.setItem('accessToken', accessToken!)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('role', role!)
            localStorage.setItem('email', email!)
            localStorage.setItem('schoolId', schoolId!)
            if (userId) localStorage.setItem('userId', userId)
            if (subSchoolId) localStorage.setItem('subSchoolId', subSchoolId)
        },
        logout: (state, _action: PayloadAction<undefined>) => {
            state.accessToken     = null
            state.role            = null
            state.email           = null
            state.userId          = null
            state.schoolId        = null
            state.subSchoolId     = null
            state.isAuthenticated = false

            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('role')
            localStorage.removeItem('email')
            localStorage.removeItem('userId')
            localStorage.removeItem('schoolId')
            localStorage.removeItem('subSchoolId')
        },
    },
})

export const { setCredentials } = authSlice.actions
export const logout = authSlice.actions.logout as ActionCreatorWithoutPayload<'auth/logout'>;