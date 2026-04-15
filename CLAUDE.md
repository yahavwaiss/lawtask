# LawTask

## Stack
Next.js 14.2.35 + TypeScript + Tailwind v3 + Supabase + Gemini 2.5 Flash + Telegram

## 🔴 אבטחה — קריטי
- **אסור NEXT_PUBLIC_** על: `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
- כל קריאה ל-API חיצוני — רק מ-`/app/api/*`
- כל Webhook/Cron — אימות secret לפני עיבוד
- DB כתיבה — `SERVICE_ROLE_KEY` בשרת בלבד
- **`getUser()` לא `getSession()`** ב-API routes

## 🎨 Dark Mode
- `darkMode: 'class'` ב-Tailwind
- CSS variables (`--bg-primary`, `--bg-card`, ...) ב-globals.css
- כפתור toggle בפינה שמאלית תחתונה של ה-sidebar
- `suppressHydrationWarning` על `<html>` חובה

## 🌐 RTL
- `dir="rtl"` על `<html>`
- כל layout מימין לשמאל
- FAB: פינה שמאל-תחתון (`bottom-4 left-4`)
- שפת ממשק: עברית מלאה

## 📅 תאריכים
- DB: ISO (`YYYY-MM-DD`)
- תצוגה: `DD.MM.YY` (formatDate)
- קלט משתמש: `15.5.26` → parseDisplayDate → `2026-05-15`

## 📁 מבנה Supabase Clients
- Server Components / Route Handlers → `src/lib/supabase/server.ts` (createClient)
- Client Components → `src/lib/supabase/client.ts` (createClient)
- middleware.ts → `src/lib/supabase/middleware.ts` (createClient)
- Telegram bot / service operations → `createServiceClient()` מ-`server.ts`

## ⚠️ מלכודות
- `@react-pdf/renderer` דורש `serverExternalPackages` ב-`next.config.ts`
- Telegram bot: `polling: false` בלבד (serverless!)
- Vercel crons ב-UTC — ישראל UTC+3 (קיץ)
- Tailwind v3 — לא v4
- Hebrew PDF: חייב Font.register עם Heebo TTF ב-`public/fonts/`

## 🗂️ DB Schema (Supabase SQL)
```sql
-- הרץ ב-Supabase SQL Editor:
CREATE TABLE cases (...);
CREATE TABLE tasks (...);
CREATE TABLE task_updates (...);
CREATE TABLE profiles (...);
CREATE TABLE telegram_sessions (...);
-- ראה schema מלא בסוף הקובץ הזה
```

## 🚀 Deploy Checklist
1. הוסף כל env vars ל-Vercel Settings
2. הרץ SQL migrations ב-Supabase SQL Editor
3. רשום Telegram webhook:
   ```
   POST https://api.telegram.org/bot{TOKEN}/setWebhook
   body: { url: "https://lawtask.vercel.app/api/telegram/webhook", secret_token: "TELEGRAM_WEBHOOK_SECRET" }
   ```
4. וודא `vercel.json` committed עם cron definitions

## 📊 SQL Schema מלא
```sql
CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_number text NOT NULL,
  case_name text NOT NULL,
  court text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, case_number)
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('work', 'personal')),
  title text NOT NULL,
  notes text,
  due_date date,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'low')),
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  court text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at timestamptz,
  completion_notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE task_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_chat_id text,
  telegram_link_code text,
  telegram_link_code_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE telegram_sessions (
  chat_id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  state jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_cases"    ON cases           FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_tasks"    ON tasks           FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_updates"  ON task_updates    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_profile"  ON profiles        FOR ALL TO authenticated USING (auth.uid() = id)      WITH CHECK (auth.uid() = id);
CREATE POLICY "service_only" ON telegram_sessions FOR ALL TO service_role USING (true);
```
