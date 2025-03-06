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

// コンポーネントのプロパティを定義
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
  min-width: 80px;
  height: 30px;
  font-size: 12px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 0;
  background-color: #fff;
  color: #333;
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
