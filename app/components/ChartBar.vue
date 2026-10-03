<template>
  <div class="h-full w-full relative">
    <canvas ref="canvasRef"></canvas>
    <div v-if="!ready" class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
      Memuat grafik...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  chartData: any
  chartOptions?: any
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
let chart: any = null
let disposed = false

async function build() {
  if (!canvasRef.value || disposed) return
  const { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } = await import('chart.js')
  if (disposed || !canvasRef.value) return
  Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data: props.chartData,
    options: props.chartOptions || { responsive: true, maintainAspectRatio: false }
  })
  ready.value = true
}

onMounted(() => { void build() })

watch(() => props.chartData, (v) => {
  if (chart && v) {
    chart.data = v
    chart.update()
  }
}, { deep: true })

watch(() => props.chartOptions, (v) => {
  if (chart && v) {
    chart.options = v
    chart.update()
  }
}, { deep: true })

onBeforeUnmount(() => {
  disposed = true
  try { chart?.destroy() } catch {}
  chart = null
})
</script>
