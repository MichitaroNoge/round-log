<template>
  <div class="container" @touchstart="startTouch" @touchmove="moveTouch" @touchend="endTouch">
    <h2 class="animate__animated animate__bounce">Round Log</h2>

    <div class="score-input">
      <div class="hole-selector">
        <button @click="prevHole">◀</button>
        <input type="number" v-model="holeNumber" min="1" max="18" />
        <label>H</label>
        <button @click="nextHole">▶</button>
      </div>

      <h2>{{ currentShotCount }}打目</h2>

      <label>クラブ: </label>
      <div class="button-group">
        <button
          v-for="club in clubs"
          :key="club"
          :class="{ selected: selectedClub === club }"
          @click="selectedClub = club"
        >
          {{ club }}
        </button>
      </div>

      <label>結果: </label>
      <div class="button-group">
        <button
          v-for="result in results"
          :key="result.value"
          :class="{ selected: selectedResult === result.value }"
          @click="selectedResult = result.value"
        >
          {{ result.label }}
        </button>
      </div>

      <label>状況: </label>
      <div class="button-group">
        <button
          v-for="condition in filteredConditions"
          :key="condition"
          :class="{ selected: selectedConditions.includes(condition) }"
          @click="toggleCondition(condition)"
        >
          {{ condition }}
        </button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <button class="add-btn" @click="isEditing ? updateShot() : addShot()">
        {{ isEditing ? '更新' : '追加' }}
      </button>
    </div>
    <h3 class="animationClass">トータルスコア: {{ totalScore }}</h3>
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
              <li v-for="(shot, index) in shots" :key="index" class="shot-details">
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from './supabase' // Supabaseクライアントをインポート

interface Shot {
  club: string
  result: string
  conditions: string[]
}

const holeNumber = ref<number>(1)
const selectedClub = ref<string>('')
const selectedResult = ref<string>('')
const selectedConditions = ref<string[]>([])
const scores = ref<Record<number, Shot[]>>({})
const isEditing = ref<boolean>(false)
const editingHole = ref<number | null>(null)
const editingIndex = ref<number | null>(null)
const errorMessage = ref<string>('') // エラーメッセージの状態管理
const successMessage = ref<string>('') // 成功メッセージの状態管理
let touchStartX = 0
let touchEndX = 0

// タッチ開始時のX座標を記録
const startTouch = (event: TouchEvent) => {
  touchStartX = event.touches[0].clientX
}

// タッチ移動時に現在のX座標を記録
const moveTouch = (event: TouchEvent) => {
  touchEndX = event.touches[0].clientX
}

// タッチ終了時にスワイプ方向を判定
const endTouch = () => {
  const swipeDistance = touchStartX - touchEndX

  if (swipeDistance > 50) {
    nextHole() // 左スワイプで次のホールへ
  } else if (swipeDistance < -50) {
    prevHole() // 右スワイプで前のホールへ
  }
}

// Supabaseからデータを取得する関数
const fetchShotsFromSupabase = async () => {
  const { data, error } = await supabase.from('golf_shots').select('*')

  if (error) {
    console.error('データ取得エラー:', error.message)
    errorMessage.value = `データの取得に失敗しました: ${error.message}`
    return
  }

  if (data) {
    const organizedScores: Record<number, Shot[]> = {}
    data.forEach((shot: any) => {
      if (!organizedScores[shot.hole_number]) {
        organizedScores[shot.hole_number] = []
      }
      organizedScores[shot.hole_number].push({
        club: shot.club,
        result: shot.result,
        conditions: shot.conditions,
      })
    })
    scores.value = organizedScores
    successMessage.value = ''
  }
}

onMounted(() => {
  fetchShotsFromSupabase()
})

// Supabaseにデータを保存
const saveShotToSupabase = async (shot: Shot) => {
  const { error } = await supabase.from('golf_shots').insert([
    {
      hole_number: holeNumber.value,
      shot_number: (scores.value[holeNumber.value]?.length || 0) + 1,
      club: shot.club,
      result: shot.result,
      conditions: shot.conditions,
    },
  ])

  if (error) {
    console.error('保存エラー:', error.message)
    errorMessage.value = `保存に失敗しました: ${error.message}`
    return false
  } else {
    successMessage.value = ''
    return true
  }
}

// Supabaseからデータを削除する関数
const deleteShotFromSupabase = async (hole: number, shotNumber: number) => {
  const { error } = await supabase
    .from('golf_shots')
    .delete()
    .match({ hole_number: hole, shot_number: shotNumber })

  if (error) {
    console.error('削除エラー:', error.message)
    errorMessage.value = `削除に失敗しました: ${error.message}`
    return false
  } else {
    successMessage.value = ''
    return true
  }
}

