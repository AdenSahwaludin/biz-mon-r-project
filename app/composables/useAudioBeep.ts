let sharedAudioCtx: AudioContext | null = null
let isUnlocked = false

function ensureAudioContext(): AudioContext | null {
  if (!process.client) return null
  if (!sharedAudioCtx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (Ctor) {
      sharedAudioCtx = new Ctor()
    }
  }
  return sharedAudioCtx
}

function unlockAudio() {
  if (!process.client) return
  const ctx = ensureAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  if (!isUnlocked) {
    try {
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
    } catch (_) {}
    isUnlocked = true
  }
}

// Auto unlock on any first user interaction on the page
if (process.client) {
  const handleUserInteraction = () => {
    unlockAudio()
  }
  window.addEventListener('click', handleUserInteraction, { capture: true, passive: true })
  window.addEventListener('pointerdown', handleUserInteraction, { capture: true, passive: true })
  window.addEventListener('keydown', handleUserInteraction, { capture: true, passive: true })
  window.addEventListener('touchstart', handleUserInteraction, { capture: true, passive: true })
}

async function getActiveContext(): Promise<AudioContext | null> {
  const ctx = ensureAudioContext()
  if (!ctx) return null
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch (_) {}
  }
  return ctx
}

export function useAudioBeep() {
  async function playSuccessBeep() {
    try {
      unlockAudio()
      const ctx = await getActiveContext()
      if (!ctx || ctx.state !== 'running') return

      const now = ctx.currentTime

      // Bright high-pitch beep (C6 = 1046.5Hz)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1046.5, now)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.6, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.2)
    } catch (e) {
      console.warn('Audio success beep failed:', e)
    }
  }

  async function playErrorBeep() {
    try {
      unlockAudio()
      const ctx = await getActiveContext()
      if (!ctx || ctx.state !== 'running') return

      const now = ctx.currentTime

      // Loud double-beep error warning tone (330Hz then 220Hz)
      for (const [freq, offset, dur] of [[350, 0, 0.14], [220, 0.16, 0.2]] as const) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, now + offset)

        gain.gain.setValueAtTime(0, now + offset)
        gain.gain.linearRampToValueAtTime(0.6, now + offset + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + offset)
        osc.stop(now + offset + dur)
      }
    } catch (e) {
      console.warn('Audio error beep failed:', e)
    }
  }

  return {
    unlockAudio,
    playSuccessBeep,
    playErrorBeep
  }
}
