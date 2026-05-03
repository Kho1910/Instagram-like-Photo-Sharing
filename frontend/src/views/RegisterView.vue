<template>
  <div class="auth-page">
    <div class="form-card">
      <h2>Tạo tài khoản</h2>
      <form @submit.prevent="handleRegister">
        <input v-model="form.username" type="text" placeholder="Tên đăng nhập" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.password" type="password" placeholder="Mật khẩu" required minlength="6" />
        <button type="submit" :disabled="loading">{{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({ username: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = '';
  loading.value = true;
  try {
    const success = await authStore.register({
      username: form.value.username, 
      password: form.value.password,
      email: form.value.email 
    });

    if (success) {
      alert('Đăng ký thành công! Mời bạn đăng nhập lại.');
      router.push('/login'); 
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page { display: flex; min-height: calc(100vh - 80px); align-items: center; justify-content: center; }
.form-card { width: 100%; max-width: 400px; background: white; padding: 28px; border: 1px solid #dbdbdb; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
input { width: 100%; margin-bottom: 12px; padding: 12px 14px; border: 1px solid #d3d3d3; border-radius: 10px; }
button { width: 100%; padding: 12px 14px; border: none; background: #0095f6; color: #fff; font-weight: 700; border-radius: 10px; cursor: pointer; }
.error { margin-top: 10px; color: #d8000c; font-size: 14px; }
</style>
