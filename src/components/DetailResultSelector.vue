<template>
  <div class="button-group">
    <button
      v-for="detailResult in detailResultList"
      :key="detailResult"
      :class="{ selected: selectedDetailResults.includes(detailResult) }"
      @click="toggleDetailResult(detailResult)"
    >
      {{ detailResult }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

// コンポーネントのプロパティを定義
const props = defineProps({
  detailResultList: {
    type: Array as PropType<string[]>,
    required: true,
  },
  selectedDetailResults: {
    type: Array as PropType<string[]>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'updateDetailResults', results: string[]): void
}>()

// 選択・非選択を切り替える
function toggleDetailResult(detailResult: string) {
  const newSelection = props.selectedDetailResults.includes(detailResult)
    ? props.selectedDetailResults.filter((item) => item !== detailResult)
    : [...props.selectedDetailResults, detailResult]

  emit('updateDetailResults', newSelection)
}
</script>

<style scoped>
button {
  min-width: 80px;
  height: 30px;
  font-size: 12px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 0;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0;
  margin-right: -1px;
}
.button-group {
  display: inline-flex;
  justify-content: center;
}
button.selected {
  background-color: #4caf50;
  color: white;
}
</style>
