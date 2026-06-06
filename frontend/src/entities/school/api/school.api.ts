import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {School, CreateSchoolDto, UpdateSchoolDto} from "@entities/school/model/types";

export class SchoolApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(districtId?: string) {
        return this.handleRequest<School[]>(
            this._baseApi.get('/schools', { params: districtId ? { districtId } : undefined }),
            (raw) => raw as School[]
        )
    }

    getById(id: string) {
        return this.handleRequest<School>(
            this._baseApi.get(`/schools/${id}`),
            (raw) => raw as School
        )
    }

    create(payload: CreateSchoolDto){
        return this.handleRequest<School>(
            this._baseApi.post('/schools', payload),
            (raw) => raw as School
        )
    }

    update(id: string, payload: UpdateSchoolDto){
        return this.handleRequest<School>(
            this._baseApi.patch(`/schools/${id}`, payload),
            (raw) => raw as School
        )
    }

    delete(id: string) {
        return this.handleRequest(
            this._baseApi.delete(`/schools/${id}`),
            undefined
        )
    }
}
export const schoolApi = new SchoolApi()
