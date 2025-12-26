<script setup lang="ts">
</script>

<template>
  <div class="h-screen w-full flex overflow-hidden bg-gray-100 dark:bg-gray-950">
    <!-- Left Sidebar -->
    <div class="w-1/4 min-w-[320px] max-w-[420px] h-full">
      <ChatSidebar />
    </div>

    <!-- Main Chat Window -->
    <div class="flex-1 h-full">
      <ChatWindow />
    </div>
  </div>
</template>
