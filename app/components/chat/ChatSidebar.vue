<script setup lang="ts">
import { useChatStore } from '~/stores/chat';
import { storeToRefs } from 'pinia';

const chatStore = useChatStore();
const { conversations, activeConversationId } = storeToRefs(chatStore);

const getContact = (conversationId: string) => {
  const conversation = conversations.value.find(c => c.id === conversationId);
  if (!conversation) return null;
  return chatStore.contacts.find(u => u.id === conversation.contactId);
};

const getLastMessage = (conversation: any) => {
  if (conversation.lastMessage) return conversation.lastMessage.text;
  const last = conversation.messages[conversation.messages.length - 1];
  return last ? last.text : 'No messages yet';
};

const formatTime = (date?: Date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="h-full border-r border-[var(--color-wa-border)] flex flex-col bg-[var(--color-wa-bg)] dark:bg-[var(--color-wa-bg)]">
    <!-- Header -->
    <div class="h-16 px-4 bg-[var(--color-wa-header-bg)] flex justify-between items-center border-b border-[var(--color-wa-border)] shrink-0">
      <div class="flex items-center gap-2">
        <UAvatar :src="chatStore.currentUser.avatar" alt="My Profile" :ui="{ image: 'rounded-full object-cover', root: 'w-10 h-10' }" class="w-10 h-10" />
      </div>
      <div class="flex gap-4 text-[var(--color-wa-panel-header-icon)]">
         <UIcon name="i-heroicons-user-group" class="w-6 h-6 cursor-pointer" />
         <UIcon name="i-heroicons-chat-bubble-oval-left" class="w-6 h-6 cursor-pointer" />
         <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6 cursor-pointer" />
      </div>
    </div>
    
    <!-- Search Bar -->
    <div class="p-2 border-b border-[var(--color-wa-border)] bg-[var(--color-wa-incoming)] dark:bg-[var(--color-wa-bg)]">
      <div class="bg-[var(--color-wa-header-bg)] rounded-lg flex items-center px-3 py-1.5 gap-3">
        <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-[var(--color-wa-text-secondary)]" />
        <input 
          type="text" 
          placeholder="Search or start new chat" 
          class="bg-transparent border-none outline-none text-sm w-full placeholder-[var(--color-wa-text-secondary)] text-[var(--color-wa-text-primary)]"
        />
      </div>
    </div>
    
    <!-- Conversation List -->
    <div class="flex-1 overflow-y-auto bg-[var(--color-wa-incoming)] dark:bg-[var(--color-wa-bg)]">
      <div 
        v-for="conversation in conversations" 
        :key="conversation.id"
        class="h-[72px] px-3 flex items-center cursor-pointer hover:bg-[var(--color-wa-hover)] transition-colors relative"
        :class="{ 'bg-[var(--color-wa-hover)]': activeConversationId === conversation.id }"
        @click="chatStore.setActiveConversation(conversation.id)"
      >
        <!-- Contact Avatar -->
         <UAvatar :src="getContact(conversation.id)?.avatar" :alt="getContact(conversation.id)?.name" :ui="{ image: 'rounded-full object-cover', root: 'w-12 h-12' }" class="mr-3 shrink-0 w-12 h-12" />
        
        <!-- Content -->
        <div class="flex-1 min-w-0 h-full flex flex-col justify-center border-b border-[var(--color-wa-border)] pr-2">
           <div class="flex justify-between items-baseline mb-1">
              <span class="text-[17px] text-[var(--color-wa-text-primary)] font-normal truncate">
                {{ getContact(conversation.id)?.name }}
              </span>
              <ClientOnly>
                <span class="text-xs text-[var(--color-wa-text-secondary)] whitespace-nowrap ml-2 font-light">
                 {{ formatTime(conversation.messages[conversation.messages.length-1]?.timestamp) }}
                </span>
                <template #fallback>
                  <span class="text-xs text-[var(--color-wa-text-secondary)]">...</span>
                </template>
              </ClientOnly>
           </div>
           
           <div class="flex justify-between items-center">
              <p class="text-sm text-[var(--color-wa-text-secondary)] truncate flex-1 pr-2">
                {{ getLastMessage(conversation) }}
              </p>
              <div v-if="conversation.unreadCount > 0" class="bg-[var(--color-wa-teal)] text-white text-[12px] font-medium h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center">
                {{ conversation.unreadCount }}
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
