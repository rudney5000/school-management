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
} from '@shared/ui'
import {
    updateCourseSchema,
    type UpdateCourseDto,
    type Course,
    useUpdateCourse
} from '@entities/courses'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"

type Props = {
    course: Course
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const EditCourseForm: React.FC<Props> = ({
                                                    course,
                                                    isOpen,
                                                    handleOpen,
                                                    handleSuccess,
                                                    submitButtonLabel,
                                                }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const form = useForm<UpdateCourseDto>({
        resolver: zodResolver(updateCourseSchema),
        mode: "onTouched",
        defaultValues: {
            name: course.name,
            code: course.code,
            description: course.description,
            credits: course.credits,
        },
    })

    const { mutate, isPending } = useUpdateCourse()

    function onSubmit(dto: UpdateCourseDto) {
        mutate({ id: course.id, dto, subSchoolId: subSchoolId! }, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.courses.form.editTitle')}
            drawerDescription={t('dashboard.courses.form.editDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.courses.fields.name')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.courses.fields.code')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.courses.fields.description')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="credits"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.course.fields.credits')}</FormLabel>
                                <FormControl><Input {...field} type="number" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t('dashboard.common.loading') : (submitButtonLabel ?? t('dashboard.common.confirm'))}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}