import { ApiWrapper } from "@shared/api/ApiWrapper";
import { baseApi } from "@shared/api/instance";
import type {
    CreateSessionDto,
    JoinVideoCallResult,
    VideoCallSession
} from "@entities/video-call";

export class VideoCallApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    create(payload: CreateSessionDto, subSchoolId: string) {
        return this.handleRequest<VideoCallSession>(
            this._baseApi.post('/video-calls', payload, { subSchoolId }),
            (raw) => raw as VideoCallSession
        )
    }

    getById(sessionId: string) {
        return this.handleRequest<VideoCallSession>(
            this._baseApi.get(`/video-calls/${sessionId}`),
            (raw) => raw as VideoCallSession
        )
    }

    join(sessionId: string) {
        return this.handleRequest<JoinVideoCallResult>(
            this._baseApi.post(`/video-calls/${sessionId}/join`),
            (raw) => raw as JoinVideoCallResult
        )
    }

    leave(sessionId: string) {
        return this.handleRequest(
            this._baseApi.post(`/video-calls/${sessionId}/leave`),
            undefined
        )
    }

    end(sessionId: string) {
        return this.handleRequest(
            this._baseApi.post(`/video-calls/${sessionId}/end`),
            undefined
        )
    }
}

export const videoCallApi = new VideoCallApi()