"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  CheckSquare,
  Plus,
  X,
  ChevronRight,
  Check,
  Circle,
  Puzzle,
  Bell,
  MessageCircle,
  Star,
  AlertCircle,
  ShoppingCart,
  Sparkles,
  Send,
  Bot,
  RotateCcw,
} from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  getConversationContext,
  subscribeConversationContext,
} from "@/lib/conversation-context-store"
import { useLocale } from "@/lib/locale"

/* ─── Types ─── */
interface Plugin {
  id: string
  icon: React.ElementType
  label: string
  badge?: number
}

interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: string
}

interface Notification {
  id: string
  type: "message" | "review" | "order" | "system"
  title: string
  body: string
  time: string
  read: boolean
  store: string
}

/* ─── Plugin registry (locale-aware) ─── */
type T = ReturnType<typeof useLocale>["t"]
function makePlugins(t: T): Plugin[] {
  return [
    { id: "assistant",     icon: Sparkles,    label: t.pluginAIAssistant },
    { id: "notifications", icon: Bell,        label: t.pluginNotifications, badge: 4 },
    { id: "todo",          icon: CheckSquare, label: t.pluginTodo,          badge: 3 },
  ]
}

/* ─── Notification icons ─── */
const NOTIF_ICONS: Record<Notification["type"], React.ElementType> = {
  message: MessageCircle,
  review:  Star,
  order:   ShoppingCart,
  system:  AlertCircle,
}
const NOTIF_COLORS: Record<Notification["type"], string> = {
  message: "bg-blue-100 text-blue-600",
  review:  "bg-amber-100 text-amber-600",
  order:   "bg-emerald-100 text-emerald-600",
  system:  "bg-rose-100 text-rose-600",
}

function makeInitialNotifications(t: T): Notification[] {
  return [
    { id: "n1", type: "message", title: t.notifNewInquiry, body: t.notifInquiryBody.replace("{name}", "Kim Minji").replace("{topic}", "refund"), time: t.notifJustNow, read: false, store: "Gangnam Hair" },
    { id: "n2", type: "review",  title: t.notifNewReview, body: t.notifReviewBody.replace("{name}", "Lee Junhyuk").replace("{rating}", "5"), time: t.notifMinAgo.replace("{min}", "5"), read: false, store: "Seoul Hair" },
    { id: "n3", type: "order",   title: t.notifNewOrder, body: t.notifOrderBody.replace("{name}", "Park Seoyeon"), time: t.notifMinAgo.replace("{min}", "12"), read: false, store: "Gangnam Hair" },
    { id: "n4", type: "message", title: t.notifNewInquiry, body: t.notifInquiryBody.replace("{name}", "Choi Jiwoo").replace("{topic}", "price"), time: t.notifMinAgo.replace("{min}", "23"), read: false, store: "Songpa Hair" },
    { id: "n5", type: "system",  title: t.notifSystemError, body: t.notifSystemBody, time: t.notifHourAgo.replace("{hour}", "1"), read: true, store: "Gangnam Hair" },
    { id: "n6", type: "review",  title: t.notifNewReview, body: t.notifReviewBody.replace("{name}", "Jung Hyunwoo").replace("{rating}", "3"), time: t.notifHourAgo.replace("{hour}", "2"), read: true, store: "Gangnam Hair" },
  ]
}

