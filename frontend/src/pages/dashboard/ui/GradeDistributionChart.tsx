import {
    useEffect,
    useState
} from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from 'recharts'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/ui/'
import { cn } from '@/shared/lib/utils'
import {gradeApi} from "@/entities/grades/api/grade.api";
import {Status} from "@shared/helperClass/CommonResponse";
import type {Grade} from "@entities/grades";
import {useAppSelector} from "@shared/store/hooks";
import {selectSubSchoolId} from "@features/auth/model/selectors";
import {useTranslation} from "@shared/lib";
import {
    type Course,
    courseApi
} from "@entities/courses";

interface GradeDistributionItem {
    grade: string;
    students: number;
    color: string;
}

interface GradeStats {
    classAverage: string;
    passing: string;
    failing: string;
    aGradeStudents: string;
}

interface GradeData {
    distribution: GradeDistributionItem[];
    stats: GradeStats;
}

const ALL_COURSES_ID = 'ALL';

function classifyPercentage(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
}

function computeGradeData(grades: Grade[]): GradeData {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    let weightedSum = 0;
    let totalCoefficient = 0;
    let passing = 0;

    for (const g of grades) {
        const score = parseFloat(g.score);
        const maxScore = parseFloat(g.maxScore);
        const coefficient = parseFloat(g.coefficient) || 1;

        if (isNaN(score) || isNaN(maxScore) || maxScore <= 0) continue;

        const percentage = (score / maxScore) * 100;
        distribution[classifyPercentage(percentage)]++;
        weightedSum += percentage * coefficient;
        totalCoefficient += coefficient;
        if (percentage >= 60) passing++;
    }

    const total = grades.length;
    const averageScore = totalCoefficient > 0 ? (weightedSum / totalCoefficient).toFixed(1) : '0';
    const failing = total - passing;

    return {
        distribution: [
            { grade: 'A', students: distribution.A, color: '#6366f1' },
            { grade: 'B', students: distribution.B, color: '#10b981' },
            { grade: 'C', students: distribution.C, color: '#f59e0b' },
            { grade: 'D', students: distribution.D, color: '#f97316' },
            { grade: 'F', students: distribution.F, color: '#ef4444' },
        ],
        stats: {
            classAverage: `${averageScore}%`,
            passing: `${passing}/${total}`,
            failing: failing.toString(),
            aGradeStudents: distribution.A.toString(),
        },
    };
}

export function GradeDistributionChart() {
    const { t } = useTranslation();
    const subSchoolId = useAppSelector(selectSubSchoolId);
    const [allGrades, setAllGrades] = useState<Grade[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState<string>(ALL_COURSES_ID);

    useEffect(() => {
        if (!subSchoolId) return;

        const fetchData = async () => {
            try {
                const [gradesResponse, coursesResponse] = await Promise.all([
                    gradeApi.getAll({ subSchoolId }),
                    courseApi.getAll({ subSchoolId }),
                ]);

                if (gradesResponse.status === Status.Success && Array.isArray(gradesResponse.result)) {
                    setAllGrades(gradesResponse.result);
                }

                if (coursesResponse.status === Status.Success && Array.isArray(coursesResponse.result)) {
                    setCourses(coursesResponse.result);
                }
            } catch (error) {
                console.error('Error fetching grades:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [subSchoolId]);

    const filteredGrades = selectedCourseId === ALL_COURSES_ID
        ? allGrades
        : allGrades.filter((g) => g.courseId === selectedCourseId);

    const gradeData = computeGradeData(filteredGrades);

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">{t('dashboard.widgets.gradeDistribution.title')}</CardTitle>
                            <p className="text-xs text-zinc-400 mt-0.5">{t('dashboard.widgets.gradeDistribution.loading')}</p>
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
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">
                            {t('dashboard.widgets.gradeDistribution.title')}
                        </CardTitle>

                        <p className="text-xs text-zinc-400 mt-0.5">
                            {selectedCourseId === ALL_COURSES_ID ? t('dashboard.widgets.gradeDistribution.allCourses') : courses.find(c => c.id === selectedCourseId)?.name} · {t('dashboard.widgets.gradeDistribution.currentPeriod')}
                        </p>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                        <button
                            onClick={() => setSelectedCourseId(ALL_COURSES_ID)}
                            className={cn(
                                'text-xs px-2.5 py-1 rounded-full transition-colors',
                                selectedCourseId === ALL_COURSES_ID
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-500 hover:bg-zinc-100'
                            )}
                        >
                            {t('dashboard.widgets.gradeDistribution.allClasses')}
                        </button>
                        {courses.map((course) => (
                            <button
                                key={course.id}
                                onClick={() => setSelectedCourseId(course.id)}
                                className={cn(
                                    'text-xs px-2.5 py-1 rounded-full transition-colors',
                                    selectedCourseId === course.id
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-500 hover:bg-zinc-100'
                                )}
                            >
                                {course.name}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                        data={gradeData.distribution}
                        barSize={48}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />

                        <XAxis
                            dataKey="grade"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fill: '#94a3b8',
                            }}
                        />

                        <YAxis hide />

                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: 'none',
                                boxShadow:
                                    '0 4px 12px rgba(0,0,0,.1)',
                                fontSize: 12,
                            }}
                            formatter={(value) => [
                                `${value} ${t('dashboard.widgets.gradeDistribution.students')}`,
                            ]}
                        />

                        <Bar
                            dataKey="students"
                            radius={[4, 4, 0, 0]}
                        >
                            {gradeData.distribution.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={entry.color}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-5 text-center mt-2 pt-3 border-t border-zinc-100 text-xs">
                    {gradeData.distribution.map((grade) => (
                        <div key={grade.grade}>
                            <div className="font-bold text-zinc-800">
                                {grade.students}
                            </div>
                            <div className="text-zinc-400">
                                {t('dashboard.widgets.gradeDistribution.students')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-100">
                    {[
                        {
                            val: gradeData.stats.classAverage,
                            lbl: t('dashboard.widgets.gradeDistribution.classAverage'),
                            color: 'text-zinc-800',
                        },
                        {
                            val: gradeData.stats.passing,
                            lbl: t('dashboard.widgets.gradeDistribution.passing'),
                            color: 'text-zinc-800',
                        },
                        {
                            val: gradeData.stats.failing,
                            lbl: t('dashboard.widgets.gradeDistribution.failing'),
                            color: 'text-red-500',
                        },
                        {
                            val: gradeData.stats.aGradeStudents,
                            lbl: t('dashboard.widgets.gradeDistribution.aGradeStudents'),
                            color: 'text-indigo-600',
                        },
                    ].map((item) => (
                        <div
                            key={item.lbl}
                            className="text-center"
                        >
                            <div
                                className={cn(
                                    'text-base font-bold',
                                    item.color
                                )}
                            >
                                {item.val}
                            </div>

                            <div className="text-[10px] text-zinc-400 leading-tight">
                                {item.lbl}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}