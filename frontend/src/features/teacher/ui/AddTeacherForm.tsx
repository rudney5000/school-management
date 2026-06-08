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
    createTeacherSchema,
    type CreateTeacherDto,
    useCreateTeacher
} from '@entities/teacher'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"

type AddTeacherFormProps = {
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const AddTeacherForm: React.FC<AddTeacherFormProps> = ({
                                                                  isOpen,
                                                                  handleOpen,
                                                                  handleSuccess,
                                                                  submitButtonLabel,
                                                              }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const form = useForm<CreateTeacherDto>({
        resolver: zodResolver(createTeacherSchema),
        mode: "onTouched",
        defaultValues: {
            subSchoolId: subSchoolId ?? '',
        },
    })

    const { mutate, isPending } = useCreateTeacher()

    function onSubmit(dto: CreateTeacherDto) {
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
            drawerTitle={t('dashboard.teachers.form.addTitle')}
            drawerDescription={t('dashboard.teachers.form.addDescription')}
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

                    <FormField
                        control={form.control}
                        name="hireDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.hireDate')}</FormLabel>
                                <FormControl><Input {...field} type="date" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="qualification"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.qualification')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.teachers.fields.specialization')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t('common.loading') : (submitButtonLabel ?? t('common.add'))}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}