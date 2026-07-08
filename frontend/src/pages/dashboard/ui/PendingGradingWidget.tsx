import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@shared/ui/";
import {cn} from "@shared/lib/utils";
import {gradeApi} from "@/entities/grades/api/grade.api";
import {classApi} from "@/entities/class/api/class.api";
import {useEffect, useState} from "react";
import {Status} from "@shared/helperClass/CommonResponse";
import {type Grade, GradeType} from "@entities/grades";
import {useAppSelector} from "@shared/store/hooks";
import {selectSubSchoolId} from "@features/auth/model/selectors";
import {courseApi} from "@entities/courses";

interface PendingGradingItem {
    id: string;
    initials: string;
    label: string;
    sub: string;
    color: string;
}

const gradeTypeLabels: Record<GradeType, string> = {
    [GradeType.Homework]: 'Homework',
    [GradeType.Participation]: 'Participation',
    [GradeType.Project]: 'Project',
    [GradeType.Oral]: 'Oral',
};

const colors = ['bg-indigo-500', 'bg-teal-500', 'bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500'];

export function PendingGradingWidget() {
    const subSchoolId = useAppSelector(selectSubSchoolId);
    const [pendingGrading, setPendingGrading] = useState<PendingGradingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subSchoolId) return;

        const fetchPendingGrading = async () => {
            try {
                const [gradesResponse, classesResponse, coursesResponse] = await Promise.all([
                    gradeApi.getAll({ subSchoolId }),
                    classApi.getAll({ subSchoolId }),
                    courseApi.getAll({ subSchoolId }),
                ]);

                if (gradesResponse.status !== Status.Success || !Array.isArray(gradesResponse.result)) {
                    setLoading(false);
                    return;
                }

                const grades: Grade[] = gradesResponse.result;

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

                const pendingItems: PendingGradingItem[] = grades
                    .filter((g) => g.score === null)
                    .slice(0, 6)
                    .map((g, index) => {
                        const className = classNameById.get(g.classId) ?? 'Class';
                        const courseName = courseNameById.get(g.courseId) ?? 'Course';
                        const initials = className.substring(0, 2).toUpperCase();

                        return {
                            id: g.id,
                            initials,
                            label: `${courseName} · ${gradeTypeLabels[g.gradeType]}`,
                            sub: `${className} · Awaiting score`,
                            color: colors[index % colors.length],
                        };
                    });

                setPendingGrading(pendingItems);
            } catch (error) {
                console.error('Error fetching pending grading:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPendingGrading();
    }, [subSchoolId]);

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Pending Grading</CardTitle>
                        <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">Loading...</span>
                    </div>
                    <p className="text-xs text-zinc-400">Submissions awaiting review</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
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
                    <CardTitle className="text-base">Pending Grading</CardTitle>
                    <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">{pendingGrading.length} pending</span>
                </div>
                <p className="text-xs text-zinc-400">Grades awaiting a score</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {pendingGrading.length === 0 ? (
                    <div className="text-center text-sm text-zinc-400 py-8">
                        No pending grading
                    </div>
                ) : (
                    pendingGrading.map((g) => (
                        <div key={g.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={cn('w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold', g.color)}>
                                {g.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-zinc-800 group-hover:text-indigo-600 transition-colors truncate">
                                    {g.label}
                                </div>
                                <div className="text-xs text-zinc-400">{g.sub}</div>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-orange-100 text-orange-600">
                                Pending
                            </span>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}