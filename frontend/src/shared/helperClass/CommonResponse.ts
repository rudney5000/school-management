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