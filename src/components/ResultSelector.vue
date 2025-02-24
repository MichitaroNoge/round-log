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

<style scoped>
button {
  min-width: 100px;
}
.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}
button.selected {
  background-color: #4caf50;
  color: white;
}
</style>
