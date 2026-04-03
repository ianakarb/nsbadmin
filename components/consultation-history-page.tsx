"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  MessageSquare,
  Phone,
  ClipboardList,
  Mail,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ThumbsUp,
  Bot,
  User,
  BarChart2,
  Smile,
  Frown,
  Meh,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Download,
  ChevronRight,
  Star,
} from "lucide-react"
import { sessions, customers, additionalCustomers, type Session } from "@/lib/data"
import { saudiSessionsEn, saudiSessionsAr, saudiCustomersEn, saudiCustomersAr } from "@/lib/data-saudi"
import { useLocale } from "@/lib/locale"

// ── Mock analytics data ───────────────────────────────────────────────────

// TOPIC_DATA is now generated inside AnalyticsPanel using t from useLocale

const SENTIMENT_DAILY = [
  { date: "5/26", positive: 48, neutral: 32, negative: 20 },
  { date: "5/27", positive: 52, neutral: 28, negative: 20 },
  { date: "5/28", positive: 44, neutral: 35, negative: 21 },
  { date: "5/29", positive: 58, neutral: 27, negative: 15 },
  { date: "5/30", positive: 62, neutral: 24, negative: 14 },
  { date: "5/31", positive: 55, neutral: 30, negative: 15 },
  { date: "6/1",  positive: 60, neutral: 25, negative: 15 },
]

const AI_METRICS = {
  resolutionRate: 78,
  avgFirstResponse: "0분 12초",
  escalationRate: 22,
  csatAI: 4.1,
  totalAIHandled: 312,
  successHandled: 243,
}

const AGENT_METRICS = {
  avgHandleTime: "8분 34초",
  avgWaitTime: "1분 48초",
  resolutionRate: 91,
  csatHuman: 4.4,
  totalHandled: 133,
  fcr: 74,
}

const TRAFFIC_DAILY = [
  { date: "5/26", total: 58, ai: 38, human: 20 },
  { date: "5/27", total: 64, ai: 44, human: 20 },
  { date: "5/28", total: 52, ai: 34, human: 18 },
  { date: "5/29", total: 71, ai: 50, human: 21 },
  { date: "5/30", total: 75, ai: 52, human: 23 },
  { date: "5/31", total: 68, ai: 45, human: 23 },
  { date: "6/1",  total: 57, ai: 39, human: 18 },
]

// CHANNEL_DATA and HOUR_DATA are now generated inside AnalyticsPanel using t from useLocale

// ── Date range presets ────────────────────────────────────────────────────
// DATE_PRESETS is now sourced from t.datePresets in useLocale

// ── Channel icon — mirrors inbox-panel exactly ────────────────────────────
function HistChannelIcon({ channel }: { channel: string }) {
  const cls = cn(
    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
    channel === "call"      ? "bg-blue-50 text-blue-600"
    : channel === "board"  ? "bg-warning-subtle text-warning"
    : channel === "email"  ? "bg-purple-50 text-purple-600"
    : channel === "whatsapp" ? "bg-[#25D366]/20 text-[#075E54]"
    : "bg-primary-subtle text-primary"
  )
  return (
    <div className={cls}>
      {channel === "call" ? (
        <Phone className="w-3.5 h-3.5" />
      ) : channel === "board" ? (
        <ClipboardList className="w-3.5 h-3.5" />
      ) : channel === "email" ? (
        <Mail className="w-3.5 h-3.5" />
      ) : channel === "whatsapp" ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ) : (
        <MessageSquare className="w-3.5 h-3.5" />
      )}
    </div>
  )
}
const STATUS_STYLES: Record<string, string> = {
  resolved: "bg-emerald-100 text-emerald-700",
  active:   "bg-blue-100 text-blue-700",
  waiting:  "bg-amber-100 text-amber-700",
  missed:   "bg-red-100 text-red-700",
  pending:  "bg-slate-100 text-slate-600",
  ai_agent: "bg-purple-100 text-purple-700",
}
// STATUS_LABELS are now generated dynamically using t from useLocale

