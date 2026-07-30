<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col bg-black/90 text-white select-none backdrop-blur-xs overflow-hidden"
      >
        <!-- Top Bar Header -->
        <div class="relative z-20 flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-white/10 shadow-md">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-primary-500/20 text-primary-400">
              <ScanLine class="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 class="text-base font-bold leading-tight">Scan Barcode Produk</h3>
              <p class="text-xs text-gray-400">Gunakan kamera belakang HP</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Flash / Torch Button (if supported) -->
            <button
              v-if="hasTorchSupport"
              @click="toggleTorch"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
              :class="isTorchOn ? 'bg-amber-500 text-gray-950 border-amber-400 font-bold shadow-lg shadow-amber-500/30' : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700'"
            >
              <Zap class="w-4 h-4" :class="{ 'fill-current': isTorchOn }" />
              <span>Flash {{ isTorchOn ? 'ON' : 'OFF' }}</span>
            </button>

            <!-- Close Button -->
            <button
              @click="closeScanner"
              type="button"
              class="p-2 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              title="Tutup (Esc)"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Camera / Scanner View Container -->
        <div class="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <!-- HTML5 Video element -->
          <video
            ref="videoRef"
            class="absolute inset-0 w-full h-full object-cover"
            playsinline
            muted
            autoplay
          ></video>

          <!-- Error Overlay State -->
          <div v-if="cameraError" class="relative z-30 max-w-sm mx-4 p-6 bg-gray-900/90 rounded-2xl border border-red-500/40 text-center shadow-2xl backdrop-blur-md">
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <CameraOff class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-white mb-1">Kamera Tidak Aktif</h4>
            <p class="text-sm text-gray-300 mb-4">{{ cameraError }}</p>
            <button
              @click="initCamera"
              type="button"
              class="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/30"
            >
              Coba Lagi
            </button>
          </div>

          <!-- Loading Camera State -->
          <div v-else-if="isLoading" class="relative z-30 flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            <p class="text-sm font-medium text-gray-300">Menyiapkan kamera...</p>
          </div>

          <!-- Target Scanning Frame & Overlay Grid (when camera is running) -->
          <template v-else>
            <!-- Dim Backdrop Overlay around target window -->
            <div class="absolute inset-0 z-10 pointer-events-none flex flex-col">
              <!-- Top mask -->
              <div class="bg-black/55 flex-1"></div>
              
              <!-- Middle strip containing clear window -->
              <div class="flex h-56 sm:h-64">
                <div class="bg-black/55 flex-1"></div>
                <!-- Target Box (Scan Window) -->
                <div class="relative w-72 sm:w-80 h-full">
                  <!-- Corner Borders -->
                  <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-400 rounded-tl-lg"></div>
                  <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-400 rounded-tr-lg"></div>
                  <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-400 rounded-bl-lg"></div>
                  <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-400 rounded-br-lg"></div>

                  <!-- Animated Laser Beam -->
                  <div
                    class="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-scan-beam"
                    :class="{ 'opacity-30': isLocked }"
                  ></div>

                  <!-- Success Pulse Flash inside target window -->
                  <div
                    v-if="showSuccessFlash"
                    class="absolute inset-0 bg-emerald-500/30 border-2 border-emerald-400 rounded-lg animate-pulse"
                  ></div>
                </div>
                <div class="bg-black/55 flex-1"></div>
              </div>

              <!-- Bottom mask -->
              <div class="bg-black/55 flex-1 flex items-start justify-center pt-6 px-4">
                <div class="text-center bg-gray-900/75 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                  <p class="text-xs sm:text-sm font-medium text-gray-200">
                    Posisikan barcode di dalam kotak scan
                  </p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Bottom Scanner Status Bar -->
        <div class="relative z-20 px-4 py-3 bg-gray-900/90 border-t border-white/10 text-center text-xs text-gray-400 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" :class="isLocked ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'"></span>
            <span>{{ isLocked ? 'Memproses barcode...' : 'Kamera Aktif (Siap Scan)' }}</span>
          </div>

          <div class="text-[11px] font-mono text-gray-500">
            Engine: {{ activeEngine }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { ScanLine, Zap, X, CameraOff } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'scan', barcode: string): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isLoading = ref(true)
const cameraError = ref<string | null>(null)
const isTorchOn = ref(false)
const hasTorchSupport = ref(false)
const isLocked = ref(false)
const showSuccessFlash = ref(false)
const activeEngine = ref<'BarcodeDetector' | 'ZXing' | 'None'>('None')

let mediaStream: MediaStream | null = null
let mediaTrack: MediaStreamTrack | null = null
let animFrameId: number | null = null
let zxingReader: any = null
let lockTimer: any = null
let lastScannedCode: string | null = null
let lastScannedTime = 0

// Watch isOpen to initialize or stop camera
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      initCamera()
    } else {
      stopCamera()
    }
  },
  { immediate: true }
)

