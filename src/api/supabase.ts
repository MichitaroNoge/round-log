// src/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 環境変数または直接記述でURLとAPIキーを設定
const supabaseUrl = 'https://mytblvsmcftktqbnaikc.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15dGJsdnNtY2Z0a3RxYm5haWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NDEwNTcsImV4cCI6MjA1NDQxNzA1N30.6MdzWoj65LwRXI4CmYd8E5-W3dNnAi7_4QboAvOyPnc'

export const supabase = createClient(supabaseUrl, supabaseKey)