/* ─── AI Assistant Panel ─── */
function AIAssistantPanel() {
  const { t, locale } = useLocale()
  const [input, setInput]         = useState("")
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const lastAnalyzedCount         = useRef(0)   // tracks how many msgs we last analyzed
  const lastAnalyzedSession       = useRef("")   // tracks which session we analyzed

  // Mirror the shared conversation context into local state
  const [ctx, setCtx] = useState(() => getConversationContext())
  useEffect(() => subscribeConversationContext(() => setCtx({ ...getConversationContext() })), [])

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/assistant",
      prepareSendMessagesRequest: ({ id, messages: msgs }) => ({
        body: {
          id,
          messages: msgs,
          locale,
          conversationContext: ctx.session
            ? {
                customerName: ctx.customerName,
                category: ctx.session.category,
                recentMessages: ctx.messages.map((m) => ({
                  sender: m.sender,
                  content: m.content,
                })),
              }
            : undefined,
        },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-analyze: fire when a new customer message arrives or session changes
  useEffect(() => {
    if (!ctx.session) return

    const sessionChanged = ctx.session.id !== lastAnalyzedSession.current
    const customerMessages = ctx.messages.filter((m) => m.sender === "customer")
    const newMessagesArrived = customerMessages.length > lastAnalyzedCount.current

    if (!sessionChanged && !newMessagesArrived) return
    if (isLoading) return
    // Need at least 1 customer message to analyze
    if (customerMessages.length === 0) return

    lastAnalyzedSession.current = ctx.session.id
    lastAnalyzedCount.current   = customerMessages.length

    // If session changed, reset the chat thread
    if (sessionChanged) setMessages([])

    // Build a concise trigger prompt for the AI (locale-aware)
    const recentCustomerMsg = customerMessages[customerMessages.length - 1]?.content ?? ""
    const autoPrompt = locale === "ar"
      ? sessionChanged
        ? `استشارة جديدة بدأت. العميل "${ctx.customerName}" / استفسار ${ctx.session.category}. الرسالة الأولى: "${recentCustomerMsg}" — يرجى تحليل الطلب وتقديم المعلومات ذات الصلة فوراً`
        : `رسالة جديدة من العميل: "${recentCustomerMsg}" — إذا كانت هناك معلومات مفيدة للموظف في هذا السياق، يرجى تقديمها الآن`
      : locale === "en"
      ? sessionChanged
        ? `New consultation started. Customer "${ctx.customerName}" / ${ctx.session.category} inquiry. First message: "${recentCustomerMsg}" — please analyze and surface relevant information immediately`
        : `New customer message: "${recentCustomerMsg}" — if there is useful information for the agent in this context, please share it now`
      : sessionChanged
        ? `새 상담 시작. 고객 "${ctx.customerName}" / ${ctx.session.category} 문의. 첫 메시지: "${recentCustomerMsg}" — 관련 정보를 바로 파악해서 알려줘`
        : `고객 새 메시지: "${recentCustomerMsg}" — 이 맥락에서 상담사에게 필요한 정보가 있으면 바로 알려줘`

    sendMessage({ text: autoPrompt })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.session?.id, ctx.messages.length])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput("")
  }

  const getText = (msg: (typeof messages)[0]) =>
    msg.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""

  // Filter out the auto-trigger user prompts from the displayed conversation
  // (messages where role === "user" and it starts with "새 상담" or "고객 새 메시지")
  const displayMessages = messages.filter((msg) => {
    if (msg.role !== "user") return true
    const text = getText(msg)
    return !text.startsWith("새 상담 시작.") && !text.startsWith("고객 새 메시지:")
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary-subtle flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground leading-tight">{t.pluginAIHeader}</p>
            {ctx.session && (
              <p className="text-[12px] text-muted-foreground leading-tight truncate max-w-[140px]">
                {ctx.customerName} · {ctx.session.category}
              </p>
            )}
          </div>
        </div>
        {displayMessages.length > 0 && (
          <button
            onClick={() => { setMessages([]); lastAnalyzedCount.current = 0 }}
            className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />{t.pluginAIReset}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
        {displayMessages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-6">
            <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{t.pluginAIMonitoring}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
                {t.pluginAIMonitoringDesc}
              </p>
            </div>
            {!ctx.session && (
              <p className="text-[12px] text-muted-foreground/60 mt-1">
                {t.pluginAISelectSession}
              </p>
            )}
          </div>
        ) : (
          <>
            {displayMessages.map((msg) => {
              const text = getText(msg)
              if (!text) return null
              const isAssistant = msg.role === "assistant"
              return (
                <div key={msg.id} className={cn("flex gap-2", isAssistant ? "flex-row" : "flex-row-reverse")}>
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-primary-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[88%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed",
                    isAssistant
                      ? "bg-surface border border-border text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  )}>
                    {text.split("\n").map((line, i, arr) => (
                      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-subtle flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border">
        <div className={cn(
          "flex items-end gap-2 rounded-xl border bg-background px-3 py-2 transition-colors",
          isLoading ? "border-border opacity-60" : "border-border focus-within:border-primary/50"
        )}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={t.pluginAIPlaceholder}
            rows={1}
            disabled={isLoading}
            className="flex-1 text-xs bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[20px] max-h-[80px] overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
              input.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:opacity-80"
                : "bg-surface text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[12px] text-muted-foreground/50 mt-1.5 text-center">{t.pluginAIEnterHint}</p>
      </div>
    </div>
  )
}

/* ─── Notifications Panel ─── */
function NotificationsPanel() {
  const { t } = useLocale()
  const [notifications, setNotifications] = useState<Notification[]>(() => makeInitialNotifications(t))
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))

  const unreadCount = notifications.filter(n => !n.read).length
  const shown = filter === "unread" ? notifications.filter(n => !n.read) : notifications

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">{t.pluginNotifHeader}</span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[12px] text-primary hover:opacity-70 transition-opacity font-medium"
          >
            {t.pluginNotifMarkAll}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-2.5 py-2 border-b border-border-subtle">
        {(["all", "unread"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 py-1 rounded-md text-[12px] font-medium transition-colors",
              filter === f
                ? "bg-primary-subtle text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? t.pluginNotifAll : `${t.pluginNotifUnread} ${unreadCount}`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <Bell className="w-7 h-7 text-muted-foreground/30 mb-1.5" />
            <p className="text-xs text-muted-foreground">{t.pluginNotifEmpty}</p>
          </div>
        ) : (
          shown.map(notif => {
            const Icon = NOTIF_ICONS[notif.type]
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={cn(
                  "group relative flex items-start gap-2.5 px-2.5 py-2.5 cursor-pointer transition-colors border-b border-border-subtle last:border-0",
                  notif.read ? "hover:bg-surface" : "bg-primary-subtle/40 hover:bg-primary-subtle/60"
                )}
              >
                {/* Type icon */}
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", NOTIF_COLORS[notif.type])}>
                  <Icon className="w-3 h-3" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className={cn("text-[12px] leading-tight truncate", notif.read ? "text-foreground font-normal" : "text-foreground font-semibold")}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">{notif.body}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[12px] text-muted-foreground/60 bg-surface-raised px-1.5 py-0.5 rounded-full">{notif.store}</span>
                    <span className="text-[12px] text-muted-foreground/50">{notif.time}</span>
                  </div>
                </div>

                {/* Dismiss */}
                <button
                  onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-destructive transition-colors" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ─── Todo Panel ─── */
function TodoPanel() {
  const { t, locale } = useLocale()
  const [todos, setTodos] = useState<Todo[]>(() => [
    { id: "t1", text: t.todoSample1, done: false, createdAt: "10:20" },
    { id: "t2", text: t.todoSample2, done: false, createdAt: "10:35" },
    { id: "t3", text: t.todoSample3, done: true, createdAt: "09:00" },
  ])
  const [input, setInput] = useState("")
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set())

  // 외부(후처리 팝업)에서 할일을 추가할 수 있도록 CustomEvent 수신
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<string>).detail
      if (!text) return
      const newId = `t${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setTodos((prev) => [
        {
          id: newId,
          text,
          done: false,
          createdAt: new Date().toLocaleTimeString(locale === "ar" ? "ar-SA" : locale === "en" ? "en-US" : "ko-KR", { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ])
      // 하이라이트 추가
      setHighlightedIds((prev) => new Set(prev).add(newId))
      // 3초 후 하이라이트 제거
      setTimeout(() => {
        setHighlightedIds((prev) => {
          const next = new Set(prev)
          next.delete(newId)
          return next
        })
      }, 3000)
    }
    window.addEventListener("add-todo", handler)
    return () => window.removeEventListener("add-todo", handler)
  }, [])

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos((prev) => [
      { id: `t${Date.now()}`, text, done: false, createdAt: new Date().toLocaleTimeString(locale === "ar" ? "ar-SA" : locale === "en" ? "en-US" : "ko-KR", { hour: "2-digit", minute: "2-digit" }) },
      ...prev,
    ])
    setInput("")
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const pending = todos.filter((t) => !t.done)
  const done = todos.filter((t) => t.done)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">{t.pluginTodoHeader}</span>
        </div>
        <span className="text-[12px] bg-primary-subtle text-primary font-semibold px-1.5 py-0.5 rounded-full">
          {pending.length}
        </span>
      </div>

      {/* Input */}
      <div className="px-2.5 py-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-1.5 bg-surface rounded-lg border border-border px-2.5 py-1.5">
          <input
            className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground min-w-0"
            placeholder={t.pluginTodoPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            className="w-5 h-5 rounded flex items-center justify-center bg-primary text-primary-foreground hover:opacity-80 transition-opacity flex-shrink-0 disabled:opacity-30"
            disabled={!input.trim()}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2">
        {/* Pending */}
        {pending.length > 0 && (
          <div className="mb-3">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
              {t.pluginTodoPending} {pending.length}
            </p>
            <ul className="flex flex-col gap-1">
              {pending.map((todo) => {
                const isHighlighted = highlightedIds.has(todo.id)
                return (
                  <li
                    key={todo.id}
                    className={cn(
                      "group flex items-start gap-2 px-2 py-2 rounded-lg transition-all",
                      isHighlighted
                        ? "bg-primary/10 ring-1 ring-primary/30 animate-pulse"
                        : "hover:bg-surface"
                    )}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        isHighlighted ? "border-primary" : "border-border hover:border-primary"
                      )}
                    >
                      <Circle className="w-2 h-2 text-transparent" />
                    </button>
                    <span className={cn(
                      "flex-1 text-xs leading-relaxed break-words min-w-0",
                      isHighlighted ? "text-primary font-medium" : "text-foreground"
                    )}>
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive transition-colors" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
              {t.pluginTodoDone} {done.length}
            </p>
            <ul className="flex flex-col gap-1">
              {done.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="w-4 h-4 rounded-full bg-success/20 border-2 border-success flex items-center justify-center flex-shrink-0 mt-0.5"
                  >
                    <Check className="w-2.5 h-2.5 text-success" />
                  </button>
                  <span className="flex-1 text-xs text-muted-foreground line-through leading-relaxed break-words min-w-0">
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {todos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <CheckSquare className="w-7 h-7 text-muted-foreground/30 mb-1.5" />
            <p className="text-xs text-muted-foreground">{t.pluginTodoEmpty}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Plugin Add Panel ─── */
function AddPluginPanel({ onClose }: { onClose: () => void }) {
  const { t } = useLocale()
  const available = [
    { name: "Notepad",        desc: "Quick note-taking",            icon: "📝", coming: false },
    { name: "Stats Widget",   desc: "Today's consultation summary", icon: "📊", coming: true  },
    { name: "Quick Reply",    desc: "Template response library",    icon: "💬", coming: true  },
    { name: "Calendar Sync",  desc: "Google Calendar integration",  icon: "📅", coming: true  },
    { name: "CRM Connect",    desc: "External CRM data bridge",     icon: "🔗", coming: true  },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Puzzle className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">{t.pluginAddTitle}</span>
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 flex flex-col gap-1.5">
        {available.map((p) => (
          <div
            key={p.name}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors",
              p.coming
                ? "border-border bg-surface opacity-50 cursor-not-allowed"
                : "border-border bg-card hover:border-primary/40 hover:bg-primary-subtle cursor-pointer"
            )}
          >
            <span className="text-base flex-shrink-0">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{p.name}</p>
              <p className="text-[12px] text-muted-foreground truncate">{p.desc}</p>
            </div>
            {p.coming ? (
              <span className="text-[12px] bg-surface-raised text-muted-foreground px-1.5 py-0.5 rounded-full flex-shrink-0">
                {t.pluginComingSoon}
              </span>
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main Plugin Sidebar ─── */
export function PluginSidebar() {
  const { t } = useLocale()
  const PLUGINS = makePlugins(t)
  const [activePlugin, setActivePlugin] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  // 외부에서 TodoPanel 열기 요청 수신
  useEffect(() => {
    const handler = () => {
      setShowAdd(false)
      setActivePlugin("todo")
    }
    window.addEventListener("open-todo-panel", handler)
    return () => window.removeEventListener("open-todo-panel", handler)
  }, [])

  const handlePluginClick = (id: string) => {
    if (showAdd) setShowAdd(false)
    setActivePlugin((prev) => (prev === id ? null : id))
  }

  const handleAddClick = () => {
    setActivePlugin(null)
    setShowAdd((prev) => !prev)
  }

  const isPanelOpen = activePlugin !== null || showAdd

  return (
    <div className="flex h-full flex-shrink-0">
      {/* Expanded panel */}
      {isPanelOpen && (
        <div className="w-52 border-s border-border bg-card flex flex-col overflow-hidden">
          {showAdd ? (
            <AddPluginPanel onClose={() => setShowAdd(false)} />
          ) : activePlugin === "assistant" ? (
            <AIAssistantPanel />
          ) : activePlugin === "notifications" ? (
            <NotificationsPanel />
          ) : activePlugin === "todo" ? (
            <TodoPanel />
          ) : null}
        </div>
      )}

      {/* Icon rail */}
      <div className="w-13 flex flex-col items-center py-3 gap-1.5 border-l border-border bg-background">
        {/* Plugin icons */}
        {PLUGINS.map((plugin) => (
          <button
            key={plugin.id}
            onClick={() => handlePluginClick(plugin.id)}
            title={plugin.label}
            className={cn(
              "relative w-10 h-10 rounded-lg flex items-center justify-center transition-all group",
              activePlugin === plugin.id
                ? "bg-primary-subtle text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-raised"
            )}
          >
            <plugin.icon className="w-5 h-5" />
            {plugin.badge !== undefined && plugin.badge > 0 && activePlugin !== plugin.id && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                {plugin.badge}
              </span>
            )}
            {/* Tooltip */}
            <span className="absolute right-full mr-2 px-2 py-1 rounded-md bg-popover border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
              {plugin.label}
            </span>
          </button>
        ))}

        <div className="flex-1" />

        {/* Add plugin button */}
        <button
          onClick={handleAddClick}
          title={t.pluginAddTitle}
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-all group",
            showAdd
              ? "bg-primary-subtle text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-dashed border-border"
          )}
        >
          <Plus className="w-5 h-5" />
          <span className="absolute right-full mr-2 px-2 py-1 rounded-md bg-popover border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
            {t.pluginAddTitle}
          </span>
        </button>
      </div>
    </div>
  )
}
