import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    ClassParamsDto,
    ClassListQueryDto
} from "@entities/class/model/dto";
import type {
    CreateClassDto,
    Class,
    UpdateClassDto
} from "@entities/class";

export class ClassApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: ClassListQueryDto) {
        return this.handleRequest<Class[]>(
            this._baseApi.get('/classes', params ),
            (raw) => raw as Class[]
        )
    }

    getById(params: ClassParamsDto) {
        return this.handleRequest<Class>(
            this._baseApi.get(`/classes/${params.id}`),
            (raw) => raw as Class
        )
    }

    create(payload: CreateClassDto){
        return this.handleRequest<Class>(
            this._baseApi.post('/classes', payload),
            (raw) => raw as Class
        )
    }

    update(id: string, payload: UpdateClassDto, subSchoolId: string){
        return this.handleRequest<Class>(
            this._baseApi.patch(`/classes/${id}`, payload, {subSchoolId} ),
            (raw) => raw as Class
        )
    }


    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/classes/${id}`, {subSchoolId}),
            undefined
        )
    }
}
export const classApi = new ClassApi()
