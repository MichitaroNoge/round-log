<template>
  <div class="container">
    <div>
      <h3>--新しいラウンドを作る--</h3>
      <label for="roundDate">日付:</label>
      <input type="date" v-model="newRoundDate" id="roundDate" />
    </div>

    <div>
      <label for="courseName">コース名:</label>
      <input type="text" v-model="newCourseName" id="courseName" />
    </div>
    <div>
      <button
        class="enabled-button"
        @click="createNewRound"
        :disabled="!isFormValid"
        :class="{ 'disabled-button': !isFormValid }"
      >
        ラウンド作成
      </button>
    </div>
    <p></p>
    <h3>--過去のラウンドを見る--</h3>
    <ul>
      <li v-for="round in uniqueRounds" :key="`${round.round_date}-${round.course_name}`">
        <router-link :to="`/round/${round.id}/${round.round_date}/${round.course_name}`">
          {{ round.round_date }} - {{ round.course_name }}
        </router-link>
        <button class="enabled-button" @click="deleteRound(round.round_date, round.course_name)">
          削除
        </button>
      </li>
    </ul>
    <footer>
      <button @click="logout">ログアウト</button>
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
    if (err instanceof Error) {
      console.error('データ取得エラー:', err.message)
    } else {
      console.error('不明なエラーが発生しました')
    }
  }
}

// mountedフックで処理を実行
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

// 日付とコース名が両方とも入力されている場合にボタンを有効にする
const isFormValid = computed(() => {
  return newRoundDate.value && newCourseName.value.trim() !== ''
})

// 新しいラウンドを作成する
const createNewRound = async () => {
  if (!isFormValid.value) {
    alert('日付とコース名を入力してください')
    return
  }

  // 作成したラウンドの詳細ページに遷移
  router.push(`/round/new/${newRoundDate.value}/${newCourseName.value.trim()}`)
}

// ラウンドを削除する
const deleteRound = async (roundDate: Date, courseName: string) => {
  try {
    const { error } = await supabase
      .from('golf_shots')
      .delete()
      .eq('round_date', roundDate)
      .eq('course_name', courseName)

    if (error) throw new Error(error.message)

    // 削除後にリストを更新
    rounds.value = rounds.value.filter(
      (round) => !(round.round_date === roundDate && round.course_name === courseName),
    )
  } catch (err) {
    console.error('削除エラー:', err instanceof Error ? err.message : '不明なエラー')
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none; /* テキスト選択を防止 */
  touch-action: pan-y; /* 垂直スクロールは許可、横スクロールはジェスチャーで制御 */
}

body {
  padding-top: 10px;
  padding-left: 20px;
}
.enabled-button {
  margin-left: 10px;
  background-color: #008cba;
  color: white;
  border: none;
}
.disabled-button {
  margin-left: 10px;
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  opacity: 0.6; /* 透明度を少し下げる */
  border: none;
}
footer {
  width: 100%;
  border-top: 2px solid #ccc; /* 横線の色と太さ */
  padding-top: 10px; /* 上側の余白 */
}
li {
  padding: 1px;
}
</style>
