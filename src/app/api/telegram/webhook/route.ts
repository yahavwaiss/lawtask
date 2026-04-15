import { NextResponse } from 'next/server'
import { handleTelegramUpdate } from '@/lib/telegram/handlers'

export async function POST(request: Request) {
  // Validate secret token before any processing
  const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response('Forbidden', { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Process in background — Telegram expects 200 response quickly
  // We process inline here (serverless functions are short-lived)
  try {
    await handleTelegramUpdate(body as never)
  } catch (err) {
    console.error('Telegram webhook handler error:', err)
  }

  return NextResponse.json({ ok: true })
}
