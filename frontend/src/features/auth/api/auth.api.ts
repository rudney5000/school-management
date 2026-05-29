import {ApiWrapper} from "@shared/api/ApiWrapper.ts";
import {baseApi} from "@shared/api/instance.ts";
import type {CommonResponse} from "@shared/helperClass/CommonResponse.ts";
import type {CommonError} from "@shared/helperClass/CommonError.ts";
import type {LoginDto} from "@features/auth/model/dto/LoginDto.ts";
import type {AuthTokensDto} from "@features/auth/model/dto/AuthTokensDto.ts";
import type {RegisterDto} from "@features/auth/model/dto/RegisterDto.ts";
import type {UserDto} from "@features/auth/model/dto/UserDto.ts";

class AuthApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    async login(payload: LoginDto): Promise<CommonResponse<AuthTokensDto | CommonError>> {
        return this.handleRequest(
            this._baseApi.post('/auth/login', payload),
            (data) => data as AuthTokensDto
        )
    }

    async register(payload: RegisterDto): Promise<CommonResponse<AuthTokensDto | CommonError>> {
        return this.handleRequest(
            this._baseApi.post('/auth/register', payload),
            (data) => data as AuthTokensDto
        )
    }


    async me(): Promise<CommonResponse<UserDto | CommonError>> {
        return this.handleRequest(
            this._baseApi.get('/auth/me'),
            (data) => data as UserDto
        )
    }

    async refresh(refreshToken: string): Promise<CommonResponse<AuthTokensDto | CommonError>> {
        return this.handleRequest(
            this._baseApi.post('/auth/refresh', { refreshToken }),
            (data) => data as AuthTokensDto
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