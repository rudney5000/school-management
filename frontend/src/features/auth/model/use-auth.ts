import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '../api/auth.api'
import { setCredentials } from '@features/auth/store/auth-slice.ts'
import { useAppDispatch } from '@/shared/store/hooks'
import { baseApi } from '@/shared/api/instance'
import type { LoginFormData, RegisterFormData } from './auth.schema'
import type {CommonError} from "@shared/helperClass/CommonError.ts";
import type {AuthTokensDto} from "@features/auth/model/dto/AuthTokensDto.ts";

export function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAuthSuccess = async (tokens: AuthTokensDto) => {
        baseApi.saveToken(tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)

        const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]))
        dispatch(setCredentials({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            role: payload.role,
            email: payload.email,
            schoolId: payload.schoolId,
            subSchoolId: payload.subSchoolId ?? null,
        }))

        navigate({ to: '/dashboard' })
    }

    const login = async (data: LoginFormData) => {
        setIsLoading(true)
        setError(null)

        const res = await authApi.login(data)

        if (res.IsSuccess) {
            await handleAuthSuccess(res.result as AuthTokensDto)
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
            await handleAuthSuccess(res.result as AuthTokensDto)
        } else {
            setError((res.result as CommonError).Message)
        }

        setIsLoading(false)
    }

    return { login, register, isLoading, error }
}