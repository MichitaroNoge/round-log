// src/composables/useAuth.ts
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'

const isAuthenticated = ref(false)

export function useAuth() {
  const router = useRouter()
  const errorMessage = ref('')

  // セッション保存
  const saveSession = (session: any) => {
    if (session) localStorage.setItem('supabase_session', JSON.stringify(session))
  }

  // ログイン
  const login = async (email: string, password: string) => {
    errorMessage.value = ''
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      errorMessage.value = error.message
      return
    }

    if (data.session) {
      saveSession(data.session)
      isAuthenticated.value = true
      router.push('/round-list') // 成功時に遷移
    }
  }

  // サインアップ
  const signUp = async (email: string, password: string) => {
    errorMessage.value = ''
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      errorMessage.value = error.message
      isAuthenticated.value = false
      return
    }
    router.push('/round-list')
  }

  // 自動ログイン
  const autoLogin = async () => {
    const savedSession = localStorage.getItem('supabase_session')
    if (!savedSession) return

    const session = JSON.parse(savedSession)
    if (session.expires_at * 1000 < Date.now()) {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Session refresh failed:', error.message)
        localStorage.removeItem('supabase_session')
        isAuthenticated.value = false
        return
      }
      isAuthenticated.value = true
      saveSession(data.session)
    }

    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user) router.push('/round-list')
  }

  // ログアウト
  const logout = async () => {
    await supabase.auth.signOut()
    isAuthenticated.value = false
    localStorage.removeItem('supabase_session')
    router.push('/')
  }

  return { login, signUp, autoLogin, logout, errorMessage, isAuthenticated }
}
