<script setup lang="ts">
import { useDataStore } from '~/stores/data'
const auth = useAuthStore()
const data = useDataStore()

definePageMeta({
  layout: 'default' as any
})

// Redirect to login if not authenticated
onMounted(() => {
  if (!auth.isAuthenticated) {
    navigateTo('/login')
  } else {
    data.fetchAll()
  }
})

const tasks = computed(() => data.tasks)
const balance = computed(() => data.balance)
const loading = computed(() => data.loading)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'primary'
    case 'in_progress': return 'primary'
    case 'pending': return 'neutral' // warning might be better but neutral is safe
    case 'cancelled': return 'neutral' // error might be better
    default: return 'neutral'
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Hoş Geldin, <span class="text-[var(--color-wa-teal)]">{{ auth.user?.username }}</span> 👋
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Günün özeti ve bekleyen işlerin burada.</p>
      </div>
      <UButton to="/chat" icon="i-heroicons-chat-bubble-left-right" size="xl" color="primary" variant="solid" class="bg-[var(--color-wa-teal)] hover:bg-[#008f72] text-white">
        Sohbete Başla
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-if="balance">
      <UCard>
        <div class="text-center">
          <p class="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Alacakların</p>
          <p class="text-3xl font-bold text-green-500 mt-2">{{ formatCurrency(balance.total_to_collect) }}</p>
        </div>
      </UCard>
      
      <UCard>
        <div class="text-center">
          <p class="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Borçların</p>
          <p class="text-3xl font-bold text-red-500 mt-2">{{ formatCurrency(balance.total_owed) }}</p>
        </div>
      </UCard>

      <UCard :class="{'ring-green-500': balance.net_balance > 0, 'ring-red-500': balance.net_balance < 0}">
        <div class="text-center">
          <p class="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Net Durum</p>
          <p class="text-3xl font-bold mt-2" :class="balance.net_balance >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ balance.net_balance > 0 ? '+' : '' }}{{ formatCurrency(balance.net_balance) }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Tasks Section -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Görevlerim</h2>
        <UButton icon="i-heroicons-arrow-path" color="neutral" variant="ghost" :loading="loading" @click="data.fetchTasks" />
      </div>

      <UCard v-if="loading && tasks.length === 0">
        <div class="flex justify-center p-8">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </UCard>

      <div v-else-if="tasks.length > 0" class="grid gap-4">
        <UCard v-for="task in tasks" :key="task.id" :ui="{ body: { padding: 'p-4 sm:p-6' } } as any">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2">
                <UBadge :color="getStatusColor(task.status) as any" variant="subtle" size="sm" class="capitalize">
                  {{ task.status }}
                </UBadge>
                <span class="text-xs text-gray-500">{{ formatDate(task.created_at) }}</span>
              </div>
              <p class="mt-2 font-medium text-gray-900 dark:text-white">{{ task.item_name }}</p>
            </div>
            
            <div class="flex items-center gap-2">
               <!-- Future actions: Complete, Edit -->
            </div>
          </div>
        </UCard>
      </div>

      <UCard v-else>
        <div class="text-center py-8 text-gray-500">
          <UIcon name="i-heroicons-clipboard-document-list" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Henüz atanmış bir görevin yok.</p>
        </div>
      </UCard>
    </div>
  </div>
</template>
