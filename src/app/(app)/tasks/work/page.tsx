import { TaskList } from '@/components/tasks/TaskList'

export default function WorkTasksPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-primary">💼 משימות עבודה</h1>
        <p className="text-app-secondary text-sm mt-1">משימות הקשורות לתיקי בית משפט</p>
      </div>
      <TaskList defaultType="work" showFilters />
    </div>
  )
}
