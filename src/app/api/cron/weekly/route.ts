import { NextResponse } from 'next/server'
import { runWeeklyCron } from '@/lib/cron/weekly'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await runWeeklyCron()
    return NextResponse.json({ ok: true, message: 'Weekly cron completed' })
  } catch (err) {
    console.error('Weekly cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
