import { TaskList } from '@/components/tasks/TaskList'

export default function PersonalTasksPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-primary">👤 משימות אישיות</h1>
        <p className="text-app-secondary text-sm mt-1">המשימות האישיות שלך</p>
      </div>
      <TaskList defaultType="personal" showFilters />
    </div>
  )
}
