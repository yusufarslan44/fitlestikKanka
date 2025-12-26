<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const auth = useAuthStore()
const username = ref('')
const email = ref('')
const password = ref('')
const loading = computed(() => auth.loading)

const handleRegister = async () => {
  const success = await auth.register({
    username: username.value,
    email: email.value,
    password: password.value
  })

  if (success) {
    navigateTo('/login')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-xl font-medium text-gray-900 dark:text-white">Kayıt Ol</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Fitleştik Kanka ailesine katılın</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-5">
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

      <UFormField label="E-posta Adresi" name="email" class="font-medium text-gray-700 dark:text-gray-200">
        <UInput 
          v-model="email" 
          type="email" 
          placeholder="ornek@email.com" 
          icon="i-heroicons-envelope" 
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
        Kayıt Ol
      </UButton>
    </form>

    <div class="text-center text-sm text-gray-500">
      Zaten hesabınız var mı?
      <NuxtLink to="/login" class="text-[var(--color-wa-teal)] hover:underline font-medium">Giriş Yap</NuxtLink>
    </div>
  </div>
</template>
