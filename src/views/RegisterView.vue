<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12 pa-5">
          <v-card-title class="text-center text-h5 font-weight-bold">إنشاء حساب جديد</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="form.name"
                label="الاسم الكامل"
                prepend-icon="mdi-account"
                type="text"
                required
              ></v-text-field>
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

              <v-btn type="submit" color="teal" block class="mt-4" :loading="authStore.loading"
                >تسجيل الحساب</v-btn
              >

              <div class="text-center mt-4">
                <router-link to="/login" class="text-decoration-none text-teal"
                  >لديك حساب بالفعل؟ سجل دخولك الآن</router-link
                >
              </div>
            </v-form>
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

const form = ref({
  name: '',
  email: '',
  password: '',
})

const handleRegister = async () => {
  // استدعاء دالة الـ register الموجودة مسبقاً في الـ Pinia store
  const success = await authStore.register(form.value)
  if (success) {
    router.push('/') // تحويل المستخدم للوحة التحكم مباشرة فور نجاح التسجيل وحفظ التوكن
  }
}
</script>
