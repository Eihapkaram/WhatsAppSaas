<template>
  <v-container>
    <v-card class="pa-5" max-width="600">
      <v-card-title>إعدادات Meta Cloud API الخاصة بك</v-card-title>
      <v-form @submit.prevent="handleSave">
        <v-text-field
          v-model="form.meta_token"
          label="Meta Permanent Access Token"
          required
        ></v-text-field>
        <v-text-field
          v-model="form.phone_number_id"
          label="Phone Number ID"
          required
        ></v-text-field>
        <v-text-field
          v-model="form.verify_token"
          label="Webhook Verify Token الخاص بك"
          required
        ></v-text-field>

        <v-btn type="submit" color="primary" :loading="whatsappStore.loading">حفظ الإعدادات</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useWhatsappStore } from '@/stores/whatsapp'

const whatsappStore = useWhatsappStore()
const form = ref({
  meta_token: '',
  phone_number_id: '',
  verify_token: '',
})

const handleSave = async () => {
  const result = await whatsappStore.saveSettings(form.value)
  if (result.success) {
    alert(result.message) // يمكنك استبدالها بـ Vuetify Snackbar
  } else {
    alert(result.message)
  }
}
</script>
