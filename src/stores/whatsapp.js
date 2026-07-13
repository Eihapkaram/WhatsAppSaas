import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useWhatsappStore = defineStore('whatsapp', {
  state: () => ({
    receivedMessages: [],
    loading: false,
  }),
  actions: {
    async saveSettings(settingsData) {
      try {
        const response = await api.post('/save-settings', settingsData)
        return { success: true, message: response.data.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'فشل حفظ الإعدادات' }
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
