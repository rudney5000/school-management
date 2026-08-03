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
    MultiSelect,
    SelectTrigger,
    SelectValue,
    SelectItem,
    SelectContent,
    Select,
} from '@shared/ui'
import {
    createParentSchema,
    type CreateParentDto,
    useCreateParent
} from '@entities/parent'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"
import {useUnassignedStudents} from "@entities/student";

type AddParentFormProps = {
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const AddParentForm: React.FC<AddParentFormProps> = ({
                                                   isOpen,
                                                   handleOpen,
                                                   handleSuccess,
                                                   submitButtonLabel,
                                               }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })
    const { data: unassignedStudents } = useUnassignedStudents(subSchoolId)


    const form = useForm<CreateParentDto>({
        resolver: zodResolver(createParentSchema),
        mode: "onTouched",
        defaultValues: {
            subSchoolId: subSchoolId ?? '',
        },
    })

    const { mutate, isPending } = useCreateParent()

    function onSubmit(dto: CreateParentDto) {
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
            drawerTitle={t('dashboard.parents.form.addTitle')}
            drawerDescription={t('dashboard.parents.form.addDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.parents.fields.firstName')}</FormLabel>
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
                                <FormLabel>{t('dashboard.parents.fields.lastName')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.parents.fields.gender')}</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dashboard.parents.form.selectGender')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">{t('dashboard.teachers.gender.male')}</SelectItem>
                                            <SelectItem value="female">{t('dashboard.teachers.gender.female')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.parents.fields.email')}</FormLabel>
                                <FormControl><Input {...field} type="email" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="studentIds"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.parents.fields.children')}</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        items={(unassignedStudents ?? []).map(s => ({
                                            value: s.id,
                                            label: `${s.firstName} ${s.lastName}`,
                                        }))}
                                        selected={field.value ?? []}
                                        onChange={field.onChange}
                                        placeholder={t('dashboard.parents.form.selectChildren')}
                                        emptyText={t('dashboard.parents.form.noUnassignedChildren')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.parents.fields.phone')}</FormLabel>
                                <FormControl><Input {...field} placeholder="+243 ..." /></FormControl>
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