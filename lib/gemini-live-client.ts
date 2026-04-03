// Gemini Live API — BidiGenerateContent over WebSocket
// Mic lifecycle is SEPARATE from WS lifecycle.
// The mic stays open until disconnect() is explicitly called.

type LiveConfig = {
  token: string
  model: string
  systemInstruction?: string
  onInputTranscript?: (text: string) => void
  onOutputTranscript?: (text: string) => void
  onVolumeLevel?: (level: number) => void   // 0.0 – 1.0 mic RMS level
  onError?: (err: Error) => void
  onClose?: () => void
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null
  private stream: MediaStream | null = null
  private audioCtx: AudioContext | null = null
  private workletNode: AudioWorkletNode | null = null
  private analyser: AnalyserNode | null = null
  private analyserRaf = 0
  private playCtx: AudioContext | null = null
  private nextPlay = 0
  private muted = false
  private destroyed = false   // set true only when disconnect() is called
  private cfg: LiveConfig

  constructor(cfg: LiveConfig) {
    this.cfg = cfg
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    this.destroyed = false

    // 1. Acquire mic ONCE — kept alive for the whole call
    if (!this.stream) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
      } catch (e: any) {
        throw new Error("마이크 접근이 거부됐습니다: " + (e.message ?? e))
      }
    }

    // 2. Open WebSocket
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.cfg.token}`
    this.ws = new WebSocket(url)
    this.ws.binaryType = "arraybuffer"

    return new Promise<void>((resolve, reject) => {
      const tid = setTimeout(() => {
        reject(new Error("Gemini Live setup timeout (15s)"))
      }, 15_000)

      this.ws!.onopen = () => {
        console.log("[v0] WS opened — sending setup for model:", this.cfg.model)
        // 3. Send setup
        this.ws!.send(JSON.stringify({
          setup: {
            model: `models/${this.cfg.model}`,
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: { voice_name: "Aoede" },
                },
              },
            },
            input_audio_transcription: {},
            output_audio_transcription: {},
            ...(this.cfg.systemInstruction && {
              system_instruction: {
                parts: [{ text: this.cfg.systemInstruction }],
              },
            }),
          },
        }))
      }

      this.ws!.onmessage = (ev) => {
        let msg: any
        try {
          const raw = typeof ev.data === "string"
            ? ev.data
            : new TextDecoder().decode(ev.data as ArrayBuffer)
          msg = JSON.parse(raw)
        } catch { return }

        console.log("[v0] WS message keys:", Object.keys(msg), JSON.stringify(msg).slice(0, 200))

        // 4. setupComplete — check both camelCase and snake_case
        const isSetupComplete =
          msg.setupComplete !== undefined || msg.setup_complete !== undefined
        if (isSetupComplete) {
          console.log("[v0] setupComplete received — starting worklet")
          clearTimeout(tid)
          this.startWorklet()
            .then(resolve)
            .catch(reject)
          return
        }

        this.handleServerMessage(msg)
      }

      this.ws!.onerror = (e) => {
        clearTimeout(tid)
        console.error("[v0] WS error:", e)
        const err = new Error("WebSocket 오류 — 모델명/API 키 확인")
        this.cfg.onError?.(err)
        reject(err)
      }

      this.ws!.onclose = (ev) => {
        clearTimeout(tid)
        console.log("[v0] WS closed:", ev.code, ev.reason)
        if (!this.destroyed) {
          this.cfg.onError?.(new Error(`WS closed: ${ev.code} ${ev.reason}`))
        }
        this.ws = null
      }
    })
  }

  setMuted(m: boolean) {
    this.muted = m
    this.workletNode?.port.postMessage({ type: "mute", value: m })
  }

  /** Trigger the AI customer to speak first after the call connects. */
  greet() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    // Inject a user prompt so the model immediately replies with its opening line
    this.ws.send(JSON.stringify({
      client_content: {
        turns: [
          { role: "user", parts: [{ text: "Hello?" }] },
        ],
        turn_complete: true,
      },
    }))
  }

  /** Called only by the user (hangup button or unmount). Kills mic + WS. */
  disconnect() {
    this.destroyed = true
    this.cleanupWorkletAndMic()
    if (this.ws && this.ws.readyState < WebSocket.CLOSING) {
      this.ws.close(1000, "hangup")
    }
    this.ws = null
    try { this.playCtx?.close() } catch {}
    this.playCtx = null
    this.cfg.onClose?.()
  }

  // ── AudioWorklet ─────────────────────────────────────────────────────────────

  private async startWorklet(): Promise<void> {
    if (!this.stream) throw new Error("No media stream")
    if (this.workletNode) return   // already running

    this.audioCtx = new AudioContext()
    await this.audioCtx.audioWorklet.addModule("/mic-processor.js")

    const src = this.audioCtx.createMediaStreamSource(this.stream)
    this.workletNode = new AudioWorkletNode(this.audioCtx, "mic-processor")

    this.workletNode.port.onmessage = (ev) => {
      if (ev.data.type !== "chunk") return
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
      if (this.muted) return

      const pcm16: Int16Array = ev.data.pcm16
      const b64 = this.toB64(new Uint8Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength))
      this.ws.send(JSON.stringify({
        realtime_input: {
          media_chunks: [{ data: b64, mime_type: "audio/pcm;rate=16000" }],
        },
      }))
    }

    // Connect to silent gain → destination so Chrome actually runs the audio graph
    const silentGain = this.audioCtx.createGain()
    silentGain.gain.value = 0
    src.connect(this.workletNode)
    this.workletNode.connect(silentGain)
    silentGain.connect(this.audioCtx.destination)

    // AnalyserNode for mic volume level
    if (this.cfg.onVolumeLevel) {
      this.analyser = this.audioCtx.createAnalyser()
      this.analyser.fftSize = 256
      src.connect(this.analyser)
      const buf = new Uint8Array(this.analyser.frequencyBinCount)
      const tick = () => {
        if (!this.analyser || this.muted) {
          this.cfg.onVolumeLevel?.(0)
          this.analyserRaf = requestAnimationFrame(tick)
          return
        }
        this.analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / buf.length)
        this.cfg.onVolumeLevel?.(Math.min(1, rms * 4))
        this.analyserRaf = requestAnimationFrame(tick)
      }
      this.analyserRaf = requestAnimationFrame(tick)
    }
  }

  private cleanupWorkletAndMic() {
    cancelAnimationFrame(this.analyserRaf)
    this.cfg.onVolumeLevel?.(0)
    try { this.analyser?.disconnect() } catch {}
    this.analyser = null
    try { this.workletNode?.port.postMessage({ type: "mute", value: true }) } catch {}
    try { this.workletNode?.disconnect() } catch {}
    try { this.audioCtx?.close() } catch {}
    // Stop all mic tracks — only called from disconnect()
    this.stream?.getTracks().forEach(t => t.stop())
    this.workletNode = null
    this.audioCtx = null
    this.stream = null
  }

  // ── Server message parser ─────────────────────────────────────────────────────

  private handleServerMessage(msg: any) {
    console.log("[v0] handleServerMessage:", JSON.stringify(msg).slice(0, 300))

    const sc = msg.serverContent ?? msg.server_content
    if (!sc) return

    // Input transcription (agent mic → text)
    const inTxt =
      sc.inputTranscription?.text ??
      sc.input_transcription?.text ??
      sc.inputTranscription?.parts?.[0]?.text ??
      sc.input_transcription?.parts?.[0]?.text
    if (inTxt) this.cfg.onInputTranscript?.(inTxt)

    // Output transcription (AI speech → text)
    const outTxt =
      sc.outputTranscription?.text ??
      sc.output_transcription?.text ??
      sc.outputTranscription?.parts?.[0]?.text ??
      sc.output_transcription?.parts?.[0]?.text
    if (outTxt) this.cfg.onOutputTranscript?.(outTxt)

    // Model turn parts — audio and/or text
    const parts: any[] = sc.modelTurn?.parts ?? sc.model_turn?.parts ?? []
    for (const p of parts) {
      // inline audio data
      const mime: string = p.inlineData?.mimeType ?? p.inline_data?.mime_type ?? ""
      if (mime.startsWith("audio/pcm") || mime.startsWith("audio/l16")) {
        const data = p.inlineData?.data ?? p.inline_data?.data
        if (data) {
          console.log("[v0] playing inline audio, mime:", mime, "len:", data.length)
          this.playPCM(this.fromB64(data), 24000)
        }
      }
      // text part
      if (p.text) this.cfg.onOutputTranscript?.(p.text)
    }

    // Gemini Live 2.0 also sends audio directly as inlineData at top-level
    const topInline = msg.inlineData ?? msg.inline_data
    if (topInline) {
      const mime: string = topInline.mimeType ?? topInline.mime_type ?? ""
      if (mime.startsWith("audio/pcm") || mime.startsWith("audio/l16")) {
        const data = topInline.data
        if (data) {
          console.log("[v0] playing top-level inline audio, len:", data.length)
          this.playPCM(this.fromB64(data), 24000)
        }
      }
    }
  }

  // ── PCM playback ─────────��────────────────────────────────────────────────────

  private playPCM(pcm16: Int16Array, sr: number) {
    console.log("[v0] playPCM samples:", pcm16.length, "sampleRate:", sr)
    if (!this.playCtx || this.playCtx.state === "closed") {
      this.playCtx = new AudioContext({ sampleRate: sr })
      this.nextPlay = 0
    }
    const ctx = this.playCtx
    const buf = ctx.createBuffer(1, pcm16.length, sr)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < pcm16.length; i++) ch[i] = pcm16[i] / 32768
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    const at = Math.max(ctx.currentTime, this.nextPlay)
    src.start(at)
    this.nextPlay = at + buf.duration
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private toB64(bytes: Uint8Array): string {
    let s = ""
    for (let i = 0; i < bytes.length; i += 8192) {
      s += String.fromCharCode(...Array.from(bytes.subarray(i, i + 8192)))
    }
    return btoa(s)
  }

  private fromB64(b64: string): Int16Array {
    const bin = atob(b64)
    const u8 = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)
    return new Int16Array(u8.buffer)
  }
}
