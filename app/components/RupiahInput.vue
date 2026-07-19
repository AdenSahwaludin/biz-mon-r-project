<template>
  <div class="relative w-full">
    <span
      v-if="showPrefix"
      class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none pointer-events-none z-10"
    >
      Rp
    </span>
    <input
      ref="inputRef"
      type="text"
      inputmode="numeric"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full py-2 text-sm border border-gray-300 rounded-lg outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        showPrefix ? 'pl-10 pr-8' : 'px-3 pr-8',
        error ? 'border-red-400 focus:ring-red-400' : '',
        disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'text-gray-900 bg-white',
        customClass
      ]"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <button
      v-if="displayValue && !disabled"
      type="button"
      @click="clearInput"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100 z-10"
      title="Hapus"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | null | undefined
    placeholder?: string
    disabled?: boolean
    error?: boolean
    showPrefix?: boolean
    customClass?: string
  }>(),
  {
    placeholder: '0',
    disabled: false,
    error: false,
    showPrefix: true,
    customClass: '',
  }
)

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const inputRef = ref<HTMLInputElement | null>(null)

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num) || num === 0) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

function parseDigits(str: string): number {
  const clean = str.replace(/\D/g, '')
  if (!clean) return 0
  return parseInt(clean, 10) || 0
}

const displayValue = ref(formatNumber(props.modelValue))

watch(
  () => props.modelValue,
  (newVal) => {
    const currentNumeric = parseDigits(displayValue.value)
    if (newVal !== currentNumeric) {
      displayValue.value = formatNumber(newVal)
    }
  },
  { immediate: true }
)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const rawValue = target.value
  const numericValue = parseDigits(rawValue)

  const formatted = numericValue > 0 ? new Intl.NumberFormat('id-ID').format(numericValue) : ''
  displayValue.value = formatted
  target.value = formatted

  emit('update:modelValue', numericValue)
  emit('change', numericValue)
}

function clearInput() {
  displayValue.value = ''
  emit('update:modelValue', 0)
  emit('change', 0)
  inputRef.value?.focus()
}

function handleBlur(e: FocusEvent) {
  emit('blur', e)
}

function handleFocus(e: FocusEvent) {
  emit('focus', e)
}
</script>
