import { ApiWrapper } from '@shared/api/ApiWrapper';
import { baseApi } from '@shared/api/instance';
import type {
    StudentAttendanceParamsDto,
    CreateStudentAttendanceDto,
    UpdateStudentAttendanceDto,
    BulkUpsertStudentAttendanceDto,
    AttendanceQueryDto,
} from '@entities/attendances/model/dto';
import type { StudentAttendance, PaginatedAttendance } from '@entities/attendances';

export class StudentAttendanceApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params: AttendanceQueryDto) {
        return this.handleRequest<PaginatedAttendance<StudentAttendance>>(
            this._baseApi.get('/attendances/students', params ),
            (raw) => raw as PaginatedAttendance<StudentAttendance>,
        );
    }

    getById(params: StudentAttendanceParamsDto, subSchoolId: string) {
        return this.handleRequest<StudentAttendance>(
            this._baseApi.get(`/attendances/students/${params.id}`, {
                params: { subSchoolId },
            }),
            (raw) => raw as StudentAttendance,
        );
    }

    create(payload: CreateStudentAttendanceDto) {
        return this.handleRequest<StudentAttendance>(
            this._baseApi.post('/attendances/students', payload),
            (raw) => raw as StudentAttendance,
        );
    }

    bulkUpsert(payload: BulkUpsertStudentAttendanceDto) {
        return this.handleRequest<StudentAttendance[]>(
            this._baseApi.post('/attendances/students/bulk', payload),
            (raw) => raw as StudentAttendance[],
        );
    }

    update(id: string, subSchoolId: string, payload: UpdateStudentAttendanceDto) {
        return this.handleRequest<StudentAttendance>(
            this._baseApi.patch(`/attendances/students/${id}`, payload, {
                params: { subSchoolId },
            }),
            (raw) => raw as StudentAttendance,
        );
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/attendances/students/${id}`, {
                params: { subSchoolId },
            }),
            undefined,
        );
    }
}

export const studentAttendanceApi = new StudentAttendanceApi();