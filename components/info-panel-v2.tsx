"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { sessions, customers, additionalCustomers, customerReservations, customerOrders, customerReviews } from "@/lib/data"
import {
  saudiSessionsEn, saudiSessionsAr, saudiCustomersEn, saudiCustomersAr,
  saudiCustomerReservationsEn, saudiCustomerReservationsAr,
  saudiCustomerOrdersEn, saudiCustomerOrdersAr,
  saudiCustomerReviewsEn, saudiCustomerReviewsAr,
} from "@/lib/data-saudi"
import { useLocale } from "@/lib/locale"
import type { Reservation, Order, Review } from "@/lib/data"
import {
  Phone,
  Mail,
  Monitor,
  Clock,
  Star,
  TrendingUp,
  Tag,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  CheckCheck,
  MessageSquare,
  Smile,
  Meh,
  Frown,
  Crown,
  AlertCircle,
  Info,
  Hash,
  Layers,
  User,
  ClipboardList,
  Activity,
  CalendarDays,
  UserCircle2,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageCircle,
  Bot,
  Pencil,
} from "lucide-react"

interface InfoPanelProps {
  sessionId: string
  storeId?: string
}

// Helper to translate gender values from any language to current locale
type TranslationKeys = ReturnType<typeof useLocale>["t"]
function translateGender(gender: string | undefined, t: TranslationKeys): string {
  if (!gender) return ""
  const lowerGender = gender.toLowerCase()
  // Match various gender representations
  if (lowerGender === "male" || lowerGender === "남성" || lowerGender === "ذكر") {
    return t.infoGenderMale
  }
  if (lowerGender === "female" || lowerGender === "여성" || lowerGender === "أنثى") {
    return t.infoGenderFemale
  }
  return gender // fallback to original if unknown
}

function CopyableRow({
  label,
  value,
  mono = false,
  accent = false,
  primary = false,
}: {
  label: string
  value: string
  mono?: boolean
  accent?: boolean
  primary?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between gap-2 py-2 group">
      <span className="text-[12px] text-muted-foreground flex-shrink-0 w-16">{label}</span>
      <span
        className={cn(
          "text-[12px] text-right truncate flex-1",
          mono && "font-mono",
          primary ? "text-primary font-semibold" : accent ? "text-foreground font-medium" : "text-foreground"
        )}
      >
        {value}
      </span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0"
      >
        {copied ? <CheckCheck className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  )
}

function EditableInlineField({ placeholder }: { placeholder: string }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState("")

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditing(false) }}
        placeholder={placeholder}
        className="text-base font-bold bg-transparent border-b border-primary outline-none text-foreground placeholder:text-muted-foreground/40 w-full"
      />
    )
  }

  return val ? (
    <h3 className="text-base font-bold text-foreground cursor-pointer" onClick={() => setEditing(true)}>{val}</h3>
  ) : (
    <button
      onClick={() => setEditing(true)}
      className="text-sm italic text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1"
    >
      <Pencil className="w-3 h-3" />
      {placeholder}
    </button>
  )
}

