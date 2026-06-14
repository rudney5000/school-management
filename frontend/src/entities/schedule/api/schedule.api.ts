import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    ParentParamsDto,
    ParentListQueryDto
} from "@entities/parent/model/dto";
import type {
    CreateScheduleDto,
    Schedule,
    UpdateScheduleDto
} from "@entities/schedule";

export class ScheduleApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: ParentListQueryDto) {
        return this.handleRequest<Schedule[]>(
            this._baseApi.get('/schedules', params ),
            (raw) => raw as Schedule[]
        )
    }

    getById(params: ParentParamsDto) {
        return this.handleRequest<Schedule>(
            this._baseApi.get(`/schedules/${params.id}`),
            (raw) => raw as Schedule
        )
    }

    create(payload: CreateScheduleDto){
        return this.handleRequest<Schedule>(
            this._baseApi.post('/schedules', payload),
            (raw) => raw as Schedule
        )
    }

    update(id: string, payload: UpdateScheduleDto, subSchoolId: string){
        return this.handleRequest<Schedule>(
            this._baseApi.patch(`/schedules/${id}`, payload, {subSchoolId} ),
            (raw) => raw as Schedule
        )
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/schedules/${id}`, {subSchoolId}),
            undefined
        )
    }
}
export const scheduleApi = new ScheduleApi()
