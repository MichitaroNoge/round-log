<!-- components/HoleSelector.vue -->
<template>
  <div class="hole-selector">
    <button class="prev-button" :disabled="disabled" @click="prevHole">◀ 前のホール</button>
    <h3>{{ localHoleNumber }}H</h3>
    <button class="next-button" :disabled="disabled" @click="nextHole">次のホール ▶</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  holeNumber: number
  min: number
  max: number
  disabled: boolean
}>()

// イベントを親に送信
const emit = defineEmits(['update:holeNumber'])

// ローカルのholeNumberを管理
const localHoleNumber = ref(props.holeNumber)

// holeNumberが親から変更された場合に同期
watch(
  () => props.holeNumber,
  (newVal) => {
    localHoleNumber.value = newVal
  },
)

// 前のホールに移動
const prevHole = () => {
  if (localHoleNumber.value > props.min) {
    localHoleNumber.value -= 1
  } else {
    localHoleNumber.value = props.max // 1のときは18に戻る
  }
  emit('update:holeNumber', localHoleNumber.value)
}

// 次のホールに移動
const nextHole = () => {
  if (localHoleNumber.value < props.max) {
    localHoleNumber.value += 1
  } else {
    localHoleNumber.value = props.min // 18のときは1に戻る
  }
  emit('update:holeNumber', localHoleNumber.value)
}
</script>

<style scoped>
.hole-selector {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

button.prev-button,
button.next-button {
  min-width: 80px;
  height: 30px;
  font-size: 12px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 0;
  background-color: #79718a;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0;
  margin-right: -1px;
  border-radius: 4px;
}

h3 {
  margin: 10px; /* 子要素の余白を削除 */
}
</style>
