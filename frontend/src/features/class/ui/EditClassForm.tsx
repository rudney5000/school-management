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
    updateClassSchema,
    type UpdateClassDto,
    type Class,
    useUpdateClass
} from '@entities/class'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"

type Props = {
    classItem: Class
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const EditClassForm: React.FC<Props> = ({
                                                    classItem,
                                                    isOpen,
                                                    handleOpen,
                                                    handleSuccess,
                                                    submitButtonLabel,
                                                }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const form = useForm<UpdateClassDto>({
        resolver: zodResolver(updateClassSchema),
        mode: "onTouched",
        defaultValues: {
            name: classItem.name,
            gradeLevel: classItem.gradeLevel,
            capacity: classItem.capacity,
        },
    })

    const { mutate, isPending } = useUpdateClass()

    function onSubmit(dto: UpdateClassDto) {
        mutate({ id: classItem.id, dto, subSchoolId: subSchoolId! }, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.classes.form.editTitle')}
            drawerDescription={t('dashboard.classes.form.editDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.classes.fields.name')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gradeLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.classes.fields.gradeLevel')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.classes.fields.capacity')}</FormLabel>
                                <FormControl><Input {...field} type="number" /></FormControl>
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