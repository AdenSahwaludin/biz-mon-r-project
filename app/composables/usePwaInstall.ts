import { ref, onMounted } from 'vue'

const deferredPrompt = ref<any>(null)
const isInstalled = ref(false)
const canInstall = ref(false)

export const usePwaInstall = () => {
  onMounted(() => {
    if (typeof window === 'undefined') return

    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      isInstalled.value = true
      canInstall.value = false
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e
      canInstall.value = true
    })

    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      canInstall.value = false
      deferredPrompt.value = null
    })
  })

  async function installPwa() {
    if (!deferredPrompt.value) return false
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      canInstall.value = false
      isInstalled.value = true
    }
    deferredPrompt.value = null
    return outcome === 'accepted'
  }

  return {
    canInstall,
    isInstalled,
    installPwa
  }
}
