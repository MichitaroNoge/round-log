<!-- components/HoleSelector.vue -->
<template>
  <div class="hole-selector">
    <button :disabled="disabled" @click="prevHole">◀</button>
    <span>{{ localHoleNumber }}H</span>
    <button :disabled="disabled" @click="nextHole">▶</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Propsの定義
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
  display: flex;
  align-items: center;
}
.hole-selector button {
  margin: 0 5px;
}
</style>
