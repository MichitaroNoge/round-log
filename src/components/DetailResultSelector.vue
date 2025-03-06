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