// Supabase内のショット番号を更新する関数（削除後の整合性維持）
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
      console.error('ショット番号更新エラー:', error.message)
      errorMessage.value = `ショット番号の更新に失敗しました: ${error.message}`
    }
  }
}

const clubs: string[] = [
  '1W',
  '3W',
  '5W',
  '4U',
  '5I',
  '6I',
  '7I',
  '8I',
  '9I',
  'PW',
  'AP',
  'AW',
  'SW',
  'PT',
]

const results = [
  { label: '〇（Good!!）', value: '〇' },
  { label: '△（普通）', value: '△' },
  { label: '×（ミス）', value: '×' },
]

const conditionsList: string[] = [
  'ラフ',
  'バンカー',
  'ベアグラウンド',
  '左足下がり',
  '右足下がり',
  'つま先下がり',
  'つま先上がり',
  '池越え',
  '谷越え',
  'バンカー越え',
  'ブラインド',
  '打ち上げ',
  '打ち下ろし',
  'ショートパッド',
  'ミドルパッド',
  'ロングパッド',
]

// 条件をフィルタリング
const filteredConditions = computed<string[]>(() => {
  if (selectedClub.value === 'PT') {
    return ['ショートパッド', 'ミドルパッド', 'ロングパッド'] // パター時の条件
  }

  if (currentShotCount.value === 1) {
    return ['池越え', '谷越え', 'ブラインド', '打ち上げ', '打ち下ろし'] // 1打目の条件
  }

  return conditionsList.filter(
    (condition) =>
      condition !== 'ショートパッド' &&
      condition !== 'ミドルパッド' &&
      condition !== 'ロングパッド',
  )
})

const currentShotCount = computed<number>(() => {
  return isEditing.value
    ? (editingIndex.value ?? 0) + 1
    : (scores.value[holeNumber.value]?.length || 0) + 1
})

const toggleCondition = (condition: string) => {
  // 1つしか選択できないグループを定義
  const exclusiveGroups = [
    ['左足下がり', '右足下がり'],
    ['つま先下がり', 'つま先上がり'],
    ['打ち上げ', '打ち下ろし'],
    ['ショートパッド', 'ミドルパッド', 'ロングパッド'],
  ]

  // すでに選択済みなら削除
  if (selectedConditions.value.includes(condition)) {
    selectedConditions.value = selectedConditions.value.filter((c) => c !== condition)
    return
  }

  // 排他グループの処理
  for (const group of exclusiveGroups) {
    if (group.includes(condition)) {
      // 同じグループ内の他の要素を削除する
      selectedConditions.value = selectedConditions.value.filter((c) => !group.includes(c))
      break
    }
  }

  // 新しい条件を追加
  selectedConditions.value.push(condition)
}

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

const updateShot = () => {
  if (!validateShot()) return

  if (editingHole.value !== null && editingIndex.value !== null) {
    scores.value[editingHole.value][editingIndex.value] = {
      club: selectedClub.value,
      result: selectedResult.value,
      conditions: [...selectedConditions.value],
    }
  }
  resetEditing()
}

const resetEditing = () => {
  isEditing.value = false
  editingHole.value = null
  editingIndex.value = null
  selectedClub.value = '1W'
  selectedResult.value = '〇'
  selectedConditions.value = []
}

const resetSelection = () => {
  selectedClub.value = ''
  selectedResult.value = ''
  selectedConditions.value = []
}

const prevHole = () => {
  holeNumber.value = holeNumber.value > 1 ? holeNumber.value - 1 : 18
}
const nextHole = () => {
  holeNumber.value = holeNumber.value < 18 ? holeNumber.value + 1 : 1
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

const totalScore = computed<number>(() => {
  return Object.values(scores.value).reduce((sum, shots) => sum + shots.length, 0)
})

const totalPTCount = computed<number>(() => {
  return Object.values(scores.value)
    .flat()
    .filter((shot) => shot.club === 'PT').length
})

const totalBunkerShots = computed<number>(() => {
  return Object.values(scores.value)
    .flat()
    .filter((shot) => shot.conditions.includes('バンカー')).length
})
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
  background-color: #ffa500;
  color: white;
  border: none;
}
.delete-btn {
  background-color: #ff4500;
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
  padding: 0px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
}

.error-message {
  color: red;
  font-weight: bold;
}

.error-message {
  color: red;
  font-weight: bold;
}

.success-message {
  color: green;
  font-weight: bold;
}
</style>
