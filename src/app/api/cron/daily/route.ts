import { NextResponse } from 'next/server'
import { runDailyCron } from '@/lib/cron/daily'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await runDailyCron()
    return NextResponse.json({ ok: true, message: 'Daily cron completed' })
  } catch (err) {
    console.error('Daily cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
