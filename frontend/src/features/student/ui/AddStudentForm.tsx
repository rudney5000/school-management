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
import {
    type CreateStudentDto,
    createStudentSchema,
    useCreateStudent
} from '@entities/student'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer";

type AddStudentFormProps = {
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const AddStudentForm: React.FC<AddStudentFormProps> = ({
                                                    isOpen,
                                                    handleOpen,
                                                    handleSuccess,
                                                    submitButtonLabel = 'Ajouter',
                                                }) => {
    const form = useForm<CreateStudentDto>({
        resolver: zodResolver(createStudentSchema),
    })

    const { mutate, isPending } = useCreateStudent()

    function onSubmit(dto: CreateStudentDto) {
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
            drawerTitle="Nouvel étudiant"
            drawerDescription="Remplissez les informations demandées."
        >
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