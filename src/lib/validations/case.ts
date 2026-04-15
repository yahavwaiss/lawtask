import { z } from 'zod'
import { CASE_NUMBER_REGEX } from '@/lib/constants'

export const CreateCaseSchema = z.object({
  case_number: z
    .string()
    .regex(CASE_NUMBER_REGEX, 'מספר הליך חייב להיות בפורמט xxx-xx-xx'),
  case_name: z.string().min(1, 'שם תיק נדרש').max(255),
  court: z.string().max(255).optional().nullable(),
})

export const UpdateCaseSchema = CreateCaseSchema.partial()

export type CreateCaseInput = z.infer<typeof CreateCaseSchema>
export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>
