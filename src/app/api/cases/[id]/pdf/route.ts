import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch case with tasks and updates
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select(`
      *,
      tasks (
        id, title, status, priority, due_date, type, notes,
        completed_at, completion_notes,
        task_updates (id, content, created_at)
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (caseError || !caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  // Dynamic import to avoid bundling issues
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { CasePDFDocument } = await import('@/components/cases/CasePDFDocument')
  const React = await import('react')

  // Supabase nested-select return type is not inferred — cast via any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfData = caseData as any
  const element = React.default.createElement(CasePDFDocument, { caseData: pdfData })
  const buffer = await renderToBuffer(element as never)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="case-${pdfData.case_number}.pdf"`,
    },
  })
}
