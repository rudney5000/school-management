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
    createCourseSchema,
    type CreateCourseDto,
    useCreateCourse
} from '@entities/courses'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"

type Props = {
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const AddCourseForm: React.FC<Props> = ({
                                                  isOpen,
                                                  handleOpen,
                                                  handleSuccess,
                                                  submitButtonLabel,
                                              }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const form = useForm<CreateCourseDto>({
        resolver: zodResolver(createCourseSchema),
        mode: "onTouched",
        defaultValues: {
            subSchoolId: subSchoolId ?? '',
        },
    })

    const { mutate, isPending } = useCreateCourse()

    function onSubmit(dto: CreateCourseDto) {
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
            drawerTitle={t('dashboard.classes.form.addTitle')}
            drawerDescription={t('dashboard.classes.form.addDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.classes.fields.name')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: 6ème A" />
                                </FormControl>
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
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Math" />
                                </FormControl>
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
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="credits"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.courses.fields.credits')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end pt-4 gap-2">
                        <Button type="button" variant="outline" onClick={handleOpen}>
                            {t('dashboard.common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t('dashboard.common.loading') : (submitButtonLabel ?? t('dashboard.common.confirm'))}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}