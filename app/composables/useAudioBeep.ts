let sharedAudioCtx: AudioContext | null = null

function getAudioContext() {
  if (!process.client) return null
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass()
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {})
  }
  return sharedAudioCtx
}

export function useAudioBeep() {
  function unlockAudio() {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  }

  function playSuccessBeep() {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1046.5, now) // C6 pitch

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.4, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.2)
    } catch (e) {
      console.warn('Audio beep failed:', e)
    }
  }

  function playErrorBeep() {
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.4, start + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + duration)
      }

      playTone(220, now, 0.15)
      playTone(180, now + 0.18, 0.2)
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
