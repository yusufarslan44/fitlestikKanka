<script setup lang="ts">
import { computed, ref } from 'vue';
import { useChatStore } from '~/stores/chat';
import { storeToRefs } from 'pinia';

const chatStore = useChatStore();
const { activeConversation, currentUser, activeContact } = storeToRefs(chatStore); // Keep currentUser, add sendMessage if needed for other parts, but not for dropdowns here.



const messageInput = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

watch(() => activeConversation.value?.messages.length, () => {
  scrollToBottom();
});

watch(() => activeConversation.value?.id, () => {
  scrollToBottom();
});

const handleSendMessage = () => {
  if (!messageInput.value.trim()) return;
  chatStore.sendMessage(messageInput.value);
  messageInput.value = '';
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="h-full flex flex-col bg-[#efeae2] dark:bg-[#0b141a]">
    
    <div v-if="activeConversation" class="h-full flex flex-col relative">
      <!-- Chat Header -->
      <!-- Chat Header -->
      <!-- Chat Header -->
      <div class="h-16 px-4 py-2 bg-[var(--color-wa-header-bg)] flex justify-between items-center border-b border-[var(--color-wa-border)] shrink-0 z-[100] relative shadow-sm">
        <div class="flex items-center gap-4 cursor-pointer">
          <UAvatar :src="activeContact?.avatar" :alt="activeContact?.name" :ui="{ image: 'rounded-full object-cover', root: 'w-10 h-10' }" class="w-10 h-10" />
          <div class="flex flex-col justify-center">
            <h3 class="font-normal text-[var(--color-wa-text-primary)] text-base">{{ activeContact?.name }}</h3>
            <span class="text-xs text-[var(--color-wa-text-secondary)] truncate" v-if="activeContact?.status === 'online'">online</span>
          </div>
        </div>
        <div class="flex items-center gap-4 text-[var(--color-wa-panel-header-icon)]">
          <UPopover :popper="{ placement: 'bottom-end', strategy: 'fixed' }" :ui="{ content: 'z-[9999]' }">
             <UButton color="neutral" variant="ghost" icon="i-heroicons-clipboard-document-list" label="Görevler" class="text-[var(--color-wa-panel-header-icon)] hover:bg-[var(--color-wa-hover)]" />
             <template #content>
               <div class="p-2 w-80 bg-white dark:bg-gray-900 shadow-xl rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 z-[999] relative">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white px-2 py-1.5 mb-1 border-b border-gray-100 dark:border-gray-800">Tanımlı Görevler</h4>
                  <ul class="space-y-1">
                    <li v-for="t in (activeConversation?.tasks || [])" :key="t.id" class="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors cursor-default">
                       <UIcon :name="t.status === 'completed' ? 'i-heroicons-check-circle' : 'i-heroicons-clock'" class="w-5 h-5 mt-0.5 shrink-0" :class="t.status === 'completed' ? 'text-green-500' : 'text-gray-400'" />
                       <div class="flex-1 min-w-0">
                          <p class="text-sm text-gray-700 dark:text-gray-200" :class="{ 'line-through opacity-70': t.status === 'completed' }">{{ t.title }}</p>
                          <span class="text-xs text-gray-400" v-if="t.status !== 'completed'">Bekliyor</span>
                       </div>
                    </li>
                    <li v-if="!activeConversation?.tasks?.length" class="text-sm text-gray-500 text-center py-4 italic">Henüz görev yok.</li>
                  </ul>
               </div>
             </template>
          </UPopover>
          
           <UPopover :popper="{ placement: 'bottom-end', strategy: 'fixed' }" :ui="{ content: 'z-[9999]' }">
             <UButton color="neutral" variant="ghost" icon="i-heroicons-banknotes" label="Borçlar" class="text-[var(--color-wa-panel-header-icon)] hover:bg-[var(--color-wa-hover)]" />
             <template #content>
                <div class="p-2 w-80 bg-white dark:bg-gray-900 shadow-xl rounded-lg ring-1 ring-gray-200 dark:ring-gray-800">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white px-2 py-1.5 mb-1 border-b border-gray-100 dark:border-gray-800">Alacak/Verecek Durumu</h4>
                  <ul class="space-y-1">
                    <li v-for="d in (activeConversation?.debts || [])" :key="d.id" class="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors cursor-default">
                       <div class="p-1.5 rounded-full shrink-0" :class="d.whoOwes === 'me' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-green-50 text-green-500 dark:bg-green-900/20'">
                          <UIcon :name="d.whoOwes === 'me' ? 'i-heroicons-arrow-trending-down' : 'i-heroicons-arrow-trending-up'" class="w-4 h-4" />
                       </div>
                       <div class="flex-1 min-w-0">
                          <div class="flex justify-between items-start">
                             <p class="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">{{ d.description }}</p>
                             <span class="text-sm font-bold whitespace-nowrap" :class="d.whoOwes === 'me' ? 'text-red-600' : 'text-green-600'">{{ d.amount }}₺</span>
                          </div>
                          <p class="text-xs text-gray-500 mt-0.5">{{ d.whoOwes === 'me' ? 'Sen ödemelisin' : 'Sana ödenecek' }}</p>
                       </div>
                    </li>
                     <li v-if="!activeConversation?.debts?.length" class="text-sm text-gray-500 text-center py-4 italic">Borç kaydı bulunmuyor.</li>
                  </ul>
               </div>
             </template>
          </UPopover>

          <div class="h-10 w-[1px] bg-gray-300 dark:bg-gray-700 mx-2"></div>
          
          <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 cursor-pointer" />
          <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6 cursor-pointer" />
        </div>
      </div>
      
      <!-- Messages Area with Background -->
      <div class="flex-1 relative overflow-hidden bg-[var(--color-wa-chat-bg)]">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-40 bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png')] pointer-events-none z-0"></div>
        
        <div ref="messagesContainer" class="absolute inset-0 overflow-y-auto z-0" style="scroll-behavior: smooth;">
           <TransitionGroup 
              tag="div" 
              class="flex flex-col justify-end min-h-full p-4 space-y-2"
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-4 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition-all duration-200 ease-in absolute w-full"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
              appear
            >
             <ChatBubble 
              v-for="msg in activeConversation.messages" 
              :key="msg.id" 
              :message="msg" 
              :is-mine="msg.senderId === currentUser.id" 
            />
           </TransitionGroup>
        </div>
      </div>

      <!-- Input Area -->
      <div class="min-h-[62px] px-4 py-2 bg-[var(--color-wa-header-bg)] flex items-center gap-4 z-20 border-t border-[var(--color-wa-border)]">
        <UIcon name="i-heroicons-face-smile" class="w-7 h-7 text-[var(--color-wa-panel-header-icon)] cursor-pointer" />
        <UIcon name="i-heroicons-plus" class="w-7 h-7 text-[var(--color-wa-panel-header-icon)] cursor-pointer" />
        
        <div class="flex-1 bg-[var(--color-wa-incoming)] dark:bg-[var(--color-wa-header-bg)] rounded-lg py-2 px-4 flex items-center">
          <input 
            v-model="messageInput"
            type="text"
            placeholder="Type a message" 
            class="bg-transparent border-none outline-none text-[15px] w-full text-[var(--color-wa-text-primary)] placeholder-[var(--color-wa-text-secondary)]"
            @keydown="handleKeydown"
          />
        </div>
        
        <UIcon 
          v-if="messageInput.trim()" 
          name="i-heroicons-paper-airplane" 
          class="w-7 h-7 text-[var(--color-wa-teal)] cursor-pointer"
          @click="handleSendMessage" 
        />
        <UIcon 
          v-else 
          name="i-heroicons-microphone" 
          class="w-7 h-7 text-[var(--color-wa-panel-header-icon)] cursor-pointer" 
        />
      </div>
    </div>

    <!-- No Chat Selected State -->
    <div v-else class="h-full flex flex-col items-center justify-center bg-[var(--color-wa-app-bg)] text-[var(--color-wa-text-secondary)] border-b-[6px] border-b-[var(--color-wa-teal)] box-border">
       <div class="text-center">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-32 h-32 text-violet-500 dark:text-violet-400 mb-6 mx-auto" />
          <h2 class="text-3xl font-light text-[var(--color-wa-text-primary)] mb-4">Fitleştik Kanka</h2>
          <p class="text-sm">Send and receive messages without keeping your phone online.</p>
          <p class="text-sm mt-1">Use app on up to 4 linked devices and 1 phone.</p>
       </div>
    </div>
  </div>
</template>
