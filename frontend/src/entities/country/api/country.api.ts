import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    CountryParamsDto,
    CreateCountryDto,
    UpdateCountryDto
} from "@entities/country/model/dto";
import type {Country} from "@entities/country";

export class CountryApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll() {
        return this.handleRequest<Country[]>(
            this._baseApi.get('/countries'),
            (raw) => raw as Country[]
        )
    }

    getById(params: CountryParamsDto) {
        return this.handleRequest<Country>(
            this._baseApi.get(`/countries/${params.id}`),
            (raw) => raw as Country
        )
    }

    create(payload: CreateCountryDto){
        return this.handleRequest<Country>(
            this._baseApi.post('/countries', payload),
            (raw) => raw as Country
        )
    }

    update(id: string, payload: UpdateCountryDto){
        return this.handleRequest<Country>(
            this._baseApi.patch(`/countries/${id}`, payload),
            (raw) => raw as Country
        )
    }

    delete(id: string) {
        return this.handleRequest(
            this._baseApi.delete(`/countries/${id}`),
            undefined
        )
    }
}
export const countryApi = new CountryApi()
