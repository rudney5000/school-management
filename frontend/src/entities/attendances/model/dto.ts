import type {AttendanceStatus} from "@entities/attendances";

export type CreateStudentAttendanceDto = {
    subSchoolId: string;
    studentId:   string;
    classId?:    string;
    courseId?:   string;
    teacherId?:  string;
    date:        string;
    status:      AttendanceStatus;
    reason?:     string;
    note?:       string;
};

export type UpdateStudentAttendanceDto = Partial<Pick<CreateStudentAttendanceDto, 'status' | 'reason' | 'note'>>;

export type BulkUpsertStudentAttendanceDto = {
    subSchoolId: string;
    date:        string;
    records: {
        studentId:  string;
        classId?:   string;
        courseId?:  string;
        teacherId?: string;
        status:     AttendanceStatus;
        reason?:    string;
        note?:      string;
    }[];
};

export type CreateTeacherAttendanceDto = {
    subSchoolId: string;
    teacherId:   string;
    date:        string;
    status:      AttendanceStatus;
    reason?:     string;
};

export type UpdateTeacherAttendanceDto = Partial<Pick<CreateTeacherAttendanceDto, 'status' | 'reason'>>;

export type BulkUpsertTeacherAttendanceDto = {
    subSchoolId: string;
    date:        string;
    records: {
        teacherId: string;
        status:    AttendanceStatus;
        reason?:   string;
    }[];
};

export type AttendanceQueryDto = {
    subSchoolId: string;
    from?:       string;
    to?:         string;
    status?:     AttendanceStatus;
    page?:       number;
    limit?:      number;
};

export type StudentAttendanceParamsDto = { id: string };
export type TeacherAttendanceParamsDto = { id: string };
