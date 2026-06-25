import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    BulletinQueryDto,
    CreateGradeDto,
    BulkCreateGradesDto,
    Grade,
    GradeListQueryDto,
    GradeParamsDto,
    UpdateGradeDto
} from "@entities/grades";

export class GradeApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: GradeListQueryDto) {
        return this.handleRequest<Grade[]>(
            this._baseApi.get('/grades', params),
            (raw) => raw as Grade[]
        )
    }

    getById(params: GradeParamsDto) {
        return this.handleRequest<Grade>(
            this._baseApi.get(`/grades/${params.id}`),
            (raw) => raw as Grade
        )
    }

    getBulletin(params: BulletinQueryDto) {
        return this.handleRequest<any>(
            this._baseApi.get('/grades/bulletin', params),
            (raw) => raw
        )
    }

    create(payload: CreateGradeDto) {
        return this.handleRequest<Grade>(
            this._baseApi.post('/grades', payload),
            (raw) => raw as Grade
        )
    }

    bulkCreate(payload: BulkCreateGradesDto) {
        return this.handleRequest<Grade[]>(
            this._baseApi.post('/grades/bulk', payload),
            (raw) => raw as Grade[]
        )
    }

    update(id: string, payload: UpdateGradeDto) {
        return this.handleRequest<Grade>(
            this._baseApi.patch(`/grades/${id}`, payload),
            (raw) => raw as Grade
        )
    }

    delete(id: string) {
        return this.handleRequest(
            this._baseApi.delete(`/grades/${id}`),
            undefined
        )
    }
}

export const gradeApi = new GradeApi()
