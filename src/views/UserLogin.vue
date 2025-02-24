<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { ref, onMounted } from 'vue'

const { login, signUp, autoLogin, errorMessage } = useAuth()

const email = ref('')
const password = ref('')

onMounted(() => {
  autoLogin()
})
</script>

<template>
  <h2>Round Log</h2>
  <div class="form-container">
    <input v-model="email" type="email" placeholder="メールアドレス" />
    <input v-model="password" type="password" placeholder="パスワード" />
    <button @click="login(email, password)">ログイン</button>
    <button @click="signUp(email, password)">アカウント登録</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
h2 {
  text-align: center; /* h3を中央揃え */
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* 入力欄やボタン間のスペースを広げる */
  max-width: 400px; /* 横幅を制限 */
  margin: 0 auto; /* 中央揃え */
  padding: 2rem; /* 内側に余白を追加 */
}

input {
  padding: 0.8rem;
  font-size: 1rem;
  width: 100%; /* 横幅を100%に設定し、親の横幅に合わせる */
  box-sizing: border-box; /* パディングを含めて幅を計算 */
}

button {
  width: 100%; /* 横幅を100%に設定し、親の横幅に合わせる */
  box-sizing: border-box; /* パディングを含めて幅を計算 */
  cursor: pointer;
  background-color: #4caf50; /* ボタンの背景色 */
  color: white;
  border: none;
  border-radius: 4px;
  height: 40px;
  vertical-align: middle;
}

button:hover {
  background-color: #45a049; /* ホバー時の背景色 */
}
</style>
