export default defineNuxtPlugin(async (nuxtApp) => {
    const authStore = useAuthStore()
    if (authStore.token) {
        await authStore.fetchUser()
    }
})
