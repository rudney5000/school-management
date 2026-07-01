import {
    useState,
    useMemo
} from 'react';
import { useParams } from '@tanstack/react-router';
import {
    Plus,
    Search,
    LayoutGrid,
    List,
} from 'lucide-react';
import {
    Badge,
    Button,
    Input,
    Separator,
    Spinner
} from '@/shared/ui';
import type {Course} from "@entities/courses";
import { useCourses } from "@entities/courses";
import {
    AddCourseForm,
    EditCourseForm,
    DeleteCourseAlert
} from "@features/courses";
import type {CourseStatus} from "@entities/courses/model/constants";
import {useTranslation} from "@shared/lib";
import CourseCard from "@/pages/courses/ui/CourseCard";
import {ListRow} from "@/pages/courses/ui";
import i18n from "@app/i18n/i18n";

export default function CoursesPage() {
    const { subSchoolId } = useParams({ strict: false });
    const { data: courses = [], isLoading } = useCourses(subSchoolId);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<CourseStatus | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editCourse, setEditCourse] = useState<Course | null>(null);
    const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

    const { t } = useTranslation();
    const filtered = useMemo(() => {
        return courses.filter(c => {
            const q = search.toLowerCase();
            const matchSearch = c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
            const matchStatus = filterStatus === 'all' || c.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [courses, search, filterStatus]);

    const STATUS_TABS = useMemo<
        { key: CourseStatus | 'all'; label: string }[]
    >(
        () => [
            { key: 'all', label: t('dashboard.courses.tabs.all') },
            { key: 'active', label: t('dashboard.courses.tabs.active') },
            { key: 'completed', label: t('dashboard.courses.tabs.completed') },
            { key: 'archived', label: t('dashboard.courses.tabs.archived') },
        ],
        [i18n.language]
    );

    const counts = useMemo(() => ({
        all: courses.length,
        active: courses.filter(c => c.status === 'active').length,
        completed: courses.filter(c => c.status === 'completed').length,
        archived: courses.filter(c => c.status === 'archived').length,
    }), [courses]);

    const handleEdit = (course: Course) => {
        setEditCourse(course);
    };

    const handleOpenCreate = () => {
        setAddModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-secondary/40">
            <header className="bg-background border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight shrink-0">
                        {t('dashboard.courses.title')}
                    </h1>
                    <div className="flex-1" />
                    <div className="relative w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('dashboard.courses.search')}
                            className="pl-9 h-9 text-sm"
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-9 shrink-0">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-none h-full px-3"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={15} />
                        </Button>
                        <Separator orientation="vertical" className="h-5" />
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-none h-full px-3"
                            onClick={() => setViewMode('list')}
                        >
                            <List size={15} />
                        </Button>
                    </div>
                    <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 shrink-0">
                        <Plus size={15} /> <span className="hidden sm:inline">
                        {t('dashboard.courses.add')}
                    </span>
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                    {[
                        { label: t('dashboard.courses.tabs.all'), value: counts.all },
                        { label: t('dashboard.courses.tabs.active'), value: counts.active },
                        { label: t('dashboard.courses.tabs.completed'), value: counts.completed },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-background rounded-xl border p-4 sm:p-5 shadow-sm">
                            <p className="text-sm text-muted-foreground mb-1">{label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-primary">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-1 mb-6">
                    {STATUS_TABS.map(({ key, label }) => (
                        <Button
                            key={key}
                            variant={filterStatus === key ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterStatus(key)}
                            className="gap-2 h-8"
                        >
                            {label}
                            <Badge
                                variant={filterStatus === key ? 'outline' : 'secondary'}
                                className={
                                    filterStatus === key
                                        ? 'border-white/30 text-white bg-white/20 text-[10px] px-1.5 py-0'
                                        : 'text-[10px] px-1.5 py-0'
                                }
                            >
                                {counts[key]}
                            </Badge>
                        </Button>
                    ))}
                    <span className="ml-auto text-sm text-muted-foreground">
                        {t('dashboard.courses.results', { count: filtered.length })}
                    </span>
                </div>

                {isLoading ? (
                    <div className="text-center py-24 text-muted-foreground">
                        <Spinner/>
                        <p>{t('dashboard.courses.loading')}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 sm:py-24 text-muted-foreground">
                        <Search size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">
                            {t('dashboard.courses.empty.title')}
                        </p>
                        <p className="text-sm mt-1">
                            {t('dashboard.courses.empty.description')}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {filtered.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onEdit={handleEdit}
                                onDelete={(id) => setDeleteCourse(courses.find(c => c.id === id) ?? null)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-background rounded-xl border overflow-hidden shadow-sm">
                        {filtered.map((course, i) => (
                            <div key={course.id}>
                                {i > 0 && <Separator />}
                                <ListRow
                                    course={course}
                                    onEdit={handleEdit}
                                    onDelete={(id) => setDeleteCourse(courses.find(c => c.id === id) ?? null)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <AddCourseForm
                isOpen={addModalOpen}
                handleOpen={() => setAddModalOpen(false)}
                handleSuccess={() => setAddModalOpen(false)}
            />

            {editCourse && (
                <EditCourseForm
                    course={editCourse}
                    isOpen={!!editCourse}
                    handleOpen={() => setEditCourse(null)}
                    handleSuccess={() => setEditCourse(null)}
                />
            )}

            {deleteCourse && (
                <DeleteCourseAlert
                    course={deleteCourse}
                    isOpen={!!deleteCourse}
                    onOpenChange={() => setDeleteCourse(null)}
                    handleSuccess={() => setDeleteCourse(null)}
                />
            )}
        </div>
    );
}