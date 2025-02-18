<template>
  <div>
    <div>
      <label for="roundDate">日付:</label>
      <input type="date" v-model="newRoundDate" id="roundDate" />

      <label for="courseName">コース名:</label>
      <input type="text" v-model="newCourseName" id="courseName" />

      <button
        class="enabled-button"
        @click="createNewRound"
        :disabled="!isFormValid"
        :class="{ 'disabled-button': !isFormValid }"
      >
        新しいラウンド作成
      </button>
    </div>

    <h3>過去のラウンド</h3>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const rounds = ref<any[]>([])
const uniqueRounds = ref<any[]>([])
const newRoundDate = ref<string>('')
const newCourseName = ref<string>('')
const router = useRouter()

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
    removeDuplicates()
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

// 重複データを取り除く（明細を全取得しているため）
const removeDuplicates = () => {
  const seen = new Set()
  uniqueRounds.value = rounds.value
    .filter((round) => {
      const key = `${round.round_date}-${round.course_name}`
      if (!seen.has(key)) {
        seen.add(key)
        return true
      }
      return false
    })
    .map((round) => ({
      id: round.id, // id を保持する
      round_date: round.round_date,
      course_name: round.course_name,
    }))
}

// 日付とコース名が両方とも入力されている場合にボタンを有効にする
const isFormValid = computed(() => {
  return newRoundDate.value && newCourseName.value.trim() !== ''
})

// 新しいラウンドを作成する
const createNewRound = async () => {
  if (!newCourseName.value) {
  }

  if (!newRoundDate.value || !newCourseName.value.trim()) {
    alert('日付とコース名を入力してください')
    return
  }

  // 作成したラウンドの詳細ページに遷移
  router.push(`/round/$0/${newRoundDate.value}/${newCourseName.value.trim()}`)
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
    rounds.value = rounds.value.filter((round) => round.roundDate !== roundDate)
    fetchRounds()
  } catch (err) {
    if (err instanceof Error) {
      console.error('削除エラー:', err.message)
    } else {
      console.error('不明なエラーが発生しました。')
    }
  }
}
</script>

<style>
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
</style>
