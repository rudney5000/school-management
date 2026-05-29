import { createSlice, type PayloadAction, type Slice } from '@reduxjs/toolkit'

export interface AuthState {
    accessToken: string | null
    role: string | null
    email: string | null
    schoolId: string | null
    subSchoolId: string | null
    isAuthenticated: boolean
}

const initialState: AuthState = {
    accessToken:     localStorage.getItem('accessToken'),
    role:            localStorage.getItem('role'),
    email:           localStorage.getItem('email'),
    schoolId:        localStorage.getItem('schoolId'),
    subSchoolId:     localStorage.getItem('subSchoolId'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
}

const authSlice: Slice<AuthState> = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                accessToken: string
                role: string
                email: string
                schoolId: string
                subSchoolId?: string
            }>,
        ) => {
            const { accessToken, role, email, schoolId, subSchoolId } = action.payload
            state.accessToken     = accessToken
            state.role            = role
            state.email           = email
            state.schoolId        = schoolId
            state.subSchoolId     = subSchoolId ?? null
            state.isAuthenticated = true
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('role', role)
            localStorage.setItem('email', email)
            localStorage.setItem('schoolId', schoolId)
            if (subSchoolId) localStorage.setItem('subSchoolId', subSchoolId)
        },
        logout: (state) => {
            state.accessToken     = null
            state.role            = null
            state.email           = null
            state.schoolId        = null
            state.subSchoolId     = null
            state.isAuthenticated = false
            localStorage.clear()
        },
    },
})

export { authSlice }

export const { setCredentials, logout } = authSlice.actions