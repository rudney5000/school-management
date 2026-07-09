import {
    useEffect,
    useState
} from "react";
import {StatCard} from "@/pages/dashboard/ui/";
import {classApi} from "@/entities/class/api/class.api";
import {gradeApi} from "@/entities/grades/api/grade.api";
import {studentAttendanceApi} from "@/entities/attendances/api/studentAttendanceApi";
import {Status} from "@shared/helperClass/CommonResponse";
import {
    startOfDay,
    endOfDay,
    format
} from "date-fns";
import {selectSubSchoolId} from "@features/auth/model/selectors";
import {useAppSelector} from "@shared/store/hooks";
import {useTranslation} from "@shared/lib";
import type {StudentAttendance} from "@entities/attendances";
import type {Grade} from "@entities/grades";
import { studentApi } from "@/entities/student";

interface Stats {
    classAverageScore: string;
    attendanceRate: string;
    attendanceRecordedRate: string;
    atRiskStudents: number;
    totalClasses: number;
    totalStudents: number;
}

export function StatsCards() {
    const { t } = useTranslation();
    const subSchoolId = useAppSelector(selectSubSchoolId);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subSchoolId) return;

        const fetchStats = async () => {
            try {
                const today = new Date();
                const from = format(startOfDay(today), 'yyyy-MM-dd');
                const to = format(endOfDay(today), 'yyyy-MM-dd');

                const [classesResponse, gradesResponse, attendanceResponse, studentsResponse] = await Promise.all([
                    classApi.getAll({ subSchoolId }),
                    gradeApi.getAll({ subSchoolId }),
                    studentAttendanceApi.getAll({ subSchoolId, from, to }),
                    studentApi.getAll({ subSchoolId }),
                ]);

                const classes = classesResponse.status === Status.Success && Array.isArray(classesResponse.result)
                    ? classesResponse.result
                    : [];

                const grades: Grade[] = gradesResponse.status === Status.Success && Array.isArray(gradesResponse.result)
                    ? gradesResponse.result
                    : [];

                const attendances: StudentAttendance[] =
                    attendanceResponse.status === Status.Success && attendanceResponse.result
                        ? (attendanceResponse.result.data as StudentAttendance[])
                        : [];

                const students = studentsResponse.status === Status.Success && Array.isArray(studentsResponse.result)
                    ? studentsResponse.result.filter((s) => s.isActive)
                    : [];

                const totalStudents = students.length;

                let averageScore = '0';
                if (grades.length > 0) {
                    let weightedSum = 0;
                    let totalCoefficient = 0;
                    for (const g of grades) {
                        const score = parseFloat(g.score);
                        const maxScore = parseFloat(g.maxScore);
                        const coefficient = parseFloat(g.coefficient) || 1;
                        if (!isNaN(score) && !isNaN(maxScore) && maxScore > 0) {
                            const percentage = (score / maxScore) * 100;
                            weightedSum += percentage * coefficient;
                            totalCoefficient += coefficient;
                        }
                    }
                    averageScore = totalCoefficient > 0 ? (weightedSum / totalCoefficient).toFixed(1) : '0';
                }

                const atRiskStudents = grades.filter((g) => {
                    const score = parseFloat(g.score);
                    const maxScore = parseFloat(g.maxScore);
                    if (isNaN(score) || isNaN(maxScore) || maxScore === 0) return false;
                    return (score / maxScore) * 100 < 60;
                }).length;

                const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
                const attendanceRate = attendances.length > 0
                    ? ((presentCount / attendances.length) * 100).toFixed(1)
                    : '0';

                const attendanceRecordedRate = totalStudents > 0
                    ? ((attendances.length / totalStudents) * 100).toFixed(1)
                    : '0';

                setStats({
                    classAverageScore: `${averageScore}%`,
                    attendanceRate: `${attendanceRate}%`,
                    attendanceRecordedRate: `${attendanceRecordedRate}%`,
                    atRiskStudents,
                    totalClasses: classes.length,
                    totalStudents,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [subSchoolId]);

    if (loading || !stats) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-24 bg-zinc-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard
                value={stats.classAverageScore}
                label={t('dashboard.widgets.statsCards.classAverageScore')}
                sub={t('dashboard.widgets.statsCards.acrossAllClasses', { count: stats.totalClasses })}
            />

            <StatCard
                value={stats.attendanceRate}
                label={t('dashboard.widgets.statsCards.attendanceRate')}
                sub={t('dashboard.widgets.statsCards.totalStudents', { count: stats.totalStudents })}
            />

            <StatCard
                value={stats.attendanceRecordedRate}
                label={t('dashboard.widgets.statsCards.attendanceRecorded')}
                sub={t('dashboard.widgets.statsCards.markedToday')}
            />

            <StatCard
                value={stats.atRiskStudents.toString()}
                label={t('dashboard.widgets.statsCards.atRiskStudents')}
                sub={t('dashboard.widgets.statsCards.belowThreshold')}
                alert
            />
        </div>
    )
}