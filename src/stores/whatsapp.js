import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useWhatsappStore = defineStore('whatsapp', {
  state: () => ({
    receivedMessages: [],
    loading: false,
  }),
  actions: {
    // جلب الإعدادات الحالية من الباك إيند
    async fetchSettings() {
      this.loading = true
      try {
        const response = await api.get('/get-settings') // تأكد من اسم الـ Route في لارافل
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
    async fetchMessages() {
      this.loading = true
      try {
        const response = await api.get('/received-messages')
        this.receivedMessages = response.data
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