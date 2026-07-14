<template>
  <v-app>
    <!-- شريط التطبيق العلوي -->
    <v-app-bar color="teal-darken-3" elevation="2">
      <v-app-bar-title>لوحة تحكم WhatsApp SaaS</v-app-bar-title>
      <v-spacer></v-spacer>
      <!-- زر تسجيل الخروج -->
      <v-btn icon="mdi-logout" @click="authStore.logout"></v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container>
        <!-- التبويبات للتنقل داخل النظام -->
        <v-tabs v-model="tab" bg-color="teal-darken-1" center-active class="rounded text-white">
          <v-tab value="settings">⚙️ إعدادات الحساب (Meta)</v-tab>
          <v-tab value="campaign">🚀 إطلاق حملة رسائل</v-tab>
          <v-tab value="messages">📥 الرسائل المستلمة</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-5">
          <!-- 1. تبويب الإعدادات -> يضرب على /save-settings -->
          <v-window-item value="settings">
            <v-card class="pa-5 elevation-2">
              <v-card-title class="text-h6 font-weight-bold mb-4">
                ربط حساب Meta Cloud API الخاص بك
              </v-card-title>
              
              <v-form @submit.prevent="saveMetaSettings">
                <v-text-field
                  v-model="settingsForm.meta_token"
                  label="Meta Permanent Access Token"
                  variant="outlined"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="settingsForm.phone_number_id"
                  label="Phone Number ID"
                  variant="outlined"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="settingsForm.verify_token"
                  label="Webhook Verify Token"
                  variant="outlined"
                  required
                ></v-text-field>
                <v-btn
                  type="submit"
                  color="teal"
                  size="large"
                  block
                  :loading="whatsappStore.loading"
                >
                  حفظ وتفعيل الحساب
                </v-btn>
              </v-form>
            </v-card>
          </v-window-item>

          <!-- 2. تبويب الحملة والجدولة الحقيقي -> يضرب على /start-campaign كـ Multipart Form Data ⚡ -->
          <v-window-item value="campaign">
            <v-card class="pa-5 elevation-2">
              <v-card-title class="text-h6 font-weight-bold mb-2">
                إطلاق حملة ذكية مجدولة
              </v-card-title>
              <p class="text-subtitle-2 text-grey-darken-1 mb-4">
                قم برفع ملف الإكسيل الذي يحتوي على خانة الأرقام والرسائل، وسيتم جدولة الإرسال
                تدريجياً في الخلفية بناءً على الفاصل المختار.
              </p>

              <!-- حقل رفع ملف الإكسيل الحقيقي -->
              <v-file-input
                v-model="excelFile"
                label="اختر ملف الإكسيل (xlsx, xls)"
                accept=".xlsx, .xls"
                prepend-icon="mdi-file-excel"
                variant="outlined"
                show-size
                required
                :disabled="isSending"
                class="mb-2"
              ></v-file-input>

              <v-slider
                v-model="campaignDelay"
                :min="2"
                :max="5000"
                :step="1"
                label="الفاصل الزمني (بالثواني)"
                thumb-label="always"
                color="teal"
                :disabled="isSending"
                class="mb-4"
              ></v-slider>

              <v-btn
                color="success"
                size="large"
                block
                @click="fireCampaign"
                :loading="whatsappStore.loading || isSending"
                :disabled="!excelFile || isSending"
              >
                تشغيل الجدولة وإرسال الحملة فوراً
              </v-btn>
            </v-card>

            <!-- 🌟 شريط تقدم الإرسال (يظهر فقط أثناء الإرسال الفعلي للـ Queue) 🌟 -->
            <v-expand-transition>
              <div v-if="isSending" class="my-5 pa-4 border rounded bg-teal-lighten-5">
                <div class="d-flex justify-space-between mb-2 text-subtitle-2 text-teal-darken-4">
                  <span class="font-weight-bold">جاري إرسال الحملة في الخلفية...</span>
                  <span class="font-weight-bold">{{ processedCount }} / {{ totalCount }} رسالة</span>
                </div>
                
                <v-progress-linear
                  v-model="progressPercentage"
                  color="teal"
                  height="22"
                  striped
                  animated
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <strong class="text-white">{{ Math.ceil(value) }}%</strong>
                  </template>
                </v-progress-linear>

                <div class="text-caption text-grey-darken-1 mt-2 text-center">
                  يرجى عدم إغلاق الصفحة حتى يكتمل شريط التقدم بنسبة 100%.
                </div>
              </div>
            </v-expand-transition>
          </v-window-item>

          <!-- 3. تبويب الرسائل المستلمة وجدول الإكسيل -> يضرب على /received-messages و /export-messages -->
          <v-window-item value="messages">
            <v-card class="pa-5 elevation-2">
              <v-card-title class="d-flex align-center justify-space-between mb-4">
                <span class="text-h6 font-weight-bold">
                  الرسائل الواردة من العملاء عبر الـ Webhook
                </span>
                <!-- زر تحميل الإكسيل الحقيقي المتصل بالستور -->
                <v-btn
                  color="teal-darken-2"
                  prepend-icon="mdi-microsoft-excel"
                  @click="downloadExcelFile"
                  :loading="downloadLoading"
                >
                  تصدير ملف إكسيل
                </v-btn>
              </v-card-title>

              <!-- جدول عرض الرسائل المستلمة ديناميكياً بـ Vuetify -->
              <v-table class="rounded border">
                <thead>
                  <tr class="bg-grey-lighten-2">
                    <th class="text-right font-weight-bold">الرقم</th>
                    <th class="text-right font-weight-bold">الاسم</th>
                    <th class="text-right font-weight-bold">الرسالة</th>
                    <th class="text-right font-weight-bold">تاريخ الاستلام</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="msg in whatsappStore.receivedMessages" :key="msg.id">
                    <td>{{ msg.phone }}</td>
                    <td>{{ msg.name || 'غير معروف' }}</td>
                    <td>{{ msg.message }}</td>
                    <td>{{ new Date(msg.received_at).toLocaleString('ar-EG') }}</td>
                  </tr>
                  <tr v-if="whatsappStore.receivedMessages.length === 0">
                    <td colspan="4" class="text-center text-grey pa-5">
                      لا توجد رسائل مستلمة حتى الآن.
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWhatsappStore } from '@/stores/whatsapp'
import api from '@/plugins/axios'

