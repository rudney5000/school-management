import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

export class BaseApi {
    private _token: string | null = null
    private _axiosInstance: AxiosInstance
    private _onUnauthorized: (() => void) | null = null

    constructor(baseURL: string) {
        this._token = localStorage.getItem('accessToken')
        this._axiosInstance = this._createInstance(baseURL)
    }

    public get axiosInstance(): AxiosInstance {
        return this._axiosInstance
    }

    public get hasToken(): boolean {
        return this._token !== null
    }

    public setUnauthorizedHandler(handler: () => void): void {
        this._onUnauthorized = handler
    }

    public saveToken(token: string): void {
        this._token = token
        localStorage.setItem('accessToken', token)
        this._axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    public clearToken(): void {
        this._token = null
        localStorage.removeItem('accessToken')
        delete this._axiosInstance.defaults.headers.common['Authorization']
    }

    public async send<T>(promise: Promise<T>): Promise<[T | null, unknown]> {
        try {
            const result = await promise
            return [result, null]
        } catch (error) {
            return [null, error]
        }
    }

    public get<T>(url: string, params?: object) {
        return this.send(this._axiosInstance.get<T>(url, { params }))
    }

    public post<T>(url: string, data?: unknown, params?: object) {
        return this.send(this._axiosInstance.post<T>(url, data, { params }))
    }

    public patch<T>(url: string, data?: unknown, params?: object) {
        return this.send(this._axiosInstance.patch<T>(url, data, {  params }))
    }

    public put<T>(url: string, data?: unknown) {
        return this.send(this._axiosInstance.put<T>(url, data))
    }

    public delete<T>(url: string) {
        return this.send(this._axiosInstance.delete<T>(url))
    }

    private _createInstance(baseURL: string): AxiosInstance {
        const instance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                ...(this._token ? { Authorization: `Bearer ${this._token}` } : {}),
            },
        })

        instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = localStorage.getItem('accessToken')
                if (token) config.headers.Authorization = `Bearer ${token}`
                return config
            },
            (error) => Promise.reject(error),
        )

        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && this._onUnauthorized) {
                    this._onUnauthorized()
                }
                return Promise.reject(error)
            },
        )

        return instance
    }
}