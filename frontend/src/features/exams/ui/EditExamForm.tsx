import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from '@tanstack/react-router'
import {
    Button,
    Input,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Checkbox,
} from '@shared/ui'
import {
    updateExamSchema,
    type UpdateExamDto,
    useUpdateExam,
    ExamType,
    ExamStatus,
    type Exam,
} from '@entities/exams'
import { useCourses } from '@entities/courses'
import CustomDrawer from '@shared/ui/custom-drawer/custom-drawer'
import { useTranslation } from '@shared/lib'
import {useClasses} from "@entities/class";

type EditExamFormProps = {
    exam?: Exam
    isOpen?: boolean
    handleOpen?: (open: boolean) => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const EditExamForm: React.FC<EditExamFormProps> = ({
                                                              exam,
                                                              isOpen,
                                                              handleOpen,
                                                              handleSuccess,
                                                              submitButtonLabel,
                                                          }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const { data: courses } = useCourses(subSchoolId)
    const { data: classes } = useClasses(subSchoolId)

    const form = useForm<UpdateExamDto>({
        resolver: zodResolver(updateExamSchema),
        mode: 'onTouched',
    })

    const isLiveSession = form.watch('isLiveSession')

    useEffect(() => {
        if (exam) {
            form.reset({
                title: exam.title,
                type: exam.type,
                status: exam.status,
                courseId: exam.courseId,
                classId: exam.classId,
                examDate: exam.examDate,
                durationMinutes: exam.durationMinutes,
                maxScore: Number(exam.maxScore),
                coefficient: Number(exam.coefficient),
                isLiveSession: exam.isLiveSession,
                liveUrl: exam.liveUrl,
            })
        }
    }, [exam, form])

    const { mutate, isPending } = useUpdateExam()

    function onSubmit(dto: UpdateExamDto) {
        if (!exam?.id || !subSchoolId) return
        mutate({ id: exam.id, dto, subSchoolId }, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.exams.form.editTitle')}
            drawerDescription={t('dashboard.exams.form.editDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.title')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.type')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.exams.fields.select')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(ExamType).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {t(`dashboard.exams.types.${type}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.status')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.exams.fields.select')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(ExamStatus).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {t(`dashboard.exams.statuses.${status}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="courseId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.course')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.exams.fields.select')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {courses?.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.class')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.exams.fields.select')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classes?.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="examDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.examDate')}</FormLabel>
                                <FormControl><Input {...field} type="date" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.durationMinutes')}</FormLabel>
                                <FormControl><Input {...field} type="number" min={1} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="maxScore"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.maxScore')}</FormLabel>
                                <FormControl><Input {...field} type="number" min={1} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="coefficient"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.coefficient')}</FormLabel>
                                <FormControl><Input {...field} type="number" min={1} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="rounded-lg border p-4 space-y-3">
                        <FormField
                            control={form.control}
                            name="isLiveSession"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="cursor-pointer">
                                            Examen en ligne (avec live)
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {isLiveSession && (
                            <div className="space-y-3 pl-6">
                                <FormField
                                    control={form.control}
                                    name="liveUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL du live (optionnel)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="https://..."
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? t('dashboard.exams.fields.loading')
                                : (submitButtonLabel ?? t('dashboard.exams.fields.save'))
                            }
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}