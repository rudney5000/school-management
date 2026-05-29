import type { BaseApi } from './BaseApi'
import { CommonResponse, Status } from "@shared/helperClass/CommonResponse.ts";
import {CommonError} from "@shared/helperClass/CommonError.ts";

export abstract class ApiWrapper {
    constructor(protected readonly _baseApi: BaseApi) {}

    protected async handleRequest<T>(
        request: Promise<[unknown, unknown]>,
        transform?: (data: unknown) => T,
    ): Promise<CommonResponse<T | CommonError>> {
        const [result, error] = await request

        if (result) {
            const raw = (result as { data: unknown }).data
            const data = transform ? transform(raw) : (raw as T)
            return new CommonResponse<T>(Status.Success, data)
        }

        return new CommonResponse<CommonError>(Status.Fail, new CommonError(error))
    }
}