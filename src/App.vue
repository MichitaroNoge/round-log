<template>
  <div class="container">
    <h1>ゴルフラウンド記録</h1>

    <div class="score-input">
      <label>ホール番号: </label>
      <div class="hole-selector">
        <button @click="prevHole">◀</button>
        <input type="number" v-model="holeNumber" min="1" max="18" />
        <button @click="nextHole">▶</button>
      </div>

      <h3>{{ currentShotCount }}打目</h3>

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

      <label>打席の状況: </label>
      <div class="button-group">
        <button
          v-for="condition in conditions"
          :key="condition"
          :class="{ selected: selectedConditions.includes(condition) }"
          @click="toggleCondition(condition)"
        >
          {{ condition }}
        </button>
      </div>

      <button class="add-btn" @click="isEditing ? updateShot() : addShot()">
        {{ isEditing ? '更新' : '追加' }}
      </button>
    </div>

    <h2>スコア一覧</h2>
    <table>
      <thead>
        <tr>
          <th>ホール</th>
          <th>ショット数</th>
          <th>詳細</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(shots, hole) in scores" :key="hole">
          <td>{{ hole }}</td>
          <td>{{ shots.length }}</td>
          <td>
            <ul>
              <li v-for="(shot, index) in shots" :key="index">
                <span>{{ index + 1 }}打目: {{ shot.club }} - {{ shot.result }}</span>
                <br />
                <small>状況: {{ shot.conditions.join(', ') || 'なし' }}</small>
                <br />
                <button class="edit-btn" @click="editShot(hole, index, shot)">編集</button>
                <button class="delete-btn" @click="deleteShot(hole, index)">削除</button>
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>

    <h3>合計スコア: {{ totalScore }}</h3>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const holeNumber = ref(1)
const selectedClub = ref('ドライバー')
const selectedResult = ref('〇')
const selectedConditions = ref([])
const scores = ref({})
const isEditing = ref(false)
const editingHole = ref(null)
const editingIndex = ref(null)

const clubs = ['1W', '3W', '5W', '4U', '5I', '6I', '7I', '8I', '9I', 'PW', 'AP', 'AW', 'SW', 'PT']

const results = [
  { label: '〇（成功）', value: '〇' },
  { label: '△（普通）', value: '△' },
  { label: '×（ミス）', value: '×' },
]

const conditions = [
  'フェアウェイ',
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
]

const currentShotCount = computed(() => {
  return isEditing.value
    ? editingIndex.value + 1
    : (scores.value[holeNumber.value]?.length || 0) + 1
})

const toggleCondition = (condition) => {
  if (selectedConditions.value.includes(condition)) {
    selectedConditions.value = selectedConditions.value.filter((c) => c !== condition)
  } else {
    selectedConditions.value.push(condition)
  }
}

const addShot = () => {
  if (!scores.value[holeNumber.value]) {
    scores.value[holeNumber.value] = []
  }
  scores.value[holeNumber.value].push({
    club: selectedClub.value,
    result: selectedResult.value,
    conditions: [...selectedConditions.value],
  })
  selectedConditions.value = []
}

const editShot = (hole, index, shot) => {
  holeNumber.value = hole
  selectedClub.value = shot.club
  selectedResult.value = shot.result
  selectedConditions.value = [...shot.conditions]

  isEditing.value = true
  editingHole.value = hole
  editingIndex.value = index
}

const updateShot = () => {
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
  selectedClub.value = 'ドライバー'
  selectedResult.value = '〇'
  selectedConditions.value = []
}

const prevHole = () => {
  if (holeNumber.value > 1) holeNumber.value--
}
const nextHole = () => {
  if (holeNumber.value < 18) holeNumber.value++
}

const deleteShot = (hole, index) => {
  scores.value[hole].splice(index, 1)
  if (scores.value[hole].length === 0) {
    delete scores.value[hole]
  }
}

const totalScore = computed(() => {
  return Object.values(scores.value).reduce((sum, shots) => sum + shots.length, 0)
})
</script>

<style>
.container {
  max-width: 600px;
  margin: auto;
  text-align: center;
}
.score-input {
  margin-bottom: 20px;
}
.hole-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
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
h3 {
  margin: 10px 0;
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
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
}
</style>
