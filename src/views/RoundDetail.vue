<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../api/supabase'
import { useRoute } from 'vue-router'
import ClubSelector from '../components/ClubSelector.vue'
import HoleSelector from '../components/HoleSelector.vue'
import ConditionSelector from '../components/ConditionSelector.vue'
import ResultSelector from '../components/ResultSelector.vue'
import DetailResultSelector from '@/components/DetailResultSelector.vue'
import ShotHistory from '@/components/ShotHistory.vue'

interface Shot {
  user_id: string
  round_date: string
  course_name: string
  hole_number: number
  shot_number: number
  club: string
  result: string
  detailResults: string[]
  conditions: string[]
}

// 現在の状態を保持する変数
const route = useRoute()
const selectedRoundDate = Array.isArray(route.params.roundDate)
  ? route.params.roundDate[0]
  : route.params.roundDate // パラメーターの値を取得する
const selectedCourseName = Array.isArray(route.params.courseName)
  ? route.params.courseName[0]
  : route.params.courseName // パラメーターの値を取得する
const userId = ref<string>('')
const resultList = ref<string[]>([]) // 結果のリスト
const detailResultList = ref<string[]>([]) // 結果(詳細)のリスト

const selectedHoleNumber = ref<number>(1) // 選択しているホールナンバー
const selectedResult = ref<string>('') // 選択している結果
const selectedDetailResults = ref<string[]>([]) // 選択している結果(詳細)のリスト
const selectedConditions = ref<string[]>([]) // 選択している状況

const scores = ref<Record<number, Shot[]>>({}) // スコアのデータレコード

const isEditing = ref<boolean>(false) // 変更モードかどうかを表すフラグ
const isBouncing = ref(false) // ラベルのアニメーション適用フラグ
const editingHole = ref<number | null>(null)
const editingIndex = ref<number | null>(null)
const errorMessage = ref<string>('') // エラーメッセージの状態管理
const successMessage = ref<string>('') // 成功メッセージの状態管理

onMounted(async () => {
  const { data: user } = await supabase.auth.getUser()
  if (!user || !user.user) {
    handleError('ユーザー情報が取得できません')
    return
  }
  userId.value = user.user.id
  try {
    await fetchData()
  } catch (error) {
    handleError(`データの取得に失敗しました: ${(error as Error).message}`)
  }
})

const fetchData = async () => {
  await Promise.all([
    fetchClubs(),
    fetchConditionsList(),
    createOrLoadRound(),
    fetchResultList(),
    fetchDetailResultList(),
  ])
}

// HoleSelectorから受け取った値を更新
const updateHole = (newHoleNumber: number) => {
  selectedHoleNumber.value = newHoleNumber
}

// 追加(更新)ボタン押下時のイベント
const handleClick = async () => {
  // isBouncing.value = false
  // isBouncing.value = true

  if (isEditing.value) {
    updateShot()
  } else {
    addShot()
  }
}

// キャンセルボタン押下時のイベント
const handleCancel = () => {
  // キャンセルの処理
  isEditing.value = false
  resetSelection()
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
    // hole_number → shot_number の昇順でソートしてから整理
    const sortedData = data.sort((a, b) => {
      if (a.hole_number === b.hole_number) {
        return a.shot_number - b.shot_number
      }
      return a.hole_number - b.hole_number
    })
    organizeShots(sortedData)
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
      user_id: userId.value,
      round_date: selectedRoundDate,
      course_name: selectedCourseName,
      hole_number: shot.hole_number,
      shot_number: shot.shot_number,
      club: shot.club,
      result: shot.result,
      detailResults: shot.detailResults,
      conditions: shot.conditions,
    })
  })
  scores.value = organizedScores

  console.log('scores')
  console.log(scores)
}

