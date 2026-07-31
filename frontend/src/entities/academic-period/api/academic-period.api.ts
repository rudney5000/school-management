import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    AcademicPeriod,
    AcademicPeriodListQueryDto,
    AcademicPeriodParamsDto
} from "@entities/academic-period";
import type {
    CreateAcademicPeriodDto,
    UpdateAcademicPeriodDto
} from "@entities/academic-period/model/createAcademicPeriodSchema";

export class AcademicPeriodApi extends ApiWrapper {
    constructor() {
        super(baseApi)
    }

    getAll(params?: AcademicPeriodListQueryDto) {
        return this.handleRequest<AcademicPeriod[]>(
            this._baseApi.get(`/academic-periods`, params),
            (raw) => raw as AcademicPeriod[]
        )
    }

    getById(params: AcademicPeriodParamsDto, subSchoolId: string) {
        return this.handleRequest<AcademicPeriod>(
            this._baseApi.get(`/academic-periods/${params.id}`, { subSchoolId }),
            (raw) => raw as AcademicPeriod
        )
    }

    create(payload: CreateAcademicPeriodDto) {
        return this.handleRequest<AcademicPeriod>(
            this._baseApi.post(`/academic-periods`, payload),
            (raw) => raw as AcademicPeriod
        )
    }

    update(id: string, payload: UpdateAcademicPeriodDto, subSchoolId: string) {
        return this.handleRequest<AcademicPeriod>(
            this._baseApi.patch(`/academic-periods/${id}`, payload, {subSchoolId}),
            (raw) => raw as AcademicPeriod
        )
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/academic-periods/${id}`, {subSchoolId}),
            undefined
        )
    }
}

export const academicPeriodApi = new AcademicPeriodApi()