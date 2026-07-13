<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12 pa-5">
          <v-card-title class="text-center text-h5 font-weight-bold"
            >تسجيل الدخول للنظام</v-card-title
          >
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.email"
                label="البريد الإلكتروني"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.password"
                label="كلمة المرور"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
              <v-alert v-if="authStore.error" type="error" class="mt-3">{{
                authStore.error
              }}</v-alert>
              <v-btn type="submit" color="primary" block class="mt-4" :loading="authStore.loading"
                >دخول</v-btn
              >
            </v-form>
            <!-- أضف هذا السطر تحت الـ v-btn الخاص بالدخول في ملف LoginView.vue -->
            <div class="text-center mt-4">
              <router-link to="/register" class="text-decoration-none text-primary"
                >ليس لديك حساب؟ أنشئ حسابك الآن</router-link
              >
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const form = ref({ email: '', password: '' })

const handleLogin = async () => {
  const success = await authStore.login(form.value)
  if (success) {
    router.push('/')
  }
}
</script>
