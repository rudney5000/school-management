import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    ParentParamsDto,
    ParentListQueryDto
} from "@entities/parent/model/dto";
import type {
    CreateEventDto,
    Event,
    UpdateEventDto
} from "@entities/event";

export class EventApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: ParentListQueryDto) {
        return this.handleRequest<Event[]>(
            this._baseApi.get('/events', params ),
            (raw) => raw as Event[]
        )
    }

    getById(params: ParentParamsDto) {
        return this.handleRequest<Event>(
            this._baseApi.get(`/events/${params.id}`),
            (raw) => raw as Event
        )
    }

    create(payload: CreateEventDto){
        return this.handleRequest<Event>(
            this._baseApi.post('/events', payload),
            (raw) => raw as Event
        )
    }

    update(id: string, payload: UpdateEventDto, subSchoolId: string){
        return this.handleRequest<Event>(
            this._baseApi.patch(`/events/${id}`, payload, {subSchoolId} ),
            (raw) => raw as Event
        )
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/events/${id}`, {subSchoolId}),
            undefined
        )
    }
}
export const eventApi = new EventApi()
