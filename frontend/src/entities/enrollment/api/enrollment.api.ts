import { ApiWrapper } from "@shared/api/ApiWrapper";
import { baseApi } from "@shared/api/instance";
import type {
    EnrollmentParamsDto,
    EnrollmentListQueryDto,
    CreateEnrollmentDto
} from "@entities/enrollment/model/dto";
import type { Enrollment } from "@entities/enrollment/model/types";

export class EnrollmentApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: EnrollmentListQueryDto) {
        return this.handleRequest<Enrollment[]>(
            this._baseApi.get('/enrollments', params),
            (raw) => raw as Enrollment[]
        )
    }

    getById(params: EnrollmentParamsDto) {
        return this.handleRequest<Enrollment>(
            this._baseApi.get(`/enrollments/${params.id}`),
            (raw) => raw as Enrollment
        )
    }

    create(payload: CreateEnrollmentDto) {
        return this.handleRequest<Enrollment>(
            this._baseApi.post('/enrollments', payload),
            (raw) => raw as Enrollment
        )
    }

    delete(id: string) {
        return this.handleRequest(
            this._baseApi.delete(`/enrollments/${id}`),
            undefined
        )
    }
}
export const enrollmentApi = new EnrollmentApi()