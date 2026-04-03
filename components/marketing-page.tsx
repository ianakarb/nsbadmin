"use client"

import { useState, useMemo, useEffect } from "react"
import { getCampaignsByStore } from "@/lib/mock-store-data"
import {
  Megaphone, Plus, Search, Send, Pause, Play, Trash2,
  ChevronRight, ChevronDown, X, Check, Copy,
  Zap, Clock, Users, Mail, MessageSquare, Smartphone,
  TrendingUp, MousePointerClick, Gift, Star,
  CalendarDays, BarChart2, Filter, Tag, AlertCircle,
  RefreshCw, Eye, ArrowUpRight, Settings, Ticket, Percent,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale"
import {
  customers, sessions, customerReservations,
  customerOrders, customerReviews,
  type Customer,
} from "@/lib/data"

// ── Types ──────────────────────────────────────────────────────────────────

type Channel = "kakao" | "sms" | "email" | "push" | "whatsapp"
type MessageType = "coupon" | "survey" | "revisit" | "custom"
type CampaignStatus = "active" | "paused" | "scheduled" | "draft" | "completed"
type TriggerEvent = "cs_resolved" | "reservation_confirmed" | "reservation_cancelled" | "no_show" | "review_submitted"
type WizardStep = 1 | 2 | 3 | 4

interface Segment {
  id: string
  label: string
  description: string
  filter: (c: Customer) => boolean
  color: string
}

type TargetType = "segment" | "filterview" | "group"
type AutomationStatus = "active" | "paused"

interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  segmentId: string
  targetType: TargetType
  targetLabel: string
  channels: Channel[]
  messageType: MessageType
  sentCount: number
  openRate: number
  clickRate: number
  redemptionRate: number
  scheduledAt?: string
  createdAt: string
  message: string
}

interface Automation {
  id: string
  name: string
  status: AutomationStatus
  triggerEvent: TriggerEvent
  targetType: TargetType
  targetLabel: string
  channels: Channel[]
  messageType: MessageType
  message: string
  sentCount: number
  createdAt: string
}

interface Coupon {
  id: string
  code: string
  discount: string
  type: "percent" | "amount"
  validDays: number
  manualIssuable: boolean
  usedCount: number
  totalIssued: number
}

// ── Mock data ──────────────────────────────────────────────────────────────

const ALL_CUSTOMERS = Object.values(customers)

function makeSegments(t: ReturnType<typeof useLocale>["t"]): Segment[] {
  return [
    { id: "seg-all",       label: t.mktSegAll,      description: t.mktSegAllDesc,      filter: () => true,                                                                                     color: "bg-muted text-foreground border-border" },
    { id: "seg-vip",       label: t.mktSegVip,      description: t.mktSegVipDesc,      filter: (c: Customer) => c.grade === "VIP",                                                             color: "bg-amber-100 text-amber-700 border-amber-200" },
    { id: "seg-negative",  label: t.mktSegNegative, description: t.mktSegNegativeDesc, filter: (c: Customer) => c.sentiment === "negative",                                                    color: "bg-destructive/10 text-destructive border-destructive/20" },
    { id: "seg-new",       label: t.mktSegNew,      description: t.mktSegNewDesc,      filter: (c: Customer) => c.grade === "신규",                                                            color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { id: "seg-cs-heavy",  label: t.mktSegCsHeavy,  description: t.mktSegCsHeavyDesc,  filter: (c: Customer) => c.totalTickets >= 5,                                                          color: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: "seg-no-order",  label: t.mktSegNoOrder,  description: t.mktSegNoOrderDesc,  filter: (c: Customer) => (customerOrders[c.id] ?? []).filter(o => o.status === "paid").length === 0,   color: "bg-slate-100 text-slate-600 border-slate-200" },
    { id: "seg-no-review", label: t.mktSegNoReview, description: t.mktSegNoReviewDesc, filter: (c: Customer) => (customerReviews[c.id] ?? []).length === 0,                                   color: "bg-blue-100 text-blue-700 border-blue-200" },
  ]
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-001",
    name: "VIP 고객 봄 쿠폰 발송",
    status: "active",
    segmentId: "seg-vip",
    targetType: "segment",
    targetLabel: "VIP 고객",
    channels: ["kakao", "sms"],
    messageType: "coupon",
    sentCount: 2,
    openRate: 100,
    clickRate: 50,
    redemptionRate: 50,
    scheduledAt: "2025-03-01T10:00:00",
    createdAt: "2025-02-25",
    message: "안녕하세요 {{customer_name}}님! VIP 고객 특별 할인 쿠폰을 보내드립니다. {{coupon_code}} 코드를 입력하시면 20% 할인 혜택을 받으실 수 있습니다.",
  },
  {
    id: "camp-002",
    name: "부정 고객 사후 만족도 조사",
    status: "active",
    segmentId: "seg-negative",
    targetType: "segment",
    targetLabel: "부정 고객",
    channels: ["email"],
    messageType: "survey",
    sentCount: 1,
    openRate: 100,
    clickRate: 0,
    redemptionRate: 0,
    createdAt: "2025-02-26",
    message: "안녕하세요 {{customer_name}}님. 지난 방문에서 불편함을 느끼셨다면 진심으로 사과드립니다. 짧은 설문에 참여해 주시면 서비스 개선에 큰 도움이 됩니다.",
  },
  {
    id: "camp-003",
    name: "신규 고객 재방문 유도",
    status: "paused",
    segmentId: "seg-new",
    targetType: "segment",
    targetLabel: "신규 고객",
    channels: ["sms"],
    messageType: "revisit",
    sentCount: 2,
    openRate: 50,
    clickRate: 0,
    redemptionRate: 0,
    createdAt: "2025-02-20",
    message: "{{customer_name}}님, 첫 방문 감사합니다! 다음 방문 시 10% 할인 혜택을 드립니다. {{last_consultant_name}} 상담사가 기다리고 있습니다.",
  },
  {
    id: "camp-004",
    name: "CS 해결 후 자동 감사 메시지",
    status: "active",
    segmentId: "seg-cs-heavy",
    targetType: "segment",
    targetLabel: "CS 다발 고객",
    channels: ["kakao"],
    messageType: "custom",
    sentCount: 5,
    openRate: 80,
    clickRate: 20,
    redemptionRate: 0,
    createdAt: "2025-02-18",
    message: "{{customer_name}}님, {{cs_category}} 관련 문의가 해결되었습니다. 담당 상담사 {{last_consultant_name}}이 최선을 다했습니다. 추가 문의 사항이 있으시면 언제든 연락해 주세요.",
  },
  {
    id: "camp-005",
    name: "리뷰 미작성 고객 후기 요청",
    status: "draft",
    segmentId: "seg-no-review",
    targetType: "segment",
    targetLabel: "리뷰 미작성",
    channels: ["sms", "email"],
    messageType: "survey",
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    redemptionRate: 0,
    createdAt: "2025-02-27",
    message: "{{customer_name}}님, 방문해 주셔서 감사합니다. 소중한 후기를 남겨 주시면 다음 방문 시 음료 쿠폰을 드립니다!",
  },
]

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: "auto-001",
    name: "CS 해결 후 감사 메시지",
    status: "active",
    triggerEvent: "cs_resolved",
    targetType: "segment",
    targetLabel: "CS 다발 고객",
    channels: ["kakao"],
    messageType: "custom",
    message: "{{customer_name}}님, {{cs_category}} 관련 문의가 해결되��습니다. 담당 상담사 {{last_consultant_name}}이 최선을 다���습니다. 추가 문의가 있으시면 언제든 연락해 주세요.",
    sentCount: 5,
    createdAt: "2025-02-18",
  },
  {
    id: "auto-002",
    name: "예약 확정 안내 메시지",
    status: "active",
    triggerEvent: "reservation_confirmed",
    targetType: "segment",
    targetLabel: "전체 고객",
    channels: ["kakao", "sms"],
    messageType: "custom",
    message: "{{customer_name}}님, {{reservation_date}} 예약이 확정되었습니다. {{last_consultant_name}} 상담사가 기다리겠습니다. 감사합니다.",
    sentCount: 12,
    createdAt: "2025-02-20",
  },
  {
    id: "auto-003",
    name: "노쇼 발생 시 재예약 안내",
    status: "paused",
    triggerEvent: "no_show",
    targetType: "segment",
    targetLabel: "전체 고객",
    channels: ["sms"],
    messageType: "revisit",
    message: "{{customer_name}}님, 예약하신 시간에 오시지 못하셨네요. 다음 방문 시 특별 혜택을 드립니다. 재예약 부탁드립니다.",
    sentCount: 3,
    createdAt: "2025-02-22",
  },
]

const INITIAL_COUPONS: Coupon[] = [
  { id: "coup-001", code: "VIP20", discount: "20%", type: "percent", validDays: 30, manualIssuable: true, usedCount: 1, totalIssued: 2 },
  { id: "coup-002", code: "NEWBIE10", discount: "10%", type: "percent", validDays: 14, manualIssuable: false, usedCount: 0, totalIssued: 2 },
  { id: "coup-003", code: "SORRY5000", discount: "₩5,000", type: "amount", validDays: 7, manualIssuable: true, usedCount: 0, totalIssued: 1 },
]

// ── Helpers ────────────────────────────────────────────────────────────────

type MktT = ReturnType<typeof useLocale>["t"]

function makeChannelMeta(t: MktT): Record<Channel, { label: string; icon: React.ElementType; color: string }> {
  return {
    kakao:    { label: t.mktChannelKakao, icon: MessageSquare, color: "bg-green-100 text-green-700" },
    sms:      { label: "SMS",             icon: Smartphone,   color: "bg-blue-100 text-blue-700" },
    email:    { label: t.mktChannelEmail, icon: Mail,         color: "bg-slate-100 text-slate-600" },
    push:     { label: t.mktChannelPush,  icon: Smartphone,   color: "bg-purple-100 text-purple-700" },
    whatsapp: { label: "WhatsApp",        icon: MessageSquare, color: "bg-green-100 text-green-700" },
  }
}

