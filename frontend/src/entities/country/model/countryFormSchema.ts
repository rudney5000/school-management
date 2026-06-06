import { z } from 'zod'

export const countryFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(2).max(3, 'Code must be 2-3 characters').toUpperCase(),
})

export type CountryFormValues = z.infer<typeof countryFormSchema>