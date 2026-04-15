import { TaskList } from '@/components/tasks/TaskList'

export default function ArchivePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-primary">📦 ארכיון</h1>
        <p className="text-app-secondary text-sm mt-1">משימות שהושלמו</p>
      </div>
      <TaskList showFilters showArchived />
    </div>
  )
}
