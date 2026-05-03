<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h1 class="logo-text">Instagram Clone</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="Tên đăng nhập hoặc email" 
            required 
          />
        </div>
        
        <div class="input-group">
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Mật khẩu" 
            required 
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>

        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>

      <div class="divider"><span>HOẶC</span></div>
      <div class="footer-link">
        Bạn chưa có tài khoản? <router-link to="/register">Đăng ký</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    const success = await authStore.login({ 
      username: form.value.username, 
      password: form.value.password 
    });
    if (success) router.push('/feed');
  } catch (err) {
    error.value = err.message || 'Sai tài khoản hoặc mật khẩu';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.login-card {
  background: white;
  border: 1px solid #dbdbdb;
  padding: 40px;
  width: 100%;
  max-width: 350px;
  text-align: center;
}
.logo-text {
  font-family: 'Billabong', cursive; 
  font-size: 40px;
  margin-bottom: 30px;
}
.input-group {
  margin-bottom: 10px;
}
input {
  width: 100%;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  box-sizing: border-box;
}
.btn-login {
  width: 100%;
  background-color: #0095f6;
  color: white;
  border: none;
  padding: 7px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}
.btn-login:disabled {
  background-color: #b2dffc;
}
.error-msg {
  color: #ed4956;
  font-size: 14px;
  margin-top: 15px;
}
.divider {
  margin: 20px 0;
  border-bottom: 1px solid #dbdbdb;
  position: relative;
}
.divider span {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0 10px;
  color: #8e8e8e;
  font-size: 13px;
}
.footer-link {
  margin-top: 20px;
  font-size: 14px;
}
.footer-link a {
  color: #0095f6;
  text-decoration: none;
  font-weight: bold;
}
</style>