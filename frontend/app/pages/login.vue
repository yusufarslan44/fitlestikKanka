<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const loading = computed(() => auth.loading)

const handleLogin = async () => {
  if (!username.value || !password.value) return
  
  const success = await auth.login(username.value, password.value)
  if (success) {
    navigateTo('/chat')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-xl font-medium text-gray-900 dark:text-white">Giriş Yap</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Hesabınıza erişmek için bilgilerinizi girin</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <UFormField label="Kullanıcı Adı" name="username" class="font-medium text-gray-700 dark:text-gray-200">
        <UInput 
          v-model="username" 
          placeholder="yusuf" 
          icon="i-heroicons-user" 
          size="lg" 
          class="w-full mt-1" 
          :ui="{ leadingIcon: 'text-gray-400 dark:text-gray-500' }"
        />
      </UFormField>

      <UFormField label="Şifre" name="password" class="font-medium text-gray-700 dark:text-gray-200">
        <UInput 
          v-model="password" 
          type="password" 
          placeholder="••••••••" 
          icon="i-heroicons-lock-closed" 
          size="lg" 
          class="w-full mt-1"
          :ui="{ leadingIcon: 'text-gray-400 dark:text-gray-500' }"
        />
      </UFormField>

      <UButton type="submit" block size="xl" color="neutral" variant="solid" :loading="loading" class="mt-2 bg-[var(--color-wa-teal)] hover:bg-[#008f72] text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
        Giriş Yap
      </UButton>
    </form>

    <div class="text-center text-sm text-gray-500">
      Hesabınız yok mu? 
      <NuxtLink to="/register" class="text-[var(--color-wa-teal)] hover:underline font-medium">Kayıt Ol</NuxtLink>
    </div>
  </div>
</template>
