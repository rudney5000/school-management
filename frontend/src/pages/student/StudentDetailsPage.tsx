import React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    User,
    Users
} from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Separator,
    Spinner
} from '@shared/ui'
import { useStudent } from '@entities/student'
import { useParents } from '@entities/parent'
import { cn, useTranslation } from '@shared/lib'
import i18n from "@app/i18n/i18n";

const StudentDetailsPage = () => {
    const { subSchoolId, studentId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/students/$studentId',
    })
    const navigate = useNavigate()
    const { t } = useTranslation()

    const { data: student, isLoading, isError } = useStudent(studentId, subSchoolId)
    const { data: parents, isLoading: isParentsLoading } = useParents(subSchoolId)

    if (isLoading) return <div className="p-8 text-muted-foreground">
        <Spinner/>
        {t('common.loading')}
    </div>
    if (isError || !student) return <div className="p-8 text-destructive">{t('common.error')}</div>

    const avatar = student.image ?? `https://i.pravatar.cc/150?u=${student.id}`
    const locale = i18n.language

    const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ru: 'ru-RU', ln: 'ln-CD' }
    const fmt = (d: string) => new Date(d).toLocaleDateString(localeMap[locale] || 'fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    })


    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground -ml-2"
                onClick={() => navigate({
                    to: '/$locale/sub-schools/$subSchoolId/students',
                    params: {
                        locale: locale,
                        subSchoolId: subSchoolId
                    }
                })}
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('common.back')}
            </Button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                    src={avatar}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {student.firstName} {student.lastName}
                        </h1>
                        <Badge
                            variant="outline"
                            className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded-full border-0',
                                student.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            )}
                        >
                            {student.isActive
                                ? t('dashboard.students.status.active')
                                : t('dashboard.students.status.inactive')}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {student.email}
                    </p>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {t('dashboard.students.details.personalInfo')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <InfoRow label={t('dashboard.students.columns.firstName')} value={student.firstName} />
                        <InfoRow label={t('dashboard.students.columns.lastName')} value={student.lastName} />
                        <InfoRow
                            label={t('dashboard.students.columns.gender')}
                            value={student.gender === 'male'
                                ? t('dashboard.students.gender.male')
                                : t('dashboard.students.gender.female')}
                        />
                        <InfoRow
                            label={t('dashboard.students.columns.phone')}
                            value={student.phone || '—'}
                            icon={<Phone className="w-3.5 h-3.5 text-muted-foreground" />}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {t('dashboard.students.details.dates')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <InfoRow
                            label={t('dashboard.students.columns.dateOfBirth')}
                            value={fmt(student.dateOfBirth)}
                        />
                        <InfoRow
                            label={t('dashboard.students.columns.enrollmentDate')}
                            value={fmt(student.enrollmentDate)}
                        />
                        <InfoRow
                            label={t('dashboard.students.details.studentId')}
                            value={
                                <span className="font-mono text-xs text-muted-foreground truncate max-w-[180px] block">
                                  {student.id}
                                </span>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {t('dashboard.students.details.parents')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isParentsLoading ? (
                        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                    ) : !parents || parents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('dashboard.students.details.noParents')}</p>
                    ) : (
                        <Accordion type="multiple" className="space-y-2">
                            {parents.map((parent) => (
                                <AccordionItem
                                    key={parent.id}
                                    value={parent.id}
                                    className="border border-border rounded-lg px-3 bg-muted/30"
                                >
                                    <AccordionTrigger className="hover:no-underline py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                                                {parent.firstName?.[0]}{parent.lastName?.[0]}
                                            </div>
                                            <div className="text-left min-w-0">
                                                <p className="font-medium text-sm">
                                                    {parent.firstName} {parent.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">{parent.email}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-3">
                                        <div className="space-y-2 pt-1">
                                            {parent.phone && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {parent.phone}
                                                </div>
                                            )}
                                            {parent.children && parent.children.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                                                        {t('dashboard.students.details.siblings')}
                                                    </p>
                                                    <div className="space-y-1">
                                                        {parent.children.map((child) => (
                                                            <div
                                                                key={child.id}
                                                                className="flex items-center gap-2 text-xs p-1.5 rounded-md bg-background border border-border"
                                                            >
                                                                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 text-[10px] font-medium flex items-center justify-center flex-shrink-0">
                                                                    {child.firstName?.[0]}{child.lastName?.[0]}
                                                                </div>
                                                                <span className="font-medium">{child.firstName} {child.lastName}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

const InfoRow = ({
                     label,
                     value,
                     icon,
                 }: {
    label: string
    value: React.ReactNode
    icon?: React.ReactNode
}) => (
    <div className="flex items-start justify-between gap-4">
    <span className="text-muted-foreground shrink-0 flex items-center gap-1.5">
      {icon}
        {label}
    </span>
        <span className="text-right font-medium">{value}</span>
    </div>
)

export default StudentDetailsPage