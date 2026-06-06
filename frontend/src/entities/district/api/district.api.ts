import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    DistrictParamsDto,
    CreateDistrictDto,
    UpdateDistrictDto,
    DistrictListQueryDto
} from "@entities/district/model/dto";
import type {District} from "@entities/district";

export class DistrictApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: DistrictListQueryDto) {
        return this.handleRequest<District[]>(
            this._baseApi.get('/districts', { params }),
            (raw) => raw as District[]
        )
    }

    getById(params: DistrictParamsDto) {
        return this.handleRequest<District>(
            this._baseApi.get(`/districts/${params.id}`),
            (raw) => raw as District
        )
    }

    create(payload: CreateDistrictDto){
        return this.handleRequest<District>(
            this._baseApi.post('/districts', payload),
            (raw) => raw as District
        )
    }

    update(id: string, payload: UpdateDistrictDto){
        return this.handleRequest<District>(
            this._baseApi.patch(`/districts/${id}`, payload),
            (raw) => raw as District
        )
    }

    delete(id: string) {
        return this.handleRequest(
            this._baseApi.delete(`/districts/${id}`),
            undefined
        )
    }
}
export const districtApi = new DistrictApi()