function EditableRow({
  label,
  value,
  placeholder,
  mono = false,
}: {
  label: string
  value: string
  placeholder: string
  mono?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  if (editing) {
    return (
      <div className="flex items-center justify-between gap-2 py-2">
        <span className="text-[12px] text-muted-foreground flex-shrink-0 w-16">{label}</span>
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditing(false) }}
          placeholder={placeholder}
          className={cn(
            "flex-1 text-[12px] text-right bg-transparent border-b border-primary outline-none text-foreground placeholder:text-muted-foreground/50",
            mono && "font-mono"
          )}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 py-2 group">
      <span className="text-[12px] text-muted-foreground flex-shrink-0 w-16">{label}</span>
      {val ? (
        <span className={cn("text-[12px] text-right truncate flex-1 text-foreground", mono && "font-mono")}>
          {val}
        </span>
      ) : (
        <span className="text-[12px] text-right truncate flex-1 text-muted-foreground/50 italic">
          {placeholder}
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  )
}

function CollapsibleSection({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border-subtle">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-surface transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        </div>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

function SentimentBadge({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const { t } = useLocale()
  const config = {
    positive: { label: t.sentimentPositive, icon: Smile, className: "text-success bg-success-subtle border-success/20" },
    neutral:  { label: t.sentimentNeutral,  icon: Meh,   className: "text-muted-foreground bg-muted border-border" },
    negative: { label: t.sentimentNegative, icon: Frown,  className: "text-destructive bg-destructive-subtle border-destructive/20" },
  }
  const conf = config[sentiment]
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full border", conf.className)}>
      <conf.icon className="w-3 h-3" />
      {conf.label}
    </span>
  )
}

function GradeBadge({ grade }: { grade?: string }) {
  const { t } = useLocale()
  if (!grade) return null
  // Normalize grade to enum key regardless of locale
  const isVIP = grade === "VIP" || grade === t.gradeVIP
  const isNew = grade === "신규" || grade === t.gradeNew || grade === "New" || grade === "جديد"
  const gradeClass = isVIP
    ? "bg-warning-subtle text-warning border-warning/20"
    : isNew
      ? "bg-primary-subtle text-primary border-primary/20"
      : "bg-surface-raised text-muted-foreground border-border"
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full border", gradeClass)}>
      {isVIP && <Crown className="w-2.5 h-2.5" />}
      {grade}
    </span>
  )
}

type HistoryTab = "inquiry" | "reservation" | "order" | "review"

export function InfoPanel({ sessionId, storeId }: InfoPanelProps) {
  const { locale, t } = useLocale()
  const activeSessions = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
  const allCustomers = locale === "ko"
    ? { ...customers, ...additionalCustomers }
    : locale === "ar" ? saudiCustomersAr : saudiCustomersEn
  const activeReservations = locale === "ko" ? customerReservations : locale === "ar" ? saudiCustomerReservationsAr : saudiCustomerReservationsEn
  const activeOrders = locale === "ko" ? customerOrders : locale === "ar" ? saudiCustomerOrdersAr : saudiCustomerOrdersEn
  const activeReviews = locale === "ko" ? customerReviews : locale === "ar" ? saudiCustomerReviewsAr : saudiCustomerReviewsEn

  const [rightTab, setRightTab] = useState<"customer" | "session">("customer")
  const [historyTab, setHistoryTab] = useState<HistoryTab>("inquiry")

  const session = activeSessions.find((s) => s.id === sessionId)
  const customer = session ? allCustomers[session.customerId] : null
  const reservations = customer ? (activeReservations[customer.id] ?? []) : []
  const orders = customer ? (activeOrders[customer.id] ?? []) : []
  const reviews = customer ? (activeReviews[customer.id] ?? []) : []

  if (!session || !customer) {
    return (
      <aside className="flex flex-col h-full bg-background border-l border-border items-center justify-center text-muted-foreground">
        <Info className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-xs">{t.infoNoSession}</p>
      </aside>
    )
  }

  const resolveRate = Math.round((customer.resolvedTickets / customer.totalTickets) * 100)

  return (
    <aside className="flex flex-col h-full bg-background border-s border-border overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        {(["customer", "session"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setRightTab(tab)}
            className={cn(
              "flex-1 py-3 text-[12px] font-medium transition-all relative flex items-center justify-center gap-1.5",
              rightTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "customer" ? <User className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            {tab === "customer" ? t.infoPanelCustomer : t.infoPanelSession}
            {rightTab === tab && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {rightTab === "customer" ? (
          <div key={customer.id}>
            {/* 1. 고객 프로필 헤더 */}
            <div className="px-4 pt-4 pb-3 border-b border-border-subtle">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                {customer.name ? (
                  <h3 className="text-base font-bold leading-tight text-foreground">{customer.name}</h3>
                ) : (
                  <EditableInlineField placeholder={t.infoNamePlaceholder} />
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <GradeBadge grade={customer.grade} />
                  <SentimentBadge sentiment={customer.sentiment} />
                </div>
              </div>

              <button
                className="flex items-center gap-1.5 group mb-3"
                onClick={() => navigator.clipboard.writeText(customer.phone)}
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-primary tracking-wide">{customer.phone}</span>
                <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full bg-surface-raised text-muted-foreground border border-border-subtle"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 2. 핵심 통계 */}
            <div className="grid grid-cols-3 divide-x divide-border-subtle border-b border-border-subtle">
              <div className="flex flex-col items-center py-3">
                <span className="text-base font-bold text-foreground">{customer.totalTickets}</span>
                <span className="text-[12px] text-muted-foreground mt-0.5">{t.infoStatTotal}</span>
              </div>
              <div className="flex flex-col items-center py-3">
                <span className="text-base font-bold text-success">{resolveRate}%</span>
                <span className="text-[12px] text-muted-foreground mt-0.5">{t.infoStatResolve}</span>
              </div>
              <div className="flex flex-col items-center py-3">
                <span className="text-base font-bold text-foreground">{customer.ltv ?? "-"}</span>
                <span className="text-[12px] text-muted-foreground mt-0.5">LTV</span>
              </div>
            </div>

            {/* 3. 연락처 */}
            <CollapsibleSection icon={Phone} title={t.infoSectionContact} defaultOpen={true}>
              <div className="divide-y divide-border-subtle">
                <CopyableRow label={t.infoFieldPhone} value={customer.phone} primary />
                {customer.name ? (
                  <>
                    <EditableRow label={t.infoFieldEmail} value={customer.email} mono placeholder={t.infoFieldEmailPlaceholder} />
                    <EditableRow label={t.infoFieldGender} value={translateGender(customer.gender, t)} placeholder={t.infoFieldGenderPlaceholder} />
                    <CopyableRow label={t.infoFieldJoined} value={customer.joinedAt} />
                  </>
                ) : (
                  <>
                    <EditableRow label={t.infoFieldEmail} value="" mono placeholder={t.infoFieldEmailPlaceholder} />
                    <EditableRow label={t.infoFieldGender} value="" placeholder={t.infoFieldGenderPlaceholder} />
                  </>
                )}
              </div>
            </CollapsibleSection>

            {/* 4. 이력 탭 */}
            <div className="border-b border-border-subtle">
              <div className="flex border-b border-border-subtle px-2 pt-2.5">
                {([
                  { key: "inquiry",     label: t.infoHistoryInquiry,     icon: ClipboardList },
                  { key: "reservation", label: t.infoHistoryReservation, icon: CalendarDays },
                  { key: "order",       label: t.infoHistoryOrder,       icon: ShoppingBag },
                  { key: "review",      label: t.infoHistoryReview,      icon: MessageCircle },
                ] as { key: HistoryTab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setHistoryTab(key)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-0.5 pb-2 text-[12px] font-medium transition-colors relative",
                      historyTab === key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {historyTab === key && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="px-4 py-2.5 pb-3 space-y-1">
                {historyTab === "inquiry" && (
                  activeSessions.filter((s) => s.customerId === customer.id).length === 0 ? (
                    <p className="text-[12px] text-muted-foreground text-center py-4">{t.infoNoInquiry}</p>
                  ) : (
                    activeSessions.filter((s) => s.customerId === customer.id).slice(0, 6).map((s) => (
                      <div key={s.id} className="flex items-center gap-2 py-1.5 rounded-lg hover:bg-surface px-1.5 -mx-1.5 cursor-pointer transition-colors group">
                        <span className={cn(
                          "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                          s.channel === "call" ? "bg-success-subtle text-success"
                            : s.channel === "board" ? "bg-warning-subtle text-warning"
                            : s.channel === "whatsapp" ? "bg-[#25D366]/10 text-[#128C7E]"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {s.channel === "call" ? <Phone className="w-3 h-3" />
                            : s.channel === "board" ? <ClipboardList className="w-3 h-3" />
                            : s.channel === "whatsapp" ? (
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                            )
                            : <MessageSquare className="w-3 h-3" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground truncate leading-tight">{s.subject}</p>
                          <p className="text-[12px] text-muted-foreground">{s.category}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={cn("text-[12px] font-medium",
                            s.status === "active" ? "text-success" : s.status === "waiting" ? "text-warning" : "text-muted-foreground"
                          )}>
                            {s.status === "active" ? t.infoStatusActive : s.status === "waiting" ? t.infoStatusWaiting : t.infoStatusDone}
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    ))
                  )
                )}

                {historyTab === "reservation" && (
                  reservations.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground text-center py-4">{t.infoNoReservation}</p>
                  ) : (
                    reservations.map((r) => {
                      const statusConf = {
                        confirmed:  { label: t.infoReservationConfirmed, className: "text-primary bg-primary-subtle" },
                        pending:    { label: t.infoReservationPending,   className: "text-warning bg-warning-subtle" },
                        completed:  { label: t.infoReservationCompleted, className: "text-muted-foreground bg-surface-raised" },
                        cancelled:  { label: t.infoReservationCancelled, className: "text-destructive bg-destructive-subtle" },
                      }[r.status]
                      return (
                        <div key={r.id} className="flex items-start gap-2 py-2 border-b border-border-subtle last:border-0">
                          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-foreground truncate">{r.service}</p>
                            <p className="text-[12px] text-muted-foreground">{r.date} {r.time}</p>
                            {r.memo && <p className="text-[12px] text-muted-foreground italic mt-0.5">{r.memo}</p>}
                          </div>
                          <span className={cn("text-[12px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0", statusConf.className)}>
                            {statusConf.label}
                          </span>
                        </div>
                      )
                    })
                  )
                )}

                {historyTab === "order" && (
                  orders.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground text-center py-4">{t.infoNoOrder}</p>
                  ) : (
                    orders.map((o) => {
                      const statusConf = {
                        paid:      { label: t.infoOrderPaid,      icon: CheckCircle2, className: "text-success" },
                        pending:   { label: t.infoOrderPending,   icon: Clock,        className: "text-warning" },
                        refunded:  { label: t.infoOrderRefunded,  icon: RotateCcw,    className: "text-destructive" },
                        cancelled: { label: t.infoOrderCancelled, icon: XCircle,      className: "text-muted-foreground" },
                      }[o.status]
                      const StatusIcon = statusConf.icon
                      return (
                        <div key={o.id} className="flex items-center gap-2 py-2 border-b border-border-subtle last:border-0">
                          <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-foreground truncate">{o.item}</p>
                            <p className="text-[12px] text-muted-foreground">{o.date}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                            <span className="text-[12px] font-semibold text-foreground">{o.amount}</span>
                            <span className={cn("flex items-center gap-0.5 text-[12px]", statusConf.className)}>
                              <StatusIcon className="w-2.5 h-2.5" />
                              {statusConf.label}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )
                )}

                {historyTab === "review" && (
                  reviews.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground text-center py-4">{t.infoNoReview}</p>
                  ) : (
                    reviews.map((rv) => (
                      <div key={rv.id} className="py-2 border-b border-border-subtle last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3", i < rv.rating ? "text-warning fill-warning" : "text-border")} />
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {rv.replied
                              ? <span className="text-[12px] text-success flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />{t.infoReviewReplied}</span>
                              : <span className="text-[12px] text-warning flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" />{t.infoReviewPending}</span>
                            }
                            <span className="text-[12px] text-muted-foreground">{rv.date}</span>
                          </div>
                        </div>
                        <p className="text-[12px] text-foreground leading-relaxed">{rv.content}</p>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-4 border-b border-border-subtle">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">{session.id}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground leading-snug mb-2">{session.subject}</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[12px] px-2 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20">
                  {session.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border-subtle border-b border-border-subtle">
              <div className="flex flex-col items-center py-3">
                <Bot className="w-4 h-4 text-primary mb-1" />
                <span className="text-sm font-bold text-foreground">{(session as any).aiTime ?? "-"}</span>
                <span className="text-[12px] text-muted-foreground mt-0.5">{t.infoSessionAI}</span>
              </div>
              <div className="flex flex-col items-center py-3">
                <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                <span className="text-sm font-bold text-foreground">{session.waitTime}</span>
                <span className="text-[12px] text-muted-foreground mt-0.5">{t.infoSessionWait}</span>
              </div>
              <div className="flex flex-col items-center py-3">
                <Activity className="w-4 h-4 text-muted-foreground mb-1" />
                <span className="text-sm font-bold text-foreground">{session.handleTime ?? "-"}</span>
                <span className="text-[12px] text-muted-foreground mt-0.5">{t.infoSessionHandle}</span>
              </div>
            </div>

            <CollapsibleSection icon={Info} title={t.infoSectionSession} defaultOpen={true}>
              <div className="divide-y divide-border-subtle">
                <CopyableRow label={t.infoFieldChannel} value={
                  session.channel === "call" ? t.infoChannelCall
                  : session.channel === "board" ? t.infoChannelBoard
                  : session.channel === "whatsapp" ? "WhatsApp"
                  : t.infoChannelWebchat
                } />
                <CopyableRow label={t.infoFieldSource} value={session.source} />
                <CopyableRow
                  label={t.infoFieldCreated}
                  value={new Date(session.createdAt).toLocaleString(locale === "ko" ? "ko-KR" : locale === "ar" ? "ar-SA" : "en-US", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                />
                <CopyableRow
                  label={t.infoFieldUpdated}
                  value={new Date(session.updatedAt).toLocaleString(locale === "ko" ? "ko-KR" : locale === "ar" ? "ar-SA" : "en-US", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                />
                {session.csat && <CopyableRow label={t.infoFieldCSAT} value={`${session.csat} / 5`} accent />}
              </div>
            </CollapsibleSection>

            <CollapsibleSection icon={Monitor} title={t.infoSectionEnv} defaultOpen={false}>
              <div className="divide-y divide-border-subtle">
                {session.location && <CopyableRow label={t.infoFieldLocation} value={session.location} />}
                {session.browser && <CopyableRow label={t.infoFieldBrowser} value={session.browser} />}
                {session.os && <CopyableRow label="OS" value={session.os} />}
                {session.ip && <CopyableRow label="IP" value={session.ip} mono />}
                {session.referrer && <CopyableRow label={t.infoFieldReferrer} value={session.referrer} mono />}
              </div>
            </CollapsibleSection>

            {session.tags.length > 0 && (
              <CollapsibleSection icon={Tag} title={t.infoSectionTags} defaultOpen={true}>
                <div className="flex flex-wrap gap-1.5">
                  {session.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-lg bg-surface-raised text-foreground border border-border-subtle hover:border-primary/30 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            <div className="px-4 py-4 space-y-2">
              <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.infoQuickActions}</p>
              <button className="w-full flex items-center gap-2 text-xs py-2 px-3 rounded-lg bg-surface hover:bg-primary-subtle hover:text-primary text-foreground border border-border-subtle hover:border-primary/30 transition-all">
                <CheckCheck className="w-3.5 h-3.5" />
                {t.infoActionComplete}
              </button>
              <button className="w-full flex items-center gap-2 text-xs py-2 px-3 rounded-lg bg-surface text-foreground border border-border-subtle transition-all hover:border-warning/40">
                <AlertCircle className="w-3.5 h-3.5 text-warning" />
                {t.infoActionPriority}
              </button>
              <button className="w-full flex items-center gap-2 text-xs py-2 px-3 rounded-lg bg-surface text-foreground border border-border-subtle transition-all hover:border-primary/30">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                {t.infoActionTransfer}
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
