<template>
  <div class="button-group">
    <button
      v-for="club in clubs"
      :key="club"
      :class="{ selected: selectedClub === club }"
      @click="selectClub(club)"
    >
      {{ club }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  clubs: {
    type: Array as PropType<string[]>,
    required: true,
  },
  selectedClub: {
    type: String,
    required: true,
  },
  selectClub: {
    type: Function as PropType<(club: string) => void>,
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
  gap: 5px;
  justify-content: center;
}
button.selected {
  background-color: #4caf50;
  color: white;
}
</style>
