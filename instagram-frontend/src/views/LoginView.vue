<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1 class="auth-logo">
  <span class="logo-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="6.5" width="17" height="12" rx="2" />
      <path d="M8 6.5L9.5 4.5H14.5L16 6.5" />
      <circle cx="12" cy="12.5" r="2.5" />
    </svg>
  </span>
  InstaClone
</h1>

      

      <div class="auth-tabs">
        <button :class="{ active: tab === 'login' }"    @click="tab = 'login'">Đăng nhập</button>
        <button :class="{ active: tab === 'register' }" @click="tab = 'register'">Đăng ký</button>
      </div>

      <div class="auth-form">
        <BaseInput v-if="tab === 'register'"
          v-model="form.username" placeholder="Tên người dùng" :error="errors.username" />
        <BaseInput v-if="tab === 'register'"
          v-model="form.full_name" placeholder="Họ và tên" :error="errors.full_name" />
        <BaseInput v-model="form.email" type="email"
          placeholder="Email" :error="errors.email" />
        <BaseInput v-model="form.password" type="password"
          placeholder="Mật khẩu" :error="errors.password" />
        

        <p v-if="apiError" class="api-error">{{ apiError }}</p>

        <BaseButton :loading="loading" block @click="handleSubmit">
          {{ tab === 'login' ? 'Đăng nhập' : 'Đăng ký' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter }  from 'vue-router'
import { useAuth }    from '@/composables/useAuth'
import BaseInput  from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router   = useRouter()
const { login, register } = useAuth()
const tab      = ref('login')
const loading  = ref(false)
const apiError = ref('')
const form     = reactive({ username: '', full_name: '', email: '', password: '' })
const errors   = reactive({ username: '', full_name: '', email: '', password: '' })

watch(tab, () => { Object.assign(errors, { username:'', full_name:'', email:'', password:'' }); apiError.value = '' })

function validate() {
  let ok = true
  errors.email    = form.email    ? '' : 'Bắt buộc'; if (!form.email)    ok = false
  errors.password = form.password ? '' : 'Bắt buộc'; if (!form.password) ok = false
  if (tab.value === 'register') {
    errors.username = form.username ? '' : 'Bắt buộc'; if (!form.username) ok = false;
    errors.full_name = form.full_name ? '' : 'Bắt buộc'
    if (!form.full_name) ok = false
  }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true; apiError.value = ''
  try {
    if (tab.value === 'login') {
      await login(form.email, form.password)
      router.push('/feed')
    } else {
      await register(
        form.username,  
        form.email,   
        form.password, 
        form.full_name  
      )

      alert('Đăng ký thành công! Mời bạn đăng nhập.')
      tab.value = 'login' 
    }
  } catch (e) {
    const serverError = e.response?.data?.error
    apiError.value = typeof serverError === 'string'
      ? serverError
      : serverError?.message || 'Có lỗi xảy ra, thử lại.'
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-page  { min-height: 100vh; display: flex; align-items: center;
  justify-content: center; background: var(--color-bg); padding: 16px; }
.auth-card  { width: 100%; max-width: 380px; padding: 32px; }
.auth-logo  { font-size: 26px; text-align: center; margin-bottom: 24px; }

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px; 
  font-size: 26px; text-align: center; margin-bottom: 24px; 
}

/* Kế thừa CSS icon từ Navbar */
.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  /* Tôi chỉnh size lên 32px một chút để nó cân xứng với kích thước chữ h1 to ở trang Login */
  width: 32px; 
  height: 32px;
}

.auth-tabs  { display: flex; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md); overflow: hidden; margin-bottom: 20px; }
.auth-tabs button { flex: 1; padding: 9px; border: none; background: none;
  font-size: 13px; font-weight: 600; color: var(--color-text-muted); cursor: pointer; }
.auth-tabs button.active { background: var(--color-primary); color: #fff; }
.auth-form { display: flex; flex-direction: column; }
.api-error  { color: var(--color-danger); font-size: 13px; margin-bottom: 10px; text-align: center; }
</style>
