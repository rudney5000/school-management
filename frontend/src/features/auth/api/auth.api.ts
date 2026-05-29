import {ApiWrapper} from "@shared/api/ApiWrapper.ts";
import {baseApi} from "@shared/api/instance.ts";
import type {CommonResponse} from "@shared/helperClass/CommonResponse.ts";
import type {CommonError} from "@shared/helperClass/CommonError.ts";

export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload extends LoginPayload {
    role: 'admin' | 'director' | 'teacher' | 'worker' | 'parent' | 'student'
    workerId?: string
    parentId?: string
    studentId?: string
    teacherId?: string
}

export interface AuthResponse {
    accessToken: string
    refreshToken: string
}

export interface MeResponse {
    id: string
    email: string
    role: string
    schoolId: string
    subSchoolId: string
}

class AuthApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    async login(payload: LoginPayload): Promise<CommonResponse<AuthResponse | CommonError>> {
        return this.handleRequest(
            this._baseApi.post('/auth/login', payload),
            (data) => data as AuthResponse
        )
    }

    async register(payload: RegisterPayload): Promise<CommonResponse<AuthResponse | CommonError>> {
        return this.handleRequest(
            this._baseApi.post('/auth/register', payload),
            (data) => data as AuthResponse
        )
    }


    async me(): Promise<CommonResponse<MeResponse | CommonError>> {
        return this.handleRequest(
            this._baseApi.get('/auth/me'),
            (data) => data as MeResponse
        )
    }

    async refresh(refreshToken: string): Promise<CommonResponse<AuthResponse | CommonError>> {
        return this.handleRequest(
            this._baseApi.post('/auth/refresh', { refreshToken }),
            (data) => data as AuthResponse
        )
    }
    async logout(): Promise<CommonResponse<void | CommonError>> {
        return this.handleRequest(
            this._baseApi.post('/auth/logout'),
            () => undefined
        )
    }
}

export const authApi = new AuthApi()