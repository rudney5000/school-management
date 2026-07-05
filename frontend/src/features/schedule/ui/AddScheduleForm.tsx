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
    Checkbox,
} from '@shared/ui'
import {
    createScheduleSchema,
    type CreateScheduleDto,
    useCreateSchedule
} from '@entities/schedule'
import { useClasses } from '@entities/class'
import { useCourses } from '@entities/courses'
import { useTeachers } from '@entities/teacher'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"

type Props = {
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const AddScheduleForm: React.FC<Props> = ({
                                                     isOpen,
                                                     handleOpen,
                                                     handleSuccess,
                                                     submitButtonLabel,
                                                 }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const { data: classes } = useClasses(subSchoolId)
    const { data: courses } = useCourses(subSchoolId)
    const { data: teachers } = useTeachers(subSchoolId)

    const form = useForm<CreateScheduleDto>({
        resolver: zodResolver(createScheduleSchema),
        mode: "onTouched",
        defaultValues: {
            subSchoolId: subSchoolId ?? '',
            dayOfWeek: 'MONDAY',
            startTime: '',
            endTime: '',
            room: '',
            academicYear: '',
            classId: '',
            courseId: '',
            teacherId: '',
            isLiveSession: false,
        },
    })

    const isLiveSession = form.watch('isLiveSession')

    const { mutate, isPending } = useCreateSchedule()

    function onSubmit(dto: CreateScheduleDto) {
        mutate(dto, {
            onSuccess: () => {
                form.reset({
                    subSchoolId: subSchoolId ?? '',
                })
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.schedules.form.addTitle')}
            drawerDescription={t('dashboard.schedules.form.addDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

                    <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.schedules.fields.class')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.schedules.fields.selectClass')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classes?.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.name}
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
                                <FormLabel>{t('dashboard.schedules.fields.course')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.schedules.fields.selectCourse')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {courses?.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.name}
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
                        name="teacherId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.schedules.fields.teacher')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.schedules.fields.selectTeacher')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {teachers?.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {teacher.firstName} {teacher.lastName}
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
                        name="dayOfWeek"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.schedules.fields.day')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.schedules.fields.selectDay')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="MONDAY">{t('dashboard.schedules.days.monday')}</SelectItem>
                                        <SelectItem value="TUESDAY">{t('dashboard.schedules.days.tuesday')}</SelectItem>
                                        <SelectItem value="WEDNESDAY">{t('dashboard.schedules.days.wednesday')}</SelectItem>
                                        <SelectItem value="THURSDAY">{t('dashboard.schedules.days.thursday')}</SelectItem>
                                        <SelectItem value="FRIDAY">{t('dashboard.schedules.days.friday')}</SelectItem>
                                        <SelectItem value="SATURDAY">{t('dashboard.schedules.days.saturday')}</SelectItem>
                                        <SelectItem value="SUNDAY">{t('dashboard.schedules.days.sunday')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.schedules.fields.startTime')}</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.schedules.fields.endTime')}</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="room"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.schedules.fields.room')}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="academicYear"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.schedules.fields.academicYear')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="2025-2026" />
                                </FormControl>
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
                                            Séance en ligne (avec live)
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
                            {isPending ? t('dashboard.common.loading') : (submitButtonLabel ?? t('dashboard.common.confirm'))}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}