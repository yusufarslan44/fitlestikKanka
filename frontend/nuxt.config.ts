// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      wsBase: 'ws://207.180.207.45:8000'
    }
  },

  nitro: {
    routeRules: {
      '/api/auth/**': { proxy: 'http://207.180.207.45:8000/api/auth/**' },
      '/api/users/**': { proxy: 'http://207.180.207.45:8000/api/users/**' },
      '/api/messages/**': { proxy: 'http://207.180.207.45:8000/api/messages/**' },
      '/api/tasks/**': { proxy: 'http://207.180.207.45:8000/api/tasks/**' },
      '/api/debts/**': { proxy: 'http://207.180.207.45:8000/api/debts/**' },
      '/ws/**': { proxy: 'http://207.180.207.45:8000/ws/**' }
    }
  },

  future: {
    compatibilityVersion: 4
  },

  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css']
})
