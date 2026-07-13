<template>
  <v-container>
    <v-card class="pa-5">
      <v-card-title>بدء حملة إرسال رسائل ذكية</v-card-title>
      <!-- حقل لتحديد الـ Delay بالثواني بين كل رسالة ورسالة -->
      <v-slider
        v-model="delay"
        min="1"
        max="60"
        step="1"
        label="الفاصل الزمني بالثواني"
        thumb-label="always"
      ></v-slider>

      <v-btn color="success" :loading="whatsappStore.campaignLoading" @click="launchCampaign">
        بدء الحملة وجدولة الرسائل تلقائياً
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useWhatsappStore } from '@/stores/whatsapp'

const whatsappStore = useWhatsappStore()
const delay = ref(5) // القيمة الافتراضية 5 ثواني
const messagesList = ref([
  { phone: '201000000000', message: 'مرحبا بك في منصتنا!' },
  { phone: '201111111111', message: 'تذكير بموعد اشتراكك.' },
])

const launchCampaign = async () => {
  const payload = {
    delay: delay.value,
    messages: messagesList.value,
  }

  const result = await whatsappStore.startCampaign(payload)
  alert(result.message)
}
</script>
