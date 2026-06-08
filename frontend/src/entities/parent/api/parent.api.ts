import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    ParentParamsDto,
    ParentListQueryDto
} from "@entities/parent/model/dto";
import type {
    CreateParentDto,
    Parent,
    UpdateParentDto
} from "@entities/parent";

export class ParentApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: ParentListQueryDto) {
        return this.handleRequest<Parent[]>(
            this._baseApi.get('/parents', params ),
            (raw) => raw as Parent[]
        )
    }

    getById(params: ParentParamsDto) {
        return this.handleRequest<Parent>(
            this._baseApi.get(`/parents/${params.id}`),
            (raw) => raw as Parent
        )
    }

    create(payload: CreateParentDto){
        return this.handleRequest<Parent>(
            this._baseApi.post('/parents', payload),
            (raw) => raw as Parent
        )
    }

    update(id: string, payload: UpdateParentDto, subSchoolId: string){
        return this.handleRequest<Parent>(
            this._baseApi.patch(`/parents/${id}`, payload, {subSchoolId} ),
            (raw) => raw as Parent
        )
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/parents/${id}`, {subSchoolId}),
            undefined
        )
    }
}
export const parentApi = new ParentApi()
