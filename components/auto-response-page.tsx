"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale"
import {
  type KBItem,
  type KBCollection,
  getItemsByStore as kbGetItems,
  getCollectionsByStore as kbGetCollections,
  addItem as kbAddItem,
  subscribeKB,
} from "@/lib/kb-store"
import { AGENTS_BY_STORE, getAgentsByStore } from "@/lib/mock-store-data"
import {
  MessageSquare, Phone, Bot, Workflow,
  Plus, Trash2, Save,
  ChevronRight, X, Check,
  Mic, Volume2, Zap, Users,
  Hash, ArrowRight,
  Send, RefreshCw,
  PhoneCall, Cpu, GitBranch,
  Sliders, Database,
  Thermometer, BookOpen,
  Flag, PhoneForwarded, HelpCircle, Shuffle,
  ToggleLeft, ToggleRight,
  Star, Crown, PhoneOff, Play,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────

type Channel = "chat" | "call"
type ChatMode = "ai-agent" | "hybrid"
type CallMode = "ai-voice" | "ars" | "hybrid-ivr"

interface ArsMenu {
  digit: string
  label: string
  action: "message" | "agent" | "ai" | "hangup"
  content?: string
}



interface SimMessage {
  role: "user" | "bot" | "agent"
  text: string
  time: string
}

// ── Constants ──────────────────────────────────────────────────────────────

// CHAT_MODES and CALL_MODES are built inside AutoResponsePage using useLocale()

function makeInitialArsMenus(locale: string): ArsMenu[] {
  if (locale === "ar") return [
    { digit: "1", label: "استفسار حجز",    action: "message", content: "للاستفسار عن الحجز يرجى استخدام التطبيق أو الموقع الإلكتروني." },
    { digit: "2", label: "الدفع / الاسترداد", action: "agent",   content: "" },
    { digit: "3", label: "دردشة AI",       action: "ai",      content: "" },
    { digit: "0", label: "التواصل مع موظف", action: "agent",   content: "" },
    { digit: "9", label: "إنهاء المكالمة", action: "hangup",  content: "" },
  ]
  if (locale === "en") return [
    { digit: "1", label: "Booking Inquiry", action: "message", content: "For booking inquiries please use our app or website." },
    { digit: "2", label: "Payment / Refund", action: "agent",   content: "" },
    { digit: "3", label: "AI Chat",          action: "ai",      content: "" },
    { digit: "0", label: "Connect to Agent", action: "agent",   content: "" },
    { digit: "9", label: "Hang Up",          action: "hangup",  content: "" },
  ]
  return [
    { digit: "1", label: "예약 문의",    action: "message", content: "예약 관련 문의는 앱 또는 홈페이지를 이용해 주세요." },
    { digit: "2", label: "결제/환불",    action: "agent",   content: "" },
    { digit: "3", label: "AI 상담",     action: "ai",      content: "" },
    { digit: "0", label: "상담원 연결",  action: "agent",   content: "" },
    { digit: "9", label: "전화 끊기",   action: "hangup",  content: "" },
  ]
}
const INITIAL_ARS_MENUS = makeInitialArsMenus("ko") // fallback; overridden inside ClassicArsPanel


const CUSTOMER_GROUP_IDS = [
  { id: "vip",       color: "bg-amber-100 text-amber-700", labelKey: "arGroupVip"       as const, descKey: "arGroupVipDesc"       as const },
  { id: "blacklist", color: "bg-red-100 text-red-700",     labelKey: "arGroupBlacklist"  as const, descKey: "arGroupBlacklistDesc"  as const },
  { id: "new",       color: "bg-blue-100 text-blue-700",   labelKey: "arGroupNew"        as const, descKey: "arGroupNewDesc"        as const },
  { id: "regular",   color: "bg-slate-100 text-slate-700", labelKey: "arGroupRegular"    as const, descKey: "arGroupRegularDesc"    as const },
]

// ── Helpers ────────────────────────────────────────────────────────────────

// ARS_ACTION_LABELS is built dynamically per-component using useLocale()
const ARS_ACTION_COLORS: Record<ArsMenu["action"], string> = {
  message: "bg-blue-100 text-blue-700",
  agent:   "bg-emerald-100 text-emerald-700",
  ai:      "bg-emerald-100 text-emerald-700",
  hangup:  "bg-red-100 text-red-700",
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// ── Sub-components ─────────────────────────────────────────────────────────

// Chat Simulator
function ChatSimulator({ greeting }: { greeting: string }) {
  const { t, locale } = useLocale()

  const defaultGreeting = locale === "ar"
    ? "مرحباً! كيف يمكنني مساعدتك اليوم؟"
    : locale === "en"
    ? "Hello! How can I help you today?"
    : "안녕하세요! 무엇을 도와드릴까요?"

  const [messages, setMessages] = useState<SimMessage[]>([
    { role: "bot", text: greeting || defaultGreeting, time: now() },
  ])
  const [input, setInput] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const BOT_REPLIES: [string[], string][] = locale === "ar" ? [
    [["حجز", "موعد", "booking"], "يمكنك الحجز عبر التطبيق أو الموقع الإلكتروني أو الاتصال على 0112345678."],
    [["استرداد", "استرجاع", "refund"], "قبل 48 ساعة استرداد كامل، قبل 24 ساعة 50%، والإلغاء في نفس اليوم غير قابل للاسترداد."],
    [["دوام", "ساعات", "أوقات"], "السبت–الأربعاء 10:00–20:00، الخميس–الجمعة 10:00–21:00."],
    [["موظف", "شخص", "بشري", "agent"], "جارٍ التواصل مع أحد أفراد الفريق. يرجى الانتظار."],
    [["vip", "ذهبي", "بلاتيني"], "يحصل عملاء VIP على أولوية الحجز وخصم إضافي 10%."],
  ] : locale === "en" ? [
    [["book", "appoint", "reservation"], "You can book via our app, website, or call us at 02-1234-5678."],
    [["refund", "cancel", "return"], "100% refund if cancelled 48h prior, 50% within 24h, no refund same-day."],
    [["hours", "open", "schedule"], "Mon–Fri 10:00–20:00, Weekends & holidays 11:00–19:00."],
    [["agent", "human", "staff"], "Connecting you to a team member now. Please wait."],
    [["vip", "premium"], "VIP members enjoy priority booking and an additional 10% discount."],
  ] : [
    [["예약"], "예약은 앱/홈페이지 예약 탭 또는 전화(02-1234-5678)로 가능합니다."],
    [["환불"], "48시간 전 100%, 24시간 전 50%, 당일 취소는 환불이 어렵습니다."],
    [["영업"], "평일 10:00~20:00, 주말·공휴일 11:00~19:00 운영합니다."],
    [["상담원"], "상담원에게 연결 중입니다. 잠시만 기다려 주세요."],
    [["vip"], "VIP 고객 우선 예약권과 10% 추가 할인 혜택을 드립니다."],
  ]

  const fallbackReply = locale === "ar"
    ? "عذراً، لم أفهم استفسارك بشكل صحيح. هل تودّ التواصل مع أحد أفراد الفريق؟"
    : locale === "en"
    ? "Sorry, I didn't quite understand that. Would you like me to connect you with an agent?"
    : "죄송합니다, 해당 내용을 정확히 이해하지 못했습니다. 상담원에게 연결해 드릴까요?"

  const send = () => {
    const text = input.trim()
    if (!text) return
    const userMsg: SimMessage = { role: "user", text, time: now() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setTimeout(() => {
      const lc = text.toLowerCase()
      const matched = BOT_REPLIES.find(([keys]) => keys.some(k => lc.includes(k)))
      const reply = matched ? matched[1] : fallbackReply
      setMessages(prev => [...prev, { role: "bot", text: reply, time: now() }])
    }, 700)
  }

  return (
    <div className="flex flex-col h-full">
      {/* phone frame */}
      <div className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex flex-col">
        <div className="bg-emerald-600 px-4 py-2.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-white text-[12px] font-semibold leading-tight">{t.arChatBotName}</p>
            <p className="text-emerald-200 text-[12px]">{t.arChatBotStatus}</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
              {m.role === "bot" && (
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-emerald-600" />
                </div>
              )}
              <div className={cn(
                "max-w-[75%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed",
                m.role === "user"
                  ? "bg-emerald-600 text-white rounded-tr-sm"
                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm"
              )}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Quick replies */}
        <div className="px-3 py-2 border-t border-slate-200 flex gap-1.5 flex-wrap">
          {([t.arChatReplyReservation, t.arChatReplyRefund, t.arChatReplyAgent] as string[]).map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="px-2.5 py-1 rounded-full border border-emerald-300 text-emerald-600 text-[12px] font-medium hover:bg-emerald-50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2 p-3 border-t border-slate-200">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={t.arChatPlaceholder}
            className="flex-1 text-[12px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <button onClick={send} className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Call Simulator
function CallSimulator({ greeting }: { greeting: string }) {
  const { t, locale } = useLocale()
  const [phase, setPhase] = useState<"idle" | "ringing" | "connected" | "ended">("idle")
  const [elapsed, setElapsed] = useState(0)
  const [currentMenu, setCurrentMenu] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    setPhase("ringing")
    setTimeout(() => {
      setPhase("connected")
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000)
    }, 1500)
  }
  const end = () => {
    setPhase("ended")
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeout(() => { setPhase("idle"); setElapsed(0); setCurrentMenu(null) }, 2000)
  }
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const WAVEFORM = [3, 8, 5, 12, 7, 10, 4, 9, 6, 14, 8, 5, 11, 7, 9, 4, 13, 6, 10, 5]

  return (
    <div className="flex flex-col gap-3">
      {/* Phone UI */}
      <div className="rounded-2xl bg-slate-900 overflow-hidden border border-slate-700">
        <div className="px-4 pt-5 pb-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-2">
            <PhoneCall className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-white font-semibold text-[14px]">{t.arCallAutoResponse}</p>
          <p className="text-slate-400 text-[12px] mt-0.5">
            {phase === "idle"     && t.arCallIdle}
            {phase === "ringing"  && t.arCallRinging}
            {phase === "connected" && fmt(elapsed)}
            {phase === "ended"    && t.arCallEnded}
          </p>
        </div>

        {/* Waveform */}
        {phase === "connected" && (
          <div className="flex items-end justify-center gap-0.5 h-10 px-4 mb-2">
            {WAVEFORM.map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-emerald-500 transition-all"
                style={{
                  height: `${h * (3 + Math.sin(Date.now() / 300 + i))}px`,
                  opacity: 0.6 + (i % 3) * 0.13,
                  animation: `pulse ${0.5 + (i % 3) * 0.2}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
        )}

        {/* Greeting */}
        {phase === "connected" && !currentMenu && (
          <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
            <p className="text-slate-300 text-[12px] leading-relaxed">{greeting || (
              locale === "ar"
                ? "مرحباً، هذه خدمة الرد الآلي. للدعم اضغط 1، للحجز اضغط 2، للموظف اضغط 0."
                : locale === "en"
                ? "Hello, automated service. For support press 1, bookings press 2, agent press 0."
                : "안녕하세요. 자동응답 서비스입니다. 상담은 1번, 예약은 2번, 상담원 연결은 0번을 눌러주세요."
            )}</p>
          </div>
        )}
        {phase === "connected" && currentMenu && (
          <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-emerald-900/30 border border-emerald-700">
            <p className="text-emerald-300 text-[12px]">
              {currentMenu === "1" && t.arCallMenu1}
              {currentMenu === "2" && t.arCallMenu2}
              {currentMenu === "3" && t.arCallMenu3}
              {currentMenu === "0" && t.arCallMenu0}
            </p>
          </div>
        )}

        {/* Dialpad */}
        {phase === "connected" && (
          <div className="grid grid-cols-3 gap-1 px-4 pb-3">
            {["1","2","3","4","5","6","7","8","9","*","0","#"].map(d => (
              <button
                key={d}
                onClick={() => ["1","2","3","0"].includes(d) && setCurrentMenu(d)}
                className={cn(
                  "h-9 rounded-lg text-[13px] font-semibold transition-all",
                  ["1","2","3","0"].includes(d)
                    ? "bg-slate-700 text-white hover:bg-emerald-600 active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-default"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4">
          {phase === "idle" || phase === "ended" ? (
            <button
              onClick={start}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-[12px] font-semibold hover:bg-emerald-600 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />{t.arCallTestBtn}
            </button>
          ) : phase === "ringing" ? (
            <button
              onClick={end}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-700 text-white text-[12px] font-semibold"
            >
              <PhoneOff className="w-4 h-4" />{t.arCallCancel}
            </button>
          ) : (
            <button
              onClick={end}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-4 h-4" />{t.arCallEnd}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}



// ── Agent types & data ────────────��────────────��──────────────────────────

interface Agent {
  id: string
  name: string
  persona: string
  greeting: string
  temperature: number
  model: string
  fallback: string
  selectedKB: string[]
  // call-only
  voiceStyle?: string
  sttEngine?: string
  ttsEngine?: string
}

function makeInitialAgents(locale: string): Agent[] {
  if (locale === "ar") return [
    {
      id: "agent-1",
      name: "وكيل الدعم الأساسي",
      persona: "مستشار خدمة عملاء ودود ومحترف يقدم إجابات واضحة وموجزة. يحيل الأسئلة غير المعروفة إلى أحد أفراد الفريق.",
      greeting: "مرحباً! أنا مساعد الدعم بالذكاء الاصطناعي. كيف يمكنني مساعدتك؟",
      temperature: 0.7,
      model: "GPT-4o (Recommended)",
      fallback: "التواصل مع أحد أفراد الفريق",
      selectedKB: ["k1", "k2", "k3", "k4"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (Arabic Female)",
    },
    {
      id: "agent-2",
      name: "وكيل VIP المخصص",
      persona: "مستشار متميز لعملاء VIP. يعطي الأولوية القصوى دائماً ويتعامل بأسلوب احترافي ورسمي.",
      greeting: "مرحباً عزيزي عميل VIP. تم تخصيص مستشار AI لخدمتك. كيف يمكنني مساعدتك؟",
      temperature: 0.4,
      model: "Claude 3.5 Sonnet",
      fallback: "التواصل مع وكيل VIP المخصص",
      selectedKB: ["k1", "k2", "k3", "k4"],
      voiceStyle: "formal",
      sttEngine: "OpenAI Whisper",
      ttsEngine: "ElevenLabs",
    },
    {
      id: "agent-3",
      name: "وكيل الحجز المتخصص",
      persona: "مستشار متخصص في الحجوزات والمواعيد. يقدم إرشادات دقيقة للحجز والتعديل والإلغاء.",
      greeting: "مرحباً! أنا مساعد الحجز المتخصص. يمكنني مساعدتك في الحجز أو التعديل أو الإلغاء.",
      temperature: 0.3,
      model: "GPT-4o (Recommended)",
      fallback: "إرشادات تقديم البريد الإلكتروني",
      selectedKB: ["k2"],
      voiceStyle: "professional",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (Arabic Female)",
    },
  ]
  if (locale === "en") return [
    {
      id: "agent-1",
      name: "General Support Agent",
      persona: "A friendly and professional customer service advisor who answers clearly and concisely. Escalates unknown topics to a team member.",
      greeting: "Hello! I'm your AI support assistant. How can I help you today?",
      temperature: 0.7,
      model: "GPT-4o (Recommended)",
      fallback: "Connect to Agent",
      selectedKB: ["k1", "k2", "k3", "k4"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (English Female)",
    },
    {
      id: "agent-2",
      name: "VIP Dedicated Agent",
      persona: "A premium advisor for VIP customers. Always prioritizes and responds in a professional and formal manner.",
      greeting: "Hello, valued VIP customer. Your dedicated AI advisor is connected. How may I assist you?",
      temperature: 0.4,
      model: "Claude 3.5 Sonnet",
      fallback: "Connect to VIP Dedicated Agent",
      selectedKB: ["k1", "k2", "k3", "k4"],
      voiceStyle: "formal",
      sttEngine: "OpenAI Whisper",
      ttsEngine: "ElevenLabs",
    },
    {
      id: "agent-3",
      name: "Booking Specialist Agent",
      persona: "A specialist advisor for bookings and scheduling. Provides accurate guidance on booking, modification, and cancellation procedures.",
      greeting: "Hello! I'm your booking specialist. I can help with bookings, changes, or cancellations.",
      temperature: 0.3,
      model: "GPT-4o (Recommended)",
      fallback: "Email Submission Guidance",
      selectedKB: ["k2"],
      voiceStyle: "professional",
      sttEngine: "OpenAI Whisper",
      ttsEngine: "Google TTS (English Female)",
    },
  ]
  // ko (default)
  return [
    {
      id: "agent-1",
      name: "기본 상담 에이전트",
      persona: "친절하고 전문적인 고객 상담사로서 명확하고 간결하게 답변합니다. 모르는 내용은 상담원에게 연결합니다.",
      greeting: "안녕하세요! 저는 AI 상담 도우미입니다. 무엇을 도와드릴까요?",
      temperature: 0.7,
      model: "GPT-4o (권장)",
      fallback: "상담원에게 연결",
      selectedKB: ["k1", "k2", "k3", "k4"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (한국어 여성)",
    },
    {
      id: "agent-2",
      name: "VIP 전담 에이전트",
      persona: "VIP 고객을 위한 프리미엄 상담사입니다. 항상 최우선으로 처리하며 전문적이고 격식 있게 응대합니다.",
      greeting: "안녕하세요, VIP 고객님. 전담 AI 상담사가 연결되었습니다. 무엇을 도와드릴까요?",
      temperature: 0.4,
      model: "Claude 3.5 Sonnet",
      fallback: "VIP 전담 상담원 연결",
      selectedKB: ["k1", "k2", "k3", "k4"],
      voiceStyle: "formal",
      sttEngine: "OpenAI Whisper",
      ttsEngine: "ElevenLabs",
    },
    {
      id: "agent-3",
      name: "예약 전문 에이전트",
      persona: "예약 및 일정 관련 전문 상담사입니다. 예약 안내, 변경, 취소 절차를 정확히 안내합니다.",
      greeting: "안녕하세요! 예약 전문 상담사입니다. 예약·변경·취소 무엇이든 도와드리겠습니다.",
      temperature: 0.3,
      model: "GPT-4o (권장)",
      fallback: "이메일 접수 안내",
      selectedKB: ["k2"],
      voiceStyle: "professional",
      sttEngine: "Clova Speech (네이버)",
      ttsEngine: "Clova Voice (네이버)",
    },
  ]
}

// ── Agent Editor (shared by chat & call) ─────��────────────────────────────

function AgentEditor({
  agent,
  channel,
  onChange,
  onSave,
  saved,
  storeId = "store-001",
}: {
  agent: Agent
  channel: "chat" | "call"
  onChange: (a: Agent) => void
  onSave: () => void
  saved: boolean
  storeId?: string
}) {
  const { t, locale } = useLocale()
  const VOICE_STYLES = [
    { id: "friendly",     label: t.arVoiceFriendly,      desc: t.arVoiceFriendlyDesc },
    { id: "professional", label: t.arVoiceProfessional,   desc: t.arVoiceProfessionalDesc },
    { id: "formal",       label: t.arVoiceFormal,         desc: t.arVoiceFormalDesc },
  ]
  const [showSim, setShowSim] = useState(false)
  const set = <K extends keyof Agent>(k: K, v: Agent[K]) => onChange({ ...agent, [k]: v })

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-bold text-slate-800">{t.arAgentEditHeader} {agent.name}</h3>
            <p className="text-[12px] text-slate-500">
              {channel === "chat" ? t.arAgentChatDesc : t.arAgentCallDesc}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSim(p => !p)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors",
                showSim
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
              )}
            >
              {channel === "chat" ? <Play className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
              {t.arSimulator}
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? t.arSaved : t.arSave}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Persona */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-[12px] font-semibold text-slate-800">{t.arAgentPersona}</p>
            </div>
            <div>
              <p className="text-[12px] text-slate-500 mb-1">{t.arAgentName}</p>
              <input
                value={agent.name}
                onChange={e => set("name", e.target.value)}
                className="w-full text-[12px] px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div>
              <p className="text-[12px] text-slate-500 mb-1">{t.arAgentSystemPrompt}</p>
              <textarea
                value={agent.persona}
                onChange={e => set("persona", e.target.value)}
                rows={4}
                className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div>
              <p className="text-[12px] text-slate-500 mb-1">{t.arAgentGreeting}</p>
              <input
                value={agent.greeting}
                onChange={e => set("greeting", e.target.value)}
                className="w-full text-[12px] px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            {/* Voice style — call only, placed here to keep same 2-col layout */}
            {channel === "call" && (
              <>
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Mic className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-[12px] font-semibold text-slate-700">{t.arAgentVoiceStyle}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {VOICE_STYLES.map(v => (
                      <button
                        key={v.id}
                        onClick={() => set("voiceStyle", v.id)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all",
                          agent.voiceStyle === v.id ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className={cn("w-3 h-3 rounded-full border-2 flex-shrink-0",
                          agent.voiceStyle === v.id ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                        )} />
                        <div>
                          <p className="text-[12px] font-medium text-slate-800">{v.label}</p>
                          <p className="text-[12px] text-slate-400">{v.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* LLM + STT/TTS Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                <Sliders className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <p className="text-[12px] font-semibold text-slate-800">{t.arAgentModelSettings}</p>
            </div>
            <div>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-slate-600 flex items-center gap-1"><Thermometer className="w-3 h-3" />{t.arAgentTemperature}</span>
                <span className="font-bold text-emerald-600">{agent.temperature.toFixed(1)}</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.1}
                value={agent.temperature}
                onChange={e => set("temperature", parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[12px] text-slate-400 mt-0.5">
                <span>{t.arAgentAccurate}</span><span>{t.arAgentCreative}</span>
              </div>
            </div>
            <div>
              <p className="text-[12px] text-slate-500 mb-1.5">{t.arAgentLlmModel}</p>
              <select
                value={agent.model}
                onChange={e => set("model", e.target.value)}
                className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option>{locale === "ko" ? "GPT-4o (권장)" : "GPT-4o (Recommended)"}</option>
                <option>Claude 3.5 Sonnet</option>
                <option>Gemini 1.5 Pro</option>
              </select>
            </div>
            <div>
              <p className="text-[12px] text-slate-500 mb-1.5">{t.arAgentFallback}</p>
              <select
                value={agent.fallback}
                onChange={e => set("fallback", e.target.value)}
                className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option>{t.arAgentFallbackAgent}</option>
                <option>{t.arAgentFallbackClose}</option>
                <option>{t.arAgentFallbackEmail}</option>
                <option>{t.arAgentFallbackVip}</option>
              </select>
            </div>
            {/* STT/TTS — call only, placed here to keep same 2-col layout */}
            {channel === "call" && (
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-[12px] font-semibold text-slate-700">{t.arAgentVoiceEngine}</p>
                </div>
                <div>
                  <p className="text-[12px] text-slate-500 mb-1">{t.arAgentStt}</p>
                  <select
                    value={agent.sttEngine}
                    onChange={e => set("sttEngine", e.target.value)}
                    className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    <option>Google STT</option>
                    {locale === "ko" && <option>Clova Speech (네이버)</option>}
                    <option>OpenAI Whisper</option>
                  </select>
                </div>
                <div>
                  <p className="text-[12px] text-slate-500 mb-1">{t.arAgentTts}</p>
                  <select
                    value={agent.ttsEngine}
                    onChange={e => set("ttsEngine", e.target.value)}
                    className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {locale === "ko"
                      ? <><option>Google TTS (한국어 여성)</option><option>Clova Voice (네이버)</option></>
                      : locale === "ar"
                      ? <option>Google TTS (Arabic Female)</option>
                      : <option>Google TTS (English Female)</option>
                    }
                    <option>OpenAI TTS</option>
                    <option>ElevenLabs</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Knowledge Base — always col-span-2 */}
          <div className="col-span-2">
            <AgentKBSection
              selectedIds={agent.selectedKB}
              onChange={ids => set("selectedKB", ids)}
              agentChannel={channel}
              storeId={storeId}
            />
          </div>
        </div>
      </div>

      {/* Simulator */}
      {showSim && (
        <div className="w-[240px] flex-shrink-0">
          <p className="text-[12px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            {channel === "chat"
              ? <><MessageSquare className="w-3.5 h-3.5" />{t.arChatSimTitle}</>
              : <><Phone className="w-3.5 h-3.5" />{t.arCallSimTitle}</>
            }
          </p>
          <div className="h-[520px]">
            {channel === "chat"
              ? <ChatSimulator greeting={agent.greeting} />
              : <CallSimulator greeting={agent.greeting} />
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ── Agent KB Section ──────────────────────────────────────────────────────
// Shows the shared KB with checkboxes for selection, plus an inline "add"
// modal that writes back to the shared store so KnowledgeBasePage reflects it.

const SOURCE_ICON_MAP: Record<string, React.ElementType> = {
  text: BookOpen,
  file: Database,
  url:  Zap,
}
const SOURCE_COLOR_MAP: Record<string, string> = {
  text: "text-blue-600 bg-blue-50",
  file: "text-emerald-600 bg-emerald-50",
  url:  "text-amber-600 bg-amber-50",
}
const STATUS_DOT: Record<string, string> = {
  ready:    "bg-emerald-500",
  learning: "bg-blue-400 animate-pulse",
  conflict: "bg-amber-500",
  failed:   "bg-red-500",
}

function AgentKBSection({
  selectedIds,
  onChange,
  agentChannel,
  storeId = "store-001",
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  agentChannel: "chat" | "call"
  storeId?: string
}) {
  const { t, locale } = useLocale()
  const [kbItems, setKbItems]           = useState<KBItem[]>(() => kbGetItems(storeId, locale))
  const [collections, setCollections]   = useState<KBCollection[]>(() => kbGetCollections(storeId, locale))
  const [search, setSearch]             = useState("")
  const [activeCol, setActiveCol]       = useState<string | null>(null)
  const [showAdd, setShowAdd]           = useState(false)

  // Re-sync when store or locale changes (e.g. from KnowledgeBasePage)
  useEffect(() => {
    setKbItems([...kbGetItems(storeId, locale)])
    setCollections([...kbGetCollections(storeId, locale)])
    return subscribeKB(() => {
      setKbItems([...kbGetItems(storeId, locale)])
      setCollections([...kbGetCollections(storeId, locale)])
    })
  }, [storeId, locale])

  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter(k => k !== id) : [...selectedIds, id])

  const filtered = kbItems.filter(item => {
    const matchCol  = !activeCol || item.collectionId === activeCol
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchCol && matchSearch
  })

  // Inline add form state
  const [addTitle,   setAddTitle]   = useState("")
  const [addContent, setAddContent] = useState("")
  const [addCol,     setAddCol]     = useState(() => kbGetCollections(storeId)[0]?.id ?? "")

  const handleAdd = () => {
    if (!addTitle.trim() || !addContent.trim()) return
    const newItem: KBItem = {
      id:           `kb-${Date.now()}`,
      title:        addTitle.trim(),
      sourceType:   "text",
      updatedAt:    new Date().toISOString().split("T")[0],
      status:       "learning",
      channel:      agentChannel === "chat" ? "chat" : "call",
      collectionId: addCol,
      content:      addContent.trim(),
      citedCount:   0,
      failRate:     0,
    }
    kbAddItem(newItem, storeId)   // writes to shared store → notifies KnowledgeBasePage
    onChange([...selectedIds, newItem.id])
    setAddTitle(""); setAddContent(""); setShowAdd(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col gap-0 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-[13px] font-semibold text-slate-800">{t.arKbConnect}</p>
          {selectedIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[12px] font-semibold">
              {selectedIds.length} {t.arKbSelected}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors",
            showAdd
              ? "bg-emerald-600 text-white border-emerald-600"
              : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          )}
        >
          <Plus className="w-3.5 h-3.5" />{t.arKbAddData}
        </button>
      </div>

      {/* Inline add form */}
      {showAdd && (
        <div className="px-4 py-3 border-b border-slate-100 bg-emerald-50 flex flex-col gap-2.5">
          <p className="text-[12px] text-emerald-700 font-medium">
            {t.arKbAddNote}
          </p>
          <input
            value={addTitle}
            onChange={e => setAddTitle(e.target.value)}
            placeholder={t.arKbTitlePlaceholder}
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <textarea
            value={addContent}
            onChange={e => setAddContent(e.target.value)}
            placeholder={t.arKbContentPlaceholder}
            rows={3}
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <div className="flex items-center gap-2">
            <select
              value={addCol}
              onChange={e => setAddCol(e.target.value)}
              className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button
              onClick={handleAdd}
              disabled={!addTitle.trim() || !addContent.trim()}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors",
                addTitle.trim() && addContent.trim()
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <Check className="w-3.5 h-3.5" />{t.arKbAdd}
            </button>
            <button onClick={() => setShowAdd(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Search + collection filter */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
          <ArrowRight className="w-3 h-3 text-slate-400 rotate-90 flex-shrink-0" style={{ transform: "rotate(0deg)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.arKbSearch}
            className="flex-1 text-[12px] bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setActiveCol(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors",
              !activeCol ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >{t.arKbAll}</button>
          {collections.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCol(activeCol === c.id ? null : c.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors",
                activeCol === c.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >{c.name}</button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100 max-h-[280px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center py-10 text-[12px] text-slate-400">
            {t.arKbNoResults}
          </div>
        ) : filtered.map(item => {
          const checked = selectedIds.includes(item.id)
          const SrcIcon = SOURCE_ICON_MAP[item.sourceType] ?? Database
          const srcCls  = SOURCE_COLOR_MAP[item.sourceType] ?? "text-slate-500 bg-slate-100"
          const dotCls  = STATUS_DOT[item.status] ?? "bg-slate-300"
          return (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              className={cn(
                "flex items-start gap-2.5 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 last:border-0",
                checked ? "bg-emerald-50" : "hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors",
                checked ? "bg-emerald-600 border-emerald-600" : "border-slate-300"
              )}>
                {checked && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0", srcCls)}>
                <SrcIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={cn("text-[12px] font-medium truncate", checked ? "text-emerald-800" : "text-slate-800")}>
                    {item.title}
                  </p>
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotCls)} />
                </div>
                <p className="text-[12px] text-slate-400 truncate mt-0.5">
                  {item.content.slice(0, 60)}{item.content.length > 60 ? "..." : ""}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Agent Manager Panel (chat or call) ────────────────────────────────────

function AgentManagerPanel({ channel, storeId = "store-001" }: { channel: "chat" | "call"; storeId?: string }) {
  const { t, locale } = useLocale()
  const getStoreAgents = () => getAgentsByStore(locale, storeId) as Agent[]
  const [agents, setAgents] = useState<Agent[]>(getStoreAgents)
  const [primaryId, setPrimaryId] = useState<string>(() => getStoreAgents()[0]?.id ?? "")
  const [editingId, setEditingId] = useState<string>(() => getStoreAgents()[0]?.id ?? "")
  const [saved, setSaved] = useState(false)

  // Reset when storeId changes
  useEffect(() => {
    const next = getStoreAgents()
    setAgents(next)
    setPrimaryId(next[0]?.id ?? "")
    setEditingId(next[0]?.id ?? "")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId])

  const editing = agents.find(a => a.id === editingId) ?? agents[0]

  const updateAgent = (updated: Agent) =>
    setAgents(prev => prev.map(a => a.id === updated.id ? updated : a))

  const addAgent = () => {
    const id = `agent-${Date.now()}`
    const defaultPersona = locale === "ar"
      ? "مستشار ودود ومحترف يجيب بإخلاص على استفسارات العملاء."
      : locale === "en"
      ? "A friendly and professional advisor who answers customer inquiries sincerely."
      : "친절하고 전문적인 상담사로서 고객 문의에 성실히 답변합니다."
    const defaultGreeting = locale === "ar"
      ? "مرحباً! كيف يمكنني مساعدتك؟"
      : locale === "en"
      ? "Hello! How can I help you today?"
      : "안녕하세요! 무엇을 도와드����까요?"
    const defaultModel = locale === "ko" ? "GPT-4o (권장)" : "GPT-4o (Recommended)"
    const defaultFallback = locale === "ar"
      ? "التواصل مع أحد أفراد الفريق"
      : locale === "en" ? "Connect to Agent" : "상담원에게 연결"
    const defaultTts = locale === "ar"
      ? "Google TTS (Arabic Female)"
      : locale === "en" ? "Google TTS (English Female)" : "Google TTS (한국어 여성)"
    const newAgent: Agent = {
      id,
      name: `${t.arNewAgentName} ${agents.length + 1}`,
      persona: defaultPersona,
      greeting: defaultGreeting,
      temperature: 0.7,
      model: defaultModel,
      fallback: defaultFallback,
      selectedKB: [],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: defaultTts,
    }
    setAgents(prev => [...prev, newAgent])
    setEditingId(id)
  }

  const deleteAgent = (id: string) => {
    if (agents.length <= 1) return
    const next = agents.find(a => a.id !== id)
    setAgents(prev => prev.filter(a => a.id !== id))
    if (editingId === id && next) setEditingId(next.id)
    if (primaryId === id && next) setPrimaryId(next.id)
  }

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="flex flex-col gap-5">
      {/* Agent list header */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-800">{t.arAgentList}</p>
              <p className="text-[12px] text-slate-500">{t.arAgentListDesc}</p>
            </div>
          </div>
          <button
            onClick={addAgent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />{t.arNewAgent}
          </button>
        </div>

        <div className="flex flex-col divide-y divide-slate-100">
          {agents.map(a => {
            const isPrimary = a.id === primaryId
            const isEditing = a.id === editingId
            return (
              <div
                key={a.id}
                onClick={() => setEditingId(a.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group",
                  isEditing ? "bg-emerald-50" : "hover:bg-slate-50"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  isPrimary ? "bg-emerald-600" : "bg-slate-200"
                )}>
                  <Bot className={cn("w-4.5 h-4.5", isPrimary ? "text-white" : "text-slate-500")} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-semibold text-slate-800 truncate">{a.name}</p>
                    {isPrimary && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[12px] font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" />{t.arAgentPrimary}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-400 truncate mt-0.5">{a.greeting}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{a.model.split(" ")[0]}</span>
                    {channel === "call" && a.voiceStyle && (
                      <span className="text-[12px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Mic className="w-2.5 h-2.5" />{a.voiceStyle === "friendly" ? t.arVoiceFriendly : a.voiceStyle === "professional" ? t.arVoiceProfessional : t.arVoiceFormal}
                      </span>
                    )}
                    <span className="text-[12px] text-slate-400">T={a.temperature.toFixed(1)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  {!isPrimary && (
                    <button
                      onClick={() => setPrimaryId(a.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title={t.arAgentSetPrimary}
                    >
                      <Crown className="w-3 h-3" />{t.arAgentSetPrimary}
                    </button>
                  )}
                  <button
                    onClick={() => deleteAgent(a.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    title={t.arAgentDelete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isEditing && (
                  <div className="w-1 h-8 rounded-full bg-emerald-500 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Editor for selected agent */}
      {editing && (
        <AgentEditor
          agent={editing}
          channel={channel}
          onChange={updateAgent}
          onSave={save}
          saved={saved}
          storeId={storeId}
        />
      )}
    </div>
  )
}

// ── AI Workflow Builder (Canvas) ───────────────────────────────────────────

type WFNodeType = "start" | "scenario" | "agent" | "condition" | "transfer" | "end" | "tool"

interface WFNode {
  id: string
  type: WFNodeType
  title: string
  desc?: string
  x: number // absolute pixel X on canvas
  y: number // absolute pixel Y on canvas
}

interface WFEdge {
  id: string
  from: string
  to: string
  label: string
  style?: "default" | "success" | "failure"
}

const WF_NODE_META: Record<WFNodeType, { icon: React.ElementType; bg: string; border: string; text: string; iconBg: string }> = {
  start:     { icon: Play,           bg: "bg-[#1a1a2e]", border: "border-[#ff6b35]",  text: "text-white",        iconBg: "bg-[#ff6b35]" },
  scenario:  { icon: MessageSquare,  bg: "bg-[#1a1a2e]", border: "border-[#4ade80]",  text: "text-white",        iconBg: "bg-[#4ade80]/20" },
  agent:     { icon: Bot,            bg: "bg-[#1a1a2e]", border: "border-[#3b82f6]",  text: "text-white",        iconBg: "bg-[#3b82f6]/20" },
  condition: { icon: GitBranch,      bg: "bg-[#1a1a2e]", border: "border-[#f59e0b]",  text: "text-white",        iconBg: "bg-[#f59e0b]/20" },
  transfer:  { icon: PhoneForwarded, bg: "bg-[#1a1a2e]", border: "border-[#a855f7]",  text: "text-white",        iconBg: "bg-[#a855f7]/20" },
  end:       { icon: X,              bg: "bg-[#1a1a2e]", border: "border-[#64748b]",  text: "text-slate-400",    iconBg: "bg-[#64748b]/20" },
  tool:      { icon: HelpCircle,     bg: "bg-[#1a1a2e]", border: "border-[#06b6d4]",  text: "text-white",        iconBg: "bg-[#06b6d4]/20" },
}

const EDGE_PILL: Record<NonNullable<WFEdge["style"]>, string> = {
  default: "bg-slate-900 text-white",
  success: "bg-emerald-500 text-white",
  failure: "bg-rose-400 text-white",
}

function makeInitialChatNodes(locale: string): WFNode[] {
  const l = {
    ar: { qualify: "تحليل الاستفسار", qualifyDesc: "تصنيف نية العميل وتعيين الوك��ل المناسب", refund: "وكيل الاسترداد", refundDesc: "إرشادات معالجة الاسترداد والإلغاء", reserve: "وكيل الحجز", reserveDesc: "معالجة استعلامات الحجز والتعديل والإلغاء", human: "التواصل مع موظف", humanDesc: "تحويل الدردشة إلى موظف مباشر" },
    en: { qualify: "Qualify Inquiry", qualifyDesc: "Classify customer intent and assign the right agent", refund: "Refund Agent", refundDesc: "Guide refund and cancellation processing", reserve: "Booking Agent", reserveDesc: "Handle booking lookups, changes, and cancellations", human: "Connect to Agent", humanDesc: "Escalate chat to a live human agent" },
    ko: { qualify: "문의 파악", qualifyDesc: "고객 의도를 분류하고 적합한 에이전트를 배정합니다", refund: "환불 에이전트", refundDesc: "환불·취소 처리를 안내하고 요청을 접수합니다", reserve: "예약 에이전트", reserveDesc: "예약 조회·변경·취소를 처리합니다", human: "상담원 연결", humanDesc: "실시간 상담원에게 채팅을 이관합니다" },
  }
  const s = l[locale as keyof typeof l] ?? l.en
  // x, y = absolute pixel position on canvas
  // col0=40  col1=300  col2=560  col3=820  col4=1080
  // row0=60  row1=200  row2=340
  return [
    { id: "n-start",   type: "start",    title: "Start",      x: 40,  y: 130 },
    { id: "n-qualify", type: "agent",    title: s.qualify,    desc: s.qualifyDesc, x: 300, y: 130 },
    { id: "n-refund",  type: "agent",    title: s.refund,     desc: s.refundDesc,  x: 580, y: 60  },
    { id: "n-reserve", type: "agent",    title: s.reserve,    desc: s.reserveDesc, x: 580, y: 220 },
    { id: "n-human",   type: "transfer", title: s.human,      desc: s.humanDesc,   x: 860, y: 60  },
    { id: "n-end1",    type: "end",      title: "End",        x: 860, y: 220 },
    { id: "n-end2",    type: "end",      title: "End",        x: 860, y: 360 },
  ]
}
function makeInitialChatEdges(locale: string): WFEdge[] {
  const l = {
    ar: { refundInq: "استفسار استرداد", reserveInq: "استفسار حجز", unresolved: "غير محلول", done: "تم المعالجة", repeat: "طلب متكرر", confirmed: "تأكيد الحجز" },
    en: { refundInq: "Refund Inquiry", reserveInq: "Booking Inquiry", unresolved: "Unresolved", done: "Resolved", repeat: "Repeated Request", confirmed: "Booking Confirmed" },
    ko: { refundInq: "환불 문의", reserveInq: "예약 문의", unresolved: "해결 불가", done: "처리 완료", repeat: "반복 요청", confirmed: "예약 확정" },
  }
  const s = l[locale as keyof typeof l] ?? l.en
  return [
    { id: "e1", from: "n-start",   to: "n-qualify", label: "",          style: "default" },
    { id: "e2", from: "n-qualify", to: "n-refund",  label: s.refundInq, style: "default" },
    { id: "e3", from: "n-qualify", to: "n-reserve", label: s.reserveInq, style: "default" },
    { id: "e4", from: "n-qualify", to: "n-human",   label: s.unresolved, style: "failure" },
    { id: "e5", from: "n-refund",  to: "n-end1",    label: s.done,       style: "success" },
    { id: "e6", from: "n-refund",  to: "n-human",   label: s.repeat,     style: "failure" },
    { id: "e7", from: "n-reserve", to: "n-end2",    label: s.confirmed,  style: "success" },
  ]
}
function makeInitialCallNodes(locale: string): WFNode[] {
  const l = {
    ar: { qualify: "رد AI الصوتي", qualifyDesc: "التعرف على كلام العميل وتحليل النية", refund: "وكيل الاسترداد", refundDesc: "معالجة إرشادات الاسترداد والإلغاء صوتياً", reserve: "وكيل الحجز", reserveDesc: "معالجة استعلامات الحجز والتعديل صوتياً", human: "التواصل مع موظف", humanDesc: "تحويل المكالمة بعد ملخص AI" },
    en: { qualify: "AI Voice Response", qualifyDesc: "Recognise customer speech and classify intent", refund: "Refund Agent", refundDesc: "Handle refund and cancellation guidance via voice", reserve: "Booking Agent", reserveDesc: "Handle booking lookups and changes via voice", human: "Connect to Agent", humanDesc: "Transfer call to human agent after AI summary" },
    ko: { qualify: "AI 음성 응대", qualifyDesc: "고객 발화를 인식해 의도를 파악합니다", refund: "환불 에이전트", refundDesc: "환불·취소 안내를 음성으로 처리합니다", reserve: "예약 에이전트", reserveDesc: "예약 조회·변경을 음성으로 처리합니다", human: "상담원 연결", humanDesc: "AI 요약 후 상담원에게 호를 전달합니다" },
  }
  const s = l[locale as keyof typeof l] ?? l.en
  return [
    { id: "c-start",   type: "start",    title: "Start",      x: 40,  y: 130 },
    { id: "c-qualify", type: "agent",    title: s.qualify,    desc: s.qualifyDesc, x: 300, y: 130 },
    { id: "c-refund",  type: "agent",    title: s.refund,     desc: s.refundDesc,  x: 580, y: 60  },
    { id: "c-reserve", type: "agent",    title: s.reserve,    desc: s.reserveDesc, x: 580, y: 220 },
    { id: "c-human",   type: "transfer", title: s.human,      desc: s.humanDesc,   x: 860, y: 60  },
    { id: "c-end1",    type: "end",      title: "End",        x: 860, y: 220 },
    { id: "c-end2",    type: "end",      title: "End",        x: 860, y: 360 },
  ]
}
function makeInitialCallEdges(locale: string): WFEdge[] {
  const l = {
    ar: { refundReq: "طلب استرداد", reserveReq: "طلب حجز", unresolved: "غير محلول", done: "تم المعالجة", repeat: "طلب متكرر", confirmed: "تأكيد الحجز" },
    en: { refundReq: "Refund Request", reserveReq: "Booking Request", unresolved: "Unresolved", done: "Resolved", repeat: "Repeated Request", confirmed: "Booking Confirmed" },
    ko: { refundReq: "환불 요청", reserveReq: "예약 요청", unresolved: "해결 불가", done: "처리 완료", repeat: "반복 요청", confirmed: "예약 확정" },
  }
  const s = l[locale as keyof typeof l] ?? l.en
  return [
    { id: "f1", from: "c-start",   to: "c-qualify", label: "",           style: "default" },
    { id: "f2", from: "c-qualify", to: "c-refund",  label: s.refundReq,  style: "default" },
    { id: "f3", from: "c-qualify", to: "c-reserve", label: s.reserveReq, style: "default" },
    { id: "f4", from: "c-qualify", to: "c-human",   label: s.unresolved, style: "failure" },
    { id: "f5", from: "c-refund",  to: "c-end1",    label: s.done,       style: "success" },
    { id: "f6", from: "c-refund",  to: "c-human",   label: s.repeat,     style: "failure" },
    { id: "f7", from: "c-reserve", to: "c-end2",    label: s.confirmed,  style: "success" },
  ]
}
// Legacy KO constants kept for reference (overridden inside WorkflowBuilder by locale)
const _INITIAL_CHAT_NODES = makeInitialChatNodes("ko")
const _INITIAL_CHAT_EDGES = makeInitialChatEdges("ko")
const _INITIAL_CALL_NODES = makeInitialCallNodes("ko")
const _INITIAL_CALL_EDGES = makeInitialCallEdges("ko")

// n8n-style node card
function WFNodeCard({
  node, selected, onClick, onDelete,
}: {
  node: WFNode; selected: boolean; onClick: () => void; onDelete: () => void
}) {
  const meta = WF_NODE_META[node.type]
  const Icon = meta.icon
  const isStart = node.type === "start"
  const isEnd = node.type === "end"
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group select-none transition-shadow",
        "rounded-xl border-2 shadow-lg",
        meta.bg, meta.border,
        selected ? "ring-2 ring-white/50 ring-offset-1 ring-offset-[#0e0e1a]" : "hover:brightness-110",
        isStart || isEnd ? "w-[80px]" : "w-[180px]",
      )}
    >
      {/* Input port dot */}
      {!isStart && (
        <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#2d2d44] border-2 border-slate-500" />
      )}
      {/* Output port dot */}
      {!isEnd && (
        <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#2d2d44] border-2 border-slate-500" />
      )}

      <div className={cn("p-3", isStart || isEnd ? "flex flex-col items-center gap-1.5 py-3" : "")}>
        {/* Icon badge */}
        <div className={cn(
          "rounded-lg flex items-center justify-center flex-shrink-0",
          meta.iconBg,
          isStart || isEnd ? "w-8 h-8" : "w-7 h-7 mb-2",
        )}>
          <Icon className={cn(isStart ? "w-4 h-4 text-white" : isEnd ? "w-4 h-4 text-slate-400" : "w-3.5 h-3.5", meta.text)} />
        </div>

        {/* Title */}
        <p className={cn(
          "font-semibold leading-tight",
          isStart || isEnd ? "text-[11px] text-center" : "text-[12px]",
          meta.text,
        )}>
          {node.title}
        </p>

        {/* Description */}
        {node.desc && !isEnd && !isStart && (
          <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{node.desc}</p>
        )}
      </div>

      {/* Delete button */}
      {!isStart && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-md"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  )
}

// Edge pill
function EdgePill({ edge }: { edge: WFEdge }) {
  if (!edge.label) return null
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap shadow-sm",
      EDGE_PILL[edge.style ?? "default"]
    )}>
      {edge.style === "success" && <ChevronRight className="w-3 h-3" />}
      {edge.style === "failure" && <X className="w-3 h-3" />}
      {edge.label}
    </div>
  )
}

type NodeTypeOption = { type: WFNodeType; label: string; icon: React.ElementType }

// Node dimensions (pixels) — must match WFNodeCard CSS
const WF_SM_W = 80   // start / end node width
const WF_SM_H = 88   // start / end node height
const WF_LG_W = 180  // regular node width
const WF_LG_H = 96   // regular node height

function nodeSize(type: WFNodeType) {
  return (type === "start" || type === "end")
    ? { w: WF_SM_W, h: WF_SM_H }
    : { w: WF_LG_W, h: WF_LG_H }
}

// SVG bezier edge — uses absolute pixel coords stored on each WFNode
function CurvedEdge({ edge, allNodes }: { edge: WFEdge; allNodes: WFNode[] }) {
  const fromNode = allNodes.find(n => n.id === edge.from)
  const toNode   = allNodes.find(n => n.id === edge.to)
  if (!fromNode || !toNode) return null

  const fs = nodeSize(fromNode.type)
  const ts = nodeSize(toNode.type)

  // right-center of from node → left-center of to node
  const x1 = fromNode.x + fs.w
  const y1 = fromNode.y + fs.h / 2
  const x2 = toNode.x
  const y2 = toNode.y + ts.h / 2

  const dx   = Math.abs(x2 - x1)
  const cpx1 = x1 + dx * 0.5
  const cpx2 = x2 - dx * 0.5
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  const color = edge.style === "success" ? "#4ade80" : edge.style === "failure" ? "#f87171" : "#94a3b8"
  const arrowId = `arr-${edge.id}`

  return (
    <g>
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={color} />
        </marker>
      </defs>
      {/* Glow / halo for visibility */}
      <path
        d={`M ${x1} ${y1} C ${cpx1} ${y1}, ${cpx2} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeOpacity={0.12}
      />
      <path
        d={`M ${x1} ${y1} C ${cpx1} ${y1}, ${cpx2} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray={edge.style === "failure" ? "5 4" : undefined}
        markerEnd={`url(#${arrowId})`}
      />
      {edge.label && (
        <g>
          <rect
            x={midX - 36} y={midY - 10}
            width={72} height={20}
            rx={10}
            fill="#0e0e1a"
            stroke={color}
            strokeWidth={1}
            strokeOpacity={0.6}
          />
          <text
            x={midX} y={midY + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={color}
            style={{ userSelect: "none" }}
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  )
}

function WorkflowBuilder({ channel }: { channel: Channel }) {
  const { t, locale } = useLocale()
  const NODE_TYPE_OPTIONS: NodeTypeOption[] = [
    { type: "scenario",  label: t.arNodeScenario, icon: MessageSquare },
    { type: "agent",     label: t.arNodeAgent,    icon: Bot },
    { type: "condition", label: t.arNodeCondition, icon: Shuffle },
    { type: "transfer",  label: t.arNodeTransfer, icon: PhoneForwarded },
    { type: "tool",      label: t.arNodeTool,     icon: HelpCircle },
    { type: "end",       label: t.arNodeEnd,      icon: X },
  ]
  const [nodes, setNodes] = useState<WFNode[]>(() =>
    channel === "chat" ? makeInitialChatNodes(locale) : makeInitialCallNodes(locale)
  )
  const [edges, setEdges] = useState<WFEdge[]>(() =>
    channel === "chat" ? makeInitialChatEdges(locale) : makeInitialCallEdges(locale)
  )

  useEffect(() => {
    setNodes(channel === "chat" ? makeInitialChatNodes(locale) : makeInitialCallNodes(locale))
    setEdges(channel === "chat" ? makeInitialChatEdges(locale) : makeInitialCallEdges(locale))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const updateNode = (field: keyof WFNode, val: string) => {
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, [field]: val } : n))
  }

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id))
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id))
    if (selectedNodeId === id) setSelectedNodeId(null)
  }

  const addNode = (type: WFNodeType) => {
    const maxX = Math.max(...nodes.map(n => n.x), 0)
    const newNode: WFNode = {
      id: `n-${Date.now()}`,
      type,
      title: NODE_TYPE_OPTIONS.find(o => o.type === type)?.label ?? t.arWfDefaultNodeTitle,
      desc: type === "agent" ? t.arWfNodeDesc2 : undefined,
      x: maxX + 260,
      y: 130,
    }
    setNodes(prev => [...prev, newNode])
    setShowAddPanel(false)
    setSelectedNodeId(newNode.id)
  }

  // ── Drag state ────────────────────────────────────────────────────────────
  const nodeWasClickedRef = useRef(false)
  const dragRef = useRef<{
    nodeId: string
    startMouseX: number; startMouseY: number
    startNodeX: number;  startNodeY: number
    moved: boolean  // true once mouse has moved enough to count as a drag
  } | null>(null)

  const onNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    e.preventDefault()          // prevent synthetic click from bubbling to canvas
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    dragRef.current = {
      nodeId,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startNodeX: node.x,     startNodeY: node.y,
      moved: false,
    }
    nodeWasClickedRef.current = true
    setSelectedNodeId(nodeId)
  }

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return
    const { nodeId, startMouseX, startMouseY, startNodeX, startNodeY } = dragRef.current
    const dx = e.clientX - startMouseX
    const dy = e.clientY - startMouseY
    if (!dragRef.current.moved && Math.abs(dx) + Math.abs(dy) < 4) return // dead zone
    dragRef.current.moved = true
    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, x: Math.max(0, startNodeX + dx), y: Math.max(0, startNodeY + dy) }
        : n
    ))
  }

  const onCanvasMouseUp = () => { dragRef.current = null }

  const onCanvasClick = () => {
    if (nodeWasClickedRef.current) {
      nodeWasClickedRef.current = false
      return
    }
    setSelectedNodeId(null)
  }

  // Canvas bounding box
  const canvasW = Math.max(...nodes.map(n => n.x + WF_LG_W + 60), 1100)
  const canvasH = Math.max(...nodes.map(n => n.y + WF_LG_H + 60), 500)

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-bold text-white">{t.arWfTitle}</h3>
          <p className="text-[12px] text-slate-400">{t.arWfDesc}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddPanel(p => !p)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors",
              showAddPanel ? "bg-emerald-600 text-white border-emerald-600" : "bg-[#1a1a2e] text-slate-300 border-slate-700 hover:border-emerald-500"
            )}
          >
            <Plus className="w-3.5 h-3.5" />{t.arWfAddNode}
          </button>
          <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}{saved ? t.arSaved : t.arSave}
          </button>
        </div>
      </div>

      {/* Add node panel */}
      {showAddPanel && (
        <div className="p-3 bg-[#1a1a2e] rounded-xl border border-slate-700 flex items-center gap-2 flex-wrap">
          <p className="text-[12px] font-semibold text-slate-400 mr-1">{t.arWfAddNodeType}</p>
          {NODE_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.type}
              onClick={() => addNode(opt.type)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#0e0e1a] text-[12px] font-medium text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
            >
              <opt.icon className="w-3.5 h-3.5" />{opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Canvas + side panel */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* n8n-style canvas — tall enough to show all nodes comfortably */}
        <div
          className="flex-1 rounded-2xl border border-slate-700 overflow-auto cursor-default"
          style={{
            backgroundColor: "#0e0e1a",
            backgroundImage: "radial-gradient(circle, #2a2a40 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
            minHeight: "520px",
            height: "600px",
          }}
          onClick={onCanvasClick}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={onCanvasMouseUp}
        >
          <div
            className="relative select-none"
            style={{ width: `${canvasW}px`, height: `${canvasH}px` }}
          >
            {/* SVG edge layer — sits behind nodes */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={canvasW}
              height={canvasH}
              style={{ overflow: "visible" }}
            >
              {edges.map(edge => (
                <CurvedEdge key={edge.id} edge={edge} allNodes={nodes} />
              ))}
            </svg>

            {/* Node layer */}
            {nodes.map(node => (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: `${node.x}px`,
                  top:  `${node.y}px`,
                  cursor: dragRef.current?.nodeId === node.id ? "grabbing" : "grab",
                  zIndex: selectedNodeId === node.id ? 10 : 1,
                }}
                onMouseDown={e => onNodeMouseDown(e, node.id)}
              >
                <WFNodeCard
                  node={node}
                  selected={selectedNodeId === node.id}
                  onClick={() => {}}
                  onDelete={() => deleteNode(node.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Side panel: node editor */}
        {selectedNode ? (
          <div className="w-full md:w-[220px] flex-shrink-0 bg-[#1a1a2e] rounded-2xl border border-slate-700 p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {(() => { const Icon = WF_NODE_META[selectedNode.type].icon; return <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", WF_NODE_META[selectedNode.type].iconBg)}><Icon className="w-3.5 h-3.5 text-white" /></div> })()}
              <p className="text-[12px] font-bold text-white">{t.arWfNodeEdit}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[12px] text-slate-400 mb-1">{t.arWfNodeName}</p>
                <input
                  value={selectedNode.title}
                  onChange={e => updateNode("title", e.target.value)}
                  className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-600 bg-[#0e0e1a] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {selectedNode.desc !== undefined && (
                <div>
                  <p className="text-[12px] text-slate-400 mb-1">{t.arWfNodeDesc}</p>
                  <textarea
                    value={selectedNode.desc}
                    onChange={e => updateNode("desc", e.target.value)}
                    rows={3}
                    className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-600 bg-[#0e0e1a] text-white resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <p className="text-[12px] text-slate-400 mb-1.5">{t.arWfNodeType}</p>
                <select
                  value={selectedNode.type}
                  onChange={e => updateNode("type", e.target.value)}
                  className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-600 bg-[#0e0e1a] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {NODE_TYPE_OPTIONS.map(o => (
                    <option key={o.type} value={o.type}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Outgoing edges */}
            <div>
              <p className="text-[12px] text-slate-400 mb-2">{t.arWfEdges} ({edges.filter(e => e.from === selectedNode.id).length})</p>
              <div className="flex flex-col gap-1.5">
                {edges.filter(e => e.from === selectedNode.id).map(edge => (
                  <div key={edge.id} className="flex items-center gap-2">
                    <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", EDGE_PILL[edge.style ?? "default"])}>
                      {edge.label || "→"}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {nodes.find(n => n.id === edge.to)?.title}
                    </span>
                    <button
                      onClick={() => setEdges(prev => prev.filter(e => e.id !== edge.id))}
                      className="ml-auto text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {edges.filter(e => e.from === selectedNode.id).length === 0 && (
                  <p className="text-[12px] text-slate-600">{t.arWfNoEdges}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-red-400 border border-red-900 hover:bg-red-950 transition-colors mt-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />{t.arWfDeleteNode}
            </button>
          </div>
        ) : (
          <div className="hidden md:flex w-[220px] flex-shrink-0 bg-[#1a1a2e] rounded-2xl border border-dashed border-slate-700 items-center justify-center">
            <p className="text-[12px] text-slate-600 text-center px-4">{t.arWfClickHint.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Classic ARS Panel ────────────────────────���─────────────────────────���───

function ClassicArsPanel() {
  const { t, locale } = useLocale()
  const ARS_ACTION_LABELS: Record<ArsMenu["action"], string> = {
    message: t.arActionMessage,
    agent:   t.arActionAgent,
    ai:      t.arActionAi,
    hangup:  t.arActionHangup,
  }
  const [menus, setMenus] = useState<ArsMenu[]>(() => makeInitialArsMenus(locale))
  const defaultArsGreeting = locale === "ar"
    ? "مرحباً، هذه خدمة الرد الآلي. لل��عم اضغط 1، للحجز اضغط 2، للذكاء الاصطناعي اضغط 3، للتحدث مع موظف اضغط 0."
    : locale === "en"
    ? "Hello, you have reached our automated service. For support press 1, for bookings press 2, for AI chat press 3, for an agent press 0."
    : "안녕하세요. 자동응답 서비스입니다. 상담은 1번, 예약 확인은 2번, AI 상담은 3번, 상담원 연결은 0번을 눌러주세요."
  const [greeting, setGreeting] = useState(defaultArsGreeting)
  const [selected, setSelected] = useState<string | null>(null)
  const [showSim, setShowSim] = useState(false)
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const selectedMenu = menus.find(m => m.digit === selected)
  const updateMenu = (field: keyof ArsMenu, val: string) => {
    setMenus(prev => prev.map(m => m.digit === selected ? { ...m, [field]: val } : m))
  }
  const addMenu = () => {
    const used = menus.map(m => m.digit)
    const digits = ["1","2","3","4","5","6","7","8","9","0","#","*"]
    const next = digits.find(d => !used.includes(d))
    if (next) setMenus(prev => [...prev, { digit: next, label: t.arArsNewMenu, action: "message", content: "" }])
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-bold text-slate-800">{t.arArsTitle}</h3>
            <p className="text-[12px] text-slate-500">{t.arArsDesc}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSim(p => !p)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors",
                showSim ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              )}
            >
              <PhoneCall className="w-3.5 h-3.5" />{t.arSimulator}
            </button>
            <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}{saved ? t.arSaved : t.arSave}
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[12px] font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-blue-500" />{t.arArsGreeting}
          </p>
          <textarea
            value={greeting}
            onChange={e => setGreeting(e.target.value)}
            rows={2}
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* Menu list + editor */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Dialpad grid */}
          <div className="w-full md:w-[280px] flex-shrink-0 bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-slate-700">{t.arArsMenuConfig}</p>
              <button onClick={addMenu} className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-700 font-medium">
                <Plus className="w-3 h-3" />{t.arArsAddMenu}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {menus.sort((a, b) => (a.digit < b.digit ? -1 : 1)).map(m => (
                <div
                  key={m.digit}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(m.digit === selected ? null : m.digit)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelected(m.digit === selected ? null : m.digit) }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all border cursor-pointer",
                    selected === m.digit ? "bg-blue-50 border-blue-300" : "border-transparent hover:bg-slate-50"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white text-[14px] font-bold flex items-center justify-center flex-shrink-0">
                    {m.digit}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-slate-800 truncate">{m.label}</p>
                    <span className={cn("text-[12px] px-1.5 py-0.5 rounded font-medium", ARS_ACTION_COLORS[m.action])}>
                      {ARS_ACTION_LABELS[m.action]}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setMenus(prev => prev.filter(x => x.digit !== m.digit)) }}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Menu editor */}
          {selectedMenu ? (
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
              <p className="text-[12px] font-semibold text-slate-700">
                [{selectedMenu.digit}{t.arArsMenuEdit}
              </p>
              <div>
                <p className="text-[12px] text-slate-500 mb-1">{t.arArsMenuName}</p>
                <input
                  value={selectedMenu.label}
                  onChange={e => updateMenu("label", e.target.value)}
                  className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-1.5">{t.arArsActionType}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(ARS_ACTION_LABELS) as [ArsMenu["action"], string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => updateMenu("action", key)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all text-left",
                        selectedMenu.action === key ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", selectedMenu.action === key ? "bg-blue-500" : "bg-slate-300")} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {selectedMenu.action === "message" && (
                <div>
                  <p className="text-[12px] text-slate-500 mb-1">{t.arArsTtsContent}</p>
                  <textarea
                    value={selectedMenu.content || ""}
                    onChange={e => updateMenu("content", e.target.value)}
                    rows={3}
                    className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-slate-200">
                <p className="text-[12px] text-slate-400">{t.arArsSelectMenu}</p>
            </div>
          )}
        </div>
      </div>

      {showSim && (
        <div className="w-[220px] flex-shrink-0">
          <p className="text-[12px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />{t.arCallSimTitle}
          </p>
          <CallSimulator greeting={greeting} />
        </div>
      )}
    </div>
  )
}

// AiVoicePanel removed — Call AI agent uses AgentManagerPanel({ channel: "call" })
// HybridIvrPanel removed — replaced by WorkflowBuilder({ channel: "call" })

// ── Placeholder kept for removal marker only ────────────────────────────────
// ── Conditional Routing (Customer Groups) ──────────────────────────────────

function ConditionalRoutingPanel() {
  const { t } = useLocale()
  const CUSTOMER_GROUPS = CUSTOMER_GROUP_IDS.map(g => ({
    ...g,
    label: t[g.labelKey],
    desc:  t[g.descKey],
  }))
  const [routes, setRoutes] = useState(CUSTOMER_GROUPS.map(g => ({ ...g, enabled: true })))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-slate-800">{t.arRoutingTitle}</p>
          <p className="text-[12px] text-slate-500">{t.arRoutingDesc}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {routes.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
            <span className={cn("px-2 py-0.5 rounded-full text-[12px] font-semibold", r.color)}>{r.label}</span>
            <p className="flex-1 text-[12px] text-slate-600">{r.desc}</p>
            <button
              onClick={() => setRoutes(prev => prev.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))}
              className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium transition-colors",
                r.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
              )}
            >
              {r.enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              {r.enabled ? t.arRoutingActive : t.arRoutingInactive}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────���────────

export function AutoResponsePage({ storeId = "store-001" }: { storeId?: string }) {
  const { t } = useLocale()
  const CHAT_MODES: { id: ChatMode; icon: React.ElementType; label: string; desc: string; color: string }[] = [
    { id: "hybrid",   icon: Workflow, label: t.arChatModeWorkflow ?? "AI Workflow", desc: t.arChatModeWorkflowDesc ?? "", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { id: "ai-agent", icon: Bot,      label: t.arChatModeAgent   ?? "AI Agent",    desc: t.arChatModeAgentDesc   ?? "", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ]
  const CALL_MODES: { id: CallMode; icon: React.ElementType; label: string; desc: string; color: string }[] = [
    { id: "ars",        icon: Hash,      label: t.arCallModeARS      ?? "AI ARS",      desc: t.arCallModeARSDesc      ?? "", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: "hybrid-ivr", icon: GitBranch, label: t.arCallModeWorkflow ?? "AI Workflow", desc: t.arCallModeWorkflowDesc ?? "", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { id: "ai-voice",   icon: Cpu,       label: t.arCallModeAgent    ?? "AI Agent",    desc: t.arCallModeAgentDesc    ?? "", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ]

  const [channel, setChannel] = useState<Channel>("chat")
  const [chatMode, setChatMode] = useState<ChatMode>("hybrid")
  const [callMode, setCallMode] = useState<CallMode>("ars")

  // Which mode is actually "in use" (activated) — always exactly one per channel
  const [activeChatMode, setActiveChatMode] = useState<ChatMode>("hybrid")
  const [activeCallMode, setActiveCallMode] = useState<CallMode>("ars")

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Page header */}
      <div className="flex-shrink-0 bg-slate-900 text-white">
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-4">
            <div>
              <h1 className="text-[14px] md:text-[16px] font-bold leading-tight">Omni-channel Automation Studio</h1>
              <p className="text-slate-400 text-[12px] md:text-[12px] mt-0.5">{t.arPageSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[12px] md:text-[12px] font-medium">{t.arServiceRunning}</span>
              </div>
            </div>
          </div>

          {/* Channel toggle + active mode selector */}
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            {/* Channel tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-800 w-full md:w-fit flex-shrink-0">
              {([
                { id: "chat", icon: MessageSquare, label: t.arChatChannel, sub: t.arChatChannelSub },
                { id: "call", icon: Phone,         label: t.arCallChannel, sub: t.arCallChannelSub },
              ] as const).map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className={cn(
                    "flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2 md:gap-2.5 px-3 md:px-5 py-2.5 rounded-lg transition-all",
                    channel === ch.id
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  )}
                >
                  <ch.icon className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-[12px] md:text-[13px] font-semibold leading-tight">{ch.label}</p>
                    <p className={cn("text-[12px] leading-tight hidden md:block", channel === ch.id ? "text-emerald-200" : "text-slate-500")}>{ch.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden md:block w-px self-stretch bg-slate-700 mx-1" />

            {/* Active mode selector — one per channel, always exactly one active */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <p className="text-[12px] text-slate-500 font-medium uppercase tracking-wide">
                {channel === "chat" ? t.arChatAutoMode : t.arCallAutoMode} {t.arSelectMode}
              </p>
              <div className="flex flex-col md:flex-row gap-1.5 md:flex-wrap">
                {(channel === "chat" ? CHAT_MODES : CALL_MODES).map(m => {
                  const isActive = channel === "chat"
                    ? activeChatMode === m.id
                    : activeCallMode === (m.id as CallMode)

                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (channel === "chat") {
                          setActiveChatMode(m.id as ChatMode)
                          setChatMode(m.id as ChatMode)
                        } else {
                          setActiveCallMode(m.id as CallMode)
                          setCallMode(m.id as CallMode)
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2.5 md:py-2 rounded-lg border text-[12px] font-medium transition-all",
                        isActive
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                      )}
                    >
                      <m.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {m.label}
                      {isActive && (
                        <span className="ml-auto md:ml-0.5 flex items-center gap-0.5 text-[12px] text-emerald-200 font-semibold">
                          <Check className="w-3 h-3" />{t.arInUse}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-0 px-4 md:px-6 border-t border-slate-800 overflow-x-auto">
          {(channel === "chat" ? CHAT_MODES : CALL_MODES).map(m => {
            const isActive = channel === "chat" ? chatMode === m.id : callMode === (m.id as CallMode)
            return (
              <button
                key={m.id}
                onClick={() => channel === "chat" ? setChatMode(m.id as ChatMode) : setCallMode(m.id as CallMode)}
                className={cn(
                  "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 text-[12px] md:text-[12px] font-medium border-b-2 transition-all whitespace-nowrap",
                  isActive
                    ? "border-emerald-400 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-5">
          {/* Panel content */}
          {channel === "chat" && chatMode === "ai-agent"  && <AgentManagerPanel channel="chat" storeId={storeId} />}
          {channel === "chat" && chatMode === "hybrid"    && <WorkflowBuilder channel="chat" />}
          {channel === "call" && callMode === "ai-voice"   && <AgentManagerPanel channel="call" storeId={storeId} />}
          {channel === "call" && callMode === "ars"        && <ClassicArsPanel />}
          {channel === "call" && callMode === "hybrid-ivr" && <WorkflowBuilder channel="call" />}

          {/* Conditional routing — always shown at bottom */}
          <ConditionalRoutingPanel />
        </div>
      </div>
    </div>
  )
}
