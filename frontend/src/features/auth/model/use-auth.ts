import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '../api/auth.api'
import { setCredentials } from '@features/auth/store/auth-slice.ts'
import { useAppDispatch } from '@/shared/store/hooks'
import { baseApi } from '@/shared/api/instance'
import type { LoginFormData, RegisterFormData } from './auth.schema'
import type { AuthResponse, MeResponse } from '../api/auth.api'
import type {CommonError} from "@shared/helperClass/CommonError.ts";

export function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAuthSuccess = async (tokens: AuthResponse) => {
        baseApi.saveToken(tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)

        const meRes = await authApi.me()
        if (!meRes.IsSuccess) return

        const me = meRes.result as MeResponse
        dispatch(setCredentials({
            accessToken: tokens.accessToken,
            role: me.role,
            email: me.email,
            schoolId: me.schoolId,
            subSchoolId: me.subSchoolId,
        }))

        navigate({ to: '/dashboard' })
    }

    const login = async (data: LoginFormData) => {
        setIsLoading(true)
        setError(null)

        const res = await authApi.login(data)

        if (res.IsSuccess) {
            await handleAuthSuccess(res.result as AuthResponse)
        } else {
            setError((res.result as CommonError).Message)
        }

        setIsLoading(false)
    }

    const register = async (data: RegisterFormData) => {
        setIsLoading(true)
        setError(null)

        const res = await authApi.register({
            email: data.email,
            password: data.password,
            role: data.role,
        })

        if (res.IsSuccess) {
            await handleAuthSuccess(res.result as AuthResponse)
        } else {
            setError((res.result as CommonError).Message)
        }

        setIsLoading(false)
    }

    return { login, register, isLoading, error }
}