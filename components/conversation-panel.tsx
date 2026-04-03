"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { sessions, customers, additionalCustomers, teamAgents, type Session, type Message } from "@/lib/data"
import { saudiSessionsEn, saudiSessionsAr, saudiCustomersEn, saudiCustomersAr, saudiTeamAgents, saudiTeamAgentsAr } from "@/lib/data-saudi"
import { setConversationContext } from "@/lib/conversation-context-store"
import { useLocale } from "@/lib/locale"
import { GeminiLiveClient } from "@/lib/gemini-live-client"
import {
  Phone,
  PhoneOff,
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Tag,
  FileText,
  SmilePlus,
  Bot,
  User,
  Headphones,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PhoneCall,
  Users,
  UserPlus,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  PhoneForwarded,
  Radio,
  AlertCircle,
  Circle,
  Zap,
  X,
  Plus,
  Trash2,
  Smile,
  Frown,
  Meh,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// ── Module-level helpers ──────────────────────────────────────────────────────
const KO_AGENT_NAME_MAP: Record<string, Record<string, string>> = {
  en: { "오상담": "Sarah Al-Rashidi", "이민주": "Layla Al-Harbi", "김기술": "Mohammed Al-Otaibi", "박준서": "Ahmed Al-Shamri" },
  ar: { "오상담": "سارة الرشيدي", "이민주": "ليلى الحربي", "김기술": "محمد العتيبي", "박준서": "أحمد الشمري" },
}

function translateAgentName(name: string | undefined, locale: string): string | undefined {
  if (!name || locale === "ko") return name
  return KO_AGENT_NAME_MAP[locale]?.[name] ?? name
}

function getActiveTeamAgents(locale: string) {
  return locale === "ko" ? teamAgents : locale === "ar" ? saudiTeamAgentsAr : saudiTeamAgents
}

// ── WrapUp Modal ──────────────────────────────────────────────────────────────
interface WrapUpTodo { id: string; text: string; checked: boolean }

function WrapUpModal({
  session,
  onClose,
  onComplete,
}: {
  session: Session
  onClose: () => void
  onComplete: () => void
}) {
  const { t } = useLocale()
  const categoryOptions = [
    t.wrapUpCategoryGeneral,
    t.wrapUpCategoryPayment,
    t.wrapUpCategoryError,
    t.wrapUpCategoryReservation,
    t.wrapUpCategoryAccount,
    t.wrapUpCategoryEtc,
  ]
  const [summary, setSummary] = useState(session.subject ?? "")
  const [emotion, setEmotion] = useState<"positive" | "neutral" | "negative">("neutral")
  const [category, setCategory] = useState(session.category ?? categoryOptions[0])
  const [todos, setTodos] = useState<WrapUpTodo[]>([
    { id: "w1", text: session.category ?? "", checked: true },
  ])
  const [newTodo, setNewTodo] = useState("")
  const [memo, setMemo] = useState("")

  const addTodo = () => {
    const text = newTodo.trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: `w${Date.now()}`, text, checked: false }])
    setNewTodo("")
  }

  const handleComplete = () => {
    const checkedTodos = todos.filter((td) => td.checked)
    checkedTodos.forEach((td) => {
      window.dispatchEvent(new CustomEvent("add-todo", { detail: td.text }))
    })
    if (checkedTodos.length > 0) {
      window.dispatchEvent(new CustomEvent("open-todo-panel"))
    }
    onComplete()
  }

  const emotionConfig = {
    positive: { label: t.wrapUpEmotionPositive, icon: Smile,  className: "text-success border-success/40 bg-success-subtle" },
    neutral:  { label: t.wrapUpEmotionNeutral,  icon: Meh,    className: "text-warning border-warning/40 bg-warning-subtle" },
    negative: { label: t.wrapUpEmotionNegative, icon: Frown,  className: "text-destructive border-destructive/40 bg-destructive-subtle" },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-[520px] max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-foreground">{t.wrapUpTitle}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{t.wrapUpAiSummary}</span>
              <span className="text-[12px] text-muted-foreground ml-1">{t.wrapUpAiSummaryHint}</span>
            </div>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="text-xs resize-none h-20 bg-surface border-border-subtle focus:border-primary leading-relaxed"
            />
          </section>

          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Smile className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{t.wrapUpEmotion}</span>
            </div>
            <div className="flex gap-2">
              {(["positive", "neutral", "negative"] as const).map((e) => {
                const cfg = emotionConfig[e]
                const Icon = cfg.icon
                return (
                  <button
                    key={e}
                    onClick={() => setEmotion(e)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all",
                      emotion === e ? cfg.className : "border-border text-muted-foreground hover:bg-surface-raised"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{t.wrapUpCategory}</span>
              <span className="text-[12px] text-muted-foreground ml-1">{t.wrapUpCategoryHint}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoryOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCategory(opt)}
                  className={cn(
                    "px-3 py-1 rounded-full border text-[12px] font-medium transition-all",
                    category === opt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{t.wrapUpTodos}</span>
              <span className="text-[12px] text-muted-foreground ml-1">{t.wrapUpTodosHint}</span>
            </div>
            <div className="flex flex-col gap-1.5 mb-2">
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border-subtle">
                  <input
                    type="checkbox"
                    checked={todo.checked}
                    onChange={() => setTodos((prev) => prev.map((td) => td.id === todo.id ? { ...td, checked: !td.checked } : td))}
                    className="w-3.5 h-3.5 accent-current text-primary rounded"
                  />
                  <span className="flex-1 text-xs text-foreground">{todo.text}</span>
                  <button onClick={() => setTodos((prev) => prev.filter((td) => td.id !== todo.id))}>
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                placeholder={t.wrapUpTodoAdd}
                className="flex-1 text-xs h-8 px-3 rounded-lg bg-surface border border-border-subtle focus:outline-none focus:border-primary placeholder:text-muted-foreground text-foreground"
              />
              <button
                onClick={addTodo}
                disabled={!newTodo.trim()}
                className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{t.wrapUpMemo}</span>
            </div>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t.wrapUpMemoPlaceholder}
              className="text-xs resize-none h-16 bg-surface border-border-subtle focus:border-primary placeholder:text-muted-foreground"
            />
          </section>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs border-border text-muted-foreground hover:text-foreground">
            {t.wrapUpCancel}
          </Button>
          <Button size="sm" onClick={handleComplete} className="text-xs bg-success hover:bg-success/90 text-white gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.wrapUpComplete}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ConversationPanelProps {
  sessionId: string
  statusMap?: Record<string, string>
  onStatusChange?: (id: string, status: string) => void
}

// Customer auto-reply pools
const customerAutoRepliesByLocale: Record<string, string[]> = {
  ko: [
    "네, 감사합니다!",
    "아 그렇군요, 알겠습니다.",
    "그러면 어떻게 하면 될까요?",
    "확인해볼게요. 잠시만요.",
    "빠른 답변 감사드립니다.",
    "혹시 다른 방법은 없나요?",
    "네 알겠습니다. 해봤는데 안 되네요.",
    "아, 이제 됩니다! 감사합니다!",
  ],
  en: [
    "Yes, thank you!",
    "I see, understood.",
    "How should I proceed then?",
    "Let me check that. One moment.",
    "Thanks for the quick reply!",
    "Is there another way to do this?",
    "I tried that but it still doesn't work.",
    "Oh, it works now! Thank you!",
  ],
  ar: [
    "نعم، شكراً!",
    "أرى، فهمت.",
    "كيف يمكنني المتابعة إذن؟",
    "سأتحقق من ذلك. لحظة من فضلك.",
    "شكراً على الرد السريع!",
    "هل هناك طريقة أخرى؟",
    "جربت ذلك لكنه لا يزال لا يعمل.",
    "آه، نجح الأمر الآن! شكراً!",
  ],
}

const boardCustomerRepliesByLocale: Record<string, string[]> = {
  ko: [
    "감사합니다. 확인해����겠습니다.",
    "혹시 더 자세히 알 수 있을까요?",
    "네, 그렇게 해봤는데도 안 됩니다.",
    "해결됐습니다! 감사합니다.",
  ],
  en: [
    "Thank you. I will check that.",
    "Could you provide more details?",
    "I tried that and it still doesn't work.",
    "It's resolved! Thank you.",
  ],
  ar: [
    "شكراً. سأتحقق من ذلك.",
    "هل يمكنك تقديم مزيد من التفاصيل؟",
    "جربت ذلك ولا يزال لا يعمل.",
    "تم الحل! شكراً جزيلاً.",
  ],
}

function getNow() {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

// ── MsgBubble ─────────────────────────────────────────────────────────────────
function MsgBubble({ message }: { message: Message }) {
  const { t, locale } = useLocale()
  const isAgent = message.sender === "agent"
  const isBot = message.sender === "bot"
  const isSystem = message.sender === "system"
  const isNote = message.type === "note"
  const isCallEvent = message.type === "call-start" || message.type === "call-end"
  const isSTT = message.type === "stt"

  const isTakeOver = isSystem && (message.content.includes("인계") || message.content.includes("taken over") || message.content.includes("تولى"))

  if (isSystem || isCallEvent) {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className={cn(
          "flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full border",
          isTakeOver
            ? "text-success bg-success/8 border-success/20 font-medium"
            : "text-muted-foreground bg-surface border-border-subtle"
        )}>
          {isTakeOver ? (
            <UserPlus className="w-3 h-3 text-success" />
          ) : message.type === "call-start" ? (
            <PhoneCall className="w-3 h-3 text-success" />
          ) : message.type === "call-end" ? (
            <PhoneOff className="w-3 h-3 text-destructive" />
          ) : null}
          {message.type === "call-start"
            ? `${t.callInProgress} — ${message.timestamp}`
            : message.type === "call-end"
            ? t.callEnd
            : message.content}
        </span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
    )
  }

  if (isSTT) {
    const isAgentSpeaker = message.sttSpeaker === "agent"
    return (
      <div className={cn("flex gap-2 px-4 py-1 group", isAgentSpeaker ? "flex-row-reverse" : "flex-row")}>
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isAgentSpeaker
            ? "bg-success/20 text-success border border-success/30"
            : "bg-surface-raised text-muted-foreground border border-border"
        )}>
          {isAgentSpeaker ? <Headphones className="w-3 h-3" /> : <User className="w-3 h-3" />}
        </div>
        <div className={cn("flex flex-col max-w-[75%]", isAgentSpeaker ? "items-end" : "items-start")}>
          <span className="text-[12px] text-muted-foreground mb-0.5 px-1">
            {isAgentSpeaker ? (translateAgentName(message.agentName, locale) ?? t.agentLabel) : t.customerLabel}
          </span>
          <div className={cn(
            "rounded-xl px-3 py-2 text-xs leading-relaxed border",
            isAgentSpeaker
              ? "bg-success/8 border-success/20 text-foreground"
              : "bg-card border-border text-foreground"
          )}>
            {message.content}
          </div>
          <span className="text-[12px] text-muted-foreground mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.timestamp}
          </span>
        </div>
      </div>
    )
  }

  if (isNote) {
    return (
      <div className="mx-4 my-1">
        <div className="bg-warning-subtle border border-warning/20 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="w-3 h-3 text-warning" />
            <span className="text-[12px] font-semibold text-warning">{t.noteLabelBubble}</span>
            {message.agentName && (
              <span className="text-[12px] text-muted-foreground">— {translateAgentName(message.agentName, locale)}</span>
            )}
            <span className="text-[12px] text-muted-foreground ml-auto">{message.timestamp}</span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2.5 px-4 py-1.5 group", isAgent ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold",
        isBot ? "bg-primary text-primary-foreground" :
          isAgent ? "bg-success/20 text-success border border-success/30" :
            "bg-surface-raised text-foreground border border-border"
      )}>
        {isBot ? <Bot className="w-3.5 h-3.5" /> : isAgent ? <Headphones className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
      </div>

      <div className={cn("flex flex-col max-w-[72%]", isAgent ? "items-end" : "items-start")}>
        <span className="text-[12px] text-muted-foreground mb-1 px-1 flex items-center gap-1">
          {isBot ? "AI Bot" : isAgent ? (
            <>
              <span className="font-medium text-foreground">{translateAgentName(message.agentName, locale) ?? t.agentLabel}</span>
            </>
          ) : t.customerLabel}
        </span>
        <div className={cn(
          "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isAgent
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : isBot
              ? "bg-surface-raised text-foreground border border-border-subtle rounded-tl-sm"
              : "bg-card text-foreground border border-border rounded-tl-sm"
        )}>
          {message.content}
        </div>
        <span className="text-[12px] text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {message.timestamp}
        </span>
      </div>
    </div>
  )
}

// ── TypingIndicator ───────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 px-4 py-1.5">
      <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center flex-shrink-0">
        <User className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-1 bg-card border border-border rounded-2xl rounded-tl-sm px-3.5 py-3">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}

// ── CallRoutingBanner ─────────────────────────────────────────────────────────
function CallRoutingBanner({ session }: { session: Session }) {
  const { t } = useLocale()
  if (!session.routingQueue) return null
  return (
    <div className="mx-4 my-3 border border-border rounded-xl p-3.5 bg-surface">
      <div className="flex items-center gap-2 mb-3">
        <PhoneForwarded className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">{t.callRoutingTitle}</span>
        <span className="text-[12px] text-muted-foreground ml-auto">{t.callRoutingHint}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {session.routingQueue.map((item, i) => (
          <div key={item.agent.id} className="flex items-center gap-1.5">
            <div className={cn(
              "flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border font-medium",
              item.current
                ? "bg-primary-subtle border-primary/30 text-primary"
                : item.tried
                  ? "bg-muted border-border text-muted-foreground line-through"
                  : "bg-card border-border text-foreground"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                item.agent.status === "online" ? "bg-success" :
                  item.agent.status === "busy" ? "bg-warning" : "bg-muted-foreground"
              )} />
              {item.agent.name}
              {item.current && <span className="animate-pulse">···</span>}
              {item.tried && !item.current && <span className="ml-0.5 text-[12px]">({t.callRoutingAbsent})</span>}
            </div>
            {i < session.routingQueue!.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── TeamBanner ────────────────────────────────────────────────────────────────
function TeamBanner({ session }: { session: Session }) {
  const { t, locale } = useLocale()
  const agents = getActiveTeamAgents(locale)
  const activeIds = new Set(session.activeMembers?.map((m) => m.id) ?? [])
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="mx-4 my-3 border border-border rounded-xl bg-surface overflow-hidden">
      {/* Header — always visible, click to toggle */}
      <button
        className="w-full flex items-center gap-2 px-3.5 py-3 hover:bg-surface-raised transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-xs font-semibold text-foreground">{t.teamTitle}</span>
        {/* Active member avatars shown when collapsed */}
        {collapsed && activeIds.size > 0 && (
          <div className="flex items-center gap-1 ml-1">
            {agents.filter(a => activeIds.has(a.id)).map(a => (
              <span key={a.id} className="text-[11px] px-1.5 py-0.5 rounded bg-primary-subtle text-primary font-medium">
                {a.name.split(" ")[0]}
              </span>
            ))}
          </div>
        )}
        <ChevronUp className={cn(
          "w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200",
          collapsed && "rotate-180"
        )} />
      </button>

      {/* Collapsible body */}
      {!collapsed && (
        <div className="px-3.5 pb-3.5">
          <p className="text-[12px] text-muted-foreground mb-2.5 flex items-center gap-1">
            {t.teamDisplayAs} <span className="font-semibold text-foreground mx-1">{session.id}</span> {t.teamDisplayAsSuffix}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {agents.map((agent) => {
              const isIn = activeIds.has(agent.id)
              return (
                <div key={agent.id} className={cn(
                  "flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border font-medium cursor-pointer transition-all",
                  isIn
                    ? "bg-primary-subtle border-primary/30 text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    agent.status === "online" ? "bg-success" :
                      agent.status === "busy" ? "bg-warning" : "bg-muted-foreground"
                  )} />
                  {agent.name}
                  {isIn && <span className="text-[12px] font-normal">({t.teamJoined})</span>}
                </div>
              )
            })}
            <button className="flex items-center gap-1 text-[12px] text-primary px-2.5 py-1.5 rounded-lg border border-dashed border-primary/40 hover:bg-primary-subtle transition-all">
              <UserPlus className="w-3 h-3" />
              {t.teamJoin}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CallView ──────────────────────��───────────────────────────────────────────
function CallView({
  session,
  messages,
  onAddMessage,
  onAnswer,
  onHangup,
}: {
  session: Session
  messages: Message[]
  onAddMessage: (msg: Message) => void
  onAnswer?: () => void
  onHangup?: () => void
}) {
  const { t, locale } = useLocale()
  const [muted, setMuted] = useState(false)
  const [speakerOff, setSpeakerOff] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [noteInput, setNoteInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // ── Gemini Live state ────────────────────────────────────────────────────
  const liveClientRef = useRef<GeminiLiveClient | null>(null)
  const [liveStatus, setLiveStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [liveError, setLiveError] = useState<string | null>(null)
  const agentBuf = useRef("")
  const customerBuf = useRef("")
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Real-time STT preview (shown as "typing" bubble before flush)
  const [livePreview, setLivePreview] = useState<{ sender: "agent" | "customer"; text: string } | null>(null)
  // Mic volume level 0.0–1.0 for indicator
  const [micLevel, setMicLevel] = useState(0)

  const allCustomers = locale === "ko"
    ? { ...customers, ...additionalCustomers }
    : locale === "ar" ? saudiCustomersAr : saudiCustomersEn
  const callCustomer = allCustomers[session.customerId]
  const agentDisplayName = locale === "ar" ? "سارة الرشيدي" : locale === "en" ? "Sarah Al-Rashidi" : "오상담"

  // Push buffered text as a chat bubble and clear the live preview
  const pushBubble = (buf: React.MutableRefObject<string>, sender: "agent" | "customer") => {
    const text = buf.current.trim()
    if (!text) return
    buf.current = ""
    setLivePreview(null)
    onAddMessage({
      id: `live-${sender}-${Date.now()}-${Math.random()}`,
      sender,
      agentName: sender === "agent" ? agentDisplayName : undefined,
      content: text,
      timestamp: getNow(),
      type: "text",
    })
  }

  // Start a Gemini Live session — called directly by the Answer button
  const startLive = async () => {
    if (liveClientRef.current) return  // already running
    setLiveStatus("connecting")
    setLiveError(null)

    try {
      const res = await fetch("/api/gemini-live-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: callCustomer?.name ?? "Customer", subject: session.subject ?? "", locale }),
      })
      if (!res.ok) throw new Error("Failed to get Live token")
      const { token, model, systemInstruction } = await res.json()
      if (!token) throw new Error("No ephemeral token returned from server")

      const client = new GeminiLiveClient({
        token,
        model,
        systemInstruction,
        onInputTranscript: (text) => {
          // Our mic → show as agent bubble; update live preview immediately
          agentBuf.current += (agentBuf.current ? " " : "") + text
          setLivePreview({ sender: "agent", text: agentBuf.current })
          if (flushTimer.current) clearTimeout(flushTimer.current)
          flushTimer.current = setTimeout(() => pushBubble(agentBuf, "agent"), 1200)
        },
        onOutputTranscript: (text) => {
          // Gemini reply → show as customer bubble; update live preview immediately
          customerBuf.current += (customerBuf.current ? " " : "") + text
          setLivePreview({ sender: "customer", text: customerBuf.current })
          if (flushTimer.current) clearTimeout(flushTimer.current)
          flushTimer.current = setTimeout(() => pushBubble(customerBuf, "customer"), 1200)
        },
        onVolumeLevel: (level) => setMicLevel(level),
        onError: (err) => {
          // WS dropped unexpectedly — show warning but do NOT kill the mic or reset to idle
          // (disconnect() called from hangup button is the only thing that resets to idle)
          setLiveError(err.message)
        },
        onClose: () => {
          // Only called from explicit disconnect() — safe to reset
          setLiveStatus("idle")
          liveClientRef.current = null
        },
      })

      liveClientRef.current = client
      await client.connect()   // acquires mic + opens WS + waits for setupComplete
      setLiveStatus("connected")

      // Prompt AI customer to speak first
      client.greet()
    } catch (err: any) {
      setLiveStatus("error")
      setLiveError(err.message ?? "Connection failed")
      liveClientRef.current = null
    }
  }

  const stopLive = () => {
    if (flushTimer.current) clearTimeout(flushTimer.current)
    pushBubble(agentBuf, "agent")
    pushBubble(customerBuf, "customer")
    setLivePreview(null)
    liveClientRef.current?.disconnect()
    liveClientRef.current = null
    setLiveStatus("idle")
  }

  // Mute / unmute
  const toggleMute = () => {
    setMuted(m => {
      const next = !m
      liveClientRef.current?.setMuted(next)
      return next
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopLive() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (session.status !== "active") return
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000)
    return () => clearInterval(timer)
  }, [session.status])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0")
    const s = (sec % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  // Text note still available as fallback while live is active
  const [isReplying, setIsReplying] = useState(false)

  const sendNote = async () => {
    if (!noteInput.trim()) return
    const agentDisplayName = locale === "ar" ? "سارة الرشيدي" : locale === "en" ? "Sarah Al-Rashidi" : "오상담"
    const notePrefix = locale === "ar" ? "[ملاحظة مكالمة]" : locale === "en" ? "[Call Note]" : "[통화 메모]"
    const agentMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      agentName: agentDisplayName,
      content: `${notePrefix} ${noteInput.trim()}`,
      timestamp: getNow(),
      type: "note",
    }
    onAddMessage(agentMsg)
    setNoteInput("")

    // If Live is not connected, fall back to REST Gemini
    if (liveStatus !== "connected") {
      setIsReplying(true)
      try {
        const historyWithNew = [...messages, agentMsg].map(m => ({
          sender: m.sender,
          content: m.content,
        }))
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyWithNew,
            customerName: callCustomer?.name ?? "Customer",
            channel: "phone",
            locale,
          }),
        })
        const data = await res.json()
        onAddMessage({
          id: `msg-${Date.now() + 1}`,
          sender: "customer",
          content: data.reply || (locale === "ar" ? "حسناً." : locale === "ko" ? "네." : "I see."),
          timestamp: getNow(),
          type: "text",
        })
      } catch {
        // silent fail
      } finally {
        setIsReplying(false)
      }
    }
  }

  // Live status indicator label
  const liveLabel =
    liveStatus === "connecting"
      ? (locale === "ko" ? "Gemini Live 연결 중..." : locale === "ar" ? "جارٍ الاتصال..." : "Connecting Live...")
      : liveStatus === "connected"
      ? (locale === "ko" ? "Gemini Live 연결됨 — 말씀하세요" : locale === "ar" ? "متصل — تحدث الآن" : "Live connected — speak now")
      : liveStatus === "error"
      ? (locale === "ko" ? `연결 실패: ${liveError ?? ""}` : `Live error: ${liveError ?? ""}`)
      : null

  return (
    <div className="flex flex-col h-full">
      {/* ── Active call toolbar ── */}
      {session.status === "active" && (
        <div className="flex items-center justify-between px-5 py-3 bg-success-subtle border-b border-success/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-semibold text-success">{t.callInProgress}</span>
            <span className="text-sm font-mono text-success/80">{formatTime(elapsed)}</span>
          </div>
          {session.softphone === false ? (
            <span className="text-xs text-success/70 font-medium">{t.callInbound}</span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
                  muted ? "bg-destructive-subtle text-destructive border-destructive/30" : "bg-surface-raised text-foreground border-border"
                )}
              >
                {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {muted ? t.callMute : t.callMic}
              </button>
              {/* Mic volume indicator bars */}
              {!muted && liveStatus === "connected" && (
                <div className="flex items-end gap-[2px] h-4">
                  {[0.3, 0.6, 1.0, 0.6, 0.3].map((threshold, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(20, micLevel >= threshold ? 100 : micLevel / threshold * 60)}%`,
                        backgroundColor: micLevel >= threshold ? "var(--color-success)" : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => setSpeakerOff(!speakerOff)}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
                  speakerOff ? "bg-destructive-subtle text-destructive border-destructive/30" : "bg-surface-raised text-foreground border-border"
                )}
              >
                {speakerOff ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { stopLive(); onHangup?.() }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-destructive/30 bg-destructive-subtle text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                {t.callEnd}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Waiting / answer toolbar ── */}
      {session.status === "waiting" && (
        <div className="flex items-center justify-between px-5 py-3 bg-warning-subtle border-b border-warning/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-sm font-semibold text-warning">{t.callWaiting}</span>
            <span className="text-xs text-warning/70">{session.waitTime} {t.callElapsed}</span>
          </div>
          <button
            onClick={() => { onAnswer?.(); startLive() }}
            className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg bg-success text-background font-semibold hover:bg-success/90 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {t.callAnswer}
          </button>
        </div>
      )}

      {/* ── Message area ── */}
      <div className="flex-1 overflow-y-auto py-2">
        <CallRoutingBanner session={session} />

        {/* Live connection status banner */}
        {session.status === "active" && (
          <div className={cn(
            "mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg border",
            liveStatus === "connected"   ? "bg-success-subtle border-success/20"
            : liveStatus === "error"     ? "bg-destructive-subtle border-destructive/20"
            : liveStatus === "connecting"? "bg-primary-subtle border-primary/20"
            : "bg-primary-subtle border-primary/20"
          )}>
            <Radio className={cn(
              "w-3.5 h-3.5 flex-shrink-0",
              liveStatus === "connected" ? "text-success animate-pulse"
              : liveStatus === "error"   ? "text-destructive"
              : "text-primary animate-pulse"
            )} />
            <span className={cn(
              "text-[12px] font-medium",
              liveStatus === "connected"  ? "text-success"
              : liveStatus === "error"    ? "text-destructive"
              : "text-primary"
            )}>
              {liveLabel ?? t.callSttBanner}
            </span>
            {liveStatus === "error" && (
              <button
                onClick={startLive}
                className="ml-auto text-[11px] text-primary underline-offset-2 hover:underline"
              >
                {locale === "ko" ? "재연결" : locale === "ar" ? "إعادة الاتصال" : "Retry"}
              </button>
            )}
          </div>
        )}

        {messages.map(msg => (
          <MsgBubble key={msg.id} message={msg} />
        ))}

        {/* Real-time STT preview bubble */}
        {livePreview && (
          <div className={cn(
            "flex items-end gap-2 px-4 py-1",
            livePreview.sender === "agent" ? "flex-row-reverse" : "flex-row"
          )}>
            <div className={cn(
              "max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed opacity-70 border border-dashed",
              livePreview.sender === "agent"
                ? "bg-primary/10 text-primary border-primary/30 rounded-br-sm"
                : "bg-muted text-foreground border-border rounded-bl-sm"
            )}>
              <span>{livePreview.text}</span>
              <span className="inline-flex gap-0.5 ml-1.5 align-middle">
                <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Note input (always available as fallback) ── */}
      <div className="border-t border-border px-4 py-3 flex-shrink-0">
        {liveStatus === "connected" && (
          <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1.5">
            <Mic className="w-3 h-3 text-success" />
            {locale === "ko"
              ? "마이크를 통해 직접 대화 중 — 메모는 아래에 입력하세요."
              : locale === "ar"
              ? "المكالمة الصوتية نشطة — أدخل ملاحظات أدناه إذا لزم الأمر."
              : "Voice call active — add a text note below if needed."}
          </p>
        )}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={locale === "ar" ? "أضف ملاحظة للمكالمة..." : locale === "ko" ? "통화 메모 입력..." : "Add call note..."}
              className="text-sm resize-none min-h-[60px] max-h-[100px] bg-surface border-border-subtle focus:border-primary placeholder:text-muted-foreground leading-relaxed"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendNote() } }}
            />
          </div>
          <Button
            className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
            disabled={!noteInput.trim() || isReplying}
            onClick={sendNote}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── ChatView ────────�����─────────────────────────────────────────────────────────
function ConvChatView({
  session,
  messages,
  onAddMessage,
}: {
  session: Session
  messages: Message[]
  onAddMessage: (msg: Message) => void
}) {
  const { t, locale } = useLocale()
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [guideDismissed, setGuideDismissed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Reset guide banner when switching sessions
  useEffect(() => { setGuideDismissed(false) }, [session.id])
  const allCustomers = locale === "ko"
    ? { ...customers, ...additionalCustomers }
    : locale === "ar" ? saudiCustomersAr : saudiCustomersEn
  const customer = allCustomers[session.customerId]
  const visibleMessages = messages

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const quickTemplates = locale === "ar"
    ? ["مرحباً، كيف يمكنني مساعدتك؟", "سأتحقق من ذلك وأعود إليك.", "شكراً لتواصلك معنا.", "هل هناك أي شيء آخر يمكنني مساعدتك به؟"]
    : locale === "ko"
    ? ["안녕하세요, 무엇을 도와드릴까��?", "확인 후 다시 안내드리겠습니다.", "감사합니다.", "다른 문의사항이 있으신가요?"]
    : ["Hello, how can I help you?", "Let me check that for you.", "Thank you for reaching out.", "Is there anything else I can help you with?"]

  const sendMessage = async () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput("")
    const agentDisplayName = locale === "ar" ? "سارة الرشيدي" : locale === "en" ? "Sarah Al-Rashidi" : "오상담"
    const agentMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      agentName: agentDisplayName,
      content: text,
      timestamp: getNow(),
      type: "text",
    }
    onAddMessage(agentMsg)

    // Call Gemini for customer reply
    setIsTyping(true)
    try {
      const historyWithNew = [...messages, agentMsg].map(m => ({
        sender: m.sender,
        content: m.content,
      }))
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyWithNew,
          customerName: customer?.name ?? "Customer",
          channel: session.channel ?? "chat",
          locale,
        }),
      })
      const data = await res.json()
      const replyText = data.reply || (locale === "ar" ? "شكراً." : locale === "ko" ? "감사합니다." : "Thank you.")
      onAddMessage({
        id: `msg-${Date.now() + 1}`,
        sender: "customer",
        content: replyText,
        timestamp: getNow(),
        type: "text",
      })
    } catch {
      onAddMessage({
        id: `msg-${Date.now() + 1}`,
        sender: "customer",
        content: locale === "ar" ? "عذراً، حدث خطأ." : locale === "ko" ? "오류가 발생했습니다." : "Sorry, an error occurred.",
        timestamp: getNow(),
        type: "text",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const isAiMode = session.status === "ai_agent"

  return (
    <div className="h-full flex flex-col">
      <TeamBanner session={session} />

      {isAiMode && (
        <div className="mx-4 mt-2 mb-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-subtle border border-primary/20 flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-[12px] text-primary font-medium flex-1">
            {locale === "ar" ? "الذكاء الاصطناعي يتعامل مع هذه المحادثة" : locale === "ko" ? "AI 봇이 자동 응대 중입니다" : "AI bot is handling this conversation"}
          </span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        <CallRoutingBanner session={session} />
        {visibleMessages.map(msg => (
          <MsgBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {showTemplates && (
        <div className="px-4 pb-2 border-t border-border-subtle pt-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">{t.chatTemplateTitle}</span>
            <button onClick={() => setShowTemplates(false)} className="ml-auto text-muted-foreground hover:text-foreground">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {quickTemplates.map((tmpl, i) => (
              <button key={i} onClick={() => { setInput(tmpl); setShowTemplates(false) }}
                className="text-left text-xs px-3 py-2 rounded-lg bg-surface-raised hover:bg-primary-subtle hover:text-primary text-muted-foreground transition-all border border-border-subtle">
                {tmpl}
              </button>
            ))}
          </div>
        </div>
      )}



      <div className="border-t border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              className="text-sm resize-none min-h-[60px] max-h-[120px] bg-surface border-border-subtle focus:border-primary placeholder:text-muted-foreground leading-relaxed"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            />
            <div className="flex items-center gap-2 mt-2">
              <button className="p-1.5 rounded-md hover:bg-surface-raised text-muted-foreground hover:text-foreground transition-colors"><Paperclip className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded-md hover:bg-surface-raised text-muted-foreground hover:text-foreground transition-colors"><SmilePlus className="w-3.5 h-3.5" /></button>
              <button onClick={() => setShowTemplates(!showTemplates)}
                className={cn("p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-surface-raised", showTemplates && "bg-primary-subtle text-primary")}>
                <FileText className="w-3.5 h-3.5" />
              </button>
              <span className="text-[12px] text-muted-foreground ml-auto">{input.length} / 1000</span>
            </div>
          </div>
          <Button className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
            disabled={!input.trim()} onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── BoardView ─────────────────────────────────────────────────────────────────
function BoardView({
  session,
  messages,
  onAddMessage,
}: {
  session: Session
  messages: Message[]
  onAddMessage: (msg: Message) => void
}) {
  const { t, locale } = useLocale()
  const [reply, setReply] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const allCustomers = locale === "ko"
    ? { ...customers, ...additionalCustomers }
    : locale === "ar" ? saudiCustomersAr : saudiCustomersEn
  const customer = allCustomers[session.customerId]
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const sendReply = async () => {
    if (!reply.trim()) return
    const text = reply.trim()
    setReply("")

    const agentDisplayName = locale === "ar" ? "سارة الرشيدي" : locale === "en" ? "Sarah Al-Rashidi" : "오상담"
    const agentMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      agentName: agentDisplayName,
      content: text,
      timestamp: getNow(),
      type: "text",
    }
    onAddMessage(agentMsg)

    setIsTyping(true)
    try {
      const historyWithNew = [...messages, agentMsg].map(m => ({
        sender: m.sender,
        content: m.content,
      }))
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyWithNew,
          customerName: customer?.name ?? "Customer",
          channel: session.channel ?? "board",
          locale,
        }),
      })
      const data = await res.json()
      onAddMessage({
        id: `msg-${Date.now() + 1}`,
        sender: "customer",
        content: data.reply || (locale === "ar" ? "شكراً." : locale === "ko" ? "감사합니다." : "Thank you."),
        timestamp: getNow(),
        type: "text",
      })
    } catch {
      onAddMessage({
        id: `msg-${Date.now() + 1}`,
        sender: "customer",
        content: locale === "ar" ? "عذراً." : locale === "ko" ? "오류가 발생했습니다." : "Sorry, an error occurred.",
        timestamp: getNow(),
        type: "text",
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {session.status === "waiting" && (
        <div className="flex items-center justify-between px-5 py-3 bg-warning-subtle border-b border-warning/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 text-warning" />
            <span className="text-sm font-semibold text-warning">{t.boardWaiting}</span>
            <span className="text-xs text-warning/70">{session.waitTime} {t.callElapsed}</span>
          </div>
          <span className="text-[12px] text-muted-foreground">{t.boardWaitingHint}</span>
        </div>
      )}
      {session.status === "resolved" && (
        <div className="flex items-center gap-2.5 px-5 py-3 bg-success-subtle border-b border-success/20 flex-shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span className="text-sm font-semibold text-success">{t.boardResolved}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
        <div className="border border-border rounded-xl p-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground">{customer?.name}</span>
              <span className="text-[12px] text-muted-foreground ml-2">{customer?.company}</span>
            </div>
            <span className="text-[12px] text-muted-foreground ml-auto">{messages[0]?.timestamp}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {messages[0]?.content}
          </p>
        </div>

        {messages.slice(1).map((msg) => (
          <div key={msg.id} className={cn(
            "border rounded-xl p-4",
            msg.sender === "agent"
              ? "border-primary/20 bg-primary-subtle ml-4"
              : "border-border bg-card"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center",
                msg.sender === "agent" ? "bg-success/20 border border-success/30" : "bg-surface-raised border border-border"
              )}>
                {msg.sender === "agent"
                  ? <Headphones className="w-3.5 h-3.5 text-success" />
                  : <User className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground">
                  {msg.sender === "agent" ? (translateAgentName(msg.agentName, locale) ?? t.agentLabel) : customer?.name}
                </span>
                {msg.sender === "agent" && (
                  <span className="text-[12px] text-primary ml-2">{t.agentLabel}</span>
                )}
              </div>
              <span className="text-[12px] text-muted-foreground ml-auto">{msg.timestamp}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}



        <div ref={bottomRef} />
      </div>

      {session.status !== "resolved" && (
        <div className="border-t border-border px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">{t.boardReplyTitle}</span>
            <span className="text-[12px] text-muted-foreground ml-1">{t.boardReplyHint}</span>
          </div>
          <div className="flex gap-2">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t.boardPlaceholder}
              className="text-sm resize-none min-h-[80px] bg-surface border-border-subtle focus:border-primary placeholder:text-muted-foreground leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendReply()
                }
              }}
            />
            <div className="flex flex-col gap-1.5">
              <Button
                size="sm"
                className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!reply.trim()}
                onClick={sendReply}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-border hover:bg-surface-raised text-foreground">
                <Tag className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ConversationPanel (main export) ──────────────────────────────────────────
export function ConversationPanel({ sessionId, statusMap = {}, onStatusChange }: ConversationPanelProps) {
  const { locale, t } = useLocale()
  const activeSessions = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
  const allCustomers = locale === "ko"
    ? { ...customers, ...additionalCustomers }
    : locale === "ar" ? saudiCustomersAr : saudiCustomersEn

  const session = activeSessions.find((s) => s.id === sessionId)

  const buildMessagesMap = (sess: typeof activeSessions) => {
    const map: Record<string, Message[]> = {}
    sess.forEach((s) => { map[s.id] = [...s.messages] })
    return map
  }

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() =>
    buildMessagesMap(activeSessions)
  )

  useEffect(() => {
    setMessagesMap(buildMessagesMap(activeSessions))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  const sessionStatus = session ? (statusMap[session.id] ?? session.status) : "active"
  const [showWrapUp, setShowWrapUp] = useState(false)

  const setSessionStatus = useCallback((status: string) => {
    if (!session) return
    onStatusChange?.(session.id, status)
  }, [session, onStatusChange])

  const handleEndConsult = useCallback(() => {
    setShowWrapUp(true)
  }, [])

  const handleWrapUpComplete = useCallback(() => {
    setShowWrapUp(false)
    setSessionStatus("resolved")
  }, [setSessionStatus])

  const messages = session ? (messagesMap[session.id] ?? session.messages) : []

  useEffect(() => {
    if (!session) return
    const customer = allCustomers[session.customerId ?? ""]
    setConversationContext({
      session,
      messages,
      customerName: customer?.name ?? t.customerLabel,
    })
  }, [session?.id, messages.length])

  const addMessage = useCallback((msg: Message) => {
    if (!session) return
    setMessagesMap((prev) => ({
      ...prev,
      [session.id]: [...(prev[session.id] ?? []), msg],
    }))
    if (msg.sender === "agent") {
      const currentStatus = statusMap[session.id] ?? session.status
      if (currentStatus === "waiting" || currentStatus === "ai_agent") {
        onStatusChange?.(session.id, "active")
      }
    }
  }, [session, statusMap, onStatusChange])

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-surface">
        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm font-medium">{t.convSelectPrompt}</p>
        <p className="text-xs mt-1 opacity-60">{t.convSelectHint}</p>
      </div>
    )
  }

  const customer = allCustomers[session.customerId]

  const statusColors: Record<string, string> = {
    active:   "text-success bg-success-subtle border-success/20",
    waiting:  "text-warning bg-warning-subtle border-warning/20",
    ai_agent: "text-primary bg-primary-subtle border-primary/20",
    pending:  "text-muted-foreground bg-muted border-border",
    resolved: "text-muted-foreground bg-muted border-border",
    missed:   "text-destructive bg-destructive-subtle border-destructive/20",
  }

  const channelConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    webchat: {
      label: t.convChannelWebchat,
      icon: <MessageSquare className="w-2.5 h-2.5" />,
      className: "bg-primary-subtle text-primary border-primary/20",
    },
    whatsapp: {
      label: t.convChannelWhatsapp,
      icon: (
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      className: "bg-[#25D366]/10 text-[#075E54] border-[#25D366]/30",
    },
    call: {
      label: t.convChannelCall,
      icon: <Phone className="w-2.5 h-2.5" />,
      className: "bg-blue-50 text-blue-600 border-blue-200",
    },
    board: {
      label: t.convChannelBoard,
      icon: <ClipboardList className="w-2.5 h-2.5" />,
      className: "bg-warning-subtle text-warning border-warning/20",
    },
  }

  const priorityConfig: Record<string, { label: string; className: string }> = {
    urgent: { label: t.cardPriorityUrgent, className: "bg-destructive-subtle text-destructive border-destructive/20" },
    high:   { label: t.cardPriorityHigh,   className: "bg-warning-subtle text-warning border-warning/20" },
    normal: { label: t.cardPriorityNormal, className: "bg-primary-subtle text-primary border-primary/20" },
    low:    { label: t.cardPriorityLow,    className: "bg-muted text-muted-foreground border-border" },
  }

  void statusColors

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-3.5 border-b border-border bg-surface flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn(
              "inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full border",
              channelConfig[session.channel]?.className
            )}>
              {channelConfig[session.channel]?.icon}
              {channelConfig[session.channel]?.label}
            </span>
            <span className="text-[12px] text-muted-foreground font-mono">#{session.id}</span>
            {session.priority !== "normal" && session.priority !== "low" && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full border",
                priorityConfig[session.priority]?.className
              )}>
                {session.priority === "urgent" && <Zap className="w-2.5 h-2.5" />}
                {priorityConfig[session.priority]?.label}
              </span>
            )}
            {sessionStatus === "ai_agent" && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full border border-primary/30 bg-primary-subtle text-primary">
                <Bot className="w-2.5 h-2.5" />
                {t.convStatusAI}
              </span>
            )}
            {sessionStatus === "pending" && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full border border-warning/40 bg-warning-subtle text-warning">
                <AlertCircle className="w-2.5 h-2.5" />
                {t.convStatusPending}
              </span>
            )}
            {sessionStatus === "resolved" && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full border border-muted-foreground/30 bg-muted text-muted-foreground">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {t.convStatusResolved}
              </span>
            )}
          </div>
          <h1 className="text-sm font-semibold text-foreground leading-tight truncate">{session.subject}</h1>
        </div>
        <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
          {sessionStatus === "ai_agent" && (
            <Button
              size="sm"
              className="h-7 px-2.5 text-[12px] bg-primary hover:bg-primary/90 text-primary-foreground gap-1 animate-pulse"
              onClick={() => {
                const takeOverMsg: Message = {
                  id: `sys-${Date.now()}`,
                  sender: "system",
                  content: t.convTakeOverMsg,
                  timestamp: getNow(),
                  type: "text",
                }
                addMessage(takeOverMsg)
                onStatusChange?.(session.id, "active")
              }}
            >
              <UserPlus className="w-3 h-3" />
              {t.convBtnTakeOver}
            </Button>
          )}
          {sessionStatus !== "pending" && sessionStatus !== "resolved" && sessionStatus !== "ai_agent" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[12px] border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised gap-1"
              onClick={() => setSessionStatus("pending")}
            >
              <AlertCircle className="w-3 h-3" />
              {t.convBtnPending}
            </Button>
          )}
          {sessionStatus === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[12px] border-warning/40 text-warning hover:bg-warning-subtle gap-1"
              onClick={() => setSessionStatus("active")}
            >
              <Circle className="w-3 h-3" />
              {t.convBtnResume}
            </Button>
          )}
          {sessionStatus !== "resolved" && (
            <Button
              size="sm"
              className="h-7 px-2.5 text-[12px] bg-success hover:bg-success/90 text-white gap-1"
              onClick={handleEndConsult}
            >
              <CheckCircle2 className="w-3 h-3" />
              {t.convBtnEnd}
            </Button>
          )}
          {sessionStatus === "resolved" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[12px] border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised gap-1"
              onClick={() => setSessionStatus("active")}
            >
              <Circle className="w-3 h-3" />
              {t.convBtnReopen}
            </Button>
          )}
          <button className="p-1.5 rounded-lg hover:bg-surface-raised text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showWrapUp && (
        <WrapUpModal
          session={session}
          onClose={() => setShowWrapUp(false)}
          onComplete={handleWrapUpComplete}
        />
      )}

      <div className="flex-1 overflow-hidden">
        {session.channel === "call" ? (
          <CallView
            session={{...session, status: sessionStatus as Session["status"]}}
            messages={messages}
            onAddMessage={addMessage}
            onAnswer={() => setSessionStatus("active")}
            onHangup={handleEndConsult}
          />
        ) : session.channel === "board" || session.channel === "email" ? (
          <BoardView session={{...session, status: sessionStatus as Session["status"]}} messages={messages} onAddMessage={addMessage} />
        ) : (
          <ConvChatView session={{...session, status: sessionStatus as Session["status"]}} messages={messages} onAddMessage={addMessage} />
        )}
      </div>
    </div>
  )
}
