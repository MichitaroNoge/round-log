<template>
  <div class="container">
    <h2 class="animate__animated animate__bounce">Round Log</h2>

    <router-link to="/">戻る</router-link>

    <div class="score-input">
      <HoleSelector
        :holeNumber="holeNumber"
        :min="1"
        :max="18"
        :disabled="isEditing"
        @update:holeNumber="updateHole"
      />

      <h2>{{ currentShotCount }}打目</h2>

      <label>クラブ: </label>
      <ClubSelector :clubs="clubs" :selectedClub="selectedClub" :selectClub="selectClub" />

      <label>結果: </label>
      <ResultSelector
        :results="results"
        :selectedResult="selectedResult"
        @update:selectedResult="updateSelectedResult"
      />

      <label>状況: </label>
      <ConditionSelector
        :filteredConditions="filteredConditions"
        :selectedConditions="selectedConditions"
        :conditionsList="conditionsList"
        @update:selectedConditions="selectedConditions = $event"
      />

      <button class="add-btn" @click="handleClick">
        {{ isEditing ? '更新' : '追加' }}
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
    <h3
      class="animationClass"
      :class="{ 'animate__animated animate__bounce': isBouncing }"
      @animationend="isBouncing = false"
    >
      トータルスコア: {{ totalScore }}
    </h3>
    <h4>パット数: {{ totalPTCount }}</h4>
    <h4>バンカーショット数: {{ totalBunkerShots }}</h4>
    <table>
      <thead>
        <tr>
          <th>ホール</th>
          <th>打数</th>
          <th>詳細</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(shots, hole) in scores" :key="hole">
          <td>{{ hole }}</td>
          <td>{{ shots.length }}</td>
          <td>
            <ul>
              <li
                v-for="(shot, index) in shots.sort((a, b) => a.shot_number - b.shot_number)"
                :key="index"
                class="shot-details"
              >
                <span>{{ index + 1 }}打目: {{ shot.club }} - {{ shot.result }}</span>
                <br />
                <small>状況: {{ shot.conditions.join(', ') || 'なし' }}</small>
                <br />
                <div class="button-column">
                  <button class="edit-btn" @click="editShot(hole, index, shot)">変更</button>
                  <button class="delete-btn" @click="deleteShot(hole, index)">削除</button>
                </div>
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'
import { useRoute } from 'vue-router'
import ClubSelector from '../components/ClubSelector.vue'
import HoleSelector from '../components/HoleSelector.vue'
import ConditionSelector from '../components/ConditionSelector.vue'
import ResultSelector from '../components/ResultSelector.vue'

interface Shot {
  round_date: string
  course_name: string
  shot_number: number
  club: string
  result: string
  conditions: string[]
}

// 現在の状態管理
const route = useRoute()
const selectedRoundDate = route.params.roundDate
const selectedCourseName = route.params.courseName
const holeNumber = ref<number>(1)
const selectedResult = ref<string>('')
const selectedConditions = ref<string[]>([])
const scores = ref<Record<number, Shot[]>>({})
const isEditing = ref<boolean>(false) // 変更モードかどうかを表すフラグ
const isBouncing = ref(false) // ラベルのアニメーション適用フラグ
const editingHole = ref<number | null>(null)
const editingIndex = ref<number | null>(null)
const errorMessage = ref<string>('') // エラーメッセージの状態管理
const successMessage = ref<string>('') // 成功メッセージの状態管理

onMounted(async () => {
  await Promise.all([fetchClubs(), fetchConditionsList(), createOrLoadRound()])
})

// 一覧の表示内容を更新
const updateSelectedResult = (newResult: string) => {
  selectedResult.value = newResult
}

// HoleSelectorから受け取った値を更新
const updateHole = (newHoleNumber: number) => {
  holeNumber.value = newHoleNumber
}

//追加(更新)ボタン押下時のイベント
const handleClick = async () => {
  isBouncing.value = false
  await nextTick() // レンダリング後にアニメーションを再適用
  isBouncing.value = true

  if (isEditing.value) {
    updateShot()
  } else {
    addShot()
  }
}

// ラウンドの作成・ロード
const createOrLoadRound = async () => {
  const { data, error } = await supabase
    .from('golf_shots')
    .select('*')
    .match({ round_date: selectedRoundDate, course_name: selectedCourseName })

  if (error) {
    handleError(`データの取得に失敗しました: ${error.message}`)
    return
  }

  if (data.length > 0) {
    // 既存のラウンドデータが存在する場合
    organizeShots(data)
  } else {
    // 新しいラウンド作成
    scores.value = {}
  }
}

