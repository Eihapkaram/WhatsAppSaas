import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useWhatsappStore = defineStore('whatsapp', {
  state: () => ({
    receivedMessages: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    loading: false,
  }),
  actions: {
    async fetchSettings() {
      this.loading = true
      try {
        const response = await api.get('/get-settings')
        return response.data
      } catch (err) {
        console.error('فشل في جلب إعدادات Meta الحالية', err)
        return null
      } finally {
        this.loading = false
      }
    },
    async saveSettings(settingsData) {
      this.loading = true
      try {
        const response = await api.post('/save-settings', settingsData)
        return { success: true, message: response.data.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'فشل حفظ الإعدادات' }
      } finally {
        this.loading = false
      }
    },
    // 🌟 تم تحديث الدالة لاستقبال رقم الصفحة وتحديث الـ State ببيانات الـ Pagination القادمة من لارافل
    async fetchMessages(page = 1) {
      this.loading = true
      try {
        const response = await api.get(`/received-messages?page=${page}`)
        this.receivedMessages = response.data.data
        this.currentPage = response.data.current_page
        this.totalPages = response.data.last_page
        this.totalItems = response.data.total
      } catch (err) {
        console.error('حدث خطأ أثناء جلب الرسائل', err)
      } finally {
        this.loading = false
      }
    },
    async startCampaign(campaignData) {
      try {
        const response = await api.post('/start-campaign', campaignData)
        return { success: true, message: response.data.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'فشل تشغيل الحملة' }
      }
    },
  },
})
