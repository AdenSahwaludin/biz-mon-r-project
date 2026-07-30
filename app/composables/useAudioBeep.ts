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
    if (!process.client) return
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  }

  function playSuccessBeep() {
    if (!process.client) return
    try {
      const ctx = getAudioContext()
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {})
        }

        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(1046.5, now) // C6 pitch

        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.6, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.25)
      }
    } catch (e) {
      console.warn('Audio success beep failed:', e)
    }
  }

  function playErrorBeep() {
    if (!process.client) return
    try {
      const ctx = getAudioContext()
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {})
        }

        const now = ctx.currentTime

        const playPulse = (freq: number, start: number, dur: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()

          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, start)

          gain.gain.setValueAtTime(0, start)
          gain.gain.linearRampToValueAtTime(0.7, start + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur)

          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(start)
          osc.stop(start + dur)
        }

        playPulse(260, now, 0.18)
        playPulse(170, now + 0.2, 0.25)
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