// データ整形
const organizeShots = (data: any[]) => {
  const organizedScores: Record<number, Shot[]> = {}
  data.forEach((shot) => {
    if (!organizedScores[shot.hole_number]) {
      organizedScores[shot.hole_number] = []
    }
    organizedScores[shot.hole_number].push({
      round_date: selectedRoundDate[0],
      course_name: selectedCourseName[0],
      shot_number: shot.shot_number,
      club: shot.club,
      result: shot.result,
      conditions: shot.conditions,
    })
  })
  scores.value = organizedScores
}

// Supabaseにデータを保存
const saveShotToSupabase = async (shot: Shot) => {
  const { error } = await supabase.from('golf_shots').insert([
    {
      round_date: selectedRoundDate,
      course_name: selectedCourseName,
      hole_number: holeNumber.value,
      shot_number: currentShotCount.value,
      club: shot.club,
      result: shot.result,
      conditions: shot.conditions,
    },
  ])

  if (error) {
    handleError(`保存に失敗しました: ${error.message}`)
    return false
  } else {
    return true
  }
}

const handleError = (message: string) => {
  errorMessage.value = message
  console.error(message)
}

// Supabaseからデータを削除
const deleteShotFromSupabase = async (hole: number, shotNumber: number) => {
  const { error } = await supabase
    .from('golf_shots')
    .delete()
    .match({ round_date: selectedRoundDate, hole_number: hole, shot_number: shotNumber })

  if (error) {
    handleError(`保存に失敗しました: ${error.message}`)
    return false
  } else {
    return true
  }
}

// Supabase内のショット番号を更新（削除後の整合性維持）
const updateShotNumbersInSupabase = async (hole: number) => {
  if (!scores.value[hole]) return

  for (let i = 0; i < scores.value[hole].length; i++) {
    const shotNumber = i + 1
    const { error } = await supabase.from('golf_shots').update({ shot_number: shotNumber }).match({
      hole_number: hole,
      club: scores.value[hole][i].club,
      result: scores.value[hole][i].result,
    })

    if (error) {
      handleError(`ショット番号の更新に失敗しました: ${error.message}`)
    }
  }
}

//クラブのリスト
const clubs = ref<string[]>([])
const selectedClub = ref<string>('')
// クラブリストを取得する
const fetchClubs = async () => {
  const { data, error } = await supabase.from('golf_clubs').select('name')

  if (error) {
    console.error('クラブリストの取得に失敗しました:', error.message)
    return
  }

  clubs.value = data.map((club) => club.name)
}

// クラブを選択する
const selectClub = (club: string) => {
  selectedClub.value = club
}

// 結果のリスト
const results = [
  { label: '〇（Good）', value: '〇' },
  { label: '△（普通）', value: '△' },
  { label: '×（ミス）', value: '×' },
]

// 状況リスト
const conditionsList = ref<{ name: string; groupId: string }[]>([])
// 状況リストを取得する
const fetchConditionsList = async () => {
  const { data, error } = await supabase.from('conditionsList').select('name, groupId')

  if (error) {
    console.error('状況リストの取得に失敗しました:', error.message)
    return
  }

  conditionsList.value = data.map((condition) => ({
    name: condition.name,
    groupId: condition.groupId,
  }))
}

// フィルタリング後の状況リスト
const filteredConditions = computed<string[]>(() => {
  if (selectedClub.value === 'PT') {
    return ['ショートパッド', 'ミドルパッド', 'ロングパッド'] // パター時の条件
  }

  if (currentShotCount.value === 1) {
    return ['池越え', '谷越え', 'ブラインド', '打ち上げ', '打ち下ろし'] // 1打目の条件
  }

  return conditionsList.value
    .filter(
      (condition) => !['ショートパッド', 'ミドルパッド', 'ロングパッド'].includes(condition.name),
    )
    .map((condition) => condition.name)
})

// トータルスコア
const totalScore = computed<number>(() => {
  return Object.values(scores.value).reduce((sum, shots) => sum + shots.length, 0)
})

// トータルパット数
const totalPTCount = computed<number>(() => {
  return Object.values(scores.value)
    .flat()
    .filter((shot) => shot.club === 'PT').length
})

// トータルバンカーショット数
const totalBunkerShots = computed<number>(() => {
  return Object.values(scores.value)
    .flat()
    .filter((shot) => shot.conditions.includes('バンカー')).length
})