function makeMsgTypeMeta(t: MktT): Record<MessageType, { label: string; icon: React.ElementType }> {
  return {
    coupon:  { label: t.mktMsgTypeCoupon,  icon: Gift },
    survey:  { label: t.mktMsgTypeSurvey,  icon: Star },
    revisit: { label: t.mktMsgTypeRevisit, icon: RefreshCw },
    custom:  { label: t.mktMsgTypeCustom,  icon: MessageSquare },
  }
}

function makeTriggerMeta(t: MktT): Record<TriggerEvent, string> {
  return {
    cs_resolved:           t.mktTriggerCsResolved,
    reservation_confirmed: t.mktTriggerReservationConfirmed,
    reservation_cancelled: t.mktTriggerReservationCancelled,
    no_show:               t.mktTriggerNoShow,
    review_submitted:      t.mktTriggerReviewSubmitted,
  }
}

function makeStatusMeta(t: MktT): Record<CampaignStatus, { label: string; color: string }> {
  return {
    active:    { label: t.mktStatusActive,    color: "bg-emerald-100 text-emerald-700" },
    paused:    { label: t.mktStatusPaused,    color: "bg-amber-100 text-amber-700" },
    scheduled: { label: t.mktStatusScheduled, color: "bg-blue-100 text-blue-700" },
    draft:     { label: t.mktStatusDraft,     color: "bg-slate-100 text-slate-500" },
    completed: { label: t.mktStatusCompleted, color: "bg-muted text-muted-foreground" },
  }
}

function makeVariables(t: MktT) {
  return [
    { var: "{{customer_name}}",        label: t.mktVarCustomerName },
    { var: "{{coupon_code}}",          label: t.mktVarCouponCode },
    { var: "{{last_consultant_name}}", label: t.mktVarConsultantName },
    { var: "{{cs_category}}",          label: t.mktVarCsCategory },
    { var: "{{reservation_date}}",     label: t.mktVarReservationDate },
    { var: "{{store_name}}",           label: t.mktVarStoreName },
  ]
}

function resolvePreview(message: string, customer: Customer, storeName = "Store"): string {
  const custSessions = sessions.filter(s => s.customerId === customer.id)
  const lastSession = custSessions[0]
  return message
    .replace(/\{\{customer_name\}\}/g, customer.name || customer.phone)
    .replace(/\{\{coupon_code\}\}/g, "VIP20")
    .replace(/\{\{last_consultant_name\}\}/g, lastSession?.assignedAgent?.name ?? "-")
    .replace(/\{\{cs_category\}\}/g, lastSession?.category ?? "-")
    .replace(/\{\{reservation_date\}\}/g, customerReservations[customer.id]?.[0]?.date ?? "2025-03-01")
    .replace(/\{\{store_name\}\}/g, storeName)
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, trend }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; trend?: number
}) {
  const { t } = useLocale()
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[12px] text-muted-foreground mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <p className={cn("text-[12px] font-medium mt-0.5 flex items-center gap-0.5", trend >= 0 ? "text-emerald-600" : "text-destructive")}>
            <ArrowUpRight className="w-3 h-3" />{trend >= 0 ? "+" : ""}{trend}% {t.mktVsTrendLabel}
          </p>
        )}
      </div>
    </div>
  )
}

function ChannelBadge({ channel }: { channel: Channel }) {
  const { t } = useLocale()
  const m = makeChannelMeta(t)[channel]
  if (!m) return null
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[12px] font-medium", m.color)}>
      <m.icon className="w-2.5 h-2.5" />{m.label}
    </span>
  )
}

function SegmentBadge({ segmentId }: { segmentId: string }) {
  const { t } = useLocale()
  const seg = makeSegments(t).find(s => s.id === segmentId)
  if (!seg) return null
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium", seg.color)}>
      <Users className="w-2.5 h-2.5" />{seg.label}
    </span>
  )
}

function TargetBadge({ targetType, targetLabel }: { targetType: TargetType; targetLabel: string }) {
  const { t } = useLocale()
  if (targetType === "segment") {
    const seg = makeSegments(t).find(s => s.label === targetLabel)
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium", seg?.color ?? "bg-muted text-muted-foreground border-border")}>
        <Users className="w-2.5 h-2.5" />{targetLabel}
      </span>
    )
  }
  if (targetType === "filterview") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-blue-50 text-blue-700 border-blue-200">
        <Filter className="w-2.5 h-2.5" />{targetLabel}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-violet-50 text-violet-700 border-violet-200">
      <Tag className="w-2.5 h-2.5" />{targetLabel}
    </span>
  )
}

// ── Message templates ───────────────────────────────────────�������──────────────

function makeMessageTemplates(locale: string): Record<"coupon" | "survey" | "revisit", string> {
  if (locale === "ar") return {
    coupon: `مرحباً، {{customer_name}}! 💌

نرسل إليك كوبون خصم خاص من {{store_name}} تقديراً لولائك.

🎁 رمز الكوبون: {{coupon_code}}
📅 الصلاحية: 30 يوماً من الاستلام

أدخل الرمز واستمتع بالخصم الفوري في زيارتك القادمة!

مع تحيات،
{{store_name}}`,
    survey: `مرحباً، {{customer_name}}.

كيف كانت تجربتك الأخيرة في {{store_name}}؟

رأيك يهمنا. شاركنا في استبيان قصير (دقيقة واحدة) من خلال الرابط أدناه.

👉 [المشاركة في الاستبيان]

إذا كان لديك أي استفسار، يمكنك التواصل مع مستشارك {{last_consultant_name}} مباشرة.

مع تحيات،
{{store_name}}`,
    revisit: `{{customer_name}}، مرحباً بك مجدداً!

نتمنى أن تكون بخير بعد زيارتك الأخيرة لـ {{store_name}}. مستشارك {{last_consultant_name}} ينتظر عودتك. 😊

في زيارتك القادمة استمتع بـ:
✅ خصم 10% على إعادة الزيارة
✅ مشروب مجاني

احجز الآن واستفد من العرض!

مع تحيات،
{{store_name}}`,
  }
  if (locale === "en") return {
    coupon: `Hello, {{customer_name}}! 💌

{{store_name}} is sending you a special discount coupon as a token of appreciation.

🎁 Coupon Code: {{coupon_code}}
📅 Valid for: 30 days from receipt

Enter the code to receive an instant discount. Don't miss it on your next visit!

Best regards,
{{store_name}}`,
    survey: `Hello, {{customer_name}}.

How was your recent visit to {{store_name}}?

Your feedback means a lot to us. Please take a short survey (about 1 minute) via the link below.

👉 [Take the Survey]

If you had any concerns, feel free to contact your consultant {{last_consultant_name}} directly.

Best regards,
{{store_name}}`,
    revisit: `Hi {{customer_name}}!

Hope you're doing well since your last visit to {{store_name}}. Your consultant {{last_consultant_name}} is looking forward to seeing you. 😊

On your next visit, enjoy:
✅ 10% returning customer discount
✅ 1 complimentary drink

Book now and claim your benefits!

Best regards,
{{store_name}}`,
  }
  // default: Korean
  return {
    coupon: `안녕하세요, {{customer_name}}님! 💌

{{store_name}}에서 감사의 마음을 담아 특별 할인 쿠폰을 드립니다.

🎁 쿠폰 코드: {{coupon_code}}
📅 유효 기간: 수령 후 30일

코드를 입력하시면 즉시 할인 혜택을 받으실 수 있습니다. 다음 방문에서 꼭 사용해 보세요!

감사합니다,
{{store_name}} 드림`,
    survey: `안녕하세요, {{customer_name}}님.

최근 {{store_name}} 방문은 만족스러우셨나요?

고객님의 소중한 의견이 저희 서비스 개선에 큰 힘이 됩니다. 아래 링크를 통해 짧은 설문(1분 내외)에 참여해 주시면 감사합니다.

👉 [만족도 설문 참여하기]

불편하셨던 점이 있으시다면 담당 상담사 {{last_consultant_name}}에게 직접 말씀해 주셔도 됩니다.

감사합니다,
{{store_name}} 드림`,
    revisit: `{{customer_name}}님, 안녕하세요!

지난번 {{store_name}} 방문 이후 잘 지내고 계신가요? 담당 상담사 {{last_consultant_name}}이(가) 고객님을 기다리고 있습니다. 😊

다음 방문 시 아래 혜택을 드립니다:
✅ 재방문 할인 10% 적용
✅ 음료 1잔 무료 제공

지금 바로 예약하고 특별 혜택을 누려보세요!

감사합니다,
{{store_name}} 드림`,
  }
}

// ── Filter views & Groups (mirrored from customers-page) ────────────────────

const MARKETING_FILTER_VIEWS = [
  { id: "vip",        labelKey: "gradeVIP" as const },
  { id: "new",        labelKey: "gradeNew" as const },
  { id: "negative",   labelKey: "sentimentNegative" as const },
  { id: "no_order",   labelKey: "custSegNoOrder" as const },
  { id: "pending_cs", labelKey: "custSegPendingCS" as const },
]

const MARKETING_GROUPS = [
  { id: "grp-1", nameKey: "mktGrp1Name" as const, descKey: "mktGrp1Desc" as const, colorIdx: 0, memberCount: 1 },
  { id: "grp-2", nameKey: "mktGrp2Name" as const, descKey: "mktGrp2Desc" as const, colorIdx: 4, memberCount: 2 },
  { id: "grp-3", nameKey: "mktGrp3Name" as const, descKey: "mktGrp3Desc" as const, colorIdx: 1, memberCount: 3 },
]

const GROUP_DOT_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"]

// ── Campaign Wizard ────────────────────────────────────────────────────────

// ── Detail Modals ─────────────────────────────────────────────────────────

