import {
    useEffect,
    useState
} from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Spinner
} from "@shared/ui";
import {cn} from "@shared/lib/utils";
import {studentAttendanceApi} from "@/entities/attendances/api/studentAttendanceApi";
import {classApi} from "@/entities/class/api/class.api";
import {Status} from "@shared/helperClass/CommonResponse";
import {
    endOfDay,
    format,
    startOfDay
} from "date-fns";
import {useAppSelector} from "@shared/store/hooks";
import {selectSubSchoolId} from "@features/auth/model/selectors";
import {useTranslation} from "@shared/lib";
import {studentApi} from "@entities/student";
import type {
    AttendanceStatus,
    StudentAttendance
} from "@entities/attendances";
import { enrollmentApi } from "@/entities/enrollment";

type PulseStatus = AttendanceStatus | 'UNRECORDED';

interface PulseStudent {
    id: string;
    initials: string;
    status: PulseStatus;
}

interface PulseStatusCounts {
    PRESENT: number;
    LATE: number;
    EXCUSED: number;
    ABSENT: number;
    UNRECORDED: number;
}

interface PulseData {
    className: string;
    courseName: string;
    students: PulseStudent[];
    present: string;
    needAttention: number;
    statusCounts: PulseStatusCounts;
}

const pulseColors: Record<PulseStatus, string> = {
    PRESENT: 'bg-emerald-500',
    LATE: 'bg-amber-400',
    EXCUSED: 'bg-sky-400',
    ABSENT: 'bg-red-400',
    UNRECORDED: 'bg-zinc-300',
};

