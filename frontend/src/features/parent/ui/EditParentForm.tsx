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
    updateParentSchema,
    type UpdateParentDto,
    type Parent,
    useUpdateParent
} from '@entities/parent'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"

type Props = {
    parent: Parent
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const EditParentForm: React.FC<Props> = ({
                                                    parent,
                                                    isOpen,
                                                    handleOpen,
                                                    handleSuccess,
                                                    submitButtonLabel,
                                                }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const form = useForm<UpdateParentDto>({
        resolver: zodResolver(updateParentSchema),
        mode: "onTouched",
        defaultValues: {
            firstName: parent.firstName,
            lastName: parent.lastName,
            email: parent.email,
            phone: parent.phone ?? undefined,
        },
    })

    const { mutate, isPending } = useUpdateParent()

    function onSubmit(dto: UpdateParentDto) {
        mutate({ id: parent.id, dto, subSchoolId: subSchoolId! }, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.parents.form.editTitle')}
            drawerDescription={t('dashboard.parents.form.editDescription')}
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
                            {isPending ? t('common.loading') : (submitButtonLabel ?? t('common.save'))}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}