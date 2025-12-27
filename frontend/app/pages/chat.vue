<script setup lang="ts">
definePageMeta({
  layout: 'chat',
  middleware: 'auth'
})
</script>

<template>
  <div class="h-full">
    <ChatWindow />
  </div>
</template>
