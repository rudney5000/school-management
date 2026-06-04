import type {ApiErrorShape} from "@shared/helperClass/ApiErrorShape";

export class CommonError {
    private readonly _data: unknown;

    constructor(data: unknown) {
        this._data = data;
    }

    public get data(): unknown {
        return this._data;
    }

    private get errorShape(): ApiErrorShape {
        if (this._data && typeof this._data === 'object') {
            return this._data as ApiErrorShape;
        }
        return {};
    }

    public get Message(): string {
        return this.errorShape.response?.data?.error?.message
            ?? (this._data instanceof Error ? this._data.message : 'An unexpected error occurred');
    }

    public get Code(): string {
        return this.errorShape.response?.data?.error?.code ?? 'UNKNOWN_ERROR';
    }

    public get StatusCode(): number {
        return this.errorShape.response?.status ?? 500;
    }
}