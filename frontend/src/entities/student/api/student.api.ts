import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    StudentParamsDto,
    StudentListQueryDto
} from "@entities/student/model/dto";
import type {
    CreateStudentDto,
    Student,
    UpdateStudentDto
} from "@entities/student";

export class StudentApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: StudentListQueryDto) {
        return this.handleRequest<Student[]>(
            this._baseApi.get('/students', params ),
            (raw) => raw as Student[]
        )
    }

    getById(params: StudentParamsDto) {
        return this.handleRequest<Student>(
            this._baseApi.get(`/students/${params.id}`),
            (raw) => raw as Student
        )
    }

    create(payload: CreateStudentDto){
        return this.handleRequest<Student>(
            this._baseApi.post('/students', payload),
            (raw) => raw as Student
        )
    }

    update(id: string, payload: UpdateStudentDto, subSchoolId: string){
        return this.handleRequest<Student>(
            this._baseApi.patch(`/students/${id}`, payload, {subSchoolId} ),
            (raw) => raw as Student
        )
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/students/${id}`, {subSchoolId}),
            undefined
        )
    }
}
export const studentApi = new StudentApi()
