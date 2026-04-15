import type { Tables } from './database'

export type Task = Tables<'tasks'> & {
  cases?: {
    id: string
    case_number: string
    case_name: string
    court: string | null
  } | null
  task_updates?: Tables<'task_updates'>[]
}

export type Case = Tables<'cases'>
export type TaskUpdate = Tables<'task_updates'>
