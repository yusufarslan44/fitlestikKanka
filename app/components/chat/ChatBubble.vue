<script setup lang="ts">
import type { Message } from '~/stores/chat';

const props = defineProps<{
  message: Message
  isMine: boolean
}>()

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex mb-1" :class="{ 'justify-end': isMine, 'justify-start': !isMine }">
    <div 
      class="max-w-[65%] min-h-[34px] min-w-[70px] rounded-md px-2 py-1 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] relative text-[14.2px] leading-[19px] text-[var(--color-wa-text-primary)]"
      :class="isMine ? 'bg-[var(--color-wa-outgoing)] rounded-tr-none' : 'bg-[var(--color-wa-incoming)] rounded-tl-none'"
    >
      <!-- Message Text -->
      <div class="px-1 pt-1 pb-[14px]">
        {{ message.text }}
      </div>

      <!-- Meta (Time + Check) relative absolute bottom right -->
      <div class="absolute bottom-1 right-2 flex items-center gap-[3px] select-none">
         <ClientOnly>
          <span class="text-[11px] text-[var(--color-wa-text-secondary)] min-w-[30px] text-right">{{ formatTime(message.timestamp) }}</span>
          <template #fallback>
             <span class="text-[11px] text-[var(--color-wa-text-secondary)]">...</span>
          </template>
        </ClientOnly>
        
        <!-- Checkmark (only for sent messages) -->
        <span v-if="isMine" :class="message.isRead ? 'text-[#53bdeb]' : 'text-[var(--color-wa-text-secondary)]'">
            <!-- Double check SVG (simulated with heroicons for now, but usually custom) -->
            <div class="relative w-4 h-3">
               <UIcon name="i-heroicons-check" class="w-3 h-3 absolute left-0" />
               <UIcon name="i-heroicons-check" class="w-3 h-3 absolute left-[5px]" />
            </div>
        </span>
      </div>

      <!-- Detailed Tail using SVG for precision (Optional, simplified with CSS borders for now) -->
      <span v-if="isMine" class="absolute -right-[8px] top-0 w-0 h-0 border-t-[8px] border-t-[var(--color-wa-outgoing)] border-r-[8px] border-r-transparent"></span>
      <span v-if="!isMine" class="absolute -left-[8px] top-0 w-0 h-0 border-t-[8px] border-t-[var(--color-wa-incoming)] border-l-[8px] border-l-transparent transform scale-x-[-1]"></span>

    </div>
  </div>
</template>
