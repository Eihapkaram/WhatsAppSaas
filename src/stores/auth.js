import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    // ⬇️ الدالة الجديدة اللي كانت ناقصة ومسببة المشكلة ⬇️
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/register', userData)
        this.token = response.data.token
        localStorage.setItem('auth_token', this.token)
        return true
      } catch (err) {
        // قراءة رسالة الخطأ القادمة من الـ Validation في Laravel بدقة
        this.error = err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب'
        return false
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/login', credentials)
        this.token = response.data.token
        localStorage.setItem('auth_token', this.token)
        return true
      } catch (err) {
        this.error = err.response?.data?.message || 'بيانات الدخول غير صحيحة'
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    },
  },
})
