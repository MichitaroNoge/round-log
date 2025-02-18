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
