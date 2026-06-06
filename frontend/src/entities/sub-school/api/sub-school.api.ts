import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance.ts";
import type {SubSchool} from "@entities/sub-school/model/types.ts";
import type {CreateSubSchoolDto} from "@entities/sub-school/model/dto.ts";

export class SubSchoolApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(schoolId: string) {
        return this.handleRequest<SubSchool[]>(
            this._baseApi.get('/sub-schools', { schoolId }),
            (raw) => raw as SubSchool[]
        )
    }

    getById(id: string) {
        return this.handleRequest<SubSchool>(
            this._baseApi.get(`/sub-schools/${id}`),
            (raw) => raw as SubSchool
        )
    }

    create(payload: CreateSubSchoolDto) {
        return this.handleRequest<SubSchool>(
            this._baseApi.post('/sub-schools', payload),
            (raw) => raw as SubSchool
        )
    }

    delete(id: string) {
        return this.handleRequest(
            this._baseApi.delete(`/sub-schools/${id}`),
            undefined
        )
    }
}

export const subSchoolApi = new SubSchoolApi()