const currentShotCount = computed<number>(() => {
  return isEditing.value
    ? (editingIndex.value ?? 0) + 1
    : (scores.value[holeNumber.value]?.length || 0) + 1
})

const validateShot = () => {
  if (!selectedClub.value) {
    errorMessage.value = 'クラブを選択してください。'
    return false
  }
  if (!selectedResult.value) {
    errorMessage.value = '結果を選択してください。'
    return false
  }
  errorMessage.value = ''
  return true
}

const addShot = async () => {
  if (!validateShot()) return
  const newShot: Shot = {
    round_date: selectedRoundDate[0],
    course_name: selectedCourseName[0],
    shot_number: currentShotCount.value,
    club: selectedClub.value,
    result: selectedResult.value,
    conditions: [...selectedConditions.value],
  }

  const success = await saveShotToSupabase(newShot)
  if (!success) return

  if (!scores.value[holeNumber.value]) {
    scores.value[holeNumber.value] = []
  }
  scores.value[holeNumber.value].push(newShot)
  resetSelection()
}

const editShot = (hole: number, index: number, shot: Shot) => {
  holeNumber.value = hole
  selectedClub.value = shot.club
  selectedResult.value = shot.result
  selectedConditions.value = [...shot.conditions]
  isEditing.value = true
  editingHole.value = hole
  editingIndex.value = index
}

const updateShot = async () => {
  if (!validateShot()) return

  if (editingHole.value !== null && editingIndex.value !== null) {
    // ローカルのスコア更新
    const updatedShot: Shot = {
      round_date: selectedRoundDate[0],
      course_name: selectedCourseName[0],
      shot_number: currentShotCount.value,
      club: selectedClub.value,
      result: selectedResult.value,
      conditions: [...selectedConditions.value],
    }
    scores.value[editingHole.value][editingIndex.value] = updatedShot

    // Supabaseのデータ更新
    const shotNumber = editingIndex.value + 1
    const { error } = await supabase
      .from('golf_shots')
      .update({
        club: selectedClub.value,
        result: selectedResult.value,
        conditions: selectedConditions.value,
      })
      .match({
        hole_number: editingHole.value,
        shot_number: shotNumber,
      })

    if (error) {
      handleError(`更新に失敗しました: ${error.message}`)
    } else {
      resetEditing() // 編集モードをリセット
    }
  }
}

const resetEditing = () => {
  isEditing.value = false
  editingHole.value = null
  editingIndex.value = null
  selectedClub.value = clubs.value[0] || '1W'
  selectedResult.value = '〇'
  selectedConditions.value = []
}

const resetSelection = () => {
  selectedClub.value = ''
  selectedResult.value = ''
  selectedConditions.value = []
}

const deleteShot = async (hole: number, index: number) => {
  const shotNumber = index + 1

  const success = await deleteShotFromSupabase(hole, shotNumber)
  if (!success) return

  // ローカルのscoresからデータを削除
  scores.value[hole].splice(index, 1)

  // そのホールにデータがない場合はホールごと削除
  if (scores.value[hole].length === 0) {
    delete scores.value[hole]
  }

  // 残っているショットの番号を更新する
  await updateShotNumbersInSupabase(hole)
}
</script>

<style>
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
.shot-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.button-column {
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-left: 10px;
}
.score-input {
  margin-bottom: 20px;
}
.hole-selector {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
}
.hole-selector input {
  font-size: 24px;
}
.hole-selector button {
  padding: 5px 15px;
  font-size: 16px;
  cursor: pointer;
}
input[type='number'] {
  width: 50px;
  text-align: center;
  padding: 5px;
}
.button-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
  margin: 10px 0;
}
button {
  padding: 8px 15px;
  border: 1px solid #ccc;
  cursor: pointer;
  background-color: white;
  border-radius: 5px;
}
button.selected {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}
button.add-btn {
  background-color: #008cba;
  color: white;
  border: none;
}
h2 {
  margin: 10px 0;
}
h3 {
  margin: 10px 0;
}
h4 {
  margin: 0px 0;
}
.edit-btn {
  background-color: hsl(135, 69%, 42%);
  color: white;
  border: none;
}
.delete-btn {
  background-color: #62757c;
  color: white;
  border: none;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #000; /* 罫線を追加 */
  padding: 1px;
  text-align: center;
}

.error-message {
  color: red;
  font-weight: bold;
  font-size: 14px;
}

.success-message {
  color: green;
  font-weight: bold;
}
</style>
