<template>
  <div class="container">
    <h2>Round Log</h2>

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
    <h3>トータルスコア: {{ totalScore }}</h3>
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
import { ref, computed } from 'vue'

interface Shot {
  club: string
  result: string
  conditions: string[]
}

const holeNumber = ref<number>(1)
const selectedClub = ref<string>('1W')
const selectedResult = ref<string>('〇')
const selectedConditions = ref<string[]>([])
const scores = ref<Record<number, Shot[]>>({})
const isEditing = ref<boolean>(false)
const editingHole = ref<number | null>(null)
const editingIndex = ref<number | null>(null)

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

const conditions: string[] = [
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
const currentShotCount = computed<number>(() => {
  return isEditing.value
    ? (editingIndex.value ?? 0) + 1
    : (scores.value[holeNumber.value]?.length || 0) + 1
})

const toggleCondition = (condition: string) => {
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

const prevHole = () => {
  holeNumber.value = holeNumber.value > 1 ? holeNumber.value - 1 : 18
}
const nextHole = () => {
  holeNumber.value = holeNumber.value < 18 ? holeNumber.value + 1 : 1
}

const deleteShot = (hole: number, index: number) => {
  scores.value[hole].splice(index, 1)
  if (scores.value[hole].length === 0) {
    delete scores.value[hole]
  }
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
</style>
