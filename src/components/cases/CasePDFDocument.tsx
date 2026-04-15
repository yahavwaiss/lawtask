import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { formatDate, formatDateTime } from '@/lib/utils/date'
import { PRIORITY_LABEL } from '@/lib/constants'

// Register Heebo font for Hebrew support
// Font file should be placed at public/fonts/Heebo-Regular.ttf
// Fallback: uses built-in Helvetica (Hebrew may not render correctly without font)
try {
  Font.register({
    family: 'Heebo',
    fonts: [
      { src: '/fonts/Heebo-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/Heebo-Bold.ttf', fontWeight: 700 },
    ],
  })
} catch {
  // Font not found — will fall back to default
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Heebo',
    direction: 'rtl' as never,
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottom: '2px solid #1B3A6B',
    paddingBottom: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1B3A6B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1B3A6B',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1px solid #E5E7EB',
  },
  taskCard: {
    border: '1px solid #E5E7EB',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  taskTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  taskNotes: {
    fontSize: 9,
    color: '#374151',
    marginTop: 4,
    fontStyle: 'italic',
  },
  update: {
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    padding: 6,
    marginTop: 4,
  },
  updateDate: {
    fontSize: 8,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  updateContent: {
    fontSize: 9,
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 8,
  },
})

interface PDFTask {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  notes: string | null
  completed_at: string | null
  completion_notes: string | null
  task_updates?: { id: string; content: string; created_at: string }[]
}

interface PDFCase {
  case_number: string
  case_name: string
  court: string | null
  created_at: string
  tasks?: PDFTask[]
}

export function CasePDFDocument({ caseData }: { caseData: PDFCase }) {
  const activeTasks = caseData.tasks?.filter((t) => t.status === 'pending') ?? []
  const completedTasks = caseData.tasks?.filter((t) => t.status === 'completed') ?? []

  const renderTask = (task: PDFTask) => (
    <View key={task.id} style={styles.taskCard}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskMeta}>
        עדיפות: {PRIORITY_LABEL[task.priority] ?? task.priority}
        {task.due_date && ` | תאריך: ${formatDate(task.due_date)}`}
        {task.status === 'completed' && task.completed_at && ` | הושלם: ${formatDate(task.completed_at)}`}
      </Text>
      {task.notes && (
        <Text style={styles.taskNotes}>הערות: {task.notes}</Text>
      )}
      {task.completion_notes && (
        <Text style={styles.taskNotes}>הערות ביצוע: {task.completion_notes}</Text>
      )}
      {task.task_updates && task.task_updates.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', marginBottom: 3 }}>עדכונים:</Text>
          {task.task_updates.map((u) => (
            <View key={u.id} style={styles.update}>
              <Text style={styles.updateDate}>{formatDateTime(u.created_at)}</Text>
              <Text style={styles.updateContent}>{u.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )

  return (
    <Document title={`תיק: ${caseData.case_name}`} author="LawTask">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{caseData.case_name}</Text>
          <Text style={styles.subtitle}>
            מספר הליך: {caseData.case_number}
            {caseData.court && ` | בית משפט: ${caseData.court}`}
          </Text>
          <Text style={[styles.subtitle, { marginTop: 2 }]}>
            נוצר: {formatDate(caseData.created_at)} | יוצא: {formatDate(new Date().toISOString())}
          </Text>
        </View>

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>משימות פעילות ({activeTasks.length})</Text>
            {activeTasks.map(renderTask)}
          </View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>משימות שהושלמו ({completedTasks.length})</Text>
            {completedTasks.map(renderTask)}
          </View>
        )}

        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <Text style={{ color: '#6B7280', fontSize: 10 }}>אין משימות בתיק זה</Text>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          LawTask — מערכת ניהול משימות משפטיות | הופק אוטומטית
        </Text>
      </Page>
    </Document>
  )
}
