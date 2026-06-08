import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    TeacherParamsDto,
    TeacherListQueryDto
} from "@entities/teacher/model/dto";
import type {
    AssignTeacherDto,
    CreateTeacherDto,
    Teacher, UpdateAssignmentDto,
    UpdateTeacherDto
} from "@entities/teacher";

export class TeacherApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: TeacherListQueryDto) {
        return this.handleRequest<Teacher[]>(
            this._baseApi.get('/teachers', params ),
            (raw) => raw as Teacher[]
        )
    }

    getById(params: TeacherParamsDto) {
        return this.handleRequest<Teacher>(
            this._baseApi.get(`/teachers/${params.id}`),
            (raw) => raw as Teacher
        )
    }

    create(payload: CreateTeacherDto){
        return this.handleRequest<Teacher>(
            this._baseApi.post('/teachers', payload),
            (raw) => raw as Teacher
        )
    }

    update(id: string, payload: UpdateTeacherDto, subSchoolId: string){
        return this.handleRequest<Teacher>(
            this._baseApi.patch(`/teachers/${id}`, payload, {subSchoolId} ),
            (raw) => raw as Teacher
        )
    }

    updateAssignment(id: string, payload: UpdateAssignmentDto, subSchoolId: string) {
        return this.handleRequest<Teacher>(
            this._baseApi.patch(`/teachers/${id}/assignment`, payload,  { subSchoolId }),
            (raw) => raw as Teacher
        )
    }

    assign(id: string, payload: AssignTeacherDto) {
        return this.handleRequest<Teacher>(
            this._baseApi.post(`/teachers/${id}/assign`, payload),
            (raw) => raw as Teacher
        )
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/teachers/${id}`, {subSchoolId}),
            undefined
        )
    }
}
export const studentApi = new TeacherApi()