// Supabaseにデータを保存
const saveShotToSupabase = async (shot: Shot) => {
  const { error } = await supabase.from('golf_shots').insert([
    {
      user_id: userId.value,
      round_date: selectedRoundDate,
      course_name: selectedCourseName,
      hole_number: shot.hole_number,
      shot_number: shot.shot_number,
      club: shot.club,
      result: shot.result,
      detailResults: shot.detailResults,
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
}

// Supabaseからデータを削除
const deleteShotFromSupabase = async (holeNumber: number, shotNumber: number) => {
  const { error } = await supabase
    .from('golf_shots')
    .delete()
    .match({ round_date: selectedRoundDate, hole_number: holeNumber, shot_number: shotNumber })

  if (error) {
    handleError(`保存に失敗しました: ${error.message}`)
    return false
  } else {
    return true
  }
}

// shot_numberを1からの連番で振りなおす
const updateShotNumbersInSupabase = async (holeNumber: number) => {
  // 1. 指定したhole_numberのレコードを取得 (shot_number順にソート)
  const { data: shots, error } = await supabase
    .from('golf_shots')
    .select('id, shot_number')
    .eq('hole_number', holeNumber)
    .order('shot_number', { ascending: true })

  if (error) throw error
  if (!shots || shots.length === 0) {
    console.log('該当レコードなし')
    return
  }

  // 2. 連番に更新
  for (let i = 0; i < shots.length; i++) {
    const { error: updateError } = await supabase
      .from('golf_shots')
      .update({ shot_number: i + 1 })
      .eq('id', shots[i].id)

    if (updateError) throw updateError
  }
}

//クラブのリスト
const clubs = ref<string[]>([])
const selectedClub = ref<string>('')
// クラブリストを取得する
const fetchClubs = async () => {
  const { data, error } = await supabase.from('golf_clubs').select('name')

  if (error) {
    return
  }

  clubs.value = data.map((club) => club.name)
}
// クラブを選択する
const selectClub = (club: string) => {
  selectedClub.value = club
}

// 結果リストを取得する
const fetchResultList = async () => {
  const { data, error } = await supabase.from('resultList').select('name')

  if (error) {
    return
  }

  resultList.value = data.map((result) => result.name)
}
// 結果を選択する
const selectResult = (result: string) => {
  selectedResult.value = result
}

// 結果リストを取得する
const fetchDetailResultList = async () => {
  const { data, error } = await supabase.from('detailResultList').select('name')

  if (error) {
    return
  }

  detailResultList.value = data.map((result) => result.name)
}

// 状況リスト
const conditionsList = ref<{ name: string; groupId: string }[]>([])
// 状況リストを取得する
const fetchConditionsList = async () => {
  const { data, error } = await supabase.from('conditionsList').select('name, groupId')

  if (error) {
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

// 現在の打数
const currentShotCount = computed<number>(() => {
  return isEditing.value
    ? (editingIndex.value ?? 0)
    : (scores.value[selectedHoleNumber.value]?.length || 0) + 1
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

// ショット履歴を追加する
const addShot = async () => {
  if (!validateShot()) return

  const newShot: Shot = {
    user_id: userId.value,
    round_date: selectedRoundDate,
    course_name: selectedCourseName,
    hole_number: selectedHoleNumber.value,
    shot_number: currentShotCount.value,
    club: selectedClub.value,
    result: selectedResult.value,
    detailResults: [...selectedDetailResults.value],
    conditions: [...selectedConditions.value],
  }

  const success = await saveShotToSupabase(newShot)
  if (!success) return

  if (!scores.value[selectedHoleNumber.value]) {
    scores.value[selectedHoleNumber.value] = []
  }
  scores.value[selectedHoleNumber.value].push(newShot)
  resetSelection()
}

// 明細の変更ボタン押下時
const editShot = (shot: Shot) => {
  console.log(shot)
  selectedHoleNumber.value = shot.hole_number
  selectedClub.value = shot.club
  selectedResult.value = shot.result
  selectedDetailResults.value = [...shot.detailResults]
  selectedConditions.value = [...shot.conditions]
  isEditing.value = true
  editingHole.value = shot.hole_number
  editingIndex.value = shot.shot_number
}

// ショット履歴を更新する
const updateShot = async () => {
  if (!validateShot()) return

  if (editingHole.value !== null && editingIndex.value !== null) {
    // Supabaseのデータ更新
    const shotNumber = editingIndex.value
    console.log(shotNumber)
    const { error } = await supabase
      .from('golf_shots')
      .update({
        club: selectedClub.value,
        result: selectedResult.value,
        detailResults: selectedDetailResults.value,
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
      resetSelection() // 選択状態を解除
      createOrLoadRound() // データを再取得
    }
  }
}

// 編集モードをリセットする
const resetEditing = () => {
  isEditing.value = false
  editingHole.value = null
  editingIndex.value = null
}

// 選択状態を解除
const resetSelection = () => {
  selectedClub.value = ''
  selectedResult.value = ''
  selectedDetailResults.value = []
  selectedConditions.value = []
}

// ショット履歴を削除する
const deleteShot = async (shot: Shot) => {
  const success = await deleteShotFromSupabase(shot.hole_number, shot.shot_number)
  if (!success) return

  // ローカルのscoresからデータを削除
  scores.value[shot.hole_number].splice(shot.shot_number, 1)

  // そのホールにデータがない場合はホールごと削除
  if (scores.value[shot.hole_number].length === 0) {
    delete scores.value[shot.hole_number]
    return
  }

  // ショットの番号を再番して更新する
  await updateShotNumbersInSupabase(shot.hole_number)

  // データを再取得する
  createOrLoadRound()
}
</script>

<template>
  <div class="container">
    <router-link to="/round-list">戻る</router-link>

    <div class="score-input">
      <HoleSelector
        :holeNumber="Number(selectedHoleNumber)"
        :min="1"
        :max="18"
        :disabled="isEditing"
        @update:holeNumber="updateHole"
      />

      <h2>{{ currentShotCount }}打目</h2>

      <div class="label-container">
        <label class="label-title">クラブ: </label>
        <ClubSelector :clubs="clubs" :selectedClub="selectedClub" :selectClub="selectClub" />
      </div>

      <div class="label-container">
        <label class="label-title">結果: </label>
        <ResultSelector
          :resultList="resultList"
          :selectedResult="selectedResult"
          :selectResult="selectResult"
        />
      </div>

      <div class="label-container">
        <label class="label-title">結果の詳細: </label>
        <DetailResultSelector
          :detailResultList="detailResultList"
          :selectedDetailResults="selectedDetailResults"
          @updateDetailResults="selectedDetailResults = $event"
        />
      </div>

      <div class="label-container">
        <label class="label-title">状況: </label>
        <ConditionSelector
          :filteredConditions="filteredConditions"
          :selectedConditions="selectedConditions"
          :conditionsList="conditionsList"
          @update:selectedConditions="selectedConditions = $event"
        />
      </div>
      <div class="button-container">
        <button class="button-add-edit-btn" @click="handleClick">
          {{ isEditing ? '更新' : '追加' }}
        </button>
        <button v-if="isEditing" class="button-cancel-btn" @click="handleCancel">キャンセル</button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>

    <h4
      class="animationClass"
      :class="{ 'animate__animated animate__bounce': isBouncing }"
      @animationend="isBouncing = false"
    >
      トータルスコア: {{ totalScore }}
    </h4>
    <h5>パット数: {{ totalPTCount }}</h5>
    <h5>バンカーショット数: {{ totalBunkerShots }}</h5>

    <ShotHistory :scores="scores" @edit-shot="editShot" @delete-shot="deleteShot" />
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  gap: 8px; /* ボタンの間に適度な間隔を追加 */
  justify-content: center; /* 横方向の中央配置 */
  align-items: center; /* 縦方向の中央配置 */
}
.container {
  max-width: 600px;
  margin: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none; /* テキスト選択を防止 */
  font-family: 'Roboto', sans-serif;
}
.score-input {
  margin-bottom: 20px;
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
.button-add-edit-btn,
.button-cancel-btn {
  color: white;
  border: none;
  width: 100px;
  height: 30px;
  font-size: 12px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
.button-add-edit-btn {
  background-color: hsl(253, 38%, 28%);
  color: white;
}
.button-cancel-btn {
  background-color: #f44336;
  color: white;
}
h2 {
  margin: 0px 0;
  font-family: 'Roboto', sans-serif;
}
h3 {
  margin: 0px 0;
  font-family: 'Roboto', sans-serif;
}
h4 {
  margin: 0px 0;
  font-family: 'Roboto', sans-serif;
}
h5 {
  margin: 0px 0;
  font-family: 'Roboto', sans-serif;
}

.label-container {
  display: flex;
  flex-direction: column;
  gap: 0px; /* ラベルとコンポーネントの間隔を狭める */
}
.label-title {
  margin-bottom: 0px;
  font-size: 10px;
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
.small-text {
  font-size: 12px; /* 文字サイズを小さくする */
}
</style>
