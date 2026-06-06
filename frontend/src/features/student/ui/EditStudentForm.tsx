import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Button,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch
} from '@shared/ui'
import {type UpdateStudentDto, updateStudentSchema, type Student, useUpdateStudent} from '@entities/student'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer";
import {useTranslation} from "@shared/lib";

type Props = {
    student: Student
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const EditStudentForm: React.FC<Props> = ({
                                                     student,
                                                     isOpen,
                                                     handleOpen,
                                                     handleSuccess,
                                                     submitButtonLabel = 'Modifier',
                                                 }) => {
    const form = useForm<UpdateStudentDto>({
        resolver: zodResolver(updateStudentSchema),
        mode: "onTouched",
        defaultValues: {
            ...student,
        },
    })
    const { t } = useTranslation()

    const { mutate, isPending } = useUpdateStudent()

    function onSubmit(dto: UpdateStudentDto) {
        mutate({ id: student.id, dto }, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.students.form.addTitle')}
            drawerDescription={t('dashboard.students.form.addDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.students.fields.firstName')}</FormLabel>
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
                                <FormLabel>{t('dashboard.students.fields.lastName')}</FormLabel>
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
                                <FormLabel>{t('dashboard.students.fields.email')}</FormLabel>
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
                                <FormLabel>{t('dashboard.students.fields.phone')}</FormLabel>
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
                                <FormLabel>{t('dashboard.students.fields.gender')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('common.select')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">{t('dashboard.students.gender.male')}</SelectItem>
                                        <SelectItem value="female">{t('dashboard.students.gender.female')}</SelectItem>
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
                                <FormLabel>{t('dashboard.students.fields.dateOfBirth')}</FormLabel>
                                <FormControl><Input {...field} type="date" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="enrollmentDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.students.fields.enrollmentDate')}</FormLabel>
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
                                <FormLabel>{t('dashboard.students.fields.address')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.students.fields.image')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://..." />
                                </FormControl>
                                {field.value && (
                                    <img
                                        src={field.value}
                                        alt="Aperçu"
                                        className="w-12 h-12 rounded-full object-cover mt-1"
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                    />
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                <FormLabel className="cursor-pointer">{t('dashboard.students.fields.isActive')}</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
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