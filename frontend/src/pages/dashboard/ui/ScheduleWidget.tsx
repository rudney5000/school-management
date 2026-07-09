import {
    useEffect,
    useState
} from "react";

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/shared/ui/'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ScheduleBadge } from './ScheduleBadge'
import {scheduleApi} from "@/entities/schedule/api/schedule.api";
import {Status} from "@shared/helperClass/CommonResponse";
import type {Schedule} from "@entities/schedule";
import {useAppSelector} from "@shared/store/hooks";
import {selectSubSchoolId} from "@features/auth/model/selectors";
import {useTranslation} from "@shared/lib";
import {classApi} from "@entities/class";
import {courseApi} from "@entities/courses";

type ScheduleStatus = 'live' | 'upcoming' | 'done' | 'next';

interface ScheduleItem {
    id: string;
    time: string;
    course: string;
    room: string;
    status: ScheduleStatus;
}

const DAY_INDEX_TO_ENUM: Schedule['dayOfWeek'][] = [
    'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
];

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function timeStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map((v) => parseInt(v, 10));
    return hours * 60 + minutes;
}

export function ScheduleWidget() {
    const { t } = useTranslation();
    const subSchoolId = useAppSelector(selectSubSchoolId);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subSchoolId) return;

        const fetchSchedule = async () => {
            try {
                const [scheduleResponse, classesResponse, coursesResponse] = await Promise.all([
                    scheduleApi.getAll({ subSchoolId }),
                    classApi.getAll({ subSchoolId }),
                    courseApi.getAll({ subSchoolId }),
                ]);

                if (scheduleResponse.status !== Status.Success || !Array.isArray(scheduleResponse.result)) {
                    setLoading(false);
                    return;
                }

                const classNameById = new Map<string, string>();
                if (classesResponse.status === Status.Success && Array.isArray(classesResponse.result)) {
                    for (const c of classesResponse.result) {
                        classNameById.set(c.id, c.name);
                    }
                }

                const courseNameById = new Map<string, string>();
                if (coursesResponse.status === Status.Success && Array.isArray(coursesResponse.result)) {
                    for (const c of coursesResponse.result) {
                        courseNameById.set(c.id, c.name);
                    }
                }

                const today = new Date();
                const todayDayEnum = DAY_INDEX_TO_ENUM[today.getDay()];
                const nowMinutes = today.getHours() * 60 + today.getMinutes();

                const todaySchedules = scheduleResponse.result
                    .filter((s) => s.dayOfWeek === todayDayEnum)
                    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

                const nextIndex = todaySchedules.findIndex(
                    (s) => timeStringToMinutes(s.startTime) > nowMinutes
                );

                const items: ScheduleItem[] = todaySchedules.map((s, index) => {
                    const startMinutes = timeStringToMinutes(s.startTime);
                    const endMinutes = timeStringToMinutes(s.endTime);

                    let status: ScheduleStatus = 'upcoming';
                    if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
                        status = 'live';
                    } else if (nowMinutes > endMinutes) {
                        status = 'done';
                    } else if (index === nextIndex) {
                        status = 'next';
                    }

                    const courseName = courseNameById.get(s.courseId) ?? t('dashboard.widgets.scheduleWidget.course');
                    const className = classNameById.get(s.classId) ?? t('dashboard.widgets.scheduleWidget.class');

                    return {
                        id: s.id,
                        time: formatTime(s.startTime),
                        course: `${courseName} — ${className}`,
                        room: s.room ?? t('dashboard.widgets.scheduleWidget.noRoomAssigned'),
                        status,
                    };
                });

                setSchedule(items);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [subSchoolId]);

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">{t('dashboard.widgets.scheduleWidget.title')}</CardTitle>
                            <p className="text-xs text-zinc-400 mt-0.5">{t('dashboard.widgets.scheduleWidget.loading')}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
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
                    <div>
                        <CardTitle className="text-base">
                            {t('dashboard.widgets.scheduleWidget.title')}
                        </CardTitle>

                        <p className="text-xs text-zinc-400 mt-0.5">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · {t('dashboard.widgets.scheduleWidget.periods', { count: schedule.length })}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1"
                    >
                        <Plus className="h-3 w-3" />
                        {t('dashboard.widgets.scheduleWidget.newEvent')}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-1">
                {schedule.length === 0 ? (
                    <div className="text-center text-sm text-zinc-400 py-8">
                        {t('dashboard.widgets.scheduleWidget.noSchedule')}
                    </div>
                ) : (
                    schedule.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                                item.status === 'live'
                                    ? 'bg-indigo-50 ring-1 ring-indigo-200'
                                    : 'hover:bg-zinc-50'
                            )}
                        >
                            <div className="w-16 text-xs font-mono text-zinc-400 shrink-0">
                                {item.time}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div
                                    className={cn(
                                        'text-sm font-semibold truncate',
                                        item.status === 'live'
                                            ? 'text-indigo-700'
                                            : 'text-zinc-800'
                                    )}
                                >
                                    {item.course}
                                </div>

                                <div className="text-xs text-zinc-400 truncate">
                                    {item.room}
                                </div>
                            </div>

                            <ScheduleBadge status={item.status} />
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}