function CampaignDetailModal({ campaign, onClose, onToggle, onDelete }: {
  campaign: Campaign
  onClose: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const { t } = useLocale()
  const STATUS_META = makeStatusMeta(t)
  const MSG_META = makeMsgTypeMeta(t)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[560px] max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[15px] font-bold text-foreground truncate">{campaign.name}</h2>
              <span className={cn("px-2 py-0.5 rounded-full text-[12px] font-bold flex-shrink-0", STATUS_META[campaign.status].color)}>
                {STATUS_META[campaign.status].label}
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">{campaign.createdAt} {t.mktCreatedAt}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors ml-3 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Target & Channels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{t.mktSendTarget}</p>
              <TargetBadge targetType={campaign.targetType ?? "segment"} targetLabel={campaign.targetLabel ?? campaign.segmentId} />
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{t.mktSendChannel}</p>
              <div className="flex gap-1">{campaign.channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}</div>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t.mktMetrics}</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: t.mktSentTotal,      value: campaign.sentCount.toLocaleString(), unit: t.mktStatSentUnit, color: "bg-slate-500" },
                { label: t.mktOpenRate,        value: campaign.openRate,                   unit: "%",              color: "bg-primary" },
                { label: t.mktClickRate,       value: campaign.clickRate,                  unit: "%",              color: "bg-emerald-500" },
                { label: t.mktConversionRate,  value: campaign.redemptionRate,             unit: "%",              color: "bg-amber-400" },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl bg-muted/30 border border-border text-center">
                  <p className="text-[12px] text-muted-foreground mb-1">{m.label}</p>
                  <p className="text-[18px] font-bold text-foreground">{m.value}<span className="text-[12px] font-normal ml-0.5">{m.unit}</span></p>
                  <div className="h-1 rounded-full bg-muted overflow-hidden mt-2">
                    <div className={cn("h-full rounded-full", m.color)}
                      style={{ width: `${Math.min(typeof m.value === "number" ? m.value : parseFloat(String(m.value)), 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t.mktMsgContent}</p>
            <div className="relative p-4 rounded-xl bg-muted/30 border border-border">
              <span className="absolute top-3 right-3 text-[12px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                {MSG_META[campaign.messageType].label}
              </span>
              <pre className="text-[12px] text-foreground whitespace-pre-wrap leading-relaxed font-sans">{campaign.message}</pre>
            </div>
          </div>

          {/* Schedule */}
          {campaign.scheduledAt && (
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <CalendarDays className="w-4 h-4 flex-shrink-0" />
              <span>{t.mktScheduledAt} <strong className="text-foreground">{campaign.scheduledAt}</strong></span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
          <button
            onClick={() => { onDelete(); onClose() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />{t.mktDeleteBtn}
          </button>
          <button
            onClick={() => { onToggle(); onClose() }}
            className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors",
              campaign.status === "active"
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            )}
          >
            {campaign.status === "active" ? <><Pause className="w-3.5 h-3.5" />{t.mktPauseBtn}</> : <><Play className="w-3.5 h-3.5" />{t.mktResumeBtn}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function AutomationDetailModal({ automation, onClose, onToggle, onDelete }: {
  automation: Automation
  onClose: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const { t } = useLocale()
  const CHANNEL_META = makeChannelMeta(t)
  const MSG_META = makeMsgTypeMeta(t)
  const TRIGGER_META = makeTriggerMeta(t)
  const isActive = automation.status === "active"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[560px] max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", isActive ? "bg-amber-100" : "bg-muted")}>
                <Zap className={cn("w-3.5 h-3.5", isActive ? "text-amber-600" : "text-muted-foreground")} />
              </div>
              <h2 className="text-[15px] font-bold text-foreground truncate">{automation.name}</h2>
              <span className={cn("px-2 py-0.5 rounded-full text-[12px] font-bold flex-shrink-0",
                isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
              )}>
                {isActive ? t.mktAutomationStatusActive : t.mktAutomationStatusPaused}
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">{automation.createdAt} {t.mktCreatedAt}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors ml-3 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Trigger flow */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-[12px] font-semibold text-amber-700 uppercase tracking-wide mb-2">{t.mktAutoFlow}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-[12px] font-semibold border border-amber-300">
                <Zap className="w-3.5 h-3.5" />{TRIGGER_META[automation.triggerEvent]}
              </span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
              <div className="flex gap-1">{automation.channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}</div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
              <TargetBadge targetType={automation.targetType} targetLabel={automation.targetLabel} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
              <p className="text-[12px] text-muted-foreground mb-1">{t.mktAutoSentCount}</p>
              <p className="text-[20px] font-bold text-foreground">{automation.sentCount.toLocaleString()}<span className="text-[12px] font-normal ml-0.5">{t.mktStatSentUnit}</span></p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
              <p className="text-[12px] text-muted-foreground mb-1">{t.mktSendChannel}</p>
              <p className="text-[14px] font-semibold text-foreground">{automation.channels.map(ch => CHANNEL_META[ch].label).join(", ")}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
              <p className="text-[12px] text-muted-foreground mb-1">{t.mktAutoMsgTypeTitle}</p>
              <p className="text-[14px] font-semibold text-foreground">{MSG_META[automation.messageType].label}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t.mktMsgContent}</p>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <pre className="text-[12px] text-foreground whitespace-pre-wrap leading-relaxed font-sans">{automation.message}</pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
          <button
            onClick={() => { onDelete(); onClose() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />{t.mktDeleteBtn}
          </button>
          <button
            onClick={() => { onToggle(); onClose() }}
            className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors",
              isActive
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            )}
          >
            {isActive ? <><Pause className="w-3.5 h-3.5" />{t.mktPauseBtn}</> : <><Play className="w-3.5 h-3.5" />{t.mktResumeBtn}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function CouponDetailModal({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const { t } = useLocale()
  const usageRate = coupon.totalIssued > 0 ? Math.round((coupon.usedCount / coupon.totalIssued) * 100) : 0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[420px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <code className="text-[16px] font-bold text-foreground tracking-widest">{coupon.code}</code>
              <p className="text-[12px] text-muted-foreground">{t.mktCouponCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Discount highlight */}
          <div className="flex items-center justify-center p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-center">
              <p className="text-[12px] text-amber-600 font-semibold uppercase tracking-wide mb-1">{t.mktCouponDiscount}</p>
              <p className="text-[40px] font-black text-amber-700 leading-none">{coupon.discount}</p>
              <p className="text-[12px] text-amber-600 mt-1">{t.mktCouponDiscountLabel}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-[12px] text-muted-foreground mb-1">{t.mktCouponValidDays}</p>
              <p className="text-[14px] font-bold text-foreground">{coupon.validDays}d</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-[12px] text-muted-foreground mb-1">{t.mktCouponManualIssuable}</p>
              <p className="text-[14px] font-bold text-foreground">{coupon.manualIssuable ? t.mktCouponManualYes : t.mktCouponManualNo}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-[12px] text-muted-foreground mb-1">{t.mktCouponTotalIssued}</p>
              <p className="text-[14px] font-bold text-foreground">{coupon.totalIssued.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-[12px] text-muted-foreground mb-1">{t.mktCouponUsedCount}</p>
              <p className="text-[14px] font-bold text-foreground">{coupon.usedCount.toLocaleString()}</p>
            </div>
          </div>

          {/* Usage rate bar */}
          <div>
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="text-muted-foreground">{t.mktCouponUsageRate}</span>
              <span className="font-bold text-foreground">{usageRate}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${usageRate}%` }} />
            </div>
            <p className="text-[12px] text-muted-foreground mt-1">{coupon.usedCount} / {coupon.totalIssued} {t.mktCouponUsageUnit}</p>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-border bg-muted/20">
          <button
            onClick={() => { navigator.clipboard.writeText(coupon.code); onClose() }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:opacity-90 transition-opacity"
          >
            <Copy className="w-3.5 h-3.5" />{t.mktCouponCopyBtn}
          </button>
        </div>
      </div>
    </div>
  )
}

function AnalyticsCampaignDetailModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const { t } = useLocale()
  const STATUS_META = makeStatusMeta(t)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h2 className="text-[14px] font-bold text-foreground">{campaign.name}</h2>
              <span className={cn("px-2 py-0.5 rounded-full text-[12px] font-bold", STATUS_META[campaign.status].color)}>
                {STATUS_META[campaign.status].label}
              </span>
            </div>
            <div className="flex gap-1.5">
              {campaign.channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}
              <TargetBadge targetType={campaign.targetType ?? "segment"} targetLabel={campaign.targetLabel ?? campaign.segmentId} />
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors ml-3 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Big metric highlight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-[12px] text-primary/70 mb-1">{t.mktSentTotal}</p>
              <p className="text-[32px] font-black text-primary leading-none">{campaign.sentCount.toLocaleString()}</p>
              <p className="text-[12px] text-primary/60 mt-1">{t.mktStatSentUnit}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <p className="text-[12px] text-emerald-600/70 mb-1">{t.mktOpenRate}</p>
              <p className="text-[32px] font-black text-emerald-600 leading-none">{campaign.openRate}</p>
              <p className="text-[12px] text-emerald-600/60 mt-1">%</p>
            </div>
          </div>

          {/* Bar charts */}
          <div className="flex flex-col gap-3">
            {[
              { label: t.mktOpenRate,       value: campaign.openRate,       max: 100, color: "bg-primary" },
              { label: t.mktClickRate,      value: campaign.clickRate,      max: 100, color: "bg-emerald-500" },
              { label: t.mktConversionRate, value: campaign.redemptionRate, max: 100, color: "bg-amber-400" },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-bold text-foreground">{m.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", m.color)} style={{ width: `${(m.value / m.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Message preview */}
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t.mktSentMsg}</p>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <pre className="text-[12px] text-foreground whitespace-pre-wrap leading-relaxed font-sans line-clamp-6">{campaign.message}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── AutomationWizard ───────────────────────────────────────────────────────

type AutoWizardStep = 1 | 2 | 3

function AutomationWizard({ onClose, onSave }: { onClose: () => void; onSave: (a: Automation) => void }) {
  const [step, setStep] = useState<AutoWizardStep>(1)
  const [triggerEvent, setTriggerEvent] = useState<TriggerEvent>("cs_resolved")
  const [targetTab, setTargetTab] = useState<TargetType>("segment")
  const [selectedSegment, setSelectedSegment] = useState("")
  const [selectedFilterView, setSelectedFilterView] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([])
  const [messageType, setMessageType] = useState<MessageType>("custom")
  const [message, setMessage] = useState("")
  const [autoName, setAutoName] = useState("")

  const { t, locale } = useLocale()
  const SEGMENTS = makeSegments(t)
  const CHANNEL_META = makeChannelMeta(t)
  const MSG_TYPE_META = makeMsgTypeMeta(t)
  const TRIGGER_META = makeTriggerMeta(t)
  const VARIABLES = makeVariables(t)
  const MESSAGE_TEMPLATES = makeMessageTemplates(locale)

  const filterView = MARKETING_FILTER_VIEWS.find(v => v.id === selectedFilterView)
  const segment = SEGMENTS.find(s => s.id === selectedSegment)
  const group = MARKETING_GROUPS.find(g => g.id === selectedGroup)

  const hasTarget = targetTab === "segment"
    ? (!!selectedSegment || !!selectedFilterView)
    : !!selectedGroup

  const targetLabel = targetTab === "segment"
    ? (selectedFilterView ? (filterView ? t[filterView.labelKey] : "") : (segment?.label ?? ""))
    : (group ? t[group.nameKey] : "")

  const resolvedTargetType: TargetType = targetTab === "segment" && selectedFilterView
    ? "filterview" : targetTab

  const canNext = () => {
    if (step === 1) return !!triggerEvent
    if (step === 2) return hasTarget && selectedChannels.length > 0
    return message.trim().length > 0
  }

  const applyTemplate = (type: MessageType) => {
    if (type !== "custom") {
      setMessage(MESSAGE_TEMPLATES[type as "coupon" | "survey" | "revisit"])
    } else {
      setMessage("")
    }
  }

  const handleNext = () => {
    // Step 1 → 2: auto-fill template for the current messageType
    if (step === 1 && messageType !== "custom" && message.trim() === "") {
      setMessage(MESSAGE_TEMPLATES[messageType as "coupon" | "survey" | "revisit"])
    }
    if (step < 3) setStep((step + 1) as AutoWizardStep)
    else handleSave()
  }

  const handleSave = () => {
    onSave({
      id: `auto-${Date.now()}`,
      name: autoName.trim() || TRIGGER_META[triggerEvent],
      status: "active",
      triggerEvent,
      targetType: resolvedTargetType,
      targetLabel,
      channels: selectedChannels,
      messageType,
      message,
      sentCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    onClose()
  }

  const AUTO_STEPS = [t.mktAutoStep1StepLabel, t.mktAutoStep2StepLabel, t.mktAutoStep3StepLabel] as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[820px] max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-bold text-base text-foreground">{t.mktAutomationWizardTitle}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 py-3 border-b border-border gap-0">
          {AUTO_STEPS.map((s, i) => {
            const n = (i + 1) as AutoWizardStep
            const done = step > n
            const active = step === n
            return (
              <div key={s} className="flex items-center">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium",
                  active ? "bg-amber-50 text-amber-700" : done ? "text-emerald-600" : "text-muted-foreground"
                )}>
                  <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0",
                    active ? "bg-amber-500 text-white" : done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {done ? <Check className="w-3 h-3" /> : n}
                  </span>
                  {s}
                </div>
                {i < AUTO_STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mx-1" />}
              </div>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1: 트리거 이벤트 선택 + 대상자 */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              {/* Trigger event */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{t.mktAutoTriggerTitle}</p>
                <p className="text-[12px] text-muted-foreground mb-3">{t.mktAutoTriggerDesc}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(TRIGGER_META) as [TriggerEvent, string][]).map(([k, v]) => {
                    const selected = triggerEvent === k
                    return (
                      <button
                        key={k}
                        onClick={() => setTriggerEvent(k)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          selected ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          selected ? "bg-amber-100" : "bg-muted"
                        )}>
                          <Zap className={cn("w-4 h-4", selected ? "text-amber-600" : "text-muted-foreground")} />
                        </div>
                        <span className={cn("text-[13px] font-medium", selected ? "text-amber-800" : "text-foreground")}>{v}</span>
                        {selected && <Check className="w-4 h-4 text-amber-600 ml-auto flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Target */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{t.mktAutoTargetTitle}</p>
                <p className="text-[12px] text-muted-foreground mb-3">{t.mktAutoTargetDesc}</p>
                <div className="flex gap-1 p-1 rounded-xl bg-muted border border-border mb-3">
                  {([
                    { id: "segment" as TargetType, label: t.mktTargetTabSegment, icon: Users },
                    { id: "group" as TargetType, label: t.mktTargetTabGroup, icon: Tag },
                  ]).map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setTargetTab(id)}
                      className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-all",
                        targetTab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  ))}
                </div>
                {targetTab === "segment" && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t.mktTargetSegmentLabel}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {SEGMENTS.map(seg => {
                          const cnt = ALL_CUSTOMERS.filter(seg.filter).length
                          const isSelected = selectedSegment === seg.id && !selectedFilterView
                          return (
                            <button key={seg.id} onClick={() => { setSelectedSegment(seg.id); setSelectedFilterView("") }}
                              className={cn("flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all",
                                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                              )}
                            >
                              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0", seg.color.replace("border", ""))}>{cnt}</div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-foreground">{seg.label}</p>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t.mktTargetFilterViewLabel}</p>
                      <div className="flex flex-wrap gap-2">
                        {MARKETING_FILTER_VIEWS.map(fv => {
                          const isSelected = selectedFilterView === fv.id
                          return (
                            <button key={fv.id} onClick={() => { setSelectedFilterView(fv.id); setSelectedSegment("") }}
                              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all",
                                isSelected ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                              <Filter className="w-3 h-3" />{t[fv.labelKey]}
                              {isSelected && <Check className="w-3 h-3 ml-1" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {targetTab === "group" && (
                  <div className="flex flex-col gap-2">
                    {MARKETING_GROUPS.map(grp => {
                      const selected = selectedGroup === grp.id
                      const dotColor = GROUP_DOT_COLORS[grp.colorIdx]
                      return (
                        <button key={grp.id} onClick={() => setSelectedGroup(grp.id)}
                          className={cn("flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                          )}
                        >
                          <div className={cn("w-3 h-3 rounded-full flex-shrink-0", dotColor)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-foreground">{t[grp.nameKey]}</p>
                            <p className="text-[12px] text-muted-foreground truncate">{t[grp.descKey]}</p>
                          </div>
                          <span className="text-[12px] text-muted-foreground">{grp.memberCount} {t.mktMemberCount}</span>
                          {selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Channel + Message Type + Message Editor */}
          {step === 2 && (
            <div className="flex gap-6">
              {/* Left: channel + type */}
              <div className="w-56 flex-shrink-0 flex flex-col gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">{t.mktAutoChannelTitle}</p>
                  <div className="flex flex-col gap-2">
                    {(Object.entries(CHANNEL_META) as [Channel, typeof CHANNEL_META[Channel]][]).map(([ch, meta]) => {
                      const sel = selectedChannels.includes(ch)
                      return (
                        <button key={ch} onClick={() => setSelectedChannels(prev => sel ? prev.filter(c => c !== ch) : [...prev, ch])}
                          className={cn("flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all",
                            sel ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                          )}
                        >
                          <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", meta.color)}>
                            <meta.icon className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[12px] font-medium text-foreground">{meta.label}</span>
                          {sel && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">{t.mktAutoMsgTypeTitle}</p>
                  <div className="flex flex-col gap-2">
                    {(Object.entries(MSG_TYPE_META) as [MessageType, typeof MSG_TYPE_META[MessageType]][]).map(([type, meta]) => {
                      const sel = messageType === type
                      const hasTemplate = type !== "custom"
                      return (
                        <button key={type} onClick={() => { setMessageType(type); applyTemplate(type) }}
                          className={cn("flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all",
                            sel ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                          )}
                        >
                          <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", sel ? "bg-primary/10" : "bg-muted")}>
                            <meta.icon className={cn("w-3.5 h-3.5", sel ? "text-primary" : "text-muted-foreground")} />
                          </span>
                          <div className="min-w-0">
                            <p className={cn("text-[12px] font-medium", sel ? "text-primary" : "text-foreground")}>{meta.label}</p>
                            {hasTemplate && <p className="text-[12px] text-emerald-600">{t.mktTemplateProvided}</p>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right: message editor */}
              <div className="flex-1 flex flex-col gap-3">
                <p className="text-sm font-semibold text-foreground">{t.mktAutoMsgEditorTitle}</p>
                {messageType !== "custom" && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-[12px] text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />{t.mktTemplateApplied}
                    </span>
                    <button onClick={() => applyTemplate(messageType)}
                      className="text-[12px] text-emerald-600 font-semibold hover:underline">{t.mktTemplateReset}</button>
                  </div>
                )}
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t.mktMsgPlaceholder}
                  className="flex-1 min-h-[260px] resize-none text-[13px] bg-muted/30 border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground leading-relaxed"
                />
                <div className="flex flex-wrap gap-1">
                  {VARIABLES.map(v => (
                    <button key={v.var} onClick={() => setMessage(prev => prev + v.var)}
                      className="px-2 py-1 rounded-lg bg-muted border border-border text-[12px] text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors">
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: name + summary */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{t.mktAutoNameTitle}</p>
                <input
                  autoFocus
                  value={autoName}
                  onChange={e => setAutoName(e.target.value)}
                  placeholder={TRIGGER_META[triggerEvent]}
                  className="w-full text-[13px] border border-border rounded-xl px-4 py-2.5 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-3">
                <p className="text-[12px] font-semibold text-amber-800">{t.mktAutoSummaryTitle}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[12px] font-semibold border border-amber-200">
                    <Zap className="w-3 h-3" />{TRIGGER_META[triggerEvent]}
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                  <span className="flex gap-1">{selectedChannels.map(ch => <ChannelBadge key={ch} channel={ch} />)}</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                  <TargetBadge targetType={resolvedTargetType} targetLabel={targetLabel} />
                </div>
                <div className="text-[12px] text-amber-700 space-y-1">
                  <div className="flex justify-between"><span>{t.mktAutoSummaryMsgType}</span><span className="font-medium">{MSG_TYPE_META[messageType].label}</span></div>
                  <div className="flex justify-between"><span>{t.mktAutoSummaryChannel}</span><span className="font-medium">{selectedChannels.map(ch => CHANNEL_META[ch].label).join(", ")}</span></div>
                </div>
                <div className="pt-2 border-t border-amber-200">
                  <p className="text-[12px] text-amber-600 font-medium">{t.mktAutoSummaryActivateNote}</p>
                </div>
              </div>

              <p className="text-[12px] text-muted-foreground line-clamp-3 italic p-3 bg-muted/30 rounded-xl border border-border">"{message.slice(0, 120)}..."</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
          <button
            onClick={() => step > 1 ? setStep((step - 1) as AutoWizardStep) : onClose()}
            className="px-4 py-2 rounded-xl border border-border text-[13px] text-muted-foreground hover:bg-muted transition-colors"
          >
            {step === 1 ? t.mktCancelBtn : t.mktPrevBtn}
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all",
              canNext()
                ? "bg-amber-500 text-white hover:opacity-90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {step === 3 ? t.mktSaveAndActivate : t.mktNextBtn}
            {step < 3 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CampaignWizard ─────────────────────────────────────────────────────────

function CampaignWizard({ onClose, onSave }: { onClose: () => void; onSave: (c: Campaign) => void }) {
  const [step, setStep] = useState<WizardStep>(1)
  const [targetTab, setTargetTab] = useState<TargetType>("segment")
  const [selectedSegment, setSelectedSegment] = useState<string>("")
  const [selectedFilterView, setSelectedFilterView] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([])
  const [messageType, setMessageType] = useState<MessageType>("coupon")
  const [campaignName, setCampaignName] = useState("")
  const [message, setMessage] = useState("")
  const [sendMode, setSendMode] = useState<"immediate" | "scheduled">("immediate")
  const [scheduledAt, setScheduledAt] = useState("")
  const [previewCustomer, setPreviewCustomer] = useState<Customer>(ALL_CUSTOMERS[0])

  const { t, locale } = useLocale()
  const SEGMENTS = makeSegments(t)
  const CHANNEL_META = makeChannelMeta(t)
  const MSG_TYPE_META = makeMsgTypeMeta(t)
  const TRIGGER_META_W = makeTriggerMeta(t)
  const MESSAGE_TEMPLATES = makeMessageTemplates(locale)
  const VARIABLES = makeVariables(t)

  const segment = SEGMENTS.find(s => s.id === selectedSegment)
  const filterView = MARKETING_FILTER_VIEWS.find(v => v.id === selectedFilterView)
  const group = MARKETING_GROUPS.find(g => g.id === selectedGroup)

  const hasTarget = targetTab === "segment"
    ? (!!selectedSegment || !!selectedFilterView)
    : !!selectedGroup

  const targetLabel = targetTab === "segment"
    ? (selectedFilterView ? (filterView ? t[filterView.labelKey] : "") : (segment?.label ?? ""))
    : (group ? t[group.nameKey] : "")

  const resolvedTargetType: TargetType = targetTab === "segment" && selectedFilterView
    ? "filterview"
    : targetTab

  const targetCount = targetTab === "segment" && segment
    ? ALL_CUSTOMERS.filter(segment.filter).length
    : targetTab === "group" && group
    ? group.memberCount
    : ALL_CUSTOMERS.length

  const toggleChannel = (ch: Channel) =>
    setSelectedChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])

  const insertVariable = (v: string) => setMessage(prev => prev + v)

  const canNext = (): boolean => {
    if (step === 1) return hasTarget
    if (step === 2) return selectedChannels.length > 0
    if (step === 3) return message.trim().length > 0
    return !!campaignName
  }

  // Auto-fill template when entering step 3 (only if message is empty)
  const handleNext = () => {
    if (step === 2 && message.trim() === "" && messageType !== "custom") {
      setMessage(MESSAGE_TEMPLATES[messageType as "coupon" | "survey" | "revisit"])
    }
    setStep((step + 1) as WizardStep)
  }

  const handleSave = () => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: campaignName || targetLabel,
      status: sendMode === "immediate" ? "active" : "scheduled",
      segmentId: selectedSegment || selectedFilterView || targetTab,
      targetType: resolvedTargetType,
      targetLabel,
      channels: selectedChannels,
      messageType,
      sentCount: sendMode === "immediate" ? targetCount : 0,
      openRate: 0, clickRate: 0, redemptionRate: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      message,
      scheduledAt: sendMode === "scheduled" ? scheduledAt : undefined,
    }
    onSave(newCamp)
    onClose()
  }

  const STEPS = [t.mktWizardStep1, t.mktWizardStep2, t.mktWizardStep3, t.mktWizardStep4] as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-[900px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Wizard header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-foreground">{t.mktWizardTitle}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 py-3 border-b border-border gap-0">
          {STEPS.map((s, i) => {
            const n = (i + 1) as WizardStep
            const done = step > n
            const active = step === n
            return (
              <div key={s} className="flex items-center">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : done ? "text-emerald-600" : "text-muted-foreground"
                )}>
                  <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0",
                    active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {done ? <Check className="w-3 h-3" /> : n}
                  </span>
                  {s}
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mx-1" />}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1: 대상자 */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {/* Target type tabs */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">{t.mktTargetTypeTitle}</p>
                <div className="flex gap-1 p-1 rounded-xl bg-muted border border-border mb-4">
                  {([
                    { id: "segment" as TargetType, label: t.mktTargetTabSegment, icon: Users },
                    { id: "group" as TargetType, label: t.mktTargetTabGroup, icon: Tag },
                  ]).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTargetTab(id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-all",
                        targetTab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Segment & FilterView tab */}
                {targetTab === "segment" && (
                  <div className="flex flex-col gap-4">
                    {/* Segments */}
                    <div>
                      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t.mktSegmentLabel}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {SEGMENTS.map(seg => {
                          const cnt = ALL_CUSTOMERS.filter(seg.filter).length
                          const isSelected = selectedSegment === seg.id && !selectedFilterView
                          return (
                            <button
                              key={seg.id}
                              onClick={() => { setSelectedSegment(seg.id); setSelectedFilterView("") }}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                              )}
                            >
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold", seg.color.replace("border", ""))}>
                                {cnt}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-foreground">{seg.label}</p>
                                <p className="text-[12px] text-muted-foreground">{seg.description}</p>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Filter views */}
                    <div>
                      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t.mktFilterViewLabel}</p>
                      <div className="flex flex-col gap-2">
                        {MARKETING_FILTER_VIEWS.map(fv => {
                          const isSelected = selectedFilterView === fv.id
                          return (
                            <button
                              key={fv.id}
                              onClick={() => { setSelectedFilterView(fv.id); setSelectedSegment("") }}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                              )}
                            >
                              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Filter className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <p className="text-[13px] font-medium text-foreground flex-1">{t[fv.labelKey]}</p>
                              {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Group tab */}
                {targetTab === "group" && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[12px] text-muted-foreground mb-1">{t.mktGroupTabDesc}</p>
                    {MARKETING_GROUPS.map(grp => {
                      const selected = selectedGroup === grp.id
                      const dotColor = GROUP_DOT_COLORS[grp.colorIdx]
                      return (
                        <button
                          key={grp.id}
                          onClick={() => setSelectedGroup(grp.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                          )}
                        >
                          <div className={cn("w-3 h-3 rounded-full flex-shrink-0", dotColor)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-foreground">{t[grp.nameKey]}</p>
                            <p className="text-[12px] text-muted-foreground truncate">{t[grp.descKey]}</p>
                          </div>
                          <span className="text-[12px] text-muted-foreground flex-shrink-0">{grp.memberCount} {t.mktMemberCount}</span>
                          {selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {hasTarget && (
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{t.mktSelectedTarget} <strong className="text-foreground">{targetLabel}</strong>
                    {targetTab === "segment" && <> · <strong className="text-foreground">{targetCount} {t.mktMemberCount}</strong></>}
                    {targetTab === "group" && <> · <strong className="text-foreground">{targetCount} {t.mktMemberCount}</strong></>}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: 채널 */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{t.mktChannelSelectTitle}</p>
                <p className="text-[12px] text-muted-foreground mb-3">{t.mktChannelSelectDesc}</p>
                <div className="flex flex-col gap-2">
                  {(Object.entries(CHANNEL_META) as [Channel, typeof CHANNEL_META[Channel]][]).map(([ch, meta]) => {
                    const selected = selectedChannels.includes(ch)
                    return (
                      <button
                        key={ch}
                        onClick={() => toggleChannel(ch)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", meta.color)}>
                          <meta.icon className="w-4 h-4" />
                        </span>
                        <span className="text-[13px] font-medium text-foreground">{meta.label}</span>
                        {selected && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{t.mktMsgTypeTitle}</p>
                <p className="text-[12px] text-muted-foreground mb-3">{t.mktMsgTypeTemplateDesc}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(MSG_TYPE_META) as [MessageType, typeof MSG_TYPE_META[MessageType]][]).map(([type, meta]) => {
                    const selected = messageType === type
                    const hasTemplate = type !== "custom"
                    return (
                      <button
                        key={type}
                        onClick={() => { setMessageType(type); if (type !== "custom") setMessage("") }}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                          selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          selected ? "bg-primary/10" : "bg-muted"
                        )}>
                          <meta.icon className={cn("w-4 h-4", selected ? "text-primary" : "text-muted-foreground")} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[13px] font-semibold", selected ? "text-primary" : "text-foreground")}>{meta.label}</p>
                          {hasTemplate && (
                            <span className="inline-flex items-center gap-0.5 mt-0.5 text-[12px] text-emerald-600 font-medium">
                              <Check className="w-3 h-3" />{t.mktTemplateProvided}
                            </span>
                          )}
                        </div>
                        {selected && <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Message Editor */}
          {step === 3 && (
            <div className="flex gap-4 h-[440px]">
              {/* Left: Editor */}
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{t.mktMsgEditorTitle}</p>
                  <p className="text-[12px] text-muted-foreground">{t.mktMsgEditorDesc}</p>
                </div>
                {messageType !== "custom" && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-[12px] text-emerald-700 font-medium">
                        {t.mktTemplateAppliedMsg}
                      </span>
                    </div>
                    <button
                      onClick={() => setMessage(MESSAGE_TEMPLATES[messageType as "coupon" | "survey" | "revisit"])}
                      className="text-[12px] text-emerald-600 font-semibold hover:underline flex-shrink-0 ml-2"
                    >
                      {t.mktTemplateReset}
                    </button>
                  </div>
                )}
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t.mktMsgEditorPlaceholder}
                  className="flex-1 px-3 py-2 text-[13px] rounded-xl border border-border bg-background text-foreground resize-none outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
                <div>
                  <p className="text-[12px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">{t.mktVarInsertLabel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLES.map(v => (
                      <button
                        key={v.var}
                        onClick={() => insertVariable(v.var)}
                        className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[12px] font-mono hover:bg-primary/20 transition-colors"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Preview customer selector */}
                <div className="flex items-center gap-2">
                  <p className="text-[12px] text-muted-foreground">{t.mktPreviewCustomer}</p>
                  <select
                    value={previewCustomer.id}
                    onChange={e => setPreviewCustomer(ALL_CUSTOMERS.find(c => c.id === e.target.value) ?? ALL_CUSTOMERS[0])}
                    className="text-[12px] border border-border rounded-lg px-2 py-1 bg-background text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    {ALL_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Right: Mobile Preview */}
              <div className="w-[220px] flex flex-col gap-2 flex-shrink-0">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">{t.mktLivePreview}</p>
                <div className="flex-1 bg-[#B2C4D7] rounded-2xl p-3 flex flex-col justify-start gap-2 overflow-hidden">
                  {/* Phone status bar */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] text-[#1a1a1a]/60 font-semibold">{t.mktVarStoreName}</span>
                    <span className="text-[8px] text-[#1a1a1a]/50">10:30</span>
                  </div>
                  {/* Message bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-full shadow-sm">
                    <p className="text-[12px] text-[#1a1a1a] leading-relaxed break-words whitespace-pre-wrap">
                      {message
                        ? resolvePreview(message, previewCustomer, t.mktVarStoreName)
                        : <span className="text-[#1a1a1a]/40 italic">{t.mktLivePreviewPlaceholder}</span>
                      }
                    </p>
                    <p className="text-[8px] text-[#1a1a1a]/40 text-right mt-1">{t.mktMsgRead}</p>
                  </div>
                  {messageType === "coupon" && message && (
                    <div className="bg-primary/90 rounded-xl px-3 py-2 text-center">
                      <p className="text-[12px] text-white font-bold">{t.mktMsgCouponBtn}</p>
                    </div>
                  )}
                  {messageType === "survey" && message && (
                    <div className="bg-white rounded-xl px-3 py-2 text-center border border-white/60">
                      <p className="text-[12px] text-primary font-bold">{t.mktMsgSurveyBtn}</p>
                    </div>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground text-center">
                  {CHANNEL_META[selectedChannels[0] ?? "kakao"].label} {t.mktChannelPreview}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Send Settings */}
          {step === 4 && (
            <div className="flex flex-col gap-4 max-w-lg">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{t.mktStep4CampaignName}</p>
                <input
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  placeholder={segment?.label ?? targetLabel}
                  className="w-full px-3 py-2 text-[13px] rounded-xl border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">{t.mktStep4SendMode}</p>
                <div className="flex flex-col gap-2">
                  {([
                    { mode: "immediate" as const, label: t.mktSendImmediate, icon: Send, desc: t.mktSendImmediateDesc },
                    { mode: "scheduled" as const, label: t.mktSendScheduled, icon: Clock, desc: t.mktSendScheduledDesc },
                  ]).map(({ mode, label, icon: Icon, desc }) => (
                    <button
                      key={mode}
                      onClick={() => setSendMode(mode)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                        sendMode === mode ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", sendMode === mode ? "text-primary" : "text-muted-foreground")} />
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{label}</p>
                        <p className="text-[12px] text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {sendMode === "scheduled" && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="mt-2 w-full text-[12px] border border-border rounded-xl px-3 py-2 bg-background text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                )}
              </div>
              {/* Summary */}
              <div className="rounded-xl border border-border p-3 bg-muted/30 flex flex-col gap-1.5 text-[12px]">
                <p className="font-semibold text-foreground mb-1">{t.mktCampaignSummary}</p>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.mktSummaryTarget}</span><TargetBadge targetType={resolvedTargetType} targetLabel={targetLabel} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t.mktSummaryExpected}</span><span className="font-medium text-foreground">{targetCount} {t.mktMemberCount}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.mktSummaryChannel}</span><div className="flex gap-1">{selectedChannels.map(ch => <ChannelBadge key={ch} channel={ch} />)}</div></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t.mktSummaryType}</span><span className="font-medium text-foreground">{MSG_TYPE_META[messageType].label}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <button
            onClick={() => step > 1 ? setStep((step - 1) as WizardStep) : onClose()}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            {step === 1 ? t.mktCancelBtn : t.mktPrevBtn}
          </button>
          <button
            disabled={!canNext()}
            onClick={() => step < 4 ? handleNext() : handleSave()}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all",
              canNext()
                ? step === 4
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {step === 4
              ? sendMode === "immediate"
                ? <><Send className="w-4 h-4" />{t.mktSaveAndSend}</>
                : <><Clock className="w-4 h-4" />{t.mktSaveScheduled}</>
              : <>{t.mktNextBtn}<ChevronRight className="w-4 h-4" /></>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Coupon Manager ──────────────────────���──────────────────────────────────

function CouponManager({ coupons, onAdd, onSelect }: { coupons: Coupon[]; onAdd: (c: Coupon) => void; onSelect: (c: Coupon) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: "", discount: "", type: "percent" as "percent" | "amount", validDays: 30, manualIssuable: true })

  const handleCreate = () => {
    if (!form.code || !form.discount) return
    onAdd({
      id: `coup-${Date.now()}`,
      code: form.code.toUpperCase(),
      discount: form.type === "percent" ? `${form.discount}%` : `₩${parseInt(form.discount).toLocaleString()}`,
      type: form.type,
      validDays: form.validDays,
      manualIssuable: form.manualIssuable,
      usedCount: 0,
      totalIssued: 0,
    })
    setOpen(false)
    setForm({ code: "", discount: "", type: "percent", validDays: 30, manualIssuable: true })
  }

  const { t } = useLocale()
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] md:text-[13px] font-semibold text-foreground">{t.mktCouponListTitle}</p>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[12px] md:text-[12px] font-medium hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />{t.mktCouponCreateBtn}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {coupons.map(c => (
          <div key={c.id} onClick={() => onSelect(c)} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors gap-2 md:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 md:w-9 h-8 md:h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Gift className="w-3.5 md:w-4 h-3.5 md:h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  <code className="text-[12px] md:text-[12px] font-bold text-foreground">{c.code}</code>
                  <span className="text-[12px] md:text-[12px] font-semibold text-primary">{c.discount} {t.mktCouponDiscountLabel}</span>
                  {c.manualIssuable && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] md:text-[12px] bg-blue-100 text-blue-700 font-medium">{t.mktCouponManualBadge}</span>
                  )}
                </div>
                <p className="text-[12px] md:text-[12px] text-muted-foreground">{c.validDays}d · {t.mktCouponUsageUnit} {c.usedCount}/{c.totalIssued}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 ml-11 md:ml-0">
              <div className="h-1.5 w-16 md:w-20 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: c.totalIssued > 0 ? `${(c.usedCount / c.totalIssued) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-[12px] md:text-[12px] text-muted-foreground">
                {c.totalIssued > 0 ? Math.round((c.usedCount / c.totalIssued) * 100) : 0}%
              </span>
              <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-xl p-5 w-[340px] flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{t.mktCouponCreateTitle}</p>
              <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-lg transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
            <input placeholder={t.mktCouponCodePlaceholder} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              className="px-3 py-2 text-[12px] rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary font-mono uppercase" />
            <div className="flex gap-2">
              <input placeholder={t.mktCouponDiscountPlaceholder} type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                className="flex-1 px-3 py-2 text-[12px] rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary" />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "percent" | "amount" }))}
                className="px-2 py-2 text-[12px] rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary">
                <option value="percent">%</option>
                <option value="amount">₩</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">{t.mktCouponValidDaysLabel}</span>
              <input type="number" value={form.validDays} onChange={e => setForm(f => ({ ...f, validDays: parseInt(e.target.value) }))}
                className="w-16 px-2 py-1 text-[12px] rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <label className="flex items-center gap-2 text-[12px] text-foreground cursor-pointer">
              <input type="checkbox" checked={form.manualIssuable} onChange={e => setForm(f => ({ ...f, manualIssuable: e.target.checked }))} className="accent-primary" />
              {t.mktCouponManualIssuableLabel}
            </label>
            <button onClick={handleCreate} className="py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:opacity-90 transition-opacity">
              {t.mktCouponCreateBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──��───────────────────────────────────────────────────────────

export function MarketingPage({ storeId }: { storeId: string }) {
  const { t, locale } = useLocale()
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    () => getCampaignsByStore(locale, storeId) as Campaign[]
  )
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS)
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS)
  const [showWizard, setShowWizard] = useState(false)
  const [showAutomationWizard, setShowAutomationWizard] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [selectedAnalyticsCampaign, setSelectedAnalyticsCampaign] = useState<Campaign | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all")
  const [activeTab, setActiveTab] = useState<"campaigns" | "triggers" | "coupons" | "analytics">("campaigns")

  // Reset campaigns when storeId or locale changes
  useEffect(() => {
    setCampaigns(getCampaignsByStore(locale, storeId) as Campaign[])
    setSelectedCampaign(null)
  }, [storeId, locale])
  const SEGMENTS = makeSegments(t)
  const STATUS_META = makeStatusMeta(t)
  const TRIGGER_META = makeTriggerMeta(t)

  const filtered = useMemo(() => campaigns.filter(c => {
    const matchStatus = statusFilter === "all" || c.status === statusFilter
    const matchSearch = c.name.includes(search) || c.targetLabel?.includes(search) || SEGMENTS.find(s => s.id === c.segmentId)?.label.includes(search)
    return matchStatus && matchSearch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [campaigns, search, statusFilter, t])

  const regularCampaigns = filtered

  const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0)
  const avgOpen = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + c.openRate, 0) / campaigns.length) : 0
  const avgClick = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + c.clickRate, 0) / campaigns.length) : 0
  const avgRedemption = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + c.redemptionRate, 0) / campaigns.length) : 0

  const toggleStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id
      ? { ...c, status: c.status === "active" ? "paused" : "active" }
      : c
    ))
  }

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id
      ? { ...a, status: a.status === "active" ? "paused" : "active" }
      : a
    ))
  }

  const deleteAutomation = (id: string) => setAutomations(prev => prev.filter(a => a.id !== id))

  const deleteCampaign = (id: string) => setCampaigns(prev => prev.filter(c => c.id !== id))

  const TABS = [
    { id: "campaigns" as const, label: t.mktTabCampaigns, icon: Megaphone },
    { id: "triggers" as const, label: t.mktTabTriggers, icon: Zap },
    { id: "coupons" as const, label: t.mktTabCoupons, icon: Gift },
    { id: "analytics" as const, label: t.mktTabAnalytics, icon: BarChart2 },
  ]

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-4 gap-3 border-b border-border bg-card">
        <div>
          <h1 className="text-base md:text-lg font-bold text-foreground">{t.mktPageTitle}</h1>
          <p className="text-[12px] text-muted-foreground">{t.mktPageDesc}</p>
        </div>
        {activeTab === "triggers" ? (
          <button
            onClick={() => setShowAutomationWizard(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-sm w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />{t.mktNewAutomation}
          </button>
        ) : (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-sm w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />{t.mktNewCampaign}
          </button>
        )}
      </div>

      {/* Tab bar - above metrics */}
      <div className="flex border-b border-border px-4 md:px-6 bg-card overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-1 md:gap-1.5 text-[12px] md:text-[12px] font-medium px-2.5 md:px-3 py-2.5 md:py-3 border-b-2 transition-colors whitespace-nowrap",
              activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── 캠페인 탭 ── */}
        {activeTab === "campaigns" && (
          <div className="p-4 md:p-6 flex flex-col gap-4">
            {/* Campaign metrics */}
            {(() => {
              const activeCnt = campaigns.filter(c => c.status === "active").length
              const scheduledCnt = campaigns.filter(c => c.status === "scheduled").length
              const completedCnt = campaigns.filter(c => c.status === "completed").length
              const topOpenRate = campaigns.length ? Math.max(...campaigns.map(c => c.openRate)) : 0
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                  <StatCard label={t.mktStatAllCampaigns}    value={campaigns.length.toString()} sub={t.mktStatAllCampaignsSub}                                                    icon={Megaphone}        trend={0} />
                  <StatCard label={t.mktStatActiveCampaigns} value={activeCnt.toString()}         sub={t.mktStatActiveCampaignsSub}                                                icon={Play}             trend={0} />
                  <StatCard label={t.mktStatTotalSent}       value={totalSent.toLocaleString()}   sub={t.mktStatTotalSentSub}                                                      icon={Send}             trend={12} />
                  <StatCard label={t.mktStatAvgOpen}         value={`${avgOpen}%`}               sub={t.mktStatAvgOpenSub}                                                        icon={Eye}              trend={3} />
                  <StatCard label={t.mktStatAvgClick}        value={`${avgClick}%`}              sub={t.mktStatAvgClickSub}                                                       icon={MousePointerClick} trend={-2} />
                  <StatCard label={t.mktStatTopOpen}         value={`${topOpenRate}%`}            sub={`${t.mktStatReserved} ${scheduledCnt} · ${t.mktStatCompleted} ${completedCnt}`} icon={TrendingUp}  trend={0} />
                </div>
              )
            })()}
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-2">
              <div className="relative w-full md:flex-1 md:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t.mktCampaignSearch}
                  className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
                {(["all", "active", "paused", "scheduled", "draft", "completed"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap flex-shrink-0",
                      statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {s === "all" ? t.mktCampaignAll : STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign table - Desktop */}
            <div className="hidden md:block rounded-xl border border-border overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[t.mktCampaignTableName, t.mktCampaignTableStatus, t.mktCampaignTableTarget, t.mktCampaignTableChannel, t.mktCampaignTableSent, t.mktCampaignTableOpenRate, t.mktCampaignTableClickRate, ""].map(h => (
                      <th key={h} className="py-2.5 px-4 text-left text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {regularCampaigns.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-[12px] text-muted-foreground">{t.mktCampaignEmpty}</td></tr>
                  ) : regularCampaigns.map(c => (
                    <tr key={c.id} onClick={() => setSelectedCampaign(c)} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-[12px] font-semibold text-foreground">{c.name}</p>
                          <p className="text-[12px] text-muted-foreground">{c.createdAt} {t.mktCampaignCreatedAt}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-0.5 rounded-full text-[12px] font-semibold", STATUS_META[c.status].color)}>
                          {STATUS_META[c.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4"><TargetBadge targetType={c.targetType ?? "segment"} targetLabel={c.targetLabel ?? c.segmentId} /></td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">{c.channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}</div>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-foreground font-medium">{c.sentCount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${c.openRate}%` }} />
                          </div>
                          <span className="text-[12px] text-foreground">{c.openRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.clickRate}%` }} />
                          </div>
                          <span className="text-[12px] text-foreground">{c.clickRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => toggleStatus(c.id)}
                            title={c.status === "active" ? t.mktPauseBtn : t.mktResumeBtn}
                            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            {c.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteCampaign(c.id)}
                            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Campaign cards - Mobile */}
            <div className="md:hidden flex flex-col gap-3">
              {regularCampaigns.length === 0 ? (
                <div className="py-10 text-center text-[12px] text-muted-foreground bg-card rounded-xl border border-border">{t.mktCampaignEmpty}</div>
              ) : regularCampaigns.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCampaign(c)}
                  className="bg-card border border-border rounded-xl p-4 active:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{c.name}</p>
                      <p className="text-[12px] text-muted-foreground">{c.createdAt} {t.mktCampaignCreatedAt}</p>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[12px] font-semibold ml-2 flex-shrink-0", STATUS_META[c.status].color)}>
                      {STATUS_META[c.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <TargetBadge targetType={c.targetType ?? "segment"} targetLabel={c.targetLabel ?? c.segmentId} />
                    <div className="flex gap-1">{c.channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}</div>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">{t.mktCampaignTableSent}: <span className="text-foreground font-medium">{c.sentCount}</span></span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${c.openRate}%` }} />
                        </div>
                        <span className="text-foreground font-medium">{c.openRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[12px] text-muted-foreground">{regularCampaigns.length} {t.mktCampaignRowHint}</p>
          </div>
        )}

        {/* ── 자동화 트리거 탭 ── */}
        {activeTab === "triggers" && (
          <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-5">
            {/* Trigger metrics */}
            {(() => {
              const activeCnt = automations.filter(a => a.status === "active").length
              const pausedCnt = automations.filter(a => a.status === "paused").length
              const totalAutoSent = automations.reduce((s, a) => s + a.sentCount, 0)
              const usedEvents = new Set(automations.filter(a => a.status === "active").map(a => a.triggerEvent)).size
              const totalEvents = Object.keys(TRIGGER_META).length
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                  <StatCard label={t.mktAutoStatAllRules}      value={automations.length.toString()}                                                                          sub={t.mktAutoStatAllRulesSub}     icon={Zap}           trend={0} />
                  <StatCard label={t.mktAutoStatActiveRules}   value={activeCnt.toString()}                                                                                   sub={t.mktAutoStatActiveRulesSub}  icon={Play}          trend={0} />
                  <StatCard label={t.mktAutoStatPausedRules}   value={pausedCnt.toString()}                                                                                   sub={t.mktAutoStatPausedRulesSub}  icon={Pause}         trend={0} />
                  <StatCard label={t.mktAutoStatTotalSent}     value={totalAutoSent.toLocaleString()}                                                                         sub={t.mktAutoStatTotalSentSub}    icon={Send}          trend={15} />
                  <StatCard label={t.mktAutoStatActiveTriggers} value={`${usedEvents}`}                                                                                       sub={t.mktAutoStatActiveTriggersSubOf.replace("{total}", String(totalEvents))} icon={AlertCircle} trend={0} />
                  <StatCard label={t.mktAutoStatAvgSent}       value={automations.length ? Math.round(totalAutoSent / automations.length).toLocaleString() : "0"}            sub={t.mktStatSentUnit}            icon={TrendingUp}    trend={0} />
                </div>
              )
            })()}
            {/* Explanation banner */}
            <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl bg-amber-50 border border-amber-200">
              <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] md:text-[12px] font-semibold text-amber-800">{t.mktAutoBannerTitle}</p>
                <p className="text-[12px] md:text-[12px] text-amber-700 mt-0.5">{t.mktAutoBannerDesc}</p>
              </div>
            </div>

            {/* Automation list */}
            <div className="flex flex-col gap-3">
              {automations.map(a => {
                const triggerLabel = TRIGGER_META[a.triggerEvent]
                const isActive = a.status === "active"
                return (
                  <div key={a.id} onClick={() => setSelectedAutomation(a)} className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-border bg-card group cursor-pointer hover:bg-muted/20 transition-colors">
                    {/* Header row for mobile */}
                    <div className="flex items-start gap-3 md:contents">
                      {/* Trigger icon */}
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        isActive ? "bg-amber-100" : "bg-muted"
                      )}>
                        <Zap className={cn("w-5 h-5", isActive ? "text-amber-600" : "text-muted-foreground")} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[12px] md:text-[13px] font-semibold text-foreground truncate">{a.name}</p>
                          <span className={cn("px-1.5 py-0.5 rounded-full text-[12px] font-bold flex-shrink-0",
                            isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                          )}>
                            {isActive ? t.mktAutomationStatusActive : t.mktAutomationStatusPaused}
                          </span>
                        </div>

                        {/* Trigger event → visual flow */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[12px] font-semibold border border-amber-200">
                            <Zap className="w-2.5 h-2.5" />{triggerLabel}
                          </span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          <span className="flex gap-1">{a.channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}</span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          <TargetBadge targetType={a.targetType} targetLabel={a.targetLabel} />
                        </div>

                        <p className="text-[12px] md:text-[12px] text-muted-foreground line-clamp-1 italic hidden md:block">"{a.message.slice(0, 70)}..."</p>
                      </div>

                      {/* Right side: stats - mobile inline */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 md:hidden">
                        <p className="text-[13px] font-bold text-foreground">{a.sentCount.toLocaleString()}</p>
                        <p className="text-[12px] text-muted-foreground">{t.mktAutoSentCount}</p>
                      </div>
                    </div>

                    {/* Mobile action row */}
                    <div className="flex items-center justify-between md:hidden" onClick={e => e.stopPropagation()}>
                      <p className="text-[12px] text-muted-foreground line-clamp-1 italic flex-1 min-w-0 mr-2">"{a.message.slice(0, 40)}..."</p>
                      <button
                        onClick={() => toggleAutomation(a.id)}
                        className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors",
                          isActive
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {isActive ? <><Pause className="w-3 h-3" />{t.mktPauseBtn}</> : <><Play className="w-3 h-3" />{t.mktResumeBtn}</>}
                      </button>
                    </div>

                    {/* Desktop right side */}
                    <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-foreground">{a.sentCount.toLocaleString()}</p>
                        <p className="text-[12px] text-muted-foreground">{t.mktAutoSentCount}</p>
                      </div>
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleAutomation(a.id)}
                          className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors",
                            isActive
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          )}
                        >
                          {isActive ? <><Pause className="w-3 h-3" />{t.mktPauseBtn}</> : <><Play className="w-3 h-3" />{t.mktResumeBtn}</>}
                        </button>
                        <button
                          onClick={() => deleteAutomation(a.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {automations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Zap className="w-10 h-10 opacity-20" />
                  <p className="text-[13px] font-medium">{t.mktAutoEmpty}</p>
                  <button
                    onClick={() => setShowAutomationWizard(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-[12px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />{t.mktAutoCreateFirst}
                  </button>
                </div>
              )}
            </div>

            {/* Trigger event reference card */}
            <div className="rounded-xl border border-border p-3 md:p-4 bg-muted/20">
              <p className="text-[12px] md:text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t.mktAutoTriggerRef}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(Object.entries(TRIGGER_META) as [TriggerEvent, string][]).map(([k, v]) => {
                  const inUse = automations.some(a => a.triggerEvent === k && a.status === "active")
                  return (
                    <div key={k} className="flex items-center justify-between gap-2 text-[12px]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", inUse ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                        {v}
                      </div>
                      {inUse && <span className="text-[12px] text-emerald-600 font-semibold">{t.mktAutoTriggerInUse}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 쿠폰 탭 ── */}
        {activeTab === "coupons" && (
          <div className="p-4 md:p-6 flex flex-col gap-4">
            {/* Coupon metrics */}
            {(() => {
              const totalIssued = coupons.reduce((s, c) => s + c.totalIssued, 0)
              const totalUsed = coupons.reduce((s, c) => s + c.usedCount, 0)
              const usageRate = totalIssued > 0 ? Math.round((totalUsed / totalIssued) * 100) : 0
              const manualCnt = coupons.filter(c => c.manualIssuable).length
              const percentCoupons = coupons.filter(c => c.type === "percent")
              const avgDiscount = percentCoupons.length
                ? Math.round(percentCoupons.reduce((s, c) => s + (parseFloat(c.discount) || 0), 0) / percentCoupons.length)
                : 0
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                  <StatCard label={t.mktCouponStatAll}       value={coupons.length.toString()}     sub={t.mktCouponStatAllSub}       icon={Gift}      trend={0} />
                  <StatCard label={t.mktCouponStatIssued}    value={totalIssued.toLocaleString()}  sub={t.mktCouponStatIssuedSub}    icon={Ticket}    trend={5} />
                  <StatCard label={t.mktCouponStatUsed}      value={totalUsed.toLocaleString()}    sub={t.mktCouponStatUsedSub}      icon={Check}     trend={8} />
                  <StatCard label={t.mktCouponStatUsageRate} value={`${usageRate}%`}              sub={t.mktCouponStatUsageRateSub} icon={TrendingUp} trend={3} />
                  <StatCard label={t.mktCouponStatManual}    value={manualCnt.toString()}          sub={t.mktCouponStatManualSub}    icon={Users}     trend={0} />
                  <StatCard label={t.mktCouponStatAvgDiscount} value={`${avgDiscount}%`}          sub={t.mktCouponStatAvgDiscountSub} icon={Percent} trend={0} />
                </div>
              )
            })()}
            <CouponManager coupons={coupons} onAdd={c => setCoupons(prev => [...prev, c])} onSelect={c => setSelectedCoupon(c)} />
          </div>
        )}

        {/* ── 성과 분석 탭 ── */}
        {activeTab === "analytics" && (
          <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
            {/* Analytics overview metrics */}
            {(() => {
              const totalAutoSent = automations.reduce((s, a) => s + a.sentCount, 0)
              const allSent = totalSent + totalAutoSent
              const topCampaign = [...campaigns].sort((a, b) => b.openRate - a.openRate)[0]
              const couponUsageRate = (() => {
                const ti = coupons.reduce((s, c) => s + c.totalIssued, 0)
                const tu = coupons.reduce((s, c) => s + c.usedCount, 0)
                return ti > 0 ? Math.round((tu / ti) * 100) : 0
              })()
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                  <StatCard label={t.mktAnalyticsCampaignSent} value={totalSent.toLocaleString()}     sub={t.mktAnalyticsCampaignSentSub} icon={Send}             trend={12} />
                  <StatCard label={t.mktAnalyticsAutoSent}     value={totalAutoSent.toLocaleString()} sub={t.mktAnalyticsAutoSentSub}     icon={Zap}              trend={15} />
                  <StatCard label={t.mktAnalyticsTotalSent}    value={allSent.toLocaleString()}       sub={t.mktAnalyticsTotalSentSub}    icon={Megaphone}        trend={13} />
                  <StatCard label={t.mktAnalyticsAvgOpen}      value={`${avgOpen}%`}                 sub={t.mktAnalyticsAvgOpenSub}      icon={Eye}              trend={3} />
                  <StatCard label={t.mktAnalyticsAvgClick}     value={`${avgClick}%`}                sub={t.mktAnalyticsAvgClickSub}     icon={MousePointerClick} trend={-2} />
                  <StatCard label={t.mktAnalyticsCouponUsage}  value={`${couponUsageRate}%`}         sub={topCampaign ? `${t.mktAnalyticsTopOpen} ${topCampaign.openRate}%` : t.mktAnalyticsVsIssued} icon={Ticket} trend={8} />
                </div>
              )
            })()}
            {/* Automation performance summary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <p className="text-[12px] md:text-[13px] font-semibold text-foreground">{t.mktAnalyticsAutoSection}</p>
              </div>
              <div className="flex flex-col gap-2">
                {automations.map(a => (
                  <div key={a.id} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-xl border border-border bg-card">
                    <div className={cn("w-7 md:w-8 h-7 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0", a.status === "active" ? "bg-amber-100" : "bg-muted")}>
                      <Zap className={cn("w-3.5 md:w-4 h-3.5 md:h-4", a.status === "active" ? "text-amber-600" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] md:text-[12px] font-semibold text-foreground truncate">{a.name}</p>
                      <span className="text-[12px] md:text-[12px] text-amber-700 font-medium">{TRIGGER_META[a.triggerEvent]}</span>
                    </div>
                    <span className={cn("text-[8px] md:text-[12px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 hidden md:inline",
                      a.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                    )}>{a.status === "active" ? t.mktAutomationStatusActive : t.mktAutomationStatusPaused}</span>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[12px] md:text-[13px] font-bold text-foreground">{a.sentCount.toLocaleString()}</p>
                      <p className="text-[8px] md:text-[12px] text-muted-foreground">{t.mktAutoSentCount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border" />

            <p className="text-[12px] md:text-[13px] font-semibold text-foreground">{t.mktAnalyticsCampaignSection}</p>

            <div className="flex flex-col gap-3">
              {campaigns.map(c => {
                const seg = SEGMENTS.find(s => s.id === c.segmentId)
                return (
                  <div key={c.id} onClick={() => setSelectedAnalyticsCampaign(c)} className="p-3 md:p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[12px] md:text-[12px] font-semibold text-foreground truncate">{c.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 md:gap-1.5">
                          {c.channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}
                          <TargetBadge targetType={c.targetType ?? "segment"} targetLabel={c.targetLabel ?? c.segmentId} />
                        </div>
                      </div>
                      <span className={cn("text-[12px] md:text-[12px] font-semibold px-1.5 md:px-2 py-0.5 rounded-full flex-shrink-0 ml-2", STATUS_META[c.status].color)}>
                        {STATUS_META[c.status].label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                      {[
                        { label: t.mktAnalyticsMetricSent, value: c.sentCount,             color: "bg-slate-200" },
                        { label: t.mktOpenRate,            value: `${c.openRate}%`,        color: "bg-primary" },
                        { label: t.mktClickRate,           value: `${c.clickRate}%`,       color: "bg-emerald-500" },
                        { label: t.mktConversionRate,      value: `${c.redemptionRate}%`,  color: "bg-amber-400" },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[8px] md:text-[12px] text-muted-foreground">{m.label}</span>
                            <span className="text-[12px] md:text-[12px] font-bold text-foreground">{m.value}</span>
                          </div>
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full", m.color)}
                              style={{ width: typeof m.value === "number" ? `${Math.min((m.value / 20) * 100, 100)}%` : `${parseFloat(m.value)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>


          </div>
        )}

      </div>

      {/* Campaign Wizard Modal */}
      {showWizard && (
        <CampaignWizard
          onClose={() => setShowWizard(false)}
          onSave={camp => { setCampaigns(prev => [...prev, camp]); setShowWizard(false) }}
        />
      )}
      {showAutomationWizard && (
        <AutomationWizard
          onClose={() => setShowAutomationWizard(false)}
          onSave={auto => { setAutomations(prev => [...prev, auto]); setShowAutomationWizard(false) }}
        />
      )}

      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onToggle={() => toggleStatus(selectedCampaign.id)}
          onDelete={() => deleteCampaign(selectedCampaign.id)}
        />
      )}
      {selectedAutomation && (
        <AutomationDetailModal
          automation={selectedAutomation}
          onClose={() => setSelectedAutomation(null)}
          onToggle={() => toggleAutomation(selectedAutomation.id)}
          onDelete={() => deleteAutomation(selectedAutomation.id)}
        />
      )}
      {selectedCoupon && (
        <CouponDetailModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
        />
      )}
      {selectedAnalyticsCampaign && (
        <AnalyticsCampaignDetailModal
          campaign={selectedAnalyticsCampaign}
          onClose={() => setSelectedAnalyticsCampaign(null)}
        />
      )}
    </div>
  )
}
