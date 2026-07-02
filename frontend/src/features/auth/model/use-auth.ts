import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '../api/auth.api'
import { setCredentials } from '@features/auth/store/auth-slice'
import { useAppDispatch } from '@/shared/store/hooks'
import { baseApi } from '@/shared/api/instance'
import type { LoginFormData, RegisterFormData } from './auth.schema'
import type {CommonError} from "@shared/helperClass/CommonError";
import type {AuthTokensDto} from "@features/auth/model/dto/AuthTokensDto";
import i18n from "@app/i18n/i18n";
import {store} from "@shared/store";

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
            userId: payload.id ?? payload.userId ?? payload.sub,
            schoolId: payload.schoolId,
            subSchoolId: payload.subSchoolId ?? null,
        }))

        console.log('JWT payload:', payload)
        const locale = i18n.language
        const subSchoolId = payload.subSchoolId
            ?? store.getState().subSchool?.selectedSubSchoolId
            ?? localStorage.getItem('subSchoolId')
            ?? 'select';

        navigate({
            to: '/$locale/sub-schools/$subSchoolId/dashboard',
            params: {
                locale,
                subSchoolId
            }
        })
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