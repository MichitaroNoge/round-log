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
  detailResult: string
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
  <div v-for="(shots, holeNumber) in props.scores" :key="holeNumber">
    <p>{{ holeNumber }}H</p>
    <ul>
      <li v-for="shot in shots" :key="shot.shot_number">
        <span
          >{{ shot.shot_number }}打目 - {{ shot.club }} - {{ shot.result }} -
          {{ shot.detailResult || 'なし' }} - ({{ shot.conditions.join(', ') || 'なし' }})</span
        >
        <button @click="editShot(shot)">編集</button>
        <button @click="deleteShot(shot)">削除</button>
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
