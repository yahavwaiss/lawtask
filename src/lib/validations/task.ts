import { z } from 'zod'

export const CreateTaskSchema = z.object({
  type: z.enum(['work', 'personal']),
  title: z.string().min(1, 'כותרת נדרשת').max(255),
  notes: z.string().max(5000).optional().nullable(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין')
    .optional()
    .nullable(),
  priority: z.enum(['urgent', 'normal', 'low']).default('normal'),
  case_id: z.string().uuid().optional().nullable(),
  court: z.string().max(255).optional().nullable(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial()

export const CompleteTaskSchema = z.object({
  completion_notes: z.string().max(5000).optional().nullable(),
})

export const CreateUpdateSchema = z.object({
  content: z.string().min(1, 'תוכן נדרש').max(5000),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type CompleteTaskInput = z.infer<typeof CompleteTaskSchema>
export type CreateUpdateInput = z.infer<typeof CreateUpdateSchema>
