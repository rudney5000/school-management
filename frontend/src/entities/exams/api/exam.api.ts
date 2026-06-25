import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    CreateExamDto,
    Exam,
    ExamListQueryDto,
    ExamParamsDto,
    UpdateExamDto
} from "@entities/exams";

export class ExamApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: ExamListQueryDto) {
        return this.handleRequest<Exam[]>(
            this._baseApi.get('/exams', params ),
            (raw) => raw as Exam[]
        )
    }

    getById(params: ExamParamsDto) {
        return this.handleRequest<Exam>(
            this._baseApi.get(`/exams/${params.id}`),
            (raw) => raw as Exam
        )
    }

    create(payload: CreateExamDto){
        return this.handleRequest<Exam>(
            this._baseApi.post('/exams', payload),
            (raw) => raw as Exam
        )
    }

    update(id: string, payload: UpdateExamDto, subSchoolId: string){
        return this.handleRequest<Exam>(
            this._baseApi.patch(`/exams/${id}`, payload, {subSchoolId} ),
            (raw) => raw as Exam
        )
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/exams/${id}`, {subSchoolId}),
            undefined
        )
    }
}
export const examApi = new ExamApi()
