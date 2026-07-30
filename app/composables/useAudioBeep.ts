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

export function useAudioBeep() {
  /**
   * MUST be called from a direct user-gesture handler (click, touchend)
   * to unlock AudioContext on mobile browsers (iOS Safari, Chrome Android).
   */
  function unlockAudio() {
    if (isUnlocked) return
    const ctx = ensureAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    // Play a silent buffer to fully unlock on iOS
    try {
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
    } catch (_) {}

    isUnlocked = true
  }

  function playSuccessBeep() {
    try {
      const ctx = ensureAudioContext()
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})

      const now = ctx.currentTime

      // Bright high-pitch beep (C6)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1046.5, now)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.5, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.18)
    } catch (e) {
      console.warn('Audio beep failed:', e)
    }
  }

  function playErrorBeep() {
    try {
      const ctx = ensureAudioContext()
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})

      const now = ctx.currentTime

      // Two descending buzzy tones
      for (const [freq, offset, dur] of [[330, 0, 0.12], [220, 0.15, 0.18]] as const) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, now + offset)
        gain.gain.setValueAtTime(0, now + offset)
        gain.gain.linearRampToValueAtTime(0.45, now + offset + 0.005)
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
