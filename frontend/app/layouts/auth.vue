<template>
  <div class="min-h-screen bg-[#d1d7db] dark:bg-[#111b21] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Background Header Band -->
    <div class="absolute top-0 left-0 w-full h-[220px] bg-[var(--color-wa-teal)] z-0"></div>

    <!-- Main Content Container -->
    <div class="w-full max-w-[450px] bg-white dark:bg-[#202c33] rounded-xl shadow-2xl z-10 flex flex-col overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800">
      <!-- App Header/Logo -->
      <div class="px-10 py-8 text-center bg-gray-50/50 dark:bg-gray-800/30">
         <UIcon name="i-heroicons-chat-bubble-left-right" class="w-14 h-14 text-violet-500 dark:text-violet-400 mx-auto mb-3" />
         <h1 class="text-2xl font-light tracking-wide text-[#41525d] dark:text-[#e9edef]">Fitleştik Kanka</h1>
      </div>

      <!-- Page Content -->
      <div class="p-10 pt-6">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-[#8696a0] text-sm z-10">
      <p>&copy; 2025 Fitleştik Kanka</p>
    </div>
  </div>
</template>

<style scoped>
/* Ensure we have access to the variables or define fallbacks if needed, 
   though they should be available globally from main.css */
</style>
