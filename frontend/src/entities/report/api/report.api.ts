import { ApiWrapper } from "@shared/api/ApiWrapper";
import { baseApi } from "@shared/api/instance";
import type {
    CreateReportDto,
    UpdateReportStatusDto,
    AssignReportDto,
    ReportParamsDto,
    ReportFiltersDto,
    TrackReportParamsDto,
} from "@entities/report/model/dto";
import type { Report } from "@entities/report/model/types";

export class ReportApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(filters?: ReportFiltersDto) {
        return this.handleRequest<Report[]>(
            this._baseApi.get('/reports', filters),
            (raw) => raw as Report[]
        );
    }

    getById(params: ReportParamsDto) {
        return this.handleRequest<Report>(
            this._baseApi.get(`/reports/${params.id}`),
            (raw) => raw as Report
        );
    }

    getMyReports() {
        return this.handleRequest<Report[]>(
            this._baseApi.get('/reports/me'),
            (raw) => raw as Report[]
        );
    }

    trackByToken(params: TrackReportParamsDto) {
        return this.handleRequest<{ status: string; createdAt: string; resolutionNote?: string }>(
            this._baseApi.get(`/reports/track/${params.token}`),
            (raw) => raw as { status: string; createdAt: string; resolutionNote?: string }
        );
    }

    create(payload: CreateReportDto) {
        return this.handleRequest<Report & { trackingToken?: string }>(
            this._baseApi.post('/reports', payload),
            (raw) => raw as Report & { trackingToken?: string }
        );
    }

    updateStatus(id: string, payload: UpdateReportStatusDto) {
        return this.handleRequest<Report>(
            this._baseApi.patch(`/reports/${id}/status`, payload),
            (raw) => raw as Report
        );
    }

    assign(id: string, payload: AssignReportDto) {
        return this.handleRequest<Report>(
            this._baseApi.patch(`/reports/${id}/assign`, payload),
            (raw) => raw as Report
        );
    }
}

export const reportApi = new ReportApi();
