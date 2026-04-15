import type { Case } from '@/types/task'

interface ParsedTask {
  type: 'work' | 'personal'
  title: string
  notes: string | null
  due_date: string | null
  priority: 'urgent' | 'normal' | 'low'
  court: string | null
  case_name: string | null
}

function buildSystemPrompt(cases: Case[]): string {
  const casesJson = JSON.stringify(
    cases.map((c) => ({ id: c.id, name: c.case_name, number: c.case_number }))
  )
  return `אתה עוזר לעורך דין לנהל משימות. קרא את ההודעה ופרש אותה ל-JSON בלבד.
פורמט חובה:
{
  "type": "work" | "personal",
  "title": "כותרת המשימה",
  "notes": "הערות נוספות" | null,
  "due_date": "YYYY-MM-DD" | null,
  "priority": "urgent" | "normal" | "low",
  "court": "שם בית המשפט" | null,
  "case_name": "שם תיק" | null
}
תיקים קיימים: ${casesJson}
התאמה חלקית של שם תיק מותרת.
השב אך ורק ב-JSON תקין, ללא הסברים נוספים.`
}

export async function parseTaskFromMessage(text: string, cases: Case[]): Promise<ParsedTask> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        systemInstruction: { parts: [{ text: buildSystemPrompt(cases) }] },
        generationConfig: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

  try {
    const parsed = JSON.parse(jsonText)
    return {
      type: parsed.type === 'personal' ? 'personal' : 'work',
      title: String(parsed.title || 'משימה חדשה'),
      notes: parsed.notes ?? null,
      due_date: parsed.due_date ?? null,
      priority: ['urgent', 'normal', 'low'].includes(parsed.priority) ? parsed.priority : 'normal',
      court: parsed.court ?? null,
      case_name: parsed.case_name ?? null,
    }
  } catch {
    throw new Error('Failed to parse Gemini response')
  }
}
