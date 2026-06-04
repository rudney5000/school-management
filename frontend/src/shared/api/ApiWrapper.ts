import type { BaseApi } from './BaseApi'
import { CommonResponse, Status } from "@shared/helperClass/CommonResponse.ts";
import {CommonError} from "@shared/helperClass/CommonError.ts";

export interface ApiResponseShape<T = unknown> {
    data: T;
    success?: boolean;
}

export abstract class ApiWrapper {
    constructor(protected readonly _baseApi: BaseApi) {}

    protected async handleRequest<T>(
        request: Promise<[unknown, unknown]>,
        transform?: (data: unknown) => T,
    ): Promise<CommonResponse<T | CommonError>> {
        const [result, error] = await request

        if (result) {
            const axiosResponse = (result as { data: ApiResponseShape<unknown> });
            const responseData = axiosResponse.data
            const raw = responseData?.data !== undefined ? responseData.data : responseData
            const data = transform ? transform(raw) : (raw as T)
            return new CommonResponse<T>(Status.Success, data)
        }

        return new CommonResponse<CommonError>(Status.Fail, new CommonError(error))
    }
}