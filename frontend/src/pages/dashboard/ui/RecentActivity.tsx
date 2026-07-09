import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@shared/ui";
import { gradeApi } from "@/entities/grades/api/grade.api";
import { studentAttendanceApi } from "@/entities/attendances/api/studentAttendanceApi";
import { useEffect, useState } from "react";
import { Status } from "@shared/helperClass/CommonResponse";
import { formatDistanceToNow, subDays, format } from "date-fns";
import { useAppSelector } from "@shared/store/hooks";
import { selectSubSchoolId } from "@features/auth/model/selectors";
import {useTranslation} from "@shared/lib";
import type { Grade } from "@entities/grades";
import type { StudentAttendance } from "@entities/attendances";

interface Activity {
    icon: string;
    text: string;
    timestamp: number;
    time: string;
    color: string;
}

export function RecentActivity() {
    const { t } = useTranslation();
    const subSchoolId = useAppSelector(selectSubSchoolId);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subSchoolId) return;

        const fetchActivities = async () => {
            try {
                const today = new Date();
                const from = format(subDays(today, 1), 'yyyy-MM-dd');
                const to = format(today, 'yyyy-MM-dd');

                const [gradesResponse, attendanceResponse] = await Promise.all([
                    gradeApi.getAll({ subSchoolId }),
                    studentAttendanceApi.getAll({ subSchoolId, from, to }),
                ]);

                const items: Activity[] = [];

                if (gradesResponse.status === Status.Success && Array.isArray(gradesResponse.result)) {
                    const grades: Grade[] = gradesResponse.result
                        .filter((g) => g.score !== null)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3);

                    for (const g of grades) {
                        const score = parseFloat(g.score as string);
                        const maxScore = parseFloat(g.maxScore);
                        if (isNaN(score) || isNaN(maxScore) || maxScore <= 0) continue;

                        const percentage = (score / maxScore) * 100;
                        const timestamp = new Date(g.createdAt).getTime();

                        if (percentage >= 90) {
                            items.push({
                                icon: '🏅',
                                text: t('dashboard.widgets.recentActivity.studentScored', { score, maxScore, percentage: percentage.toFixed(0) }),
                                timestamp,
                                time: formatDistanceToNow(new Date(g.createdAt), { addSuffix: true }),
                                color: 'text-green-500',
                            });
                        } else if (percentage < 60) {
                            items.push({
                                icon: '⚠️',
                                text: t('dashboard.widgets.recentActivity.studentFlagged'),
                                timestamp,
                                time: formatDistanceToNow(new Date(g.createdAt), { addSuffix: true }),
                                color: 'text-orange-500',
                            });
                        }
                    }
                }

                if (attendanceResponse.status === Status.Success && attendanceResponse.result) {

                    const attendances: StudentAttendance[] =
                        attendanceResponse.status === Status.Success && attendanceResponse.result
                            ? (attendanceResponse.result.data as StudentAttendance[])
                                .filter((a) => a.status === 'ABSENT')
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 2)
                            : [];

                    for (const a of attendances) {
                        items.push({
                            icon: '📋',
                            text: t('dashboard.widgets.recentActivity.studentMarkedAbsent'),
                            timestamp: new Date(a.date).getTime(),
                            time: formatDistanceToNow(new Date(a.date), { addSuffix: true }),
                            color: 'text-red-500',
                        });
                    }
                }

                items.sort((a, b) => b.timestamp - a.timestamp);
                setActivities(items.slice(0, 6));
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [subSchoolId]);

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{t('dashboard.widgets.recentActivity.title')}</CardTitle>
                        <button className="text-xs text-indigo-600 hover:underline">{t('dashboard.widgets.recentActivity.all')}</button>
                    </div>
                    <p className="text-xs text-zinc-400">{t('dashboard.widgets.recentActivity.loading')}</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t('dashboard.widgets.recentActivity.title')}</CardTitle>
                    <button className="text-xs text-indigo-600 hover:underline">{t('dashboard.widgets.recentActivity.all')}</button>
                </div>
                <p className="text-xs text-zinc-400">{t('dashboard.widgets.recentActivity.studentClassUpdates')}</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {activities.length === 0 ? (
                    <div className="text-center text-sm text-zinc-400 py-8">
                        {t('dashboard.widgets.recentActivity.noRecentActivity')}
                    </div>
                ) : (
                    activities.map((a, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                            <span className="text-sm shrink-0 mt-0.5">{a.icon}</span>
                            <div className="flex-1">
                                <p className="text-xs text-zinc-700 leading-relaxed">{a.text}</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">{a.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}