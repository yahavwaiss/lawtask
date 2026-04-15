import { TaskList } from '@/components/tasks/TaskList'

export default function TasksPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-primary">📋 כל המשימות</h1>
        <p className="text-app-secondary text-sm mt-1">כל המשימות הפעילות שלך</p>
      </div>
      <TaskList showFilters />
    </div>
  )
}
