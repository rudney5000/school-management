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
    Input
} from '@shared/ui'
import {type UpdateStudentDto, updateStudentSchema, type Student, useUpdateStudent} from '@entities/student'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer";

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
        defaultValues: { ...student },
    })

    const { mutate, isPending } = useUpdateStudent()

    function onSubmit(dto: UpdateStudentDto) {
        mutate({ id: student.id, dto }, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer isOpen={isOpen} handleOpen={handleOpen} drawerTitle="Modifier étudiant">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={isPending}>
                            {submitButtonLabel}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}