const authStore = useAuthStore()
const whatsappStore = useWhatsappStore()

const tab = ref('settings')
const campaignDelay = ref(5)
const excelFile = ref(null) 
const downloadLoading = ref(false)

// متغيرات تتبع حالة التقدم للـ Queue
const isSending = ref(false)
const progressPercentage = ref(0)
const processedCount = ref(0)
const totalCount = ref(0)
let progressInterval = null

const settingsForm = ref({
  meta_token: '',
  phone_number_id: '',
  verify_token: '',
})

// جلب إعدادات Meta المخزنة
const loadSettings = async () => {
  const settings = await whatsappStore.fetchSettings()
  if (settings) {
    settingsForm.value = {
      meta_token: settings.meta_token || '',
      phone_number_id: settings.phone_number_id || '',
      verify_token: settings.verify_token || '',
    }
  }
}

// 1. حفظ إعدادات Meta
const saveMetaSettings = async () => {
  const res = await whatsappStore.saveSettings(settingsForm.value)
  alert(res.message)
}

// تنظيف المؤقت بأمان لمنع الـ Memory Leak
const clearProgressInterval = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

// تتبع تقدم معالجة الـ Queue
const trackProgress = (batchId) => {
  clearProgressInterval()

  progressInterval = setInterval(async () => {
    try {
      const res = await api.get(`/campaign-progress/${batchId}`)
      
      progressPercentage.value = res.data.progress
      processedCount.value = res.data.processed
      totalCount.value = res.data.total

      // عند اكتمال معالجة الطابور بالكامل
      if (res.data.completed) {
        clearProgressInterval()
        isSending.value = false
        excelFile.value = null // تفريغ حقل الرفع
        alert('🎉 تم إرسال كافة رسائل الحملة من الطابور بنجاح!')
      }
    } catch (err) {
      console.error('خطأ أثناء جلب حالة التقدم:', err)
      clearProgressInterval()
      isSending.value = false
    }
  }, 2000)
}

// 2. إطلاق الحملة البرمجية
const fireCampaign = async () => {
  if (!excelFile.value) return

  whatsappStore.loading = true
  isSending.value = true
  progressPercentage.value = 0
  processedCount.value = 0
  totalCount.value = 0

  const formData = new FormData()
  
  const fileToUpload = Array.isArray(excelFile.value) 
    ? excelFile.value[0] 
    : excelFile.value

  formData.append('excel_file', fileToUpload)
  formData.append('delay', campaignDelay.value)

  try {
    const response = await api.post('/start-campaign', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    const batchId = response.data.batch_id
    trackProgress(batchId)
    
  } catch (err) {
    alert(err.response?.data?.message || 'حدث خطأ أثناء رفع ملف الحملة')
    isSending.value = false
  } finally {
    whatsappStore.loading = false
  }
}

// 3. تنزيل ملف الإكسيل كـ Blob
const downloadExcelFile = async () => {
  downloadLoading.value = true
  try {
    const response = await api.get('/export-messages', {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `received-messages-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()

    window.URL.revokeObjectURL(link.href)
  } catch (err) {
    alert('حدث خطأ أثناء تحميل ملف الإكسيل من السيرفر.')
  } finally {
    downloadLoading.value = false
  }
}

// مراقبة التبويبات لجلب البيانات تلقائياً عند الانتقال
watch(tab, (newTab) => {
  if (newTab === 'messages') {
    whatsappStore.fetchMessages()
  } else if (newTab === 'settings') {
    loadSettings()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  clearProgressInterval()
})
</script>