// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      wsBase: ''
    }
  },

  nitro: {
    routeRules: {
      '/api/auth/**': { proxy: 'http://localhost:8000/api/auth/**' },
      '/api/users/**': { proxy: 'http://localhost:8000/api/users/**' },
      '/api/messages/**': { proxy: 'http://localhost:8000/api/messages/**' },
      '/api/tasks/**': { proxy: 'http://localhost:8000/api/tasks/**' },
      '/api/debts/**': { proxy: 'http://localhost:8000/api/debts/**' },
      '/ws/**': { proxy: 'http://localhost:8000/ws/**' }
    }
  },

  future: {
    compatibilityVersion: 4
  },

  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css']
})
