import { ApiWrapper } from '@shared/api/ApiWrapper';
import { baseApi } from '@shared/api/instance';
import type {
    TeacherAttendanceParamsDto,
    CreateTeacherAttendanceDto,
    UpdateTeacherAttendanceDto,
    BulkUpsertTeacherAttendanceDto,
    AttendanceQueryDto,
} from '@entities/attendances/model/dto';
import type { TeacherAttendance, PaginatedAttendance } from '@entities/attendances';

export class TeacherAttendanceApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params: AttendanceQueryDto) {
        return this.handleRequest<PaginatedAttendance<TeacherAttendance>>(
            this._baseApi.get('/attendances/teachers', params ),
            (raw) => raw as PaginatedAttendance<TeacherAttendance>,
        );
    }

    getById(params: TeacherAttendanceParamsDto, subSchoolId: string) {
        return this.handleRequest<TeacherAttendance>(
            this._baseApi.get(`/attendances/teachers/${params.id}`, {
                params: { subSchoolId },
            }),
            (raw) => raw as TeacherAttendance,
        );
    }

    create(payload: CreateTeacherAttendanceDto) {
        return this.handleRequest<TeacherAttendance>(
            this._baseApi.post('/attendances/teachers', payload),
            (raw) => raw as TeacherAttendance,
        );
    }

    bulkUpsert(payload: BulkUpsertTeacherAttendanceDto) {
        return this.handleRequest<TeacherAttendance[]>(
            this._baseApi.post('/attendances/teachers/bulk', payload),
            (raw) => raw as TeacherAttendance[],
        );
    }

    update(id: string, subSchoolId: string, payload: UpdateTeacherAttendanceDto) {
        return this.handleRequest<TeacherAttendance>(
            this._baseApi.patch(`/attendances/teachers/${id}`, payload, {
                params: { subSchoolId },
            }),
            (raw) => raw as TeacherAttendance,
        );
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/attendances/teachers/${id}`, {
                params: { subSchoolId },
            }),
            undefined,
        );
    }
}

export const teacherAttendanceApi = new TeacherAttendanceApi();