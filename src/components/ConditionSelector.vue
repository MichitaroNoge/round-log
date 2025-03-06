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
// コンポーネントのプロパティを定義
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

// Emit: 更新されたselectedConditionsのイベントを親に通知
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
