<template>
  <div class="button-group">
    <button
      v-for="detailResult in detailResultList"
      :key="detailResult"
      :class="{ selected: selectedDetailResult === detailResult }"
      @click="toggleDetailResult(detailResult)"
    >
      {{ detailResult }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  detailResultList: {
    type: Array as PropType<string[]>,
    required: true,
  },
  selectedDetailResult: {
    type: String,
    required: false,
  },
  selectDetailResult: {
    type: Function as PropType<(result: string) => void>,
    required: true,
  },
})

// 選択・非選択を切り替える
function toggleDetailResult(detailResult: string) {
  if (props.selectedDetailResult === detailResult) {
    props.selectDetailResult('')
  } else {
    props.selectDetailResult(detailResult)
  }
}
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
