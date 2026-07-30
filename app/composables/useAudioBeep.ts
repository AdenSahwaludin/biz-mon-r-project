export function useAudioBeep() {
  let audioCtx: AudioContext | null = null

  function getAudioContext() {
    if (!process.client) return null
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioCtx = new AudioContextClass()
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
    return audioCtx
  }

  function playSuccessBeep() {
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime) // High C (C6)

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) {
      console.warn('Audio beep failed:', e)
    }
  }

  function playErrorBeep() {
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      // Double low pitch beep
      const now = ctx.currentTime
      
      const playTone = (time: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(280, time) // Low tone

        gain.gain.setValueAtTime(0, time)
        gain.gain.linearRampToValueAtTime(0.2, time + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(time)
        osc.stop(time + 0.1)
      }

      playTone(now)
      playTone(now + 0.12)
    } catch (e) {
      console.warn('Audio error beep failed:', e)
    }
  }

  return {
    playSuccessBeep,
    playErrorBeep
  }
}
