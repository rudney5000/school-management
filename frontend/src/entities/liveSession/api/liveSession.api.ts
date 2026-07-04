import { ApiWrapper } from "@shared/api/ApiWrapper";
import { baseApi } from "@shared/api/instance";
import type {
    LiveSessionParamsDto,
    CreateLiveSessionDto,
    SubSchoolQueryDto,
} from "@entities/liveSession/model/dto";
import type { LiveSession, LiveSessionAccess } from "@entities/liveSession/model/types";

export class LiveSessionApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params: SubSchoolQueryDto) {
        return this.handleRequest<LiveSession[]>(
            this._baseApi.get('/live-sessions', params),
            (raw) => raw as LiveSession[]
        );
    }

    getById(params: LiveSessionParamsDto, subSchoolId: string) {
        return this.handleRequest<LiveSession>(
            this._baseApi.get(`/live-sessions/${params.sessionId}`, { subSchoolId }),
            (raw) => raw as LiveSession
        );
    }

    create(payload: CreateLiveSessionDto, subSchoolId: string) {
        return this.handleRequest<LiveSession>(
            this._baseApi.post('/live-sessions', payload, { subSchoolId }),
            (raw) => raw as LiveSession
        );
    }

    start(sessionId: string, subSchoolId: string) {
        return this.handleRequest<LiveSession>(
            this._baseApi.post(`/live-sessions/${sessionId}/start`, undefined, { subSchoolId }),
            (raw) => raw as LiveSession
        );
    }

    end(sessionId: string, subSchoolId: string) {
        return this.handleRequest<LiveSession>(
            this._baseApi.post(`/live-sessions/${sessionId}/end`, undefined, { subSchoolId }),
            (raw) => raw as LiveSession
        );
    }

    join(sessionId: string, subSchoolId: string) {
        return this.handleRequest<LiveSessionAccess>(
            this._baseApi.post(`/live-sessions/${sessionId}/join`, undefined, { subSchoolId }),
            (raw) => raw as LiveSessionAccess
        );
    }

    leave(sessionId: string) {
        return this.handleRequest<void>(
            this._baseApi.post(`/live-sessions/${sessionId}/leave`),
            undefined
        );
    }
}

export const liveSessionApi = new LiveSessionApi();