<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

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

// ホール番号とショット履歴を親から受け取る
const props = defineProps<{
  scores: Record<number, Shot[]>
}>()

// Emit: 編集・削除のイベントを親に通知
const emit = defineEmits<{
  (e: 'edit-shot', shot: Shot): void
  (e: 'delete-shot', shot: Shot): void
}>()

// 編集ボタンのクリック
const editShot = (shot: Shot) => {
  emit('edit-shot', shot)
}

// 削除ボタンのクリック
const deleteShot = (shot: Shot) => {
  emit('delete-shot', shot)
}
</script>

<template>
  <div class="score-table">
    <table>
      <thead>
        <tr>
          <th>ホールNo</th>
          <th>打数</th>
          <th>クラブ</th>
          <th>結果</th>
          <th>詳細結果</th>
          <th>状況</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(shots, holeNumber) in props.scores" :key="holeNumber">
          <template v-for="(shot, index) in shots" :key="shot.shot_number">
            <tr>
              <td v-if="index === 0" :rowspan="shots.length">{{ holeNumber }}H</td>
              <td>{{ shot.shot_number }}打目</td>
              <td>{{ shot.club }}</td>
              <td>{{ shot.result }}</td>
              <td>{{ shot.detailResults.length ? shot.detailResults.join(', ') : 'なし' }}</td>
              <td>{{ shot.conditions.length ? shot.conditions.join(', ') : 'なし' }}</td>
              <td class="action-buttons">
                <button @click="editShot(shot)" class="edit-btn">編集</button>
                <button @click="deleteShot(shot)" class="delete-btn">削除</button>
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.score-table {
  overflow-x: auto;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px; /* フォントサイズを小さく */
}

th,
td {
  padding: 4px 8px;
  text-align: left;
}

th {
  background-color: #5981af;
  color: white;
}

tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 8px; /* ボタンを水平方向に並べる */
}

.edit-btn,
.delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
}

.edit-btn {
  background-color: #5cb85c;
  color: white;
}

.delete-btn {
  background-color: #d9534f;
  color: white;
}

button:hover {
  opacity: 0.8;
}
</style>
