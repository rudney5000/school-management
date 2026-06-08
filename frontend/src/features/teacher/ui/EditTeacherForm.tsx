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
    updateTeacherSchema,
    type UpdateTeacherDto,
    type Teacher,
    useUpdateTeacher,
} from '@entities/teacher'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"

type Props = {
    teacher: Teacher
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const EditTeacherForm: React.FC<Props> = ({
                                                     teacher,
                                                     isOpen,
                                                     handleOpen,
                                                     handleSuccess,
                                                     submitButtonLabel,
                                                 }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const form = useForm<UpdateTeacherDto>({
        resolver: zodResolver(updateTeacherSchema),
        mode: "onTouched",
        defaultValues: {
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone ?? undefined,
            address: teacher.address ?? undefined,
            gender: teacher.gender,
            dateOfBirth: teacher.dateOfBirth,
        },
    })

    const { mutate, isPending } = useUpdateTeacher()

    function onSubmit(dto: UpdateTeacherDto) {
        mutate({ id: teacher.id, dto, subSchoolId: subSchoolId! }, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.teachers.form.editTitle')}
            drawerDescription={t('dashboard.teachers.form.editDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.firstName')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.lastName')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.email')}</FormLabel>
                                <FormControl><Input {...field} type="email" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.phone')}</FormLabel>
                                <FormControl><Input {...field} placeholder="+243 ..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.gender')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('common.select')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">{t('dashboard.teachers.gender.male')}</SelectItem>
                                        <SelectItem value="female">{t('dashboard.teachers.gender.female')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.dateOfBirth')}</FormLabel>
                                <FormControl><Input {...field} type="date" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.address')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t('common.loading') : (submitButtonLabel ?? t('common.save'))}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}