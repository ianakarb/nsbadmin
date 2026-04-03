"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { sessions, customers, additionalCustomers, teamAgents, type Session, type Agent } from "@/lib/data"
import { saudiSessionsEn, saudiSessionsAr, saudiCustomersEn, saudiCustomersAr, saudiTeamAgents, saudiTeamAgentsAr } from "@/lib/data-saudi"
import { useLocale } from "@/lib/locale"
import {
  Phone,
  MessageSquare,
  Search,
  ClipboardList,
  Mail,
  Settings,
  ChevronDown,
  ArrowUpDown,
  CalendarDays,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface InboxPanelProps {
  selectedId: string
  onSelect: (id: string) => void
  statusMap?: Record<string, string>
  storeId?: string
}

function formatRelativeTime(dateStr: string, t: ReturnType<typeof useLocale>["t"]) {
  const date = new Date(dateStr)
  const now = new Date("2025-02-26T09:42:00")
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return t.timeJustNow
  if (diffMin < 60) return `${diffMin}${t.timeMinAgo}`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}${t.timeHourAgo}`
}

function AgentAvatarStack({ members, agentMap }: { members: Session["activeMembers"], agentMap: Record<string, Agent> }) {
  if (!members || members.length === 0) return null
  const visible = members.slice(0, 3)
  return (
    <div className="flex items-center">
      {visible.map((m, i) => {
        const agent = agentMap[m.id]
        const initials = agent?.avatarInitials ?? m.name.slice(0, 2)
        const color = agent?.avatarColor ?? "oklch(0.55 0.15 250)"
        return (
          <div
            key={m.id}
            className="w-5 h-5 rounded-full border-2 border-card flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
            style={{
              backgroundColor: color,
              marginInlineStart: i === 0 ? 0 : "-6px",
              zIndex: visible.length - i,
            }}
            title={m.name}
          >
            {initials}
          </div>
        )
      })}
      {members.length > 3 && (
        <div
          className="w-5 h-5 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground flex-shrink-0"
          style={{ marginInlineStart: "-6px" }}
        >
          +{members.length - 3}
        </div>
      )}
    </div>
  )
}

function SessionCard({ session, isSelected, onClick, customer, agentMap, t }: {
  session: Session
  isSelected: boolean
  onClick: () => void
  customer?: { name: string; phone?: string }
  agentMap: Record<string, Agent>
  t: ReturnType<typeof useLocale>["t"]
}) {
  const statusConfig = {
    waiting:  { label: t.cardStatusWaiting,  color: "text-warning",          bg: "bg-warning"          },
    ai_agent: { label: t.cardStatusAI,        color: "text-primary",          bg: "bg-primary"          },
    active:   { label: t.cardStatusActive,    color: "text-success",          bg: "bg-success"          },
    pending:  { label: t.cardStatusPending,   color: "text-muted-foreground", bg: "bg-muted-foreground" },
    resolved: { label: t.cardStatusResolved,  color: "text-muted-foreground", bg: "bg-muted-foreground" },
    missed:   { label: t.cardStatusMissed,    color: "text-destructive",      bg: "bg-destructive"      },
  }
  const statusConf = statusConfig[session.status]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-start px-4 py-3.5 border-b border-border-subtle transition-all duration-150 group relative",
        isSelected
          ? "bg-primary-subtle border-s-2 border-s-primary"
          : "hover:bg-surface-raised border-s-2 border-s-transparent"
      )}
    >
      {(session.priority === "urgent" || session.priority === "high") && (
        <span className={cn(
          "absolute top-3.5 end-3 w-1.5 h-1.5 rounded-full",
          session.priority === "urgent" ? "bg-destructive animate-pulse" : "bg-warning"
        )} />
      )}

      {/* show avatars for active / resolved sessions */}
      {session.status === "active" && session.activeMembers && session.activeMembers.length > 0 && (
        <div className="absolute bottom-3 end-3">
          <AgentAvatarStack members={session.activeMembers} agentMap={agentMap} />
        </div>
      )}
      {session.status === "resolved" && session.activeMembers && session.activeMembers.length > 0 && (
        <div className="absolute bottom-3 end-3">
          <AgentAvatarStack members={session.activeMembers} agentMap={agentMap} />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          session.channel === "call"      ? "bg-blue-50 text-blue-600"
          : session.channel === "board"   ? "bg-warning-subtle text-warning"
          : session.channel === "email"   ? "bg-purple-50 text-purple-600"
          : session.channel === "whatsapp" ? "bg-[#25D366]/20 text-[#075E54]"
          : "bg-primary-subtle text-primary"
        )}>
          {session.channel === "call" ? (
            <Phone className="w-3.5 h-3.5" />
          ) : session.channel === "board" ? (
            <ClipboardList className="w-3.5 h-3.5" />
          ) : session.channel === "email" ? (
            <Mail className="w-3.5 h-3.5" />
          ) : session.channel === "whatsapp" ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground truncate">
              {customer?.name
                ? (
                  <>
                    {customer.name}
                    {customer.phone && (
                      <span className="font-normal text-muted-foreground ms-1.5 text-xs">| {customer.phone}</span>
                    )}
                  </>
                )
                : (customer?.phone ?? t.inboxUnknown)
              }
            </span>
            <span className="text-[12px] text-muted-foreground flex-shrink-0">{formatRelativeTime(session.updatedAt, t)}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate mb-2 leading-relaxed">{session.subject}</p>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium px-1.5 py-0.5 rounded bg-muted", statusConf.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", statusConf.bg)} />
              {statusConf.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function InboxPanel({ selectedId, onSelect, statusMap = {}, storeId = "store-001" }: InboxPanelProps) {
  const { locale, t } = useLocale()
  const activeSessions = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
  const allCustomers = locale === "ko"
    ? { ...customers, ...additionalCustomers }
    : locale === "ar" ? saudiCustomersAr : saudiCustomersEn
  const agentList = locale === "ko" ? teamAgents : locale === "ar" ? saudiTeamAgentsAr : saudiTeamAgents
  const agentMap = Object.fromEntries(agentList.map((a) => [a.id, a]))

  const resolvedSessions = activeSessions
    .filter((s) => s.storeId === storeId)
    .map((s) => ({
      ...s,
      status: (statusMap[s.id] ?? s.status) as Session["status"],
    }))

  const tabs = [
    { id: "all",      label: t.inboxTabAll,      count: resolvedSessions.length },
    { id: "ai_agent", label: t.inboxTabAI,        count: resolvedSessions.filter((s) => s.status === "ai_agent").length },
    { id: "waiting",  label: t.inboxTabWaiting,   count: resolvedSessions.filter((s) => s.status === "waiting").length },
    { id: "active",   label: t.inboxTabActive,    count: resolvedSessions.filter((s) => s.status === "active").length },
    { id: "pending",  label: t.inboxTabPending,   count: resolvedSessions.filter((s) => s.status === "pending").length },
    { id: "resolved", label: t.inboxTabResolved,  count: resolvedSessions.filter((s) => s.status === "resolved").length },
  ]

  const DATE_PRESETS = [
    { id: "today",     label: t.inboxDateToday },
    { id: "yesterday", label: t.inboxDateYesterday },
    { id: "week",      label: t.inboxDateWeek },
    { id: "custom",    label: t.inboxDateCustom },
  ]

  const CHANNEL_FILTERS = [
    { id: "webchat",  label: t.channelWebchat,   icon: <MessageSquare className="w-3 h-3" /> },
    { id: "whatsapp", label: t.channelWhatsapp,  icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    )},
    { id: "call",     label: t.channelCall,      icon: <Phone className="w-3 h-3" /> },
    { id: "board",    label: t.channelBoard,     icon: <ClipboardList className="w-3 h-3" /> },
    { id: "email",    label: t.channelEmail,     icon: <Mail className="w-3 h-3" /> },
  ]

  const SORT_OPTIONS = [
    { id: "time",     label: t.inboxSortTime },
    { id: "priority", label: t.inboxSortPriority },
    { id: "status",   label: t.inboxSortStatus },
  ]

  const [activeTab, setActiveTab]           = useState("all")
  const [searchQuery, setSearchQuery]       = useState("")
  const [datePreset, setDatePreset]         = useState("today")
  const [customFrom, setCustomFrom]         = useState("")
  const [customTo, setCustomTo]             = useState("")
  const [channelFilters, setChannelFilters] = useState<string[]>([])
  const [sortBy, setSortBy]                 = useState("time")
  const [filterOpen, setFilterOpen]         = useState(false)
  const [sortOpen, setSortOpen]             = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const sortRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
      if (sortRef.current   && !sortRef.current.contains(e.target as Node))   setSortOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  const toggleChannel = (id: string) => {
    setChannelFilters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const filtered = resolvedSessions.filter((s) => {
    const matchTab     = activeTab === "all" || s.status === activeTab
    const customer     = allCustomers[s.customerId]
    const matchSearch  = !searchQuery
      || s.subject.toLowerCase().includes(searchQuery.toLowerCase())
      || customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchChannel = channelFilters.length === 0 || channelFilters.includes(s.channel)
    return matchTab && matchSearch && matchChannel
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "time") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
    if (sortBy === "priority") {
      const p = { urgent: 0, high: 1, normal: 2, low: 3 }
      return p[a.priority] - p[b.priority]
    }
    const o: Record<string, number> = { active: 0, waiting: 1, pending: 2, resolved: 3, missed: 4 }
    if (o[a.status] !== o[b.status]) return (o[a.status] ?? 5) - (o[b.status] ?? 5)
    const p = { urgent: 0, high: 1, normal: 2, low: 3 }
    return p[a.priority] - p[b.priority]
  })

  const activeSortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? t.inboxSortTime

  const channelFilterLabel = channelFilters.length > 0
    ? `${t.inboxChannelFilter} ${channelFilters.length}${t.inboxChannelFilterCount}`
    : t.inboxChannelFilter

  return (
    <aside className="flex flex-col h-full bg-background border-e border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">

        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">{t.inboxIncoming}</h2>
          <button className="p-1.5 rounded-md hover:bg-surface-raised text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t.inboxSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-8 h-8 text-xs bg-surface border-border-subtle focus:border-primary placeholder:text-muted-foreground"
          />
        </div>

        {/* Date range */}
        <div className="mb-2.5">
          <div className="flex items-center gap-1 mb-1.5">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setDatePreset(p.id)
                  if (p.id !== "custom") {
                    setCustomFrom("")
                    setCustomTo("")
                  }
                }}
                className={cn(
                  "flex-1 text-[12px] font-medium py-1 rounded transition-colors",
                  datePreset === p.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-raised text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {datePreset === "custom" && (
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <CalendarDays className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full pl-6 pr-2 h-7 text-[12px] bg-surface border border-border-subtle rounded-md focus:outline-none focus:border-primary text-foreground"
                />
              </div>
              <span className="text-[12px] text-muted-foreground flex-shrink-0">~</span>
              <div className="relative flex-1">
                <CalendarDays className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full pl-6 pr-2 h-7 text-[12px] bg-surface border border-border-subtle rounded-md focus:outline-none focus:border-primary text-foreground"
                />
              </div>
              <button
                disabled={!customFrom || !customTo}
                className={cn(
                  "flex-shrink-0 h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors",
                  customFrom && customTo
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {t.inboxDateApply}
              </button>
            </div>
          )}
        </div>

        {/* Filter + Sort row */}
        <div className="flex items-center justify-end gap-1.5">

          {/* Channel filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => { setFilterOpen((v) => !v); setSortOpen(false) }}
              className={cn(
                "flex items-center gap-1 h-6 pl-1.5 pr-2 rounded text-[12px] font-medium transition-colors",
                channelFilters.length > 0
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="w-3 h-3" />
              <span>{channelFilterLabel}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", filterOpen && "rotate-180")} />
            </button>

            {filterOpen && (
              <div className="absolute top-full mt-1 end-0 w-36 bg-popover border border-border rounded-lg shadow-lg z-50 p-1.5">
                <p className="text-[12px] text-muted-foreground px-1.5 mb-1">{t.inboxChannelMultiple}</p>
                {CHANNEL_FILTERS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors",
                      channelFilters.includes(ch.id)
                        ? "bg-primary-subtle text-primary font-medium"
                        : "text-foreground hover:bg-surface-raised"
                    )}
                  >
                    {ch.icon}
                    <span className="flex-1 text-start">{ch.label}</span>
                    {channelFilters.includes(ch.id) && (
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    )}
                  </button>
                ))}
                {channelFilters.length > 0 && (
                  <button
                    onClick={() => setChannelFilters([])}
                    className="w-full flex items-center gap-1 px-2 py-1.5 mt-0.5 rounded-md text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-raised border-t border-border-subtle"
                  >
                    <X className="w-3 h-3" />
                    {t.inboxChannelReset}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <span className="w-px h-3.5 bg-border" />

          {/* Sort */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => { setSortOpen((v) => !v); setFilterOpen(false) }}
              className="flex items-center gap-1 h-6 ps-1.5 pe-2 rounded text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{activeSortLabel}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", sortOpen && "rotate-180")} />
            </button>

            {sortOpen && (
              <div className="absolute top-full mt-1 end-0 w-28 bg-popover border border-border rounded-lg shadow-lg z-50 p-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortBy(opt.id); setSortOpen(false) }}
                    className={cn(
                      "w-full text-start px-2.5 py-1.5 rounded-md text-[12px] transition-colors",
                      sortBy === opt.id
                        ? "bg-primary-subtle text-primary font-medium"
                        : "text-foreground hover:bg-surface-raised"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-shrink-0 flex-1 py-2.5 text-[12px] font-medium transition-all relative whitespace-nowrap px-1",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "ms-0.5 text-[12px]",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-xs">{t.inboxTabAll}</span>
          </div>
        ) : (
          sorted.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isSelected={selectedId === session.id}
              onClick={() => onSelect(session.id)}
              customer={allCustomers[session.customerId]}
              agentMap={agentMap}
              t={t}
            />
          ))
        )}
      </div>
    </aside>
  )
}
