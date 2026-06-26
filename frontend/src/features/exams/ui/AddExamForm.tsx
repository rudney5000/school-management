import React from 'react'
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
} from '@shared/ui'
import {
    createExamSchema,
    useCreateExam,
    ExamType,
    type CreateExamDto,
} from '@entities/exams'
import { useCourses } from '@entities/courses'
import {useClasses} from "@entities/class";
import CustomDrawer from '@shared/ui/custom-drawer/custom-drawer'
import { useTranslation } from '@shared/lib'

type AddExamFormProps = {
    isOpen?: boolean
    handleOpen?: (open: boolean) => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const AddExamForm: React.FC<AddExamFormProps> = ({
                                                            isOpen,
                                                            handleOpen,
                                                            handleSuccess,
                                                            submitButtonLabel,
                                                        }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const { data: courses } = useCourses(subSchoolId)
    const { data: classes } = useClasses(subSchoolId)

    const form = useForm<CreateExamDto>({
        resolver: zodResolver(createExamSchema),
        mode: 'onTouched',
        defaultValues: {
            subSchoolId: subSchoolId ?? ''
        },
    })

    const { mutate, isPending } = useCreateExam()

    function onSubmit(dto: CreateExamDto) {
        mutate(dto, {
            onSuccess: () => {
                form.reset()
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.exams.form.addTitle')}
            drawerDescription={t('dashboard.exams.form.addDescription')}
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        name="courseId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.exams.fields.course')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? t('dashboard.exams.fields.loading')
                                : (submitButtonLabel ?? t('dashboard.exams.fields.add'))
                            }
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}