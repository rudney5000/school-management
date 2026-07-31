import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    BulkUpsertExamResultsDto,
    CreateExamDto,
    Exam,
    ExamListQueryDto,
    ExamParamsDto,
    ExamResult,
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

    getById(params: ExamParamsDto, subSchoolId?: string) {
        return this.handleRequest<Exam>(
            this._baseApi.get(`/exams/${params.id}`, subSchoolId ? { subSchoolId } : undefined),
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

    getResults(examId: string, subSchoolId?: string) {
        return this.handleRequest<ExamResult[]>(
            this._baseApi.get(`/exams/${examId}/results`, subSchoolId ? { subSchoolId } : undefined),
            (raw) => raw as ExamResult[]
        )
    }

    getResultsByStudent(studentId: string) {
        return this.handleRequest<ExamResult[]>(
            this._baseApi.get(`/exams/students/${studentId}/results`),
            (raw) => raw as ExamResult[]
        )
    }

    bulkUpsertResults(payload: BulkUpsertExamResultsDto) {
        return this.handleRequest<ExamResult[]>(
            this._baseApi.post('/exams/results/bulk', payload),
            (raw) => raw as ExamResult[]
        )
    }
}
export const examApi = new ExamApi()
