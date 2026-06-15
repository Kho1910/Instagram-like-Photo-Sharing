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

      <div class="auth-tabs" role="tablist">
        <span
          class="auth-tabs__indicator"
          :class="{ 'auth-tabs__indicator--register': tab === 'register' }"
          aria-hidden="true"
        />
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'login'"
          :class="{ active: tab === 'login' }"
          @click="setTab('login')"
        >
          Đăng nhập
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'register'"
          :class="{ active: tab === 'register' }"
          @click="setTab('register')"
        >
          Đăng ký
        </button>
      </div>

      <div class="auth-form">
        <div class="auth-form__viewport">
          <div
            class="auth-panel"
            :class="{
              'auth-panel--active': tab === 'login',
              'auth-panel--leave-left': tabAnim === 'to-register',
            }"
          >
            <BaseInput
              v-model="form.email"
              type="email"
              placeholder="Email"
              :error="errors.email"
            />
            <BaseInput
              v-model="form.password"
              type="password"
              placeholder="Mật khẩu"
              :error="errors.password"
            />
          </div>

          <div
            class="auth-panel"
            :class="{
              'auth-panel--active': tab === 'register',
              'auth-panel--leave-right': tabAnim === 'to-login',
            }"
          >
            <BaseInput
              v-model="form.username"
              placeholder="Tên người dùng"
              :error="errors.username"
            />
            <BaseInput
              v-model="form.full_name"
              placeholder="Họ và tên"
              :error="errors.full_name"
            />
            <BaseInput
              v-model="form.email"
              type="email"
              placeholder="Email"
              :error="errors.email"
            />
            <BaseInput
              v-model="form.password"
              type="password"
              placeholder="Mật khẩu"
              :error="errors.password"
            />
          </div>
        </div>

        <p class="api-error" :class="{ 'api-error--empty': !apiError }">{{ apiError }}</p>

        <BaseButton :loading="loading" block @click="handleSubmit">
          <Transition name="auth-btn" mode="out-in">
            <span :key="tab" class="auth-btn-label">
              {{ tab === 'login' ? 'Đăng nhập' : 'Đăng ký' }}
            </span>
          </Transition>
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
const tabAnim  = ref('')
const loading  = ref(false)
const apiError = ref('')
const form     = reactive({ username: '', full_name: '', email: '', password: '' })
const errors   = reactive({ username: '', full_name: '', email: '', password: '' })

function setTab(next) {
  if (next === tab.value) return
  tabAnim.value = next === 'register' ? 'to-register' : 'to-login'
  tab.value = next
}

watch(tab, () => {
  Object.assign(errors, { username: '', full_name: '', email: '', password: '' })
  apiError.value = ''
})

function validate() {
  let ok = true
  errors.email    = form.email    ? '' : 'Bắt buộc'; if (!form.email)    ok = false
  errors.password = form.password ? '' : 'Bắt buộc'; if (!form.password) ok = false
  if (tab.value === 'register') {
    errors.username = form.username ? '' : 'Bắt buộc'; if (!form.username) ok = false
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
      setTab('login')
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
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 16px;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  padding: 32px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 26px;
  text-align: center;
  margin-bottom: 24px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.auth-tabs {
  position: relative;
  display: flex;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 20px;
  isolation: isolate;
}

.auth-tabs__indicator {
  position: absolute;
  inset: 0 auto 0 0;
  width: 50%;
  background: var(--color-primary);
  border-radius: calc(var(--radius-md) - 2px);
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.auth-tabs__indicator--register {
  transform: translateX(100%);
}

.auth-tabs button {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 9px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.25s ease;
}

.auth-tabs button.active {
  color: #fff;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

/* Chiều cao cố định = panel đăng ký (4 input); hai panel chồng nhau */
.auth-form__viewport {
  position: relative;
  height: 212px;
  overflow: hidden;
}

.auth-panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(14px);
  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.3s;
}

.auth-panel--active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(0);
}

.auth-panel--leave-left:not(.auth-panel--active) {
  transform: translateX(-14px);
}

.auth-panel--leave-right:not(.auth-panel--active) {
  transform: translateX(14px);
}

.api-error {
  color: var(--color-danger);
  font-size: 13px;
  line-height: 1.35;
  min-height: 2.7em;
  margin: 0 0 10px;
  text-align: center;
}

.api-error--empty {
  visibility: hidden;
}

.auth-btn-label {
  display: inline-block;
}

.auth-btn-enter-active,
.auth-btn-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.auth-btn-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.auth-btn-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
