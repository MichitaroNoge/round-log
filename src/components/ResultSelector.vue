<template>
  <div class="button-group">
    <button
      v-for="result in results"
      :key="result.value"
      :class="{ selected: selectedResult === result.value }"
      @click="selectResult(result.value)"
    >
      {{ result.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  results: Array<{ label: string; value: string }>
  selectedResult: string
}>()

const emit = defineEmits(['update:selectedResult'])

const selectResult = (value: string) => {
  emit('update:selectedResult', value)
}
</script>

<style scoped>
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
