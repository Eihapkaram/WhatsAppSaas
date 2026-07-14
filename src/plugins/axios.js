import axios from 'axios'

const api = axios.create({
  // يمكنك تغييره إلى رابط سيرفر Railway عند الرفع للإنتاج
  baseURL: 'https://partridgelike-undelusively-gael.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  'ngrok-skip-browser-warning': 'bypass-please'
  },
})

// Interceptor لإضافة توكن Passport تلقائياً مع كل طلب للمسارات المحمية
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor لعمل تسجيل خروج تلقائي إذا انتهت صلاحية التوكن (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api