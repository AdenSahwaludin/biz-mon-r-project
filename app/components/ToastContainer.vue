<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts.toasts"
          :key="toast.id"
          class="pointer-events-auto max-w-sm w-full bg-white rounded-lg shadow-lg border px-4 py-3 flex items-start gap-3"
          :class="borderClass(toast.type)"
        >
          <component :is="iconFor(toast.type)" class="w-5 h-5 shrink-0 mt-0.5" :class="iconColor(toast.type)" />
          <p class="text-sm text-gray-700 flex-1">{{ toast.message }}</p>
          <button @click="toasts.remove(toast.id)" class="text-gray-400 hover:text-gray-600 shrink-0">
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
const toasts = useToastStore()

function iconFor(type: string) {
  return { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }[type] || Info
}

function iconColor(type: string) {
  return {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }[type] || 'text-gray-500'
}

function borderClass(type: string) {
  return {
    success: 'border-green-200',
    error: 'border-red-200',
    warning: 'border-yellow-200',
    info: 'border-blue-200',
  }[type] || 'border-gray-200'
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
