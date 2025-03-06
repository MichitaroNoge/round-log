<template>
  <div class="container">
    <!-- 新しいラウンド作成フォーム -->
    <div class="card">
      <h3>⛳ 新しいラウンドを作成</h3>
      <label for="roundDate">📅 日付</label>
      <input type="date" v-model="newRoundDate" id="roundDate" class="input-field" />

      <label for="courseName">🏌️ コース名</label>
      <input
        type="text"
        v-model="newCourseName"
        id="courseName"
        placeholder="例: グリーンヒルズGC"
        class="input-field"
      />

      <button
        class="primary-button"
        @click="createNewRound"
        :disabled="!isFormValid"
        :class="{ disabled: !isFormValid }"
      >
        ラウンド作成
      </button>
    </div>

    <!-- 過去のラウンド一覧 -->
    <h3>📖 過去のラウンド</h3>
    <div v-if="uniqueRounds.length" class="round-list">
      <div
        v-for="round in uniqueRounds"
        :key="`${round.round_date}-${round.course_name}`"
        class="round-card"
      >
        <router-link
          :to="`/round/${round.id}/${round.round_date}/${round.course_name}`"
          class="round-link"
        >
          {{ round.round_date }} - {{ round.course_name }}
        </router-link>
        <button @click="deleteRound(round.round_date, round.course_name)" class="delete-button">
          🗑️
        </button>
      </div>
    </div>
    <p v-else>まだラウンドの記録がありません。</p>

    <!-- ログアウトボタン -->
    <footer>
      <button class="secondary-button" @click="logout">ログアウト</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../api/supabase'
import { useAuth } from '@/composables/useAuth'

const rounds = ref<any[]>([])
const newRoundDate = ref<string>('')
const newCourseName = ref<string>('')
const router = useRouter()
const { logout } = useAuth()

// 今日の日付をセットする
const setTodayDate = () => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  newRoundDate.value = `${yyyy}-${mm}-${dd}`
}

// ラウンド記録を取得する
const fetchRounds = async () => {
  try {
    const { data, error } = await supabase
      .from('golf_shots')
      .select('id, round_date, course_name')
      .order('round_date', { ascending: false })

    if (error) throw new Error(error.message)

    rounds.value = data
  } catch (err) {
    console.error('データ取得エラー:', (err as Error).message)
  }
}

// 初期処理
onMounted(() => {
  setTodayDate()
  fetchRounds()
})

// 重複データを取り除く
const uniqueRounds = computed(() => {
  const seen = new Set()
  return rounds.value.filter((round) => {
    const key = `${round.round_date}-${round.course_name}`
    if (!seen.has(key)) {
      seen.add(key)
      return true
    }
    return false
  })
})

// フォームの入力確認
const isFormValid = computed(() => newRoundDate.value && newCourseName.value.trim() !== '')

// 新しいラウンドを作成
const createNewRound = () => {
  if (!isFormValid.value) return alert('日付とコース名を入力してください')
  router.push(`/round/new/${newRoundDate.value}/${newCourseName.value.trim()}`)
}

// ラウンドを削除
const deleteRound = async (roundDate: Date, courseName: string) => {
  const confirmDelete = confirm('本当に削除しますか？')
  if (!confirmDelete) return

  try {
    const { error } = await supabase
      .from('golf_shots')
      .delete()
      .eq('round_date', roundDate)
      .eq('course_name', courseName)

    if (error) throw new Error(error.message)

    rounds.value = rounds.value.filter(
      (round) => !(round.round_date === roundDate && round.course_name === courseName),
    )
  } catch (err) {
    console.error('削除エラー:', (err as Error).message)
  }
}
</script>

<style scoped>
/* ベースデザイン */
.container {
  max-width: 700px;
  margin: auto;
  padding: 20px;
  text-align: center;
  font-family: 'Roboto', sans-serif;
}

/* カードスタイル */
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

h3 {
  color: #2c3e50;
  margin-bottom: 16px;
}

/* 入力フィールド */
label {
  display: block;
  text-align: left;
  margin: 8px 0;
  font-weight: bold;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  max-width: 400px; /* 入力フィールドの幅を調整 */
  margin-left: auto;
  margin-right: auto;
}

/* ボタン */
.primary-button,
.secondary-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.primary-button {
  background-color: #4caf50;
  color: white;
}

.primary-button:hover {
  background-color: #45a049;
}

.secondary-button {
  background-color: #4682b4; /* 控えめな青色 */
  color: white;
}

.secondary-button:hover {
  background-color: #4169e1; /* さらに濃い青 */
}

.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* ラウンド一覧 */
.round-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.round-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.round-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: bold;
}

.round-link:hover {
  text-decoration: underline;
}

/* 削除ボタン */
.delete-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* フッター */
footer {
  margin-top: 32px;
}
</style>