async function initCamera() {
  if (!process.client) return
  isLoading.value = true
  cameraError.value = null
  isTorchOn.value = false
  hasTorchSupport.value = false
  activeEngine.value = 'None'

  stopCamera()

  try {
    // 1. Request camera stream with preferred rear environment camera & 720p HD resolution
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
    } catch (err) {
      // Fallback without exact environment facingMode restriction
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
    }

    mediaStream = stream
    mediaTrack = stream.getVideoTracks()[0] || null

    // Check torch capabilities
    if (mediaTrack && typeof mediaTrack.getCapabilities === 'function') {
      const caps = mediaTrack.getCapabilities() as any
      if (caps && caps.torch) {
        hasTorchSupport.value = true
      }
    }

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }

    isLoading.value = false

    // 2. Start Barcode Engine Detection
    startScanEngine()
  } catch (err: any) {
    isLoading.value = false
    console.error('Camera access error:', err)

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = 'Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.'
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      cameraError.value = 'Perangkat tidak memiliki kamera yang tersedia.'
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      cameraError.value = 'Kamera sedang digunakan oleh aplikasi lain.'
    } else {
      cameraError.value = 'Browser Anda belum mendukung fitur scan kamera ini.'
    }
  }
}

async function startScanEngine() {
  if (!process.client || !videoRef.value) return

  // Option 1: Native BarcodeDetector API (Chrome 83+, Edge 83+, Android Webview)
  if ('BarcodeDetector' in window) {
    try {
      activeEngine.value = 'BarcodeDetector'
      const supportedFormats = await (window as any).BarcodeDetector.getSupportedFormats()
      const formats = supportedFormats.length > 0 ? supportedFormats : [
        'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_39', 'code_93', 'code_128',
        'itf', 'codabar', 'qr_code', 'data_matrix', 'pdf417', 'aztec'
      ]

      const detector = new (window as any).BarcodeDetector({ formats })

      const scanFrame = async () => {
        if (!props.isOpen || !videoRef.value || activeEngine.value !== 'BarcodeDetector') return

        if (!isLocked.value && videoRef.value.readyState >= 2) {
          try {
            const barcodes = await detector.detect(videoRef.value)
            if (barcodes && barcodes.length > 0) {
              const rawVal = barcodes[0].rawValue?.trim()
              if (rawVal) {
                handleDetectedBarcode(rawVal)
              }
            }
          } catch (e) {
            // Ignore frame detection error
          }
        }

        animFrameId = requestAnimationFrame(scanFrame)
      }

      scanFrame()
      return
    } catch (e) {
      console.warn('BarcodeDetector initialization failed, falling back to ZXing:', e)
    }
  }

  // Option 2: Fallback to ZXing Browser MultiFormatReader
  try {
    activeEngine.value = 'ZXing'
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    zxingReader = new BrowserMultiFormatReader()

    zxingReader.decodeFromVideoElement(videoRef.value, (result: any, err: any) => {
      if (!props.isOpen || isLocked.value) return
      if (result) {
        const text = result.getText()?.trim()
        if (text) {
          handleDetectedBarcode(text)
        }
      }
    })
  } catch (e) {
    console.error('ZXing fallback failed:', e)
    cameraError.value = 'Gagal memuat engine barcode scanner.'
  }
}

function handleDetectedBarcode(code: string) {
  const now = Date.now()

  // Prevent immediate duplicate reading within 1000ms if code is identical
  if (lastScannedCode === code && now - lastScannedTime < 1000) {
    return
  }

  if (isLocked.value) return

  // Lock for 700ms according to PRD anti-double scan requirement
  isLocked.value = true
  lastScannedCode = code
  lastScannedTime = now

  showSuccessFlash.value = true
  setTimeout(() => {
    showSuccessFlash.value = false
  }, 300)

  // Emit event to parent
  emit('scan', code)

  // Unlock after 700 ms
  if (lockTimer) clearTimeout(lockTimer)
  lockTimer = setTimeout(() => {
    isLocked.value = false
  }, 700)
}

async function toggleTorch() {
  if (!mediaTrack || !hasTorchSupport.value) return
  try {
    isTorchOn.value = !isTorchOn.value
    await mediaTrack.applyConstraints({
      advanced: [{ torch: isTorchOn.value } as any]
    })
  } catch (err) {
    console.warn('Toggle torch failed:', err)
  }
}

function stopCamera() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  if (zxingReader) {
    try {
      // Clean up ZXing reader
      if (typeof zxingReader.reset === 'function') {
        zxingReader.reset()
      }
    } catch (e) {}
    zxingReader = null
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
    mediaStream = null
    mediaTrack = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  if (lockTimer) {
    clearTimeout(lockTimer)
    lockTimer = null
  }

  isLocked.value = false
  isTorchOn.value = false
}

function closeScanner() {
  stopCamera()
  emit('close')
}

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scanBeam {
  0% {
    top: 5%;
  }
  50% {
    top: 95%;
  }
  100% {
    top: 5%;
  }
}

.animate-scan-beam {
  animation: scanBeam 2.2s ease-in-out infinite;
}
</style>
