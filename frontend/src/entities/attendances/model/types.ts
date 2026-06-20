export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type StudentAttendance = {
    id:          string;
    subSchoolId: string;
    studentId:   string;
    classId:     string | null;
    courseId:    string | null;
    teacherId:   string | null;
    date:        string;
    status:      AttendanceStatus;
    reason:      string | null;
    note:        string | null;
    notedAt:     string;
};

export type TeacherAttendance = {
    id:          string;
    subSchoolId: string;
    teacherId:   string;
    date:        string;
    status:      AttendanceStatus;
    reason:      string | null;
    notedAt:     string;
};

export type PaginatedAttendance<T> = {
    data:  T[];
    total: number;
    page:  number;
    limit: number;
};