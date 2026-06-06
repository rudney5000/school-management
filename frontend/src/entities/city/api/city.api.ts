import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    CityParamsDto,
    CreateCityDto,
    UpdateCityDto,
    CityListQueryDto
} from "@entities/city/model/dto";
import type {City} from "@entities/city";

export class CityApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: CityListQueryDto) {
        return this.handleRequest<City[]>(
            this._baseApi.get('/cities', { params }),
            (raw) => raw as City[]
        )
    }

    getById(params: CityParamsDto) {
        return this.handleRequest<City>(
            this._baseApi.get(`/cities/${params.id}`),
            (raw) => raw as City
        )
    }

    create(payload: CreateCityDto){
        return this.handleRequest<City>(
            this._baseApi.post('/cities', payload),
            (raw) => raw as City
        )
    }

    update(id: string, payload: UpdateCityDto){
        return this.handleRequest<City>(
            this._baseApi.patch(`/cities/${id}`, payload),
            (raw) => raw as City
        )
    }

    delete(id: string) {
        return this.handleRequest(
            this._baseApi.delete(`/cities/${id}`),
            undefined
        )
    }
}
export const cityApi = new CityApi()