// ── HistStatCard ─────────────────────────────────────────────────────────
function HistStatCard({
  label, value, sub, trend, icon: Icon, accent,
}: {
  label: string; value: string | number; sub?: string
  trend?: "up" | "down" | "flat"; icon?: React.ElementType; accent?: string
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendCls  = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-400"
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        {Icon && (
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", accent ?? "bg-slate-100")}>
            <Icon className="w-3.5 h-3.5 text-slate-600" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      {sub && (
        <div className="flex items-center gap-1">
          <TrendIcon className={cn("w-3 h-3", trendCls)} />
          <span className={cn("text-[12px]", trendCls)}>{sub}</span>
        </div>
      )}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", color)}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
  )
}

// ── Session row ───────────────────────────────────────────────────────────
function SessionRow({ session, selected, onClick, allCustomers }: { session: Session; selected: boolean; onClick: () => void; allCustomers: Record<string, { name: string }> }) {
  const { t } = useLocale()
  const STATUS_LABELS: Record<string, string> = {
    resolved: t.cardStatusResolved, active: t.cardStatusActive, waiting: t.cardStatusWaiting,
    missed: t.cardStatusMissed, pending: t.cardStatusPending, ai_agent: t.cardStatusAI,
  }
  const customer = allCustomers[session.customerId]
  const date = new Date(session.createdAt)
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-slate-100 transition-colors hover:bg-slate-50 flex items-start gap-3",
        selected && "bg-emerald-50 border-l-2 border-l-emerald-500"
      )}
    >
      <HistChannelIcon channel={session.channel} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-medium text-slate-800 truncate">{customer?.name ?? t.customerFallback}</p>
          <span className="text-[12px] text-slate-400 flex-shrink-0">{dateStr}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{session.subject}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={cn("px-1.5 py-0.5 rounded text-[12px] font-medium", STATUS_STYLES[session.status])}>
            {STATUS_LABELS[session.status]}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[12px] bg-slate-100 text-slate-500">{session.category}</span>
          {session.csat && (
            <span className="flex items-center gap-0.5 text-[12px] text-amber-600">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />{session.csat}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Session detail ────────────────────────────────────────────────────────
function SessionDetail({ session, allCustomers }: { session: Session; allCustomers: Record<string, { name: string }> }) {
  const { t, locale } = useLocale()
  const STATUS_LABELS: Record<string, string> = {
    resolved: t.cardStatusResolved, active: t.cardStatusActive, waiting: t.cardStatusWaiting,
    missed: t.cardStatusMissed, pending: t.cardStatusPending, ai_agent: t.cardStatusAI,
  }
  const customer = allCustomers[session.customerId]


  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <HistChannelIcon channel={session.channel} />
            <div>
              <p className="text-sm font-semibold text-slate-900">{session.subject}</p>
              <p className="text-xs text-slate-500">{customer?.name} · {session.category}</p>
            </div>
          </div>
          <span className={cn("px-2 py-1 rounded-md text-xs font-medium flex-shrink-0", STATUS_STYLES[session.status])}>
            {STATUS_LABELS[session.status]}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs text-slate-500">
          <div><span className="text-slate-400">{t.histDuration ?? "Duration"}</span><p className="text-sm font-semibold text-slate-800 mt-0.5">{session.duration ?? "—"}</p></div>
          <div><span className="text-slate-400">{t.histChannel ?? "Channel"}</span><p className="text-sm font-semibold text-slate-800 mt-0.5">{session.channel}</p></div>
          <div><span className="text-slate-400">{t.histAgent ?? "Agent"}</span><p className="text-sm font-semibold text-slate-800 mt-0.5">{session.agentName ?? "—"}</p></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
        {(session.messages ?? []).length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">{t.histNoMessages ?? "No messages"}</div>
        ) : (
          (session.messages ?? []).map((msg, i) => {
            const isAgent = msg.sender === "agent"
            const isBot   = msg.sender === "bot"
            return (
              <div key={i} className={cn("flex gap-2", isAgent || isBot ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold",
                  isBot ? "bg-primary text-primary-foreground" :
                  isAgent ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                  "bg-slate-100 text-slate-600 border border-slate-200"
                )}>
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : isAgent ? <User className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className={cn("flex flex-col max-w-[72%]", isAgent || isBot ? "items-end" : "items-start")}>
                  <span className="text-[11px] text-slate-400 mb-0.5 px-1">
                    {isBot ? "AI Bot" : isAgent ? (msg.agentName ?? t.histAgent ?? "Agent") : (allCustomers[session.customerId]?.name ?? t.customerLabel ?? "Customer")}
                  </span>
                  <div className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm",
                    isAgent ? "bg-emerald-600 text-white rounded-tr-sm" :
                    isBot ? "bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-sm" :
                    "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
                  )}>{msg.content}</div>
                  <span className="text-[11px] text-slate-300 mt-0.5 px-1">{msg.timestamp}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export function ConsultationHistoryPage({ storeId }: { storeId: string }) {
  const { locale, t } = useLocale()
  const activeSessions = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
  const allCustomers = locale === "ko"
    ? { ...customers, ...additionalCustomers }
    : locale === "ar" ? saudiCustomersAr : saudiCustomersEn
  const [topTab, setTopTab]           = useState<"history" | "analytics">("history")
  const [datePreset, setDatePreset]   = useState<number>(2) // index into DATE_PRESETS
  const [showDateMenu, setShowDateMenu] = useState(false)
  const [search, setSearch]           = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [mobileStep, setMobileStep]   = useState<"list" | "detail">("list")

  const storeSessions = useMemo(
    () => activeSessions.filter((s) => s.storeId === storeId),
    [activeSessions, storeId]
  )

  const filtered = useMemo(() => {
    return storeSessions.filter((s) => {
      const matchStatus = statusFilter === "all" || s.status === statusFilter
      const customer = allCustomers[s.customerId]
      const matchSearch = !search ||
        s.subject.includes(search) ||
        s.category.includes(search) ||
        (customer?.name ?? "").includes(search)
      return matchStatus && matchSearch
    })
  }, [storeSessions, statusFilter, search, allCustomers])

  const selectedSession = activeSessions.find((s) => s.id === selectedId) ?? null

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* ── Top tab bar ── */}
      <div className="flex items-center gap-0 px-5 border-b border-slate-200 bg-white flex-shrink-0">
        {([
          { key: "history",   label: t.histTabHistory },
          { key: "analytics", label: t.histTabAnalytics },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTopTab(key)}
            className={cn(
              "px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors -mb-px",
              topTab === key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-400 hover:text-slate-700"
            )}
          >{label}</button>
        ))}

        {/* Date picker — always visible in top bar */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowDateMenu((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.datePresets[datePreset]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showDateMenu && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
              {t.datePresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { setDatePreset(idx); setShowDateMenu(false) }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-50",
                    datePreset === idx ? "text-emerald-600 font-semibold bg-emerald-50" : "text-slate-700"
                  )}
                >{p}</button>
              ))}
            </div>
          )}
        </div>

        {topTab === "history" && (
          <button className="flex items-center gap-1.5 ml-2 text-xs text-slate-500 hover:text-slate-700 transition-colors px-2 py-2">
            <Download className="w-3.5 h-3.5" />{t.histExport}
          </button>
        )}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">

        {/* 상담내역 tab */}
        {topTab === "history" && (
          <div className="flex h-full">

            {/* List panel — full width on mobile when step=list, hidden when step=detail; always fixed-width on desktop */}
            <div className={cn(
              "flex-shrink-0 flex flex-col border-r border-slate-200 bg-white",
              "w-full md:w-[320px]",
              mobileStep === "detail" ? "hidden md:flex" : "flex"
            )}>
              {/* Filters */}
              <div className="px-4 py-3 border-b border-slate-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.histSearchPlaceholder}
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { v: "all",      l: t.filterAll },
                    { v: "resolved", l: t.cardStatusResolved },
                    { v: "active",   l: t.cardStatusActive },
                    { v: "missed",   l: t.cardStatusMissed },
                    { v: "ai_agent", l: "AI" },
                  ].map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => setStatusFilter(v)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors",
                        statusFilter === v
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >{l}</button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2 text-[12px] text-slate-400 border-b border-slate-100">
                {t.histTotalCount.replace("{n}", String(filtered.length))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {filtered.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    selected={selectedId === s.id}
                    onClick={() => {
                      setSelectedId(s.id)
                      setMobileStep("detail")
                    }}
                    allCustomers={allCustomers}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-sm text-slate-400">
                    {t.histNoResults}
                  </div>
                )}
              </div>
            </div>

            {/* Detail panel — full width on mobile when step=detail, always visible on desktop */}
            <div className={cn(
              "flex-1 min-w-0 overflow-hidden bg-white flex flex-col",
              mobileStep === "list" ? "hidden md:flex" : "flex"
            )}>
              {/* Mobile back button */}
              <div className="flex items-center h-11 px-3 border-b border-slate-200 bg-white flex-shrink-0 md:hidden">
                <button
                  onClick={() => setMobileStep("list")}
                  className="flex items-center gap-1 text-emerald-700 text-[13px] font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t.histTabHistory}
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {selectedSession ? (
                  <SessionDetail session={selectedSession} allCustomers={allCustomers} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <ChevronRight className="w-8 h-8 opacity-20" />
                    <p className="text-sm">{t.histSelectSession}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 분석 대시보드 tab */}
        {topTab === "analytics" && <AnalyticsPanel />}
      </div>
    </div>
  )
}

// ── AnalyticsPanel ────────────────────────────────────────────────────────────
function AnalyticsPanel() {
  const { t, locale } = useLocale()

  const AI_METRICS_LOCALIZED = locale === "ko" ? AI_METRICS : {
    resolutionRate: AI_METRICS.resolutionRate,
    avgFirstResponse: locale === "ar" ? "2٫5 ثانية" : "2.5 sec",
    escalationRate: AI_METRICS.escalationRate,
    csatAI: AI_METRICS.csatAI,
    totalAIHandled: AI_METRICS.totalAIHandled,
    successHandled: AI_METRICS.successHandled,
  }
  const AGENT_METRICS_LOCALIZED = locale === "ko" ? AGENT_METRICS : {
    avgHandleTime: locale === "ar" ? "8٫5 دقائق" : "8 min 34 sec",
    avgWaitTime: locale === "ar" ? "دقيقة واحدة 48 ثانية" : "1 min 48 sec",
    resolutionRate: AGENT_METRICS.resolutionRate,
    csatHuman: AGENT_METRICS.csatHuman,
    totalHandled: AGENT_METRICS.totalHandled,
    fcr: AGENT_METRICS.fcr,
  }

  const TOPIC_DATA = [
    { topic: t.histTopicReservation, count: 142, pct: 32 },
    { topic: t.histTopicRefund,      count: 98,  pct: 22 },
    { topic: t.histTopicService,     count: 76,  pct: 17 },
    { topic: t.histTopicComplaint,   count: 54,  pct: 12 },
    { topic: t.histTopicPrice,       count: 45,  pct: 10 },
    { topic: t.histTopicOther,       count: 30,  pct: 7  },
  ]

  const CHANNEL_DATA = [
    { name: "WebChat", value: 38, color: "#10b981" },
    { name: "KakaoTalk", value: 28, color: "#FFCD00" },
    { name: "Phone", value: 22, color: "#6366f1" },
    { name: "App", value: 12, color: "#f59e0b" },
  ]

  const HOUR_DATA = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}`,
    count: [0,0,0,0,0,0,2,8,15,22,18,25,28,20,22,30,35,28,20,15,10,6,3,1][h] ?? 0,
  }))

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* AI Metrics */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-500" />{t.histAIMetrics}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <HistStatCard label={t.histAIResolution} value={`${AI_METRICS_LOCALIZED.resolutionRate}%`} sub={t.histAIResolutionSub} trend="down" icon={CheckCircle2} accent="bg-emerald-50" />
            <HistStatCard label={t.histAIFirstResp} value={AI_METRICS_LOCALIZED.avgFirstResponse} sub={t.histAIFirstRespSub} trend="down" icon={Zap} accent="bg-blue-50" />
            <HistStatCard label="AI CSAT" value={`★ ${AI_METRICS_LOCALIZED.csatAI}`} sub={t.histCSATSub} trend="up" icon={Star} accent="bg-amber-50" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 mb-1">{t.histEscalationRate}</p>
              <p className="text-xl font-bold text-slate-900">{AI_METRICS_LOCALIZED.escalationRate}%</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${AI_METRICS_LOCALIZED.escalationRate}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 mb-1">{t.histAISuccess}</p>
              <p className="text-xl font-bold text-slate-900">{AI_METRICS_LOCALIZED.successHandled}<span className="text-sm font-normal text-slate-400"> / {AI_METRICS_LOCALIZED.totalAIHandled}{t.histUnit}</span></p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(AI_METRICS_LOCALIZED.successHandled / AI_METRICS_LOCALIZED.totalAIHandled * 100)}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Traffic chart */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-500" />{t.histTrafficTitle ?? "Daily Traffic"}
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={TRAFFIC_DAILY} barSize={14} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ai" name="AI" fill="#10b981" radius={[3,3,0,0]} />
                <Bar dataKey="human" name="Human" fill="#6366f1" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* AI Topic Analysis */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-500" />{t.histTopicAnalysis}
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col gap-2">
              {TOPIC_DATA.map((td) => (
                <div key={td.topic} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-36 flex-shrink-0 truncate" title={td.topic}>{td.topic}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden min-w-0">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${td.pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-8 text-right flex-shrink-0">{td.count}</span>
                  <span className="text-[12px] text-slate-400 w-8 text-right flex-shrink-0">{td.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sentiment chart */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Smile className="w-4 h-4 text-slate-500" />{t.histDailySentiment}
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={SENTIMENT_DAILY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="positive" name="Positive" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="neutral" name="Neutral" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="negative" name="Negative" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Agent Metrics */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />{t.histHumanMetrics}
          </h3>
          <div className="grid grid-cols-3 gap-2">
          <HistStatCard label={t.histAvgHandle} value={AGENT_METRICS_LOCALIZED.avgHandleTime} sub={t.histAvgHandleSub} trend="up" icon={Clock} accent="bg-blue-50" />
          <HistStatCard label={t.histResolution} value={`${AGENT_METRICS_LOCALIZED.resolutionRate}%`} sub={t.histResolutionSub} trend="up" icon={CheckCircle2} accent="bg-emerald-50" />
          <HistStatCard label={t.histHumanCSAT} value={`★ ${AGENT_METRICS_LOCALIZED.csatHuman}`} sub={t.histCSATSub} trend="up" icon={ThumbsUp} accent="bg-amber-50" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 mb-1">{t.histAvgWait}</p>
              <p className="text-xl font-bold text-slate-900">{AGENT_METRICS_LOCALIZED.avgWaitTime}</p>
              <p className="text-[12px] text-slate-400 mt-1">{t.histAvgWaitGoal}</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: "75%" }} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 mb-1">{t.histFCR}</p>
              <p className="text-xl font-bold text-slate-900">{AGENT_METRICS_LOCALIZED.fcr}%</p>
            </div>
          </div>
        </section>

        {/* Channel & Hour charts */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-3">Channel Distribution</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={CHANNEL_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {CHANNEL_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-3">Hourly Traffic</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={HOUR_DATA} barSize={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="count" fill="#10b981" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