export function ClassroomPulse() {
    const { t } = useTranslation();
    const subSchoolId = useAppSelector(selectSubSchoolId);
    const [pulseData, setPulseData] = useState<PulseData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subSchoolId) return;
        const fetchClassroomPulse = async () => {
            try {
                const classesResponse = await classApi.getAll({subSchoolId});
                if (classesResponse.status !== Status.Success || !Array.isArray(classesResponse.result)) {
                    setLoading(false);
                    return;
                }

                let selectedClass = null;
                let studentIds: string[] = [];

                for (const cls of classesResponse.result) {
                    const enrollmentsResponse = await enrollmentApi.getAll({ classId: cls.id });
                    if (
                        enrollmentsResponse.status === Status.Success &&
                        Array.isArray(enrollmentsResponse.result) &&
                        enrollmentsResponse.result.length > 0
                    ) {
                        selectedClass = cls;
                        studentIds = enrollmentsResponse.result.map((e) => e.studentId);
                        break;
                    }
                }

                if (!selectedClass || studentIds.length === 0) {
                    setLoading(false);
                    return;
                }

                const today = new Date();
                const from = format(startOfDay(today), 'yyyy-MM-dd');
                const to = format(endOfDay(today), 'yyyy-MM-dd');

                const attendanceResponse = await studentAttendanceApi.getAll({ subSchoolId, from, to });

                const studentsResponse = await studentApi.getAll({ subSchoolId });
                if (studentsResponse.status !== Status.Success || !Array.isArray(studentsResponse.result)) {
                    setLoading(false);
                    return;
                }

                const roster = studentsResponse.result.filter((s) => studentIds.includes(s.id));

                const attendanceRecords: StudentAttendance[] =
                    attendanceResponse.status === Status.Success && attendanceResponse.result
                        ? (attendanceResponse.result.data as StudentAttendance[])
                        : [];

                const attendanceByStudentId = new Map<string, AttendanceStatus>();
                for (const record of attendanceRecords) {
                    if (studentIds.includes(record.studentId)) {
                        attendanceByStudentId.set(record.studentId, record.status);
                    }
                }

                const students: PulseStudent[] = roster.map((student) => {
                    const status: PulseStatus = attendanceByStudentId.get(student.id) ?? 'UNRECORDED';
                    return {
                        id: student.id,
                        initials: `${student.firstName[0] ?? ''}${student.lastName[0] ?? ''}`.toUpperCase(),
                        status,
                    };
                });

                const statusCounts: PulseStatusCounts = {
                    PRESENT: students.filter((s) => s.status === 'PRESENT').length,
                    LATE: students.filter((s) => s.status === 'LATE').length,
                    EXCUSED: students.filter((s) => s.status === 'EXCUSED').length,
                    ABSENT: students.filter((s) => s.status === 'ABSENT').length,
                    UNRECORDED: students.filter((s) => s.status === 'UNRECORDED').length,
                };

                setPulseData({
                    className: selectedClass.name,
                    courseName: selectedClass.gradeLevel || 'Class',
                    students,
                    present: `${statusCounts.PRESENT}/${roster.length}`,
                    needAttention: statusCounts.ABSENT + statusCounts.LATE,
                    statusCounts,
                });
            } catch (error) {
                console.error('Error fetching classroom pulse:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchClassroomPulse();
    }, [subSchoolId]);

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">{t('dashboard.widgets.classroomPulse.title')}</CardTitle>
                            <Spinner/>
                            <p className="text-xs text-zinc-400 mt-0.5">{t('dashboard.widgets.classroomPulse.loading')}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-40 bg-zinc-100 rounded-lg animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    if (!pulseData) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">{t('dashboard.widgets.classroomPulse.title')}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-40 bg-zinc-100 rounded-lg animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">
                            {t('dashboard.widgets.classroomPulse.title')}
                        </CardTitle>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {pulseData.courseName} · {pulseData.className} · {pulseData.students.length} {t('dashboard.widgets.classroomPulse.students')}
                        </p>
                    </div>

                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {t('dashboard.widgets.classroomPulse.live')}
                    </span>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-7 gap-1.5 mb-4">
                    {pulseData.students.map((student) => (
                        <div
                            key={student.id}
                            title={`${student.initials} · ${t(`dashboard.widgets.classroomPulse.status.${student.status.toLowerCase()}`)}`}
                            className={cn(
                                'aspect-square rounded-md flex items-center justify-center text-white text-[10px] font-bold',
                                pulseColors[student.status]
                            )}
                        >
                            {student.initials}
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mb-4">
                    {(
                        [
                            { key: 'PRESENT', label: `${t('dashboard.widgets.classroomPulse.status.present')} (${pulseData.statusCounts.PRESENT})` },
                            { key: 'LATE', label: `${t('dashboard.widgets.classroomPulse.status.late')} (${pulseData.statusCounts.LATE})` },
                            { key: 'EXCUSED', label: `${t('dashboard.widgets.classroomPulse.status.excused')} (${pulseData.statusCounts.EXCUSED})` },
                            { key: 'ABSENT', label: `${t('dashboard.widgets.classroomPulse.status.absent')} (${pulseData.statusCounts.ABSENT})` },
                            { key: 'UNRECORDED', label: `${t('dashboard.widgets.classroomPulse.status.notRecorded')} (${pulseData.statusCounts.UNRECORDED})` },
                        ] as { key: PulseStatus; label: string }[]
                    ).map((item) => (
                        <span key={item.key} className="flex items-center gap-1">
                            <span className={cn('w-2.5 h-2.5 rounded-sm', pulseColors[item.key])} />
                            {item.label}
                        </span>
                    ))}
                </div>

                <div className="flex gap-6 pt-3 border-t border-zinc-100">
                    <div>
                        <div className="text-2xl font-bold text-zinc-800">
                            {pulseData.present}
                        </div>
                        <div className="text-xs text-zinc-400 uppercase tracking-wide">
                            {t('dashboard.widgets.classroomPulse.present')}
                        </div>
                    </div>

                    <div>
                        <div className="text-2xl font-bold text-red-500">
                            {pulseData.needAttention}
                        </div>
                        <div className="text-xs text-zinc-400 uppercase tracking-wide">
                            {t('dashboard.widgets.classroomPulse.needAttention')}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}