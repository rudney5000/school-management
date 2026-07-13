import { BaseApi } from './BaseApi'

export const baseApi = new BaseApi(import.meta.env.VITE_API_URL || '/api')

export { BaseApi }