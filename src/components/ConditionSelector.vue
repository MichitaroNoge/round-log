<template>
  <div class="button-group">
    <button
      v-for="condition in filteredConditions"
      :key="condition"
      :class="{ selected: selectedConditions.includes(condition) }"
      @click="toggleCondition(condition)"
    >
      {{ condition }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  filteredConditions: {
    type: Array as () => string[],
    required: true,
  },
  selectedConditions: {
    type: Array as () => string[],
    required: true,
  },
  conditionsList: {
    type: Array as () => { name: string; groupId: string }[],
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'update:selectedConditions', selectedConditions: string[]): void
}>()

const toggleCondition = (condition: string) => {
  let selectedConditions = [...props.selectedConditions]

  // 条件のグループIDを取得
  const conditionGroupId = props.conditionsList.find((c) => c.name === condition)?.groupId

  // すでに選択済みなら削除
  if (selectedConditions.includes(condition)) {
    selectedConditions = selectedConditions.filter((c) => c !== condition)
  } else {
    // 排他グループの処理
    if (conditionGroupId) {
      // 同じグループ内の他の選択肢をフィルタリングして削除
      selectedConditions = selectedConditions.filter((a) => {
        const groupId = props.conditionsList.find((c) => c.name === a)?.groupId
        return groupId !== conditionGroupId
      })
    }
    // 新しい条件を追加
    selectedConditions.push(condition)
  }

  // 更新されたselectedConditionsを親コンポーネントに通知
  emit('update:selectedConditions', selectedConditions)
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
