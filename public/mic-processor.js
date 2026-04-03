// AudioWorkletProcessor — runs on the audio rendering thread
// Uses a typed-array ring buffer to avoid GC pressure that was killing the worklet.

const TARGET_SR = 16000
const CHUNK_MS  = 100  // emit every 100 ms = 1600 samples at 16 kHz

class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    // Pre-allocate 5 seconds of headroom at native SR (usually 48 kHz)
    const MAX_NATIVE = 48000 * 5
    this._buf    = new Float32Array(MAX_NATIVE)
    this._head   = 0   // write cursor
    this._muted  = false

    this.port.onmessage = (e) => {
      if (e.data.type === "mute") this._muted = e.data.value
    }
  }

  process(inputs) {
    if (this._muted) return true
    const ch = inputs[0]?.[0]
    if (!ch) return true

    // Copy into ring buffer
    const room = this._buf.length - this._head
    if (ch.length <= room) {
      this._buf.set(ch, this._head)
      this._head += ch.length
    } else {
      // Wrap — shouldn't happen in practice but handle gracefully
      this._buf.set(ch.subarray(0, room), this._head)
      this._head = 0
    }

    // Flush complete 100-ms chunks
    const nativeSR   = sampleRate            // global inside AudioWorkletProcessor
    const nativeChunk = Math.round(nativeSR * CHUNK_MS / 1000)
    const outChunk    = Math.round(TARGET_SR * CHUNK_MS / 1000)  // 1600

    while (this._head >= nativeChunk) {
      // Slice native-SR chunk
      const native = this._buf.subarray(0, nativeChunk)

      // Linear-interpolation downsample → 16 kHz
      const ratio = nativeSR / TARGET_SR
      const out   = new Float32Array(outChunk)
      for (let i = 0; i < outChunk; i++) {
        const pos  = i * ratio
        const idx  = Math.floor(pos)
        const frac = pos - idx
        const a    = native[idx]   ?? 0
        const b    = native[idx + 1] ?? a
        out[i] = a + (b - a) * frac
      }

      // Convert to signed 16-bit PCM
      const pcm16 = new Int16Array(outChunk)
      for (let i = 0; i < outChunk; i++) {
        const s = Math.max(-1, Math.min(1, out[i]))
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }

      // Transfer buffer to main thread (zero-copy)
      this.port.postMessage({ type: "chunk", pcm16 }, [pcm16.buffer])

      // Shift remaining samples to the front
      this._buf.copyWithin(0, nativeChunk, this._head)
      this._head -= nativeChunk
    }

    return true  // keep processor alive
  }
}

registerProcessor("mic-processor", MicProcessor)
