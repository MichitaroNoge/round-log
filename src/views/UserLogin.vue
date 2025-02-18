<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const login = async () => {
  errorMessage.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) {
    errorMessage.value = error.message
  } else {
    router.push('/round-list')
  }
}

const signUp = async () => {
  errorMessage.value = ''
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })
  if (error) errorMessage.value = error.message
}

// const logout = async () => {
//   await supabase.auth.signOut()
// }
</script>

<template>
  <div>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="login">Login</button>
    <button @click="signUp">Sign Up</button>
    <!-- <button @click="logout">Logout</button> -->
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<style></style>
