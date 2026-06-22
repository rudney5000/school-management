import React, {useMemo} from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
    UserCheck,
    UserPlus,
    Users,
    UserX
} from 'lucide-react'
import { Button } from '@shared/ui'
import {
    type StatCardItem,
} from '@shared/ui/data-table'
import {
    type Student,
    useStudents
} from '@entities/student'
import {
    AddStudentForm,
    StudentOverviewPanel
} from '@features/student'
import { useTranslation } from '@shared/lib'
import i18n from '@app/i18n/i18n'
import {getStudentColumns} from "@/pages/student/ui/StudentColumns";
import {StudentsTable} from "@/pages/student/ui/StudentsTable";

const StudentsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [studentToUpdate, setStudentToUpdate] = React.useState<Student>()
    const [studentToDelete, setStudentToDelete] = React.useState<Student>()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const locale = i18n.language
    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/students',
    })

    const { data, isLoading, isError } = useStudents(subSchoolId)

    const stats = React.useMemo<StatCardItem[]>(() => {
        const students = data ?? []
        const total = students.length
        const active = students.filter((s) => s.isActive).length
        const inactive = total - active
        const now = new Date()
        const newStudents = students.filter((s) => {
            const enrolled = new Date(s.enrollmentDate)
            return (
                enrolled.getMonth() === now.getMonth() &&
                enrolled.getFullYear() === now.getFullYear()
            )
        }).length
        const activePercent = total > 0 ? Math.round((active / total) * 100) : 0

        return [
            {
                label: t('dashboard.students.stats.total'),
                value: total,
                icon: Users,
                trend: { value: `${total}`, positive: true },
            },
            {
                label: t('dashboard.students.stats.active'),
                value: active,
                icon: UserCheck,
                trend: { value: `${activePercent}%`, positive: true },
            },
            {
                label: t('dashboard.students.stats.inactive'),
                value: inactive,
                icon: UserX,
                trend: {
                    value: `${total > 0 ? Math.round((inactive / total) * 100) : 0}%`,
                    positive: false,
                },
            },
            {
                label: t('dashboard.students.stats.new'),
                value: newStudents,
                icon: UserPlus,
                trend: { value: t('dashboard.students.stats.thisMonth'), positive: true },
            },
        ]
    }, [data, t])

    const handleViewStudent = React.useCallback(
        (student: Student) => {
            navigate({
                to: '/$locale/sub-schools/$subSchoolId/students/$studentId',
                params: {
                    locale,
                    subSchoolId,
                    studentId: student.id,
                },
            })
        },
        [navigate, locale, subSchoolId]
    )

    const columns = useMemo(() => getStudentColumns({
        t,
        studentToUpdate,
        studentToDelete,
        onEdit: setStudentToUpdate,
        onDelete: setStudentToDelete,
        onView: handleViewStudent,
        onCancelEdit: () => setStudentToUpdate(undefined),
        onCancelDelete: () => setStudentToDelete(undefined),
    }), [t, studentToUpdate, studentToDelete])

    return (
        <StudentsTable
            columns={columns}
            data={data ?? []}
            searchPlaceholder={t('dashboard.students.searchPlaceholder')}
            title={t('dashboard.students.title')}
            subtitle={t('dashboard.students.subtitle')}
            stats={stats}
            isLoading={isLoading}
            isError={isError}
            loadingMessage={t('dashboard.students.loading')}
            errorMessage={t('dashboard.students.error')}
            renderDetailPanel={(student) => (
                <StudentOverviewPanel
                    student={student}
                    onView={handleViewStudent}
                    onEdit={setStudentToUpdate}
                />
            )}
        >
            <AddStudentForm
                isOpen={isCreateOpen}
                handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                handleSuccess={() => setIsCreateOpen(false)}
                submitButtonLabel={t('dashboard.students.add')}
            />

            <Button
                onClick={() => setIsCreateOpen(!isCreateOpen)}
                className="h-10 rounded-2xl bg-[#1755EC] hover:bg-[#1755EC]/90 shadow-sm gap-2 px-5"
            >
                + {t('dashboard.students.add_student')}
            </Button>
        </StudentsTable>
    )
}

export default StudentsPage
