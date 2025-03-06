<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  resultList: {
    type: Array as PropType<string[]>,
    required: true,
  },
  selectedResult: {
    type: String,
    required: true,
  },
  selectResult: {
    type: Function as PropType<(result: string) => void>,
    required: true,
  },
})
</script>

<template>
  <div class="button-group">
    <button
      v-for="result in resultList"
      :key="result"
      :class="{ selected: selectedResult === result }"
      @click="selectResult(result)"
    >
      {{ result }}
    </button>
  </div>
</template>

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
