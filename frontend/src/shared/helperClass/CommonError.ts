export class CommonError {
    private readonly _data: unknown

    constructor(data: unknown) {
        this._data = data
    }

    get data(): unknown {
        return this._data
    }

    get Message(): string {
        const response = this._data as { response?: { data?: { error?: { message?: string } } } }
        return response?.response?.data?.error?.message ?? 'An unexpected error occurred'
    }

    get Code(): string {
        const response = this._data as { response?: { data?: { error?: { code?: string } } } }
        return response?.response?.data?.error?.code ?? 'UNKNOWN_ERROR'
    }

    get StatusCode(): number {
        const response = this._data as { response?: { status?: number } }
        return response?.response?.status ?? 500
    }
}