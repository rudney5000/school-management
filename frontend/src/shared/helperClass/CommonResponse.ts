import type {CommonError} from "@shared/helperClass/CommonError";

export enum Status {
    Success = 0,
    Fail = 1,
}

export class CommonResponse<T> {
    constructor(
        public readonly status: Status,
        public readonly result: T,
    ) {}

    public get IsSuccess(): boolean {
        return this.status === Status.Success
    }

    get IsFail(): boolean {
        return this.status === Status.Fail
    }
}

export function isSuccess<T>(res: CommonResponse<T>): res is CommonResponse<T> & { result: Exclude<T, CommonError> } {
    return res.status === Status.Success
}

export function isFail<T>(res: CommonResponse<T>): res is CommonResponse<T> & { result: CommonError } {
    return res.status === Status.Fail
}