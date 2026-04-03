"use client"

import React, { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { customers, additionalCustomers, customerReservations, customerOrders, customerReviews, sessions } from "@/lib/data"
import {
  saudiSessionsEn, saudiSessionsAr, saudiCustomersEn, saudiCustomersAr,
  saudiCustomerReservationsEn, saudiCustomerReservationsAr,
  saudiCustomerOrdersEn, saudiCustomerOrdersAr,
  saudiCustomerReviewsEn, saudiCustomerReviewsAr,
} from "@/lib/data-saudi"
import { useLocale } from "@/lib/locale"
import type { Customer } from "@/lib/data"
import {
  Search, Download, Plus,
  Star, MessageCircle, ShoppingBag, CalendarDays,
  Minus, Tag, Send, Gift, ClipboardList,
  X, CheckSquare, Square,
  Smile, Frown, Activity,
  Users, Crown, UserCheck, UserX, Wallet, Pencil,
  ChevronUp, ChevronDown, ChevronsUpDown, SlidersHorizontal,
  BookmarkPlus, Bookmark, Trash2,
  Layers, List, Filter, ChevronRight, ChevronLeft, UserPlus, Edit2, Check,
} from "lucide-react"

const allCustomers = Object.values({ ...customers, ...additionalCustomers })

const gradeOrder: Record<string, number> = { VIP: 0, "일반": 1, "신규": 2, "": 3 }

function sentimentIcon(s: Customer["sentiment"]) {
  if (s === "positive") return <Smile className="w-3.5 h-3.5 text-emerald-500" />
  if (s === "negative") return <Frown className="w-3.5 h-3.5 text-destructive" />
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />
}

// sentimentLabel is now provided through useLocale t.sentimentPositive/Neutral/Negative

function gradeBadge(grade?: string, labels?: { vip: string; new: string; regular: string }) {
  const l = labels ?? { vip: "VIP", new: "신규", regular: "일반" }
  if (grade === "VIP") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[12px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <Crown className="w-2.5 h-2.5" />{l.vip}
    </span>
  )
  if (grade === "신규") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[12px] font-bold bg-primary/10 text-primary border border-primary/20">
      {l.new}
    </span>
  )
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[12px] font-medium bg-muted text-muted-foreground border border-border">
      {grade || l.regular}
    </span>
  )
}

function ltvNum(ltv?: string) {
  if (!ltv) return 0
  return parseInt(ltv.replace(/[^\d]/g, ""), 10) || 0
}

// Helper to translate gender values from any language to current locale
type TranslationKeys = ReturnType<typeof useLocale>["t"]
function translateGender(gender: string | undefined, t: TranslationKeys): string {
  if (!gender) return ""
  const lowerGender = gender.toLowerCase()
  if (lowerGender === "male" || lowerGender === "남성" || lowerGender === "ذكر") {
    return t.infoGenderMale
  }
  if (lowerGender === "female" || lowerGender === "여성" || lowerGender === "أنثى") {
    return t.infoGenderFemale
  }
  return gender
}

// ── Customer Groups ──
type GroupCondition = {
  field: "grade" | "sentiment" | "ltv" | "tickets" | "tags" | "joinedAt"
  op: "is" | "is_not" | "gte" | "lte" | "contains"
  value: string
}

type CustomerGroup = {
  id: string
  name: string
  description: string
  colorIdx: number
  conditions: GroupCondition[]
  pinnedIds: string[]   // manually added member IDs (bypasses conditions)
  createdAt: string
}

const GROUP_PALETTE = [
  { dot: "bg-blue-500",    pill: "bg-blue-50 text-blue-700 border-blue-200",    active: "bg-blue-50 border-blue-300" },
  { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", active: "bg-emerald-50 border-emerald-300" },
  { dot: "bg-amber-500",   pill: "bg-amber-50 text-amber-700 border-amber-200",   active: "bg-amber-50 border-amber-300" },
  { dot: "bg-violet-500",  pill: "bg-violet-50 text-violet-700 border-violet-200",  active: "bg-violet-50 border-violet-300" },
  { dot: "bg-rose-500",    pill: "bg-rose-50 text-rose-700 border-rose-200",    active: "bg-rose-50 border-rose-300" },
  { dot: "bg-cyan-500",    pill: "bg-cyan-50 text-cyan-700 border-cyan-200",    active: "bg-cyan-50 border-cyan-300" },
]

type TranslationKeys = ReturnType<typeof useLocale>["t"]
function makeInitialGroups(t: TranslationKeys): CustomerGroup[] {
  return [
    {
      id: "grp-1",
      name: t.custGrpVipName,
      description: t.custGrpVipDesc,
      colorIdx: 0,
      conditions: [
        { field: "grade", op: "is", value: "VIP" },
        { field: "ltv", op: "gte", value: "1000000" },
      ],
      pinnedIds: [],
      createdAt: "2025-01-10",
    },
    {
      id: "grp-2",
      name: t.custGrpChurnName,
      description: t.custGrpChurnDesc,
      colorIdx: 4,
      conditions: [
        { field: "sentiment", op: "is", value: "negative" },
        { field: "tickets", op: "gte", value: "1" },
      ],
      pinnedIds: [],
      createdAt: "2025-01-15",
    },
    {
      id: "grp-3",
      name: t.custGrpNewName,
      description: t.custGrpNewDesc,
      colorIdx: 1,
      conditions: [
        { field: "grade", op: "is", value: t.custGradeNew },
      ],
      pinnedIds: [],
      createdAt: "2025-01-20",
    },
  ]
}

// FIELD_LABELS, OP_LABELS, SENTIMENT_LABELS, FIELD_OPTIONS are now locale-aware (generated inside CustomerGroupsPanel)
function makeFieldOptions(t: TranslationKeys): Record<GroupCondition["field"], { op: GroupCondition["op"][]; values?: string[] }> {
  return {
    grade:     { op: ["is", "is_not"],   values: ["VIP", t.custGradeRegular ?? "Regular", t.custGradeNew] },
    sentiment: { op: ["is", "is_not"],   values: ["positive", "neutral", "negative"] },
    ltv:       { op: ["gte", "lte"],     values: [] },
    tickets:   { op: ["gte", "lte"],     values: [] },
    tags:      { op: ["contains"],       values: [] },
    joinedAt:  { op: ["gte", "lte"],     values: [] },
  }
}

function formatConditionValue(cond: GroupCondition, sentimentLabels: Record<string, string>, currencySymbol: string): string {
  if (cond.field === "sentiment") return sentimentLabels[cond.value] ?? cond.value
  if (cond.field === "ltv") {
    const n = parseInt(cond.value)
    return isNaN(n) ? cond.value : `${n.toLocaleString()}${currencySymbol}`
  }
  return cond.value
}

function applyGroupConditions(customers: any[], conditions: GroupCondition[], pinnedIds: string[] = []): any[] {
  const pinnedSet = new Set(pinnedIds)
  return customers.filter(c => {
    if (pinnedSet.has(c.id)) return true
    if (conditions.length === 0 && pinnedIds.length === 0) return false
    return conditions.every(cond => {
    if (cond.field === "grade") {
      const grade = c.grade ?? "일반"
      return cond.op === "is" ? grade === cond.value : grade !== cond.value
    }
    if (cond.field === "sentiment") {
      return cond.op === "is" ? c.sentiment === cond.value : c.sentiment !== cond.value
    }
    if (cond.field === "ltv") {
      const v = ltvNum(c.ltv)
      return cond.op === "gte" ? v >= parseFloat(cond.value) : v <= parseFloat(cond.value)
    }
    if (cond.field === "tickets") {
      return cond.op === "gte" ? (c.totalTickets ?? 0) >= parseFloat(cond.value) : (c.totalTickets ?? 0) <= parseFloat(cond.value)
    }
    if (cond.field === "tags") {
      return (c.tags ?? []).some((t: string) => t.toLowerCase().includes(cond.value.toLowerCase()))
    }
    if (cond.field === "joinedAt") {
      const d = c.joinedAt ?? ""
      return cond.op === "gte" ? d >= cond.value : d <= cond.value
    }
    return true
    })
  })
}

function ConditionRow({
  cond, index, onChange, onDelete, fieldLabels, opLabels, sentimentLabels,
}: {
  cond: GroupCondition
  index: number
  onChange: (idx: number, c: GroupCondition) => void
  onDelete: (idx: number) => void
  fieldLabels: Record<string, string>
  opLabels: Record<string, string>
  sentimentLabels: Record<string, string>
}) {
  const { t } = useLocale()
  const FIELD_OPTIONS = makeFieldOptions(t)
  const fieldOpts = FIELD_OPTIONS[cond.field]
  const selectCls = "bg-background border border-border rounded-lg px-2.5 py-2 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-background border border-border shadow-sm group">
      {/* Badge */}
      <div className="flex-shrink-0">
        {index === 0
          ? <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[12px] font-bold tracking-wide">IF</span>
          : <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[12px] font-bold tracking-wide">AND</span>
        }
      </div>

      {/* Field */}
      <select
        value={cond.field}
        onChange={e => onChange(index, { ...cond, field: e.target.value as GroupCondition["field"], op: FIELD_OPTIONS[e.target.value as GroupCondition["field"]].op[0], value: "" })}
        className={selectCls}
      >
        {(Object.keys(fieldLabels) as GroupCondition["field"][]).map(f => (
          <option key={f} value={f}>{fieldLabels[f]}</option>
        ))}
      </select>

      {/* Op */}
      <select
        value={cond.op}
        onChange={e => onChange(index, { ...cond, op: e.target.value as GroupCondition["op"] })}
        className={selectCls}
      >
        {fieldOpts.op.map(o => (
          <option key={o} value={o}>{opLabels[o]}</option>
        ))}
      </select>

      {/* Value */}
      {fieldOpts.values && fieldOpts.values.length > 0 ? (
        <select
          value={cond.value}
          onChange={e => onChange(index, { ...cond, value: e.target.value })}
          className={cn(selectCls, "flex-1")}
        >
          <option value="">...</option>
          {fieldOpts.values.map(v => (
            <option key={v} value={v}>{cond.field === "sentiment" ? sentimentLabels[v] ?? v : v}</option>
          ))}
        </select>
      ) : (
        <input
          type={cond.field === "joinedAt" ? "date" : "text"}
          value={cond.value}
          onChange={e => onChange(index, { ...cond, value: e.target.value })}
          placeholder={cond.field === "ltv" ? t.custCondLtvPlaceholder : cond.field === "tickets" ? t.custCondTicketsPlaceholder : cond.field === "tags" ? t.custCondTagsPlaceholder : t.custCondValuePlaceholder}
          className={cn(selectCls, "flex-1 placeholder:text-muted-foreground/50")}
        />
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(index)}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 transition-all opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function CustomerGroupsPanel({
  storeId,
  groups,
  setGroups,
}: {
  storeId: string
  groups: CustomerGroup[]
  setGroups: React.Dispatch<React.SetStateAction<CustomerGroup[]>>
}) {
  const { locale, t } = useLocale()
  const SENTIMENT_LABELS: Record<string, string> = {
    positive: t.sentimentPositive, neutral: t.sentimentNeutral, negative: t.sentimentNegative,
  }
  const FIELD_LABELS: Record<GroupCondition["field"], string> = {
    grade: t.custFieldGrade,
    sentiment: t.custFieldSentiment,
    ltv: "LTV",
    tickets: t.custFieldTickets,
    tags: t.custFieldTags,
    joinedAt: t.custFieldJoined,
  }
  const OP_LABELS: Record<GroupCondition["op"], string> = {
    is: t.custOpIs,
    is_not: t.custOpIsNot,
    gte: t.custOpGte,
    lte: t.custOpLte,
    contains: t.custOpContains,
  }
  const currencySymbol = locale === "ar" ? " ر.س" : locale === "en" ? "" : "원"
  const gradeLabels = { vip: "VIP", new: t.custGradeNew, regular: t.custGradeRegular }
  const _all = useMemo(() =>
    Object.values(locale === "ko" ? { ...customers, ...additionalCustomers } : locale === "ar" ? saudiCustomersAr : saudiCustomersEn),
  [locale])
  const storeCustomers = useMemo(() => _all.filter(c => c.storeId === storeId), [_all, storeId])
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id ?? "")
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [nextColorIdx, setNextColorIdx] = useState(groups.length)
  const [memberSearch, setMemberSearch] = useState("")
  const [showAddMember, setShowAddMember] = useState(false)
  const [addMemberSearch, setAddMemberSearch] = useState("")
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

  const selectedGroup = useMemo(() => groups.find(g => g.id === selectedGroupId) ?? groups[0], [groups, selectedGroupId])
  const displayGroup = editingGroup ?? selectedGroup

  const groupMembers = useMemo(() => {
    if (!displayGroup) return []
    return applyGroupConditions(storeCustomers, displayGroup.conditions, displayGroup.pinnedIds)
  }, [displayGroup, storeCustomers])

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return groupMembers
    const q = memberSearch.toLowerCase()
    return groupMembers.filter(c => c.name?.toLowerCase().includes(q) || c.phone?.includes(q))
  }, [groupMembers, memberSearch])

  const startEdit = (group: CustomerGroup) =>
    setEditingGroup({ ...group, conditions: group.conditions.map(c => ({ ...c })) })

  const saveEdit = () => {
    if (!editingGroup) return
    setGroups(prev => prev.map(g => g.id === editingGroup.id ? editingGroup : g))
    setEditingGroup(null)
  }

  const cancelEdit = () => setEditingGroup(null)

  const deleteGroup = (id: string) => {
    const remaining = groups.filter(g => g.id !== id)
    setGroups(remaining)
    if (selectedGroupId === id) setSelectedGroupId(remaining[0]?.id ?? "")
    if (editingGroup?.id === id) setEditingGroup(null)
  }

  const createGroup = () => {
    if (!newGroupName.trim()) return
    const newGroup: CustomerGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      description: "",
      colorIdx: nextColorIdx % GROUP_PALETTE.length,
      conditions: [],
      pinnedIds: [],
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setGroups(prev => [...prev, newGroup])
    setSelectedGroupId(newGroup.id)
    setNewGroupName("")
    setIsCreating(false)
    setNextColorIdx(n => n + 1)
    startEdit(newGroup)
  }

  const addCondition = () => {
    if (!editingGroup) return
    setEditingGroup(prev => prev ? { ...prev, conditions: [...prev.conditions, { field: "grade", op: "is", value: "VIP" }] } : prev)
  }

  const updateCondition = (idx: number, cond: GroupCondition) => {
    if (!editingGroup) return
    setEditingGroup(prev => prev ? { ...prev, conditions: prev.conditions.map((c, i) => i === idx ? cond : c) } : prev)
  }

  const deleteCondition = (idx: number) => {
    if (!editingGroup) return
    setEditingGroup(prev => prev ? { ...prev, conditions: prev.conditions.filter((_, i) => i !== idx) } : prev)
  }

  // Candidates for manual add: not already a member
  const addMemberCandidates = useMemo(() => {
    const memberIds = new Set(groupMembers.map((c: any) => c.id))
    return storeCustomers.filter(c => !memberIds.has(c.id)).filter(c => {
      if (!addMemberSearch.trim()) return true
      const q = addMemberSearch.toLowerCase()
      return c.name?.toLowerCase().includes(q) || c.phone?.includes(q)
    })
  }, [storeCustomers, groupMembers, addMemberSearch])

  const addMembersToGroup = (ids: string[]) => {
    setGroups(prev => prev.map(g =>
      g.id === selectedGroupId
        ? { ...g, pinnedIds: [...new Set([...g.pinnedIds, ...ids])] }
        : g
    ))
    setShowAddMember(false)
  }

  if (!selectedGroup) return null

  const palette = GROUP_PALETTE[selectedGroup.colorIdx % GROUP_PALETTE.length]

  // Stats for the selected group
  const totalLtv = groupMembers.reduce((sum, c) => sum + ltvNum(c.ltv), 0)
  const avgLtv = groupMembers.length > 0 ? Math.round(totalLtv / groupMembers.length) : 0
  const positiveCount = groupMembers.filter(c => c.sentiment === "positive").length
  const negativeCount = groupMembers.filter(c => c.sentiment === "negative").length

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ─����� Left sidebar: group list ── */}
      <div className={cn(
        "md:w-72 flex-shrink-0 border-r border-border flex flex-col bg-gray-50",
        mobileShowDetail ? "hidden md:flex" : "flex-1 md:flex-initial"
      )}>
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">{t.custGroupList}</h3>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.custNewGroup}
            </button>
          </div>

          {isCreating && (
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-white">
              <p className="text-[12px] font-semibold text-gray-700">{t.custNewGroupTitle}</p>
              <input
                autoFocus
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") createGroup(); if (e.key === "Escape") { setIsCreating(false); setNewGroupName("") } }}
                placeholder={t.custGroupNamePlaceholder}
                className="w-full text-[13px] bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400"
              />
              <div className="flex gap-2">
                <button onClick={createGroup} className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:opacity-90">{t.custCreateBtn}</button>
                <button onClick={() => { setIsCreating(false); setNewGroupName("") }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-100">{t.custCancelBtn}</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          {groups.map((group) => {
            const members = applyGroupConditions(storeCustomers, group.conditions, group.pinnedIds)
            const isActive = selectedGroupId === group.id
            const pal = GROUP_PALETTE[group.colorIdx % GROUP_PALETTE.length]
            return (
              <button
                key={group.id}
                onClick={() => { setSelectedGroupId(group.id); setEditingGroup(null); setMemberSearch(""); setMobileShowDetail(true) }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all mb-1",
                  isActive ? "bg-white shadow-sm border border-gray-200" : "hover:bg-gray-100"
                )}
              >
                <div className={cn("w-3 h-3 rounded-full flex-shrink-0 mt-0.5", pal.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate text-gray-800">{group.name}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5 truncate">{group.description || t.custNoDescription}</p>
                </div>
                <span className={cn(
                  "flex-shrink-0 text-[12px] font-bold px-2 py-0.5 rounded-full",
                  isActive ? "bg-primary text-primary-foreground" : "bg-gray-200 text-gray-600"
                )}>
                  {members.length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Add Member Modal ── */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddMember(false)}>
          <div className="bg-background rounded-2xl shadow-2xl border border-border w-[520px] max-h-[600px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-[15px] font-bold text-foreground">{t.custAddMemberTitle}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  <span className="font-semibold text-foreground">{selectedGroup.name}</span> {t.custAddMemberDesc}
                </p>
              </div>
              <button onClick={() => setShowAddMember(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={addMemberSearch}
                  onChange={e => setAddMemberSearch(e.target.value)}
                  placeholder={t.custAddMemberSearch}
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {addMemberCandidates.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
                  <Users className="w-8 h-8 opacity-20" />
                  <p className="text-[13px]">{addMemberSearch ? t.custNoMemberSearch : t.custNoMemberCandidates}</p>
                </div>
              ) : addMemberCandidates.map(c => (
                <button
                  key={c.id}
                  onClick={() => addMembersToGroup([c.id])}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold", palette.pill)}>
                    {c.name?.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-semibold text-foreground truncate">{c.name || t.custNoName}</p>
                      {gradeBadge(c.grade, gradeLabels)}
                    </div>
                    <p className="text-[12px] text-muted-foreground">{c.phone || "—"} · LTV {c.ltv || "—"}</p>
                  </div>
                  <span className="flex-shrink-0 text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <Plus className="w-3 h-3" />
                    {t.custAddBtn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Right: group detail ── */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden bg-background",
        mobileShowDetail ? "flex" : "hidden md:flex"
      )}>
        {/* Header */}
        <div className="px-4 md:px-8 py-4 md:py-5 border-b border-border flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
            <div className="flex items-start gap-3">
              {/* Mobile back button */}
              <button
                onClick={() => setMobileShowDetail(false)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className={cn("w-4 h-4 rounded-full mt-1 flex-shrink-0 hidden md:block", palette.dot)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0 md:hidden", palette.dot)} />
                  <h2 className="text-[15px] md:text-[17px] font-bold text-foreground leading-tight truncate">{selectedGroup.name}</h2>
                </div>
                <p className="text-[12px] md:text-[13px] text-muted-foreground mt-0.5 line-clamp-1">{selectedGroup.description || t.custGroupDescription}</p>
                <p className="text-[12px] md:text-[12px] text-muted-foreground mt-1">{t.infoFieldCreated} {selectedGroup.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {editingGroup ? (
                <>
                  <button onClick={cancelEdit} className="flex-1 md:flex-initial px-3 md:px-4 py-2 rounded-xl border border-border text-[12px] md:text-[13px] text-muted-foreground hover:bg-muted transition-colors font-medium">{t.custCancelBtn}</button>
                  <button onClick={saveEdit} className="flex-1 md:flex-initial px-3 md:px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[12px] md:text-[13px] font-semibold hover:opacity-90 transition-opacity">{t.custSaveViewBtn}</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(selectedGroup)}
                    className="flex items-center justify-center gap-1.5 flex-1 md:flex-initial px-3 md:px-4 py-2 rounded-xl border border-border text-[12px] md:text-[13px] text-foreground hover:bg-muted transition-colors font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {t.custEditConditionsBtn}
                  </button>
                  <button
                    onClick={() => deleteGroup(selectedGroup.id)}
                    className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 rounded-xl border border-border text-[12px] md:text-[13px] text-destructive hover:bg-destructive/5 transition-colors font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{t.deleteBtn}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-[12px] md:text-[13px] text-muted-foreground">{t.custMemberLabel}</span>
              <span className="text-[13px] md:text-[15px] font-bold text-foreground">{groupMembers.length}</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-[12px] md:text-[13px] text-muted-foreground">Avg LTV</span>
              <span className="text-[13px] md:text-[15px] font-bold text-foreground">{avgLtv.toLocaleString()}{currencySymbol}</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[12px] md:text-[13px] text-muted-foreground">{t.sentimentPositive}</span>
                <span className="text-[12px] md:text-[13px] font-semibold text-foreground">{positiveCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[12px] md:text-[13px] text-muted-foreground">{t.sentimentNegative}</span>
                <span className="text-[12px] md:text-[13px] font-semibold text-foreground">{negativeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Conditions */}
          <div className="px-4 md:px-8 py-4 md:py-5 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-foreground">{t.custAutoConditions}</h3>
              {editingGroup && (
                <button
                  onClick={addCondition}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.custAddConditionBtn}
                </button>
              )}
            </div>

            {displayGroup.conditions.length === 0 ? (
              <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-muted/30 border border-dashed border-border">
                <Filter className="w-4 h-4 text-muted-foreground/40" />
                <p className="text-[13px] text-muted-foreground">
                  {editingGroup ? t.custConditionHint : t.custNoCondition}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {displayGroup.conditions.map((cond, idx) =>
                  editingGroup ? (
                    <ConditionRow key={idx} cond={cond} index={idx} onChange={updateCondition} onDelete={deleteCondition} fieldLabels={FIELD_LABELS} opLabels={OP_LABELS} sentimentLabels={SENTIMENT_LABELS} />
                  ) : (
                    <div key={idx} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-muted/20 border border-border">
                      {idx === 0
                        ? <span className="inline-flex px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[12px] font-bold">IF</span>
                        : <span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[12px] font-bold">AND</span>
                      }
                      <span className="text-[13px] font-semibold text-foreground">{FIELD_LABELS[cond.field]}</span>
                      <span className="text-[12px] text-muted-foreground">{OP_LABELS[cond.op]}</span>
                      <span className={cn("px-2.5 py-0.5 rounded-lg text-[12px] font-semibold border", palette.pill)}>
                        {formatConditionValue(cond, SENTIMENT_LABELS, currencySymbol)}
                      </span>
                    </div>
                  )
                )}
                {editingGroup && (
                  <p className="text-[12px] text-muted-foreground mt-1 px-1">
                    {t.custAndConditionNote}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Members */}
          <div className="px-4 md:px-8 py-4 md:py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h3 className="text-[13px] font-semibold text-foreground">
                {t.custMemberLabel}
                <span className="ml-2 text-[12px] font-normal text-muted-foreground">({groupMembers.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    placeholder={t.custMemberSearch}
                    className="w-full md:w-40 pl-8 pr-3 py-1.5 text-[12px] bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  onClick={() => { setShowAddMember(true); setAddMemberSearch("") }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {t.custAddMemberBtn}
                </button>
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
                <Users className="w-10 h-10 opacity-20" />
                <p className="text-[13px]">
                  {memberSearch ? t.custNoMatchMember : t.custNoConditionMember}
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-2xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-4 py-2.5 bg-muted/40 border-b border-border">
                  {[t.custInfoName, t.infoFieldPhone, t.custFieldGrade, "LTV", t.custFieldSentiment].map(h => (
                    <span key={h} className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</span>
                  ))}
                </div>
                {filteredMembers.map((c, i) => {
                  const isPinned = displayGroup.pinnedIds.includes(c.id)
                  return (
                  <div
                    key={c.id}
                    className={cn(
                      "grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] px-4 py-3 items-center transition-colors hover:bg-muted/30 group",
                      i !== filteredMembers.length - 1 && "border-b border-border"
                    )}
                  >
                    {/* Name + avatar */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold",
                        palette.pill
                      )}>
                        {c.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-foreground truncate">{c.name || t.custNoName}</p>
                          {isPinned && (
                            <span className="text-[12px] font-bold px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-600 border border-violet-200 whitespace-nowrap">{t.custPinnedLabel}</span>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground truncate">{c.joinedAt ? `${t.infoFieldJoined} ${c.joinedAt}` : ""}</p>
                      </div>
                    </div>
                    {/* Phone */}
                    <p className="text-[12px] text-foreground tabular-nums">{c.phone || "—"}</p>
                    {/* Grade */}
                    <div>{gradeBadge(c.grade)}</div>
                    {/* LTV */}
                    <p className="text-[13px] font-semibold text-foreground tabular-nums">{c.ltv || "—"}</p>
                    {/* Sentiment */}
                    <div className="flex items-center gap-1.5">
                      {sentimentIcon(c.sentiment)}
                      <span className="text-[12px] text-muted-foreground">
                        {c.sentiment === "positive" ? t.sentimentPositive : c.sentiment === "negative" ? t.sentimentNegative : t.sentimentNeutral}
                      </span>
                    </div>
                    {/* Remove if pinned */}
                    <div className="flex items-center justify-end pr-1">
                      {isPinned && (
                        <button
                          onClick={() => setGroups(prev => prev.map(g =>
                            g.id === selectedGroupId
                              ? { ...g, pinnedIds: g.pinnedIds.filter(id => id !== c.id) }
                              : g
                          ))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 transition-all opacity-0 group-hover:opacity-100"
                          title={t.custRemoveFromGroup}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Filter View ──
type FilterViewState = {
  segment: string
  colFilters: Record<string, string[]>  // serializable: Set → array
  search: string
}

type FilterView = {
  id: string
  label: string
  builtIn?: boolean
  state: FilterViewState
}

// BUILT_IN_VIEWS is now generated inside CustomersPage using t

// SUMMARY_CARD_FILTERS is now generated inside CustomersPage using t

// COL_LABELS, CHECKBOX_VALUE_LABELS, RANGE_UNITS are now generated inside CustomersPage using t

function humanizeColFilter(
  col: string,
  vals: string[],
  colLabels: Record<string, string>,
  checkboxValueLabels: Record<string, string>,
  rangeUnits: Record<string, string>,
  opLabels: { gte: string; lte: string; between?: string; after?: string; before?: string },
): string {
  const colLabel = colLabels[col] ?? col
  if (vals.length === 0) return ""

  try {
    const p = JSON.parse(vals[0])
    if (typeof p === "object" && p !== null && "op" in p) {
      const unit = rangeUnits[col] ?? ""
      const fmt = (v: string) => {
        const n = parseFloat(v)
        if (isNaN(n)) return v
        return `${n.toLocaleString()}${unit}`
      }
      if (p.op === "gte")     return `${colLabel} ${fmt(p.a)} ${opLabels.gte}`
      if (p.op === "lte")     return `${colLabel} ${fmt(p.a)} ${opLabels.lte}`
      if (p.op === "between") return `${colLabel} ${fmt(p.a)} ~ ${fmt(p.b)}`
      if (p.op === "after")   return `${colLabel} ${p.a} ${opLabels.after ?? ">"}`
      if (p.op === "before")  return `${colLabel} ${p.a} ${opLabels.before ?? "<"}`
    }
  } catch {
    // not JSON — checkbox values
  }

  const labels = vals.map(v => checkboxValueLabels[v] ?? v)
  return `${colLabel}: ${labels.join(", ")}`
}

// ── Save Filter View Modal ─��
function SaveFilterViewModal({
  currentState,
  onSave,
  onClose,
}: {
  currentState: FilterViewState
  onSave: (view: FilterView) => void
  onClose: () => void
}) {
  const { t, locale } = useLocale()
  const currencySymbol = locale === "ar" ? " ر.س" : locale === "en" ? "" : "원"
  const colLabels: Record<string, string> = {
    name: t.custInfoName, grade: t.custFieldGrade, sentiment: t.custFieldSentiment,
    ltv: "LTV", tickets: t.custFieldTickets, reservations: t.infoHistoryReservation,
    orders: t.infoHistoryOrder, reviews: t.infoHistoryReview, joined: t.infoFieldJoined, tags: t.custFieldTags,
  }
  const checkboxValueLabels: Record<string, string> = {
    has_name: t.custHasName, no_name: t.custNoNameFilter, cs_active: t.cardStatusActive,
    positive: t.sentimentPositive, neutral: t.sentimentNeutral, negative: t.sentimentNegative,
    VIP: "VIP", 일반: t.custGradeRegular, 신규: t.custGradeNew,
  }
  const rangeUnits: Record<string, string> = {
    ltv: currencySymbol, tickets: t.histUnit, reservations: t.histUnit,
    orders: t.histUnit, reviews: t.custReviewPoint,
  }
  const [name, setName] = useState("")
  const activeFilters = Object.entries(currentState.colFilters)
    .filter(([, v]) => v.length > 0)

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id: `custom_${Date.now()}`,
      label: name.trim(),
      builtIn: false,
      state: currentState,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[380px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-[14px] text-foreground">{t.custAddFilterView}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Current filter preview */}
          <div className="rounded-xl bg-muted/40 border border-border p-3 flex flex-col gap-1.5">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{t.custActiveFilters}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentState.segment !== "all" && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium border border-primary/20">
                  {t.custSegmentLabel}: {[...Object.values({
                    all: t.filterAll, vip: "VIP", new: t.custGradeNew,
                    negative: t.sentimentNegative, no_order: t.custSegNoOrder, pending_cs: t.custSegPendingCS,
                  })][["all","vip","new","negative","no_order","pending_cs"].indexOf(currentState.segment)] ?? currentState.segment}
                </span>
              )}
              {currentState.search && (
                <span className="px-2 py-0.5 rounded-full bg-muted border border-border text-[12px] text-muted-foreground">
                  {t.custSearchLabel} "{currentState.search}"
                </span>
              )}
              {activeFilters.map(([col, vals]) => (
                <span key={col} className="px-2 py-0.5 rounded-full bg-muted border border-border text-[12px] text-muted-foreground">
                  {humanizeColFilter(col, vals, colLabels, checkboxValueLabels, rangeUnits, { gte: t.custOpGte, lte: t.custOpLte, after: t.custDateAfter, before: t.custDateBefore })}
                </span>
              ))}
              {currentState.segment === "all" && !currentState.search && activeFilters.length === 0 && (
                <span className="text-[12px] text-muted-foreground italic">{t.custNoFilterActive}</span>
              )}
            </div>
          </div>

          {/* Name input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-foreground">{t.custViewNameLabel}</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder={t.custViewNamePlaceholder}
              className="px-3 py-2 text-[13px] rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-[13px] text-muted-foreground hover:bg-muted transition-colors">{t.custCancelBtn}</button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {t.custSaveViewBtn}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Summary Stats ──
function SummaryBar({ storeId, onCardClick, clickableLabels }: { storeId: string; onCardClick: (label: string) => void; clickableLabels: Set<string> }) {
  const { locale, t } = useLocale()
  const _all = Object.values(locale === "ko" ? { ...customers, ...additionalCustomers } : locale === "ar" ? saudiCustomersAr : saudiCustomersEn)
  const _sess = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
  const _orders = locale === "ko" ? customerOrders : locale === "ar" ? saudiCustomerOrdersAr : saudiCustomerOrdersEn
  const _reservations = locale === "ko" ? customerReservations : locale === "ar" ? saudiCustomerReservationsAr : saudiCustomerReservationsEn
  const _reviews = locale === "ko" ? customerReviews : locale === "ar" ? saudiCustomerReviewsAr : saudiCustomerReviewsEn

  const storeCustomers = _all.filter(c => c.storeId === storeId)

  const vip = storeCustomers.filter(c => c.grade === "VIP").length
  const newC = storeCustomers.filter(c => c.grade === "신규").length
  const negative = storeCustomers.filter(c => c.sentiment === "negative").length

  // 장기 미방문: 최근 예약·주문이 90일 이상 없는 고객
  const now = new Date()
  const cutoff90 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)
    .toISOString().slice(0, 10)
  const longAbsent = storeCustomers.filter(c => {
    const lastOrder = (_orders[c.id] ?? [])
      .filter(o => o.status === "paid")
      .map(o => o.date)
      .sort()
      .at(-1)
    const lastRes = (_reservations[c.id] ?? [])
      .filter(r => r.status === "completed" || r.status === "confirmed")
      .map(r => r.date)
      .sort()
      .at(-1)
    const last = [lastOrder, lastRes].filter(Boolean).sort().at(-1)
    return !last || last < cutoff90
  }).length

  // CS 진행 중 (active / waiting / ai_agent)
  const csActive = storeCustomers.filter(c =>
    _sess.some(s => s.customerId === c.id && s.storeId === storeId &&
      (s.status === "active" || s.status === "waiting" || s.status === "ai_agent"))
  ).length

  // 미답변 리뷰 보유 고객
  const unansweredReview = storeCustomers.filter(c =>
    (_reviews[c.id] ?? []).some(r => !r.replied)
  ).length

  // 미식별 고객 (이름 없음)
  const unidentified = storeCustomers.filter(c => !c.name).length

  // 최근 30일 재구매 고객 (30일 ��� 결제 2건 이상)
  const cutoff30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
    .toISOString().slice(0, 10)
  const repurchase30 = storeCustomers.filter(c => {
    const recent = (customerOrders[c.id] ?? [])
      .filter(o => o.status === "paid" && o.date >= cutoff30)
    return recent.length >= 2
  }).length

  // 평균 LTV
  const ltvValues = storeCustomers.map(c => ltvNum(c.ltv)).filter(v => v > 0)
  const avgLtv = ltvValues.length
    ? Math.round(ltvValues.reduce((s, v) => s + v, 0) / ltvValues.length)
    : 0
  const currencySymbol = locale === "ar" ? " ر.س" : locale === "en" ? "" : "원"
  const avgLtvLabel = avgLtv > 0 ? `${avgLtv.toLocaleString()}${currencySymbol}` : "-"

  const cards = [
    { label: t.custSummaryTotal,       value: storeCustomers.length, icon: Users,         color: "text-foreground",       bg: "bg-card" },
    { label: "VIP",                    value: vip,                   icon: Crown,         color: "text-amber-600",        bg: "bg-amber-50" },
    { label: t.custGradeNew,           value: newC,                  icon: UserCheck,     color: "text-primary",          bg: "bg-primary/5" },
    { label: t.custSummaryNegative,    value: negative,              icon: UserX,         color: "text-destructive",      bg: "bg-destructive/5" },
    { label: t.custSummaryLongAbsent,  value: longAbsent,            icon: CalendarDays,  color: "text-orange-500",       bg: "bg-orange-50" },
    { label: t.custSegPendingCS,       value: csActive,              icon: MessageCircle, color: "text-blue-500",         bg: "bg-blue-50" },
    { label: t.custSummaryUnanswered,  value: unansweredReview,      icon: Star,          color: "text-yellow-500",       bg: "bg-yellow-50" },
    { label: t.custSummaryUnidentified,value: unidentified,          icon: Activity,      color: "text-muted-foreground", bg: "bg-muted/50" },
    { label: t.custSummaryRepurchase,  value: repurchase30,          icon: ShoppingBag,   color: "text-emerald-600",      bg: "bg-emerald-50" },
    { label: "Avg LTV",                value: avgLtvLabel,           icon: Wallet,        color: "text-violet-600",       bg: "bg-violet-50" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-5">
      {cards.map(s => {
        const isClickable = clickableLabels.has(s.label)
        return (
          <button
            key={s.label}
            onClick={() => isClickable && onCardClick(s.label)}
            className={cn(
              "flex items-center gap-2 md:gap-2.5 px-3 md:px-3.5 py-2.5 md:py-3 rounded-xl border border-border text-left transition-all",
              s.bg,
              isClickable ? "hover:ring-2 hover:ring-primary/30 hover:border-primary/40 cursor-pointer" : "cursor-default"
            )}
          >
            <div className="w-7 md:w-8 h-7 md:h-8 rounded-lg flex items-center justify-center bg-white/60 flex-shrink-0">
              <s.icon className={cn("w-3 md:w-3.5 h-3 md:h-3.5", s.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] md:text-[12px] text-muted-foreground leading-tight truncate">{s.label}</p>
              <p className={cn("text-lg md:text-xl font-bold leading-tight", s.color)}>{s.value}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Column Header with Sort + Filter ──
type SortDir = "asc" | "desc"
type SortCol = "name" | "grade" | "sentiment" | "ltv" | "tickets" | "reservations" | "orders" | "reviews" | "joined" | "tags" | ""

// Filter value types stored in colFilters state
// - checkbox cols: Set<string> of selected values
// - range cols (ltv/tickets/etc): Set with one JSON string: '{"op":"gte","a":"100"}'  or '{"op":"between","a":"10","b":"100"}'
// - date col (joined): Set with one JSON string: '{"op":"after","a":"2024-01-01"}'

function CheckboxFilter({
  options,
  active,
  onChange,
  onReset,
}: {
  options: { value: string; label: string }[]
  active: Set<string>
  onChange: (v: string) => void
  onReset: () => void
}) {
  const { t } = useLocale()
  return (
    <div className="py-1">
      {options.map(opt => {
        const checked = active.has(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-left text-[12px] transition-colors"
          >
            <span className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
              checked ? "bg-primary border-primary" : "border-muted-foreground/40"
            )}>
              {checked && <ChevronUp className="w-2.5 h-2.5 text-white rotate-90" />}
            </span>
            <span className={cn("text-foreground", checked && "font-medium")}>{opt.label}</span>
          </button>
        )
      })}
      {active.size > 0 && (
        <button onClick={onReset} className="w-full px-3 py-1.5 mt-1 border-t border-border text-[12px] text-muted-foreground hover:text-foreground text-left hover:bg-muted transition-colors">
          {t.custResetBtn}
        </button>
      )}
    </div>
  )
}

function RangeFilter({
  unit,
  active,
  onApply,
  onReset,
}: {
  unit?: string
  active: Set<string>
  onApply: (raw: string) => void
  onReset: () => void
}) {
  const { t } = useLocale()
  const parsed = active.size > 0 ? JSON.parse([...active][0]) : { op: "gte", a: "", b: "" }
  const [op, setOp] = useState<"gte" | "lte" | "between">(parsed.op ?? "gte")
  const [valA, setValA] = useState(parsed.a ?? "")
  const [valB, setValB] = useState(parsed.b ?? "")

  const apply = () => {
    if (!valA) { onReset(); return }
    onApply(JSON.stringify({ op, a: valA, b: valB }))
  }

  return (
    <div className="p-3 flex flex-col gap-2">
      <div className="flex gap-1">
        {([["gte", t.custOpGte], ["lte", t.custOpLte], ["between", t.custBetween]] as const).map(([o, l]) => (
          <button
            key={o}
            onClick={() => setOp(o as "gte" | "lte" | "between")}
            className={cn("flex-1 py-1 text-[12px] rounded-md border transition-colors", op === o ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted")}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={valA}
          onChange={e => setValA(e.target.value)}
          placeholder={t.custCondValuePlaceholder}
          className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded-md border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
        />
        {unit && <span className="text-[12px] text-muted-foreground">{unit}</span>}
      </div>
      {op === "between" && (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={valB}
            onChange={e => setValB(e.target.value)}
            placeholder={t.custMaxPlaceholder}
            className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded-md border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
          />
          {unit && <span className="text-[12px] text-muted-foreground">{unit}</span>}
        </div>
      )}
      <div className="flex gap-1">
        <button onClick={apply} className="flex-1 py-1 text-[12px] rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">{t.custApplyBtn}</button>
        {active.size > 0 && <button onClick={onReset} className="px-2 py-1 text-[12px] rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">{t.custResetBtn}</button>}
      </div>
    </div>
  )
}

function DateFilter({
  active,
  onApply,
  onReset,
}: {
  active: Set<string>
  onApply: (raw: string) => void
  onReset: () => void
}) {
  const { t } = useLocale()
  const parsed = active.size > 0 ? JSON.parse([...active][0]) : { op: "after", a: "", b: "" }
  const [op, setOp] = useState<"after" | "before" | "between">(parsed.op ?? "after")
  const [valA, setValA] = useState(parsed.a ?? "")
  const [valB, setValB] = useState(parsed.b ?? "")

  const apply = () => {
    if (!valA) { onReset(); return }
    onApply(JSON.stringify({ op, a: valA, b: valB }))
  }

  return (
    <div className="p-3 flex flex-col gap-2">
      <div className="flex gap-1">
        {([["after", t.custDateAfter], ["before", t.custDateBefore], ["between", t.custBetween]] as const).map(([o, l]) => (
          <button
            key={o}
            onClick={() => setOp(o as "after" | "before" | "between")}
            className={cn("flex-1 py-1 text-[12px] rounded-md border transition-colors", op === o ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted")}
          >
            {l}
          </button>
        ))}
      </div>
      <input type="date" value={valA} onChange={e => setValA(e.target.value)} className="px-2 py-1 text-[12px] rounded-md border border-border bg-background outline-none focus:ring-1 focus:ring-primary" />
      {op === "between" && (
        <input type="date" value={valB} onChange={e => setValB(e.target.value)} className="px-2 py-1 text-[12px] rounded-md border border-border bg-background outline-none focus:ring-1 focus:ring-primary" />
      )}
      <div className="flex gap-1">
        <button onClick={apply} className="flex-1 py-1 text-[12px] rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">{t.custApplyBtn}</button>
        {active.size > 0 && <button onClick={onReset} className="px-2 py-1 text-[12px] rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">{t.custResetBtn}</button>}
      </div>
    </div>
  )
}

type ColFilterType = "checkbox" | "range" | "date"

function ColumnHeader({
  label,
  colKey,
  sortCol,
  sortDir,
  onSort,
  filterType,
  checkboxOptions,
  rangeUnit,
  activeFilter,
  onFilterApply,
  onFilterReset,
  canSort = true,
}: {
  label: string
  colKey: SortCol
  sortCol: SortCol
  sortDir: SortDir
  onSort: (col: SortCol) => void
  filterType?: ColFilterType
  checkboxOptions?: { value: string; label: string }[]
  rangeUnit?: string
  activeFilter: Set<string>
  onFilterApply: (raw: string) => void
  onFilterReset: () => void
  canSort?: boolean
}) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const isActive = sortCol === colKey
  const hasActiveFilter = activeFilter.size > 0

  const filterSummary = () => {
    if (!hasActiveFilter) return null
    if (filterType === "checkbox") return `${activeFilter.size} ${t.custSelectedItems}`
    try {
      const p = JSON.parse([...activeFilter][0])
      if (filterType === "date") {
        if (p.op === "after")  return `${p.a} ${t.custDateAfter}`
        if (p.op === "before") return `${p.a} ${t.custDateBefore}`
        return `${p.a} ~ ${p.b}`
      }
      if (p.op === "gte") return `${p.a}${rangeUnit ?? ""} ${t.custOpGte}`
      if (p.op === "lte") return `${p.a}${rangeUnit ?? ""} ${t.custOpLte}`
      return `${p.a}~${p.b}${rangeUnit ?? ""}`
    } catch { return null }
  }

  const summary = filterSummary()

  return (
    <th className="py-3 pr-3 text-left text-[12px] font-semibold text-muted-foreground uppercase tracking-wider relative">
      <div className="flex items-center gap-1 group whitespace-nowrap">
        {canSort ? (
          <button onClick={() => onSort(colKey)} className="flex items-center gap-0.5 hover:text-foreground transition-colors">
            <span>{label}</span>
            {isActive
              ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
              : <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            }
          </button>
        ) : (
          <span>{label}</span>
        )}
        {filterType && (
          <button
            onClick={() => setOpen(v => !v)}
            className={cn(
              "w-4 h-4 flex items-center justify-center rounded transition-colors flex-shrink-0",
              open || hasActiveFilter ? "text-primary" : "opacity-0 group-hover:opacity-60 hover:opacity-100 text-muted-foreground"
            )}
          >
            <SlidersHorizontal className="w-3 h-3" />
          </button>
        )}
        {summary && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[12px] font-semibold">{summary}</span>}
      </div>

      {open && filterType && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden" style={{ minWidth: 192 }}>
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
              {hasActiveFilter && (
                <button onClick={() => { onFilterReset(); }} className="text-[12px] text-primary hover:underline">{t.custResetBtn}</button>
              )}
            </div>
            {filterType === "checkbox" && (
              <CheckboxFilter
                options={checkboxOptions ?? []}
                active={activeFilter}
                onChange={v => { onFilterApply(v) }}
                onReset={onFilterReset}
              />
            )}
            {filterType === "range" && (
              <RangeFilter
                unit={rangeUnit}
                active={activeFilter}
                onApply={raw => { onFilterApply(raw); setOpen(false) }}
                onReset={() => { onFilterReset(); setOpen(false) }}
              />
            )}
            {filterType === "date" && (
              <DateFilter
                active={activeFilter}
                onApply={raw => { onFilterApply(raw); setOpen(false) }}
                onReset={() => { onFilterReset(); setOpen(false) }}
              />
            )}
          </div>
        </>
      )}
    </th>
  )
}

// ── Send Action Modal ──
function SendActionModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { t } = useLocale()
  const [selected, setSelected] = useState<"coupon" | "followup" | "survey" | null>(null)
  const [sent, setSent] = useState(false)

  const actions = [
    { id: "coupon"   as const, icon: Gift,          label: t.custActionCoupon,   desc: t.custActionCouponDesc },
    { id: "followup" as const, icon: MessageCircle, label: t.custActionFollowup,  desc: t.custActionFollowupDesc },
    { id: "survey"   as const, icon: ClipboardList, label: t.custActionSurvey,   desc: t.custActionSurveyDesc },
  ]

  const handleSend = () => {
    if (!selected) return
    setSent(true)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[380px] p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground">{t.custCRMSend}</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{customer.name || customer.phone}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="font-semibold text-sm text-foreground">{t.custSendSuccess}</p>
            <p className="text-[12px] text-muted-foreground mt-1">{t.custSendSuccessDesc}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
              {t.custCancelBtn}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-4">
              {actions.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all",
                    selected === a.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:border-border hover:bg-muted/60"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", selected === a.id ? "bg-primary/15" : "bg-muted")}>
                    <a.icon className={cn("w-4 h-4", selected === a.id ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{a.label}</p>
                    <p className="text-[12px] text-muted-foreground">{a.desc}</p>
                  </div>
                  {selected === a.id && <CheckSquare className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
            <button
              onClick={handleSend}
              disabled={!selected}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              {t.custSendBtn}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Customer Row ──
function CustomerRow({
  customer,
  selected,
  onSelect,
  onClick,
  storeId,
  groups,
  onAddToGroup,
}: {
  customer: Customer
  selected: boolean
  onSelect: (id: string) => void
  onClick: (c: Customer) => void
  storeId: string
  groups: CustomerGroup[]
  onAddToGroup: (customerId: string, groupId: string) => void
}) {
  const { locale, t } = useLocale()
  const gradeLabels = { vip: "VIP", new: t.custGradeNew, regular: t.custGradeRegular }
  const sentimentLabel = (s: string) =>
    s === "positive" ? t.sentimentPositive : s === "negative" ? t.sentimentNegative : t.sentimentNeutral
  const _sess = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
  const _orders = locale === "ko" ? customerOrders : locale === "ar" ? saudiCustomerOrdersAr : saudiCustomerOrdersEn
  const _reservations = locale === "ko" ? customerReservations : locale === "ar" ? saudiCustomerReservationsAr : saudiCustomerReservationsEn
  const _reviews = locale === "ko" ? customerReviews : locale === "ar" ? saudiCustomerReviewsAr : saudiCustomerReviewsEn

  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const orders = _orders[customer.id] ?? []
  const reservations = _reservations[customer.id] ?? []
  const reviews = _reviews[customer.id] ?? []
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "-"
  const hasActiveCS = _sess.some(s =>
    s.customerId === customer.id &&
    s.storeId === storeId &&
    (s.status === "active" || s.status === "waiting" || s.status === "ai_agent")
  )

  return (
    <tr
      onClick={() => onClick(customer)}
      className={cn("group border-b border-border transition-colors cursor-pointer", selected ? "bg-primary/5" : "hover:bg-muted/40")}
    >
      <td className="pl-4 pr-2 py-3 w-8" onClick={e => { e.stopPropagation(); onSelect(customer.id) }}>
        <button className="w-4 h-4 flex items-center justify-center">
          {selected
            ? <CheckSquare className="w-4 h-4 text-primary" />
            : <Square className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />}
        </button>
      </td>

      {/* Avatar + Name */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
            style={{ background: customer.avatarColor || "#94a3b8" }}
          >
            {customer.avatarInitials || "?"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn("text-sm font-semibold truncate", !customer.name && "text-muted-foreground italic text-xs")}>
                {customer.name || t.custNoName}
              </span>
              {hasActiveCS && (
                <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  CS
                </span>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground">{customer.phone}</p>
          </div>
        </div>
      </td>

      <td className="py-3 pr-4">{gradeBadge(customer.grade, gradeLabels)}</td>

      <td className="py-3 pr-4">
        <div className="flex items-center gap-1">
          {sentimentIcon(customer.sentiment)}
          <span className="text-[12px] text-muted-foreground">{sentimentLabel(customer.sentiment)}</span>
        </div>
      </td>

      <td className="py-3 pr-4">
        <span className="text-sm font-semibold text-foreground">{customer.ltv ?? "-"}</span>
      </td>

      <td className="py-3 pr-4">
        <div className="flex items-center gap-1">
          <span className="text-sm text-foreground font-medium">{customer.totalTickets}</span>
          <span className="text-[12px] text-muted-foreground">/ {customer.resolvedTickets} {t.infoStatusDone}</span>
        </div>
      </td>

      {/* 예약 */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1">
          <CalendarDays className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm text-foreground">{reservations.length}</span>
        </div>
      </td>

      {/* 주문 */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1">
          <ShoppingBag className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm text-foreground">{orders.filter(o => o.status === "paid").length}</span>
        </div>
      </td>

      {/* 리뷰 */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400" />
          <span className="text-sm text-foreground">{avgRating}</span>
        </div>
      </td>

      {/* joined */}
      <td className="py-3 pr-4">
        <span className="text-[12px] text-muted-foreground">{customer.joinedAt || "-"}</span>
      </td>

      {/* 태그 */}
      <td className="py-3 pr-2 max-w-[160px]">
        {customer.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {customer.tags.slice(0, 2).map(t => (
              <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[12px] bg-muted border border-border text-muted-foreground whitespace-nowrap">
                <Tag className="w-2.5 h-2.5" />{t}
              </span>
            ))}
            {customer.tags.length > 2 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[12px] bg-muted border border-border text-muted-foreground">
                +{customer.tags.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[12px] text-muted-foreground/40">-</span>
        )}
      </td>

      {/* 그룹 추가 액션 */}
      <td className="py-3 pr-3 w-8" onClick={e => e.stopPropagation()}>
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => setShowGroupMenu(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
            title={t.custAddToGroup}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
          </button>
          {showGroupMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-xl shadow-lg z-30 py-1 overflow-hidden">
              <p className="text-[12px] font-semibold text-muted-foreground px-3 py-1.5 uppercase tracking-wide">{t.custAddToGroupHeader}</p>
              {groups.map(group => {
                const pal = GROUP_PALETTE[group.colorIdx % GROUP_PALETTE.length]
                return (
                  <button
                    key={group.id}
                    onClick={() => { onAddToGroup(customer.id, group.id); setShowGroupMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-left"
                  >
                    <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", pal.dot)} />
                    <span className="text-[13px] text-foreground truncate">{group.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Detail Slide-over ──
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{children}</p>
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  const { t } = useLocale()
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5 border-b border-border/60 last:border-0">
      <span className="text-[12px] font-semibold text-foreground whitespace-nowrap flex-shrink-0">{label}</span>
      <span className="text-[12px] text-muted-foreground text-right min-w-0">
        {(value === null || value === undefined || value === "") ? <span className="text-muted-foreground/40 italic">{t.custNoValue}</span> : value}
      </span>
    </div>
  )
}

function CustomerDetailPanel({ customer, storeId, onClose, onSendAction }: {
  customer: Customer
  storeId: string
  onClose: () => void
  onSendAction: (c: Customer) => void
}) {
  const { locale, t } = useLocale()
  const currencySymbol = locale === "ar" ? " ر.س" : locale === "en" ? "" : "원"
  const gradeLabels = { vip: "VIP", new: t.custGradeNew, regular: t.custGradeRegular }
  const sentimentLabel = (s: string) =>
    s === "positive" ? t.sentimentPositive : s === "negative" ? t.sentimentNegative : t.sentimentNeutral
  const _sess = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
  const _orders = locale === "ko" ? customerOrders : locale === "ar" ? saudiCustomerOrdersAr : saudiCustomerOrdersEn
  const _reservations = locale === "ko" ? customerReservations : locale === "ar" ? saudiCustomerReservationsAr : saudiCustomerReservationsEn
  const _reviews = locale === "ko" ? customerReviews : locale === "ar" ? saudiCustomerReviewsAr : saudiCustomerReviewsEn

  const [activeTab, setActiveTab] = useState<"overview" | "cs" | "orders" | "reservations">("overview")
  const orders = _orders[customer.id] ?? []
  const reservations = _reservations[customer.id] ?? []
  const reviews = _reviews[customer.id] ?? []
  const custSessions = _sess.filter(s => s.customerId === customer.id && s.storeId === storeId)

  const resolveRate = customer.totalTickets > 0 ? Math.round((customer.resolvedTickets / customer.totalTickets) * 100) : 0
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "-"
  const paidOrders = orders.filter(o => o.status === "paid")
  const totalSpent = paidOrders.reduce((s, o) => s + parseInt(o.amount.replace(/[^0-9]/g, "")), 0)

  // Risk score: low resolve + negative sentiment + cancelled reservations
  const riskScore = (() => {
    let score = 0
    if (customer.sentiment === "negative") score += 40
    else if (customer.sentiment === "neutral") score += 10
    if (resolveRate < 50 && customer.totalTickets > 0) score += 30
    if (reservations.some(r => r.status === "cancelled")) score += 20
    if (paidOrders.length === 0 && customer.totalTickets > 0) score += 10
    return Math.min(score, 100)
  })()

  const riskLabel = riskScore >= 60 ? { label: t.custRiskHigh,   color: "text-destructive bg-destructive/10" }
    : riskScore >= 30 ? { label: t.custRiskMedium, color: "text-amber-600 bg-amber-100" }
    : { label: t.custRiskLow, color: "text-emerald-600 bg-emerald-100" }

  type TLItem = { date: string; type: string; label: string; sub: string; color: string; icon: string }
  const timeline: TLItem[] = [
    ...custSessions.map(s => ({ date: s.createdAt, type: "cs", label: `CS: ${s.subject}`, sub: s.status === "resolved" ? t.infoStatusDone : s.status === "active" ? t.cardStatusActive : s.status, color: "bg-primary", icon: "💬" })),
    ...orders.map(o => ({ date: o.date + "T00:00:00", type: "order", label: `${t.infoHistoryOrder}: ${o.item}`, sub: o.amount, color: "bg-emerald-500", icon: "🛍" })),
    ...reservations.map(r => ({ date: r.date + "T" + r.time + ":00", type: "res", label: `${t.infoHistoryReservation}: ${r.service}`, sub: r.time + (r.memo ? ` · ${r.memo}` : ""), color: r.status === "cancelled" ? "bg-destructive" : "bg-amber-400", icon: "📅" })),
    ...reviews.map(r => ({ date: r.date + "T00:00:00", type: "review", label: `${t.infoHistoryReview} ${r.rating}${t.custReviewPoint}`, sub: r.content.slice(0, 28) + (r.content.length > 28 ? "…" : ""), color: "bg-amber-400", icon: "⭐" })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const tabs = [
    { id: "overview" as const, label: t.custDetailOverview },
    { id: "cs" as const, label: `CS (${custSessions.length})` },
    { id: "orders" as const, label: `${t.infoHistoryOrder} (${paidOrders.length})` },
    { id: "reservations" as const, label: `${t.infoHistoryReservation} (${reservations.length})` },
  ]

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end" onClick={onClose}>
      <div
        className="relative h-full w-[480px] bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0"
              style={{ background: customer.avatarColor || "#94a3b8" }}
            >
              {customer.avatarInitials || "?"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-[15px] text-foreground leading-tight">
                  {customer.name || <span className="text-muted-foreground italic text-sm font-normal">{t.custNoName}</span>}
                </h3>
                {gradeBadge(customer.grade, gradeLabels)}
              </div>
              <p className="text-[12px] text-muted-foreground mb-1">{customer.phone}{customer.email ? ` · ${customer.email}` : ""}</p>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-[12px] text-muted-foreground">
                  {sentimentIcon(customer.sentiment)}
                  {t.custFieldSentiment}: {sentimentLabel(customer.sentiment)}
                </span>
                <span className={cn("text-[12px] font-semibold px-2 py-0.5 rounded-full", riskLabel.color)}>
                  {t.custChurnRisk} {riskLabel.label}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* KPI strip — 2 rows x 3 cols */}
        <div className="grid grid-cols-3 border-b border-border bg-muted/20">
          {[
            { label: "LTV",               value: customer.ltv ?? "-" },
            { label: t.custKpiTotalSpent, value: totalSpent > 0 ? `${totalSpent.toLocaleString()}${currencySymbol}` : "-" },
            { label: t.custFieldTickets,  value: `${customer.totalTickets}${t.histUnit}` },
            { label: t.custKpiResolveRate,value: customer.totalTickets > 0 ? `${resolveRate}%` : "-" },
            { label: t.infoHistoryReservation, value: `${reservations.length}${t.histUnit}` },
            { label: t.custKpiReviewAvg,  value: avgRating === "-" ? "-" : `★ ${avgRating}` },
          ].map((k, i) => (
            <div
              key={k.label}
              className={cn(
                "flex flex-col items-center py-2.5 px-2",
                i % 3 !== 2 && "border-r border-border",
                i < 3 && "border-b border-border"
              )}
            >
              <span className="text-[12px] font-bold text-foreground">{k.value}</span>
              <span className="text-[12px] text-muted-foreground mt-0.5 whitespace-nowrap">{k.label}</span>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border px-4 bg-card">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "text-[12px] font-medium px-3 py-2.5 border-b-2 transition-colors",
                activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── 개요 탭 ── */}
          {activeTab === "overview" && (
            <div className="p-4 flex flex-col gap-4">

              {/* Basic Info */}
              <div>
                <SectionTitle>{t.custSectionBasicInfo}</SectionTitle>
                <div className="rounded-xl border border-border overflow-hidden">
                  <InfoRow label={t.custInfoName} value={customer.name} />
                  <InfoRow label={t.infoFieldPhone} value={customer.phone} />
                  <InfoRow label={t.infoFieldEmail} value={customer.email} />
                  <InfoRow label={t.infoFieldGender} value={translateGender(customer.gender, t)} />
                  <InfoRow label={t.infoFieldJoined} value={customer.joinedAt} />
                  <InfoRow label={t.custFieldGrade} value={gradeBadge(customer.grade, gradeLabels)} />
                  <InfoRow label={t.custFieldSentiment} value={
                    <span className="flex items-center gap-1 justify-end">
                      {sentimentIcon(customer.sentiment)}{sentimentLabel(customer.sentiment)}
                    </span>
                  } />
                </div>
              </div>

              {/* Churn Risk */}
              <div>
                <SectionTitle>{t.custChurnRiskAnalysis}</SectionTitle>
                <div className="rounded-xl border border-border p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-muted-foreground">{t.custRiskScore}</span>
                      <span className={cn("text-[12px] font-bold px-2 py-0.5 rounded-full", riskLabel.color)}>{riskScore}{t.custReviewPoint} · {riskLabel.label}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", riskScore >= 60 ? "bg-destructive" : riskScore >= 30 ? "bg-amber-400" : "bg-emerald-500")}
                        style={{ width: `${riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <SectionTitle>{t.custFieldTags}</SectionTitle>
                {customer.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] bg-muted border border-border text-muted-foreground">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted-foreground/40 italic">{t.custNoTag}</p>
                )}
              </div>

              {/* Purchase Summary */}
              <div>
                <SectionTitle>{t.custSectionPurchase}</SectionTitle>
                <div className="rounded-xl border border-border overflow-hidden">
                  <InfoRow label={t.custKpiTotalSpent} value={totalSpent > 0 ? `${totalSpent.toLocaleString()}${currencySymbol}` : "-"} />
                  <InfoRow label={t.custPurchaseCount} value={`${paidOrders.length}${t.histUnit}`} />
                  <InfoRow label={t.custRefundCount} value={`${orders.filter(o => o.status === "refunded").length}${t.histUnit}`} />
                  <InfoRow label={t.custReservationCount} value={`${reservations.length}${t.histUnit} (${t.custCancelledCount} ${reservations.filter(r => r.status === "cancelled").length}${t.histUnit})`} />
                  <InfoRow label={t.custKpiReviewAvg} value={avgRating !== "-" ? `★ ${avgRating}` : "-"} />
                  <InfoRow label={t.custReviewCount} value={`${reviews.length}${t.histUnit} (${t.custUnansweredCount} ${reviews.filter(r => !r.replied).length}${t.histUnit})`} />
                </div>
              </div>

              {/* CS Summary */}
              <div>
                <SectionTitle>{t.custSectionCS}</SectionTitle>
                <div className="rounded-xl border border-border overflow-hidden">
                  <InfoRow label={t.custFieldTickets} value={`${customer.totalTickets}${t.histUnit}`} />
                  <InfoRow label={t.custResolvedCount} value={`${customer.resolvedTickets}${t.histUnit}`} />
                  <InfoRow label={t.custKpiResolveRate} value={customer.totalTickets > 0 ? `${resolveRate}%` : "-"} />
                  <InfoRow label={t.custUnresolvedCount} value={`${customer.totalTickets - customer.resolvedTickets}${t.histUnit}`} />
                </div>
              </div>

              {/* Recent Reviews */}
              {reviews.length > 0 && (
                <div>
                  <SectionTitle>{t.custRecentReviews}</SectionTitle>
                  <div className="flex flex-col gap-2">
                    {reviews.slice(0, 3).map(r => (
                      <div key={r.id} className="p-3 rounded-xl bg-muted/40 border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3", i < r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
                            ))}
                          </div>
                          <span className="text-[12px] text-muted-foreground">{r.date}</span>
                        </div>
                        <p className="text-[12px] text-foreground leading-relaxed">{r.content}</p>
                        {!r.replied && <span className="inline-block mt-1 text-[12px] text-destructive font-semibold">{t.custReplyPending}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unified Timeline */}
              <div>
                <SectionTitle>{t.custTimeline}</SectionTitle>
                {timeline.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground italic">{t.custNoActivity}</p>
                ) : (
                  <div className="relative ml-1.5">
                    <div className="absolute left-[5px] top-0 bottom-0 w-px bg-border" />
                    <div className="flex flex-col gap-3">
                      {timeline.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 relative">
                          <div className={cn("w-[11px] h-[11px] rounded-full flex-shrink-0 mt-0.5 border-2 border-card", item.color)} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-medium text-foreground truncate">{item.label}</p>
                            <p className="text-[12px] text-muted-foreground">{item.sub} · {item.date.slice(0, 10)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CS 탭 ── */}
          {activeTab === "cs" && (
            <div className="p-4 flex flex-col gap-3">
              {custSessions.length === 0 ? (
                <p className="text-[12px] text-muted-foreground italic">{t.custNoCSHistory}</p>
              ) : custSessions.map(s => (
                <div key={s.id} className="rounded-xl border border-border p-3 bg-muted/20">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-[12px] font-semibold text-foreground leading-snug">{s.subject}</p>
                    <span className={cn("text-[12px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", {
                      "bg-emerald-100 text-emerald-700": s.status === "resolved",
                      "bg-primary/10 text-primary": s.status === "active" || s.status === "ai_agent",
                      "bg-amber-100 text-amber-700": s.status === "waiting" || s.status === "pending",
                    })}>
                      {s.status === "resolved" ? t.infoStatusDone : s.status === "active" ? t.cardStatusActive : s.status === "ai_agent" ? t.cardStatusAI : s.status === "waiting" ? t.infoStatusWaiting : s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span>{s.category}</span>
                    <span>·</span>
                    <span>{s.createdAt.slice(0, 10)}</span>
                    {s.waitTime && <><span>·</span><span>{t.infoSessionWait} {s.waitTime}</span></>}
                    {s.handleTime && <><span>·</span><span>{t.infoSessionHandle} {s.handleTime}</span></>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 주문 탭 ── */}
          {activeTab === "orders" && (
            <div className="p-4 flex flex-col gap-2">
              {orders.length === 0 ? (
                <p className="text-[12px] text-muted-foreground italic">{t.infoNoOrder}</p>
              ) : orders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-border bg-muted/20">
                  <div>
                    <p className="text-[12px] font-medium text-foreground">{o.item}</p>
                    <p className="text-[12px] text-muted-foreground">{o.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-foreground">{o.amount}</p>
                    <span className={cn("text-[12px] font-semibold px-1.5 py-0.5 rounded-full", {
                      "bg-emerald-100 text-emerald-700": o.status === "paid",
                      "bg-destructive/10 text-destructive": o.status === "refunded" || o.status === "cancelled",
                      "bg-amber-100 text-amber-700": o.status === "pending",
                    })}>
                      {o.status === "paid" ? t.infoOrderPaid : o.status === "refunded" ? t.infoOrderRefunded : o.status === "cancelled" ? t.infoOrderCancelled : t.infoOrderPending}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 예약 탭 ── */}
          {activeTab === "reservations" && (
            <div className="p-4 flex flex-col gap-2">
              {reservations.length === 0 ? (
                <p className="text-[12px] text-muted-foreground italic">{t.infoNoReservation}</p>
              ) : reservations.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-border bg-muted/20">
                  <div>
                    <p className="text-[12px] font-medium text-foreground">{r.service}</p>
                    <p className="text-[12px] text-muted-foreground">{r.date} {r.time}{r.memo ? ` · ${r.memo}` : ""}</p>
                  </div>
                  <span className={cn("text-[12px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0", {
                    "bg-emerald-100 text-emerald-700": r.status === "confirmed" || r.status === "completed",
                    "bg-destructive/10 text-destructive": r.status === "cancelled",
                    "bg-amber-100 text-amber-700": r.status === "pending",
                  })}>
                    {r.status === "confirmed" ? t.infoReservationConfirmed : r.status === "completed" ? t.infoReservationCompleted : r.status === "cancelled" ? t.infoReservationCancelled : t.infoReservationPending}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={() => onSendAction(customer)}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
            {t.custCRMSend}
          </button>
          <button className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            {t.custMemo}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──
export function CustomersPage({ storeId }: { storeId: string }) {
  const { locale, t } = useLocale()
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [addedCustomers, setAddedCustomers] = useState<Customer[]>([])

  // Override module-level data with locale-aware data
  const _allCustomers = useMemo(() => [
    ...Object.values(
      locale === "ko" ? { ...customers, ...additionalCustomers }
      : locale === "ar" ? saudiCustomersAr
      : saudiCustomersEn
    ),
    ...addedCustomers,
  ], [locale, addedCustomers])
  const _sessions = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
  const _reservations = locale === "ko" ? customerReservations : locale === "ar" ? saudiCustomerReservationsAr : saudiCustomerReservationsEn
  const _orders = locale === "ko" ? customerOrders : locale === "ar" ? saudiCustomerOrdersAr : saudiCustomerOrdersEn
  const _reviews = locale === "ko" ? customerReviews : locale === "ar" ? saudiCustomerReviewsAr : saudiCustomerReviewsEn

  // Locale-aware label maps
  const currencySymbol = locale === "ar" ? " ر.س" : locale === "en" ? "" : "원"
  const colLabels: Record<string, string> = {
    name: t.custInfoName, grade: t.custFieldGrade, sentiment: t.custFieldSentiment,
    ltv: "LTV", tickets: t.custFieldTickets, reservations: t.infoHistoryReservation,
    orders: t.infoHistoryOrder, reviews: t.infoHistoryReview, joined: t.infoFieldJoined, tags: t.custFieldTags,
  }
  const checkboxValueLabels: Record<string, string> = {
    has_name: t.custHasName, no_name: t.custNoNameFilter, cs_active: t.cardStatusActive,
    positive: t.sentimentPositive, neutral: t.sentimentNeutral, negative: t.sentimentNegative,
    VIP: "VIP", 일반: t.custGradeRegular, 신규: t.custGradeNew,
  }
  const rangeUnits: Record<string, string> = {
    ltv: currencySymbol, tickets: t.histUnit, reservations: t.histUnit,
    orders: t.histUnit, reviews: t.custReviewPoint,
  }
  const humanizeFilter = (col: string, vals: string[]) =>
    humanizeColFilter(col, vals, colLabels, checkboxValueLabels, rangeUnits, {
      gte: t.custOpGte, lte: t.custOpLte, after: t.custDateAfter, before: t.custDateBefore,
    })

  const BUILT_IN_VIEWS: FilterView[] = useMemo(() => [
    { id: "all",        label: t.filterAll,            builtIn: true, state: { segment: "all",        colFilters: {}, search: "" } },
    { id: "vip",        label: "VIP",                  builtIn: true, state: { segment: "vip",        colFilters: {}, search: "" } },
    { id: "new",        label: t.custGradeNew,         builtIn: true, state: { segment: "new",        colFilters: {}, search: "" } },
    { id: "negative",   label: t.sentimentNegative,    builtIn: true, state: { segment: "negative",   colFilters: {}, search: "" } },
    { id: "no_order",   label: t.custSegNoOrder,       builtIn: true, state: { segment: "no_order",   colFilters: {}, search: "" } },
    { id: "pending_cs", label: t.custSegPendingCS,     builtIn: true, state: { segment: "pending_cs", colFilters: {}, search: "" } },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [locale])

  const gradeLabels = { vip: "VIP", new: t.custGradeNew, regular: t.custGradeRegular }

  // Locale-keyed summary card filter map (segment filtering by card click)
  const summaryTotalLabel   = t.custSummaryTotal
  const summaryNewLabel     = t.custGradeNew
  const summaryNegativeLabel = t.custSummaryNegative
  const summaryPendingCS    = t.custSegPendingCS
  const summaryUnidentified = t.custSummaryUnidentified
  const summaryUnanswered   = t.custSummaryUnanswered
  const summaryLongAbsent   = t.custSummaryLongAbsent

  const SUMMARY_CARD_FILTERS: Record<string, FilterViewState> = {
    [summaryTotalLabel]:    { segment: "all",        colFilters: {},                   search: "" },
    "VIP":                  { segment: "vip",        colFilters: {},                   search: "" },
    [summaryNewLabel]:      { segment: "new",        colFilters: {},                   search: "" },
    [summaryNegativeLabel]: { segment: "negative",   colFilters: {},                   search: "" },
    [summaryPendingCS]:     { segment: "pending_cs", colFilters: {},                   search: "" },
    [summaryUnidentified]:  { segment: "all",        colFilters: { name: ["no_name"] }, search: "" },
    [summaryUnanswered]:    { segment: "all",        colFilters: { name: ["cs_active"] }, search: "" },
    [summaryLongAbsent]:    { segment: "all",        colFilters: {},                   search: "" },
  }

  const [pageTab, setPageTab] = useState<"list" | "groups">("list")
  const [groups, setGroups] = useState<CustomerGroup[]>(() => makeInitialGroups(t))
  const [showAddToGroupMenu, setShowAddToGroupMenu] = useState(false)
  const [search, setSearch] = useState("")

  // Close Add-to-Group dropdown on outside click
  const closeMenu = () => setShowAddToGroupMenu(false)
  const [segment, setSegment] = useState("all")
  const [sortCol, setSortCol] = useState<SortCol>("ltv")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [colFilters, setColFilters] = useState<Record<string, Set<string>>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null)
  const [sendActionCustomer, setSendActionCustomer] = useState<Customer | null>(null)
  const [filterViews, setFilterViews] = useState<FilterView[]>(BUILT_IN_VIEWS)
  const [activeViewId, setActiveViewId] = useState<string>("all")
  const [showSaveModal, setShowSaveModal] = useState(false)

  const applyFilterView = (view: FilterView) => {
    setActiveViewId(view.id)
    setSegment(view.state.segment)
    setSearch(view.state.search)
    const restored: Record<string, Set<string>> = {}
    for (const [k, v] of Object.entries(view.state.colFilters)) {
      restored[k] = new Set(v)
    }
    setColFilters(restored)
  }

  const summaryClickableLabels = useMemo(
    () => new Set(Object.keys(SUMMARY_CARD_FILTERS)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summaryTotalLabel, summaryNewLabel, summaryNegativeLabel, summaryPendingCS, summaryUnidentified, summaryUnanswered, summaryLongAbsent]
  )

  const handleSummaryCardClick = (label: string) => {
    const fvState = SUMMARY_CARD_FILTERS[label]
    if (!fvState) return
    // Find matching built-in view or apply inline
    const match = filterViews.find(v => v.state.segment === fvState.segment && JSON.stringify(Object.fromEntries(Object.entries(v.state.colFilters))) === JSON.stringify(fvState.colFilters))
    setActiveViewId(match?.id ?? "__summary__")
    setSegment(fvState.segment)
    setSearch(fvState.search)
    const restored: Record<string, Set<string>> = {}
    for (const [k, v] of Object.entries(fvState.colFilters)) {
      restored[k] = new Set(v)
    }
    setColFilters(restored)
  }

  const currentFilterState: FilterViewState = {
    segment,
    search,
    colFilters: Object.fromEntries(
      Object.entries(colFilters).map(([k, v]) => [k, [...v]])
    ),
  }

  const saveFilterView = (view: FilterView) => {
    setFilterViews(prev => [...prev, view])
    setActiveViewId(view.id)
  }

  const deleteFilterView = (id: string) => {
    setFilterViews(prev => prev.filter(v => v.id !== id))
    if (activeViewId === id) applyFilterView(BUILT_IN_VIEWS[0])
  }

  const storeCustomers = useMemo(() => _allCustomers.filter(c => c.storeId === storeId), [_allCustomers, storeId])

  const filtered = useMemo(() => {
    let list = storeCustomers

    if (segment === "vip") list = list.filter(c => c.grade === "VIP")
    else if (segment === "new") list = list.filter(c => c.grade === "신규")
    else if (segment === "negative") list = list.filter(c => c.sentiment === "negative")
    else if (segment === "no_order") list = list.filter(c => (_orders[c.id] ?? []).filter(o => o.status === "paid").length === 0)
    else if (segment === "pending_cs") list = list.filter(c =>
      _sessions.some(s => s.customerId === c.id && s.storeId === storeId && (s.status === "active" || s.status === "waiting" || s.status === "ai_agent"))
    )

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.tags ?? []).some(t => t.toLowerCase().includes(q))
      )
    }

    // ── Column filters ──
    // customer (checkbox)
    const custF = colFilters["name"]
    if (custF && custF.size > 0) {
      if (custF.has("has_name")) list = list.filter(c => !!c.name)
      if (custF.has("no_name")) list = list.filter(c => !c.name)
      if (custF.has("cs_active")) list = list.filter(c => _sessions.some(s => s.customerId === c.id && s.storeId === storeId && (s.status === "active" || s.status === "waiting" || s.status === "ai_agent")))
    }
    // grade (checkbox)
    const gradeF = colFilters["grade"]
    if (gradeF && gradeF.size > 0) list = list.filter(c => gradeF.has(c.grade ?? "일반"))
    // sentiment (checkbox)
    const sentF = colFilters["sentiment"]
    if (sentF && sentF.size > 0) list = list.filter(c => sentF.has(c.sentiment))
    // tags (checkbox)
    const tagF = colFilters["tags"]
    if (tagF && tagF.size > 0) list = list.filter(c => [...tagF].every(t => c.tags.includes(t)))

    // range filter helper
    const applyRange = (list: typeof storeCustomers, col: string, getValue: (c: typeof storeCustomers[0]) => number) => {
      const f = colFilters[col]
      if (!f || f.size === 0) return list
      try {
        const { op, a, b } = JSON.parse([...f][0])
        const av = parseFloat(a), bv = parseFloat(b)
        if (op === "gte") return list.filter(c => getValue(c) >= av)
        if (op === "lte") return list.filter(c => getValue(c) <= av)
        if (op === "between") return list.filter(c => { const v = getValue(c); return v >= av && v <= bv })
      } catch {}
      return list
    }
    list = applyRange(list, "ltv", c => ltvNum(c.ltv))
    list = applyRange(list, "tickets", c => c.totalTickets)
    list = applyRange(list, "reservations", c => customerReservations[c.id]?.length ?? 0)
    list = applyRange(list, "orders", c => customerOrders[c.id]?.filter(o => o.status === "paid").length ?? 0)
    list = applyRange(list, "reviews", c => {
      const rs = customerReviews[c.id] ?? []
      return rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0
    })
    // joined (date)
    const joinedF = colFilters["joined"]
    if (joinedF && joinedF.size > 0) {
      try {
        const { op, a, b } = JSON.parse([...joinedF][0])
        list = list.filter(c => {
          const d = c.joinedAt || ""
          if (op === "after")   return d >= a
          if (op === "before")  return d <= a
          if (op === "between") return d >= a && d <= b
          return true
        })
      } catch {}
    }

    // Sort
    const dir = sortDir === "asc" ? 1 : -1
    if (sortCol === "ltv") list = [...list].sort((a, b) => dir * (ltvNum(a.ltv) - ltvNum(b.ltv)))
    else if (sortCol === "tickets") list = [...list].sort((a, b) => dir * (a.totalTickets - b.totalTickets))
    else if (sortCol === "joined") list = [...list].sort((a, b) => dir * (a.joinedAt || "").localeCompare(b.joinedAt || ""))
    else if (sortCol === "sentiment") {
      const order = { negative: 0, neutral: 1, positive: 2 }
      list = [...list].sort((a, b) => dir * (order[a.sentiment] - order[b.sentiment]))
    } else if (sortCol === "name") list = [...list].sort((a, b) => dir * a.name.localeCompare(b.name))
    else if (sortCol === "grade") list = [...list].sort((a, b) => dir * (gradeOrder[a.grade ?? ""] - gradeOrder[b.grade ?? ""]))
    else if (sortCol === "orders") list = [...list].sort((a, b) => dir * ((customerOrders[a.id]?.filter(o => o.status === "paid").length ?? 0) - (customerOrders[b.id]?.filter(o => o.status === "paid").length ?? 0)))
    else if (sortCol === "reservations") list = [...list].sort((a, b) => dir * ((customerReservations[a.id]?.length ?? 0) - (customerReservations[b.id]?.length ?? 0)))
    else if (sortCol === "reviews") list = [...list].sort((a, b) => {
      const ra = customerReviews[a.id] ?? []; const rb = customerReviews[b.id] ?? []
      const avgA = ra.length ? ra.reduce((s, r) => s + r.rating, 0) / ra.length : 0
      const avgB = rb.length ? rb.reduce((s, r) => s + r.rating, 0) / rb.length : 0
      return dir * (avgA - avgB)
    })

    return list
  }, [storeCustomers, segment, search, sortCol, sortDir, colFilters, storeId])

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortCol(col); setSortDir("desc") }
  }

  const RANGE_COLS = new Set(["ltv", "tickets", "reservations", "orders", "reviews"])
  const DATE_COLS = new Set(["joined"])

  const handleColFilter = (col: string, value: string) => {
    setColFilters(prev => {
      if (RANGE_COLS.has(col) || DATE_COLS.has(col)) {
        // range/date: single value replaces the set
        return { ...prev, [col]: new Set([value]) }
      }
      // checkbox: toggle
      const cur = new Set(prev[col] ?? [])
      cur.has(value) ? cur.delete(value) : cur.add(value)
      return { ...prev, [col]: cur }
    })
  }

  const handleColFilterReset = (col: string) => {
    setColFilters(prev => {
      const next = { ...prev }
      delete next[col]
      return next
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(c => c.id)))
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Page header */}
      <div className="px-4 md:px-6 pt-4 md:pt-5 pb-4 border-b border-border flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 mb-4">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">{t.navCustomers}</h1>
            <p className="text-[12px] md:text-[12px] text-muted-foreground mt-0.5">{t.custPageDesc}</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            {/* Page tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
              <button
                onClick={() => setPageTab("list")}
                className={cn(
                  "flex items-center justify-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-[12px] md:text-[12px] font-medium transition-all flex-1 md:flex-initial",
                  pageTab === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-3.5 h-3.5" />
                {t.custTabList}
              </button>
              <button
                onClick={() => setPageTab("groups")}
                className={cn(
                  "flex items-center justify-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-[12px] md:text-[12px] font-medium transition-all flex-1 md:flex-initial",
                  pageTab === "groups" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                {t.custTabGroups}
              </button>
            </div>

            <div className="flex items-center gap-2">
            <button className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Download className="w-3.5 h-3.5" />
              {t.histExport}
            </button>
            <button onClick={() => setShowAddCustomer(true)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] md:text-[12px] font-semibold hover:opacity-90 transition-opacity flex-1 md:flex-initial">
              <Plus className="w-3.5 h-3.5" />
              {t.custAddCustomer}
            </button>
            </div>
          </div>
        </div>

        {pageTab === "list" && <SummaryBar storeId={storeId} onCardClick={handleSummaryCardClick} clickableLabels={summaryClickableLabels} />}

        {/* Filters row */}
        {pageTab === "list" && <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 w-full md:w-auto md:min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveViewId("__custom__") }}
              placeholder={t.custSearchPlaceholder}
              className="flex-1 text-[12px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* FilterView bar */}
          <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none min-w-0 pb-1 md:pb-0">
            {filterViews.map(view => (
              <div key={view.id} className="flex-shrink-0 flex items-center group">
                <button
                  onClick={() => applyFilterView(view)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap",
                    activeViewId === view.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {!view.builtIn && <Bookmark className="w-3 h-3 flex-shrink-0" />}
                  {view.label}
                </button>
                {!view.builtIn && (
                  <button
                    onClick={() => deleteFilterView(view.id)}
                    className="opacity-0 group-hover:opacity-100 ml-0.5 w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                    title={t.deleteBtn}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Add filter view */}
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] text-muted-foreground border border-dashed border-border hover:border-primary hover:text-primary transition-all ml-1"
                  title={t.custSaveViewBtn}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{t.custAddFilterView}</span>
            </button>
          </div>
        </div>}
      </div>

      {pageTab === "groups" && <CustomerGroupsPanel storeId={storeId} groups={groups} setGroups={setGroups} />}

      {pageTab === "list" && <>
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-6 py-2.5 bg-primary/5 border-b border-primary/20">
          <span className="text-[12px] font-semibold text-primary">{t.custSelectedCount.replace("{n}", String(selectedIds.size))}</span>
          <button
            onClick={() => {
              const first = _allCustomers.find(c => selectedIds.has(c.id))
              if (first) setSendActionCustomer(first)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 transition-opacity"
          >
            <Send className="w-3 h-3" />
            {t.custBulkMessage}
          </button>
          {/* Add to group dropdown */}
          <div className="relative" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) closeMenu() }}>
            <button
              onClick={() => setShowAddToGroupMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-[12px] font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Layers className="w-3 h-3" />
              {t.custAddToGroup}
            </button>
            {showAddToGroupMenu && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-background border border-border rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                <p className="text-[12px] font-semibold text-muted-foreground px-3 py-1.5 uppercase tracking-wide">{t.custAddToGroupHeader}</p>
                {groups.map((group, idx) => {
                  const pal = GROUP_PALETTE[group.colorIdx % GROUP_PALETTE.length]
                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        setGroups(prev => prev.map(g =>
                          g.id === group.id
                            ? { ...g, pinnedIds: [...new Set([...g.pinnedIds, ...[...selectedIds]])] }
                            : g
                        ))
                        setShowAddToGroupMenu(false)
                        setSelectedIds(new Set())
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted transition-colors text-left"
                    >
                      <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", pal.dot)} />
                      <span className="text-[13px] font-medium text-foreground flex-1 truncate">{group.name}</span>
                    </button>
                  )
                })}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      const name = prompt(t.custPromptGroupName)
                      if (!name?.trim()) return
                      const newGroup: CustomerGroup = {
                        id: `grp-${Date.now()}`,
                        name: name.trim(),
                        description: "",
                        colorIdx: groups.length % GROUP_PALETTE.length,
                        conditions: [],
                        pinnedIds: [...selectedIds],
                        createdAt: new Date().toISOString().slice(0, 10),
                      }
                      setGroups(prev => [...prev, newGroup])
                      setShowAddToGroupMenu(false)
                      setSelectedIds(new Set())
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted transition-colors text-left text-primary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[13px] font-semibold">{t.custNewGroupCreate}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            {t.custDeselectAll}
          </button>
        </div>
      )}

      {/* Table - Desktop */}
      <div className="hidden md:block flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-card border-b border-border">
            <tr>
              <th className="pl-4 pr-2 py-3 w-8">
                <button onClick={toggleAll} className="w-4 h-4 flex items-center justify-center">
                  {selectedIds.size === filtered.length && filtered.length > 0
                    ? <CheckSquare className="w-4 h-4 text-primary" />
                    : <Square className="w-4 h-4 text-muted-foreground/40" />}
                </button>
              </th>
              {(() => {
                const allTags = [...new Set(storeCustomers.flatMap(c => c.tags))]
                type ColDef = {
                  label: string
                  colKey: SortCol
                  filterType?: ColFilterType
                  checkboxOptions?: { value: string; label: string }[]
                  rangeUnit?: string
                  canSort?: boolean
                }
                const cols: ColDef[] = [
                  { label: t.custInfoName, colKey: "name", filterType: "checkbox", canSort: true, checkboxOptions: [
                    { value: "has_name",  label: t.custHasName },
                    { value: "no_name",   label: t.custNoNameFilter },
                    { value: "cs_active", label: t.cardStatusActive },
                  ]},
                  { label: t.custFieldGrade, colKey: "grade", filterType: "checkbox", checkboxOptions: [
                    { value: "VIP",  label: "VIP" },
                    { value: "일반", label: t.custGradeRegular },
                    { value: "신규", label: t.custGradeNew },
                  ]},
                  { label: t.custFieldSentiment, colKey: "sentiment", filterType: "checkbox", checkboxOptions: [
                    { value: "positive", label: t.sentimentPositive },
                    { value: "neutral",  label: t.sentimentNeutral },
                    { value: "negative", label: t.sentimentNegative },
                  ]},
                  { label: "LTV",                      colKey: "ltv",          filterType: "range", rangeUnit: currencySymbol },
                  { label: t.custFieldTickets,          colKey: "tickets",      filterType: "range", rangeUnit: t.histUnit },
                  { label: t.infoHistoryReservation,    colKey: "reservations", filterType: "range", rangeUnit: t.histUnit },
                  { label: t.infoHistoryOrder,          colKey: "orders",       filterType: "range", rangeUnit: t.histUnit },
                  { label: t.infoHistoryReview,         colKey: "reviews",      filterType: "range", rangeUnit: t.custReviewPoint },
                  { label: t.infoFieldJoined,           colKey: "joined",       filterType: "date" },
                  { label: t.custFieldTags,             colKey: "tags",         filterType: "checkbox", canSort: false, checkboxOptions: allTags.map(tag => ({ value: tag, label: tag })) },
                ]
                return cols.map(col => (
                  <ColumnHeader
                    key={col.colKey}
                    label={col.label}
                    colKey={col.colKey}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    filterType={col.filterType}
                    checkboxOptions={col.checkboxOptions}
                    rangeUnit={col.rangeUnit}
                    activeFilter={colFilters[col.colKey] ?? new Set()}
                    onFilterApply={raw => {
                      if (col.filterType === "checkbox") {
                        handleColFilter(col.colKey, raw)
                      } else {
                        setColFilters(prev => ({ ...prev, [col.colKey]: new Set([raw]) }))
                      }
                    }}
                    onFilterReset={() => handleColFilterReset(col.colKey)}
                    canSort={col.canSort ?? true}
                  />
                ))
              })()}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-muted-foreground text-sm">
                  {t.custNoCustomers}
                </td>
              </tr>
            ) : filtered.map(c => (
              <CustomerRow
                key={c.id}
                customer={c}
                selected={selectedIds.has(c.id)}
                onSelect={toggleSelect}
                onClick={setDetailCustomer}
                storeId={storeId}
                groups={groups}
                onAddToGroup={(customerId, groupId) => {
                  setGroups(prev => prev.map(g =>
                    g.id === groupId
                      ? { ...g, pinnedIds: [...new Set([...g.pinnedIds, customerId])] }
                      : g
                  ))
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer list - Mobile */}
      <div className="md:hidden flex-1 overflow-auto px-4 py-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm bg-card rounded-xl border border-border">
            {t.custNoCustomers}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setDetailCustomer(c)}
                className="bg-card border border-border rounded-xl p-3 active:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-primary-foreground flex-shrink-0"
                       style={{ backgroundColor: c.sentiment === "positive" ? "#22c55e" : c.sentiment === "negative" ? "#ef4444" : "#6b7280" }}>
                    {c.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-foreground truncate">{c.name}</span>
                      {gradeBadge(c.grade, gradeLabels)}
                    </div>
                    <p className="text-[12px] text-muted-foreground">{c.phone}</p>
                    <div className="flex items-center gap-3 mt-2 text-[12px]">
                      <span className="text-muted-foreground">LTV <span className="font-medium text-foreground">{c.ltv}</span></span>
                      <span className="text-muted-foreground">CS <span className="font-medium text-foreground">{c.totalTickets}</span></span>
                      <div className="flex items-center gap-1">
                        {sentimentIcon(c.sentiment)}
                        <span className="text-muted-foreground">{c.sentiment === "positive" ? t.sentimentPositive : c.sentiment === "negative" ? t.sentimentNegative : t.sentimentNeutral}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result count */}
      <div className="px-4 md:px-6 py-2 border-t border-border flex-shrink-0">
        <p className="text-[12px] text-muted-foreground">{t.custResultCount.replace("{shown}", String(filtered.length)).replace("{total}", String(storeCustomers.length))}</p>
      </div>
      </>}

      {detailCustomer && (
        <CustomerDetailPanel
          customer={detailCustomer}
          storeId={storeId}
          onClose={() => setDetailCustomer(null)}
          onSendAction={c => { setDetailCustomer(null); setSendActionCustomer(c) }}
        />
      )}

      {sendActionCustomer && (
        <SendActionModal customer={sendActionCustomer} onClose={() => setSendActionCustomer(null)} />
      )}

      {showSaveModal && (
        <SaveFilterViewModal
          currentState={currentFilterState}
          onSave={saveFilterView}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {showAddCustomer && (
        <AddCustomerModal
          storeId={storeId}
          onClose={() => setShowAddCustomer(false)}
          onAdd={(c) => { setAddedCustomers(prev => [...prev, c]); setShowAddCustomer(false) }}
        />
      )}
    </div>
  )
}

// ── Add Customer Modal ──
function AddCustomerModal({ storeId, onClose, onAdd }: { storeId: string; onClose: () => void; onAdd: (c: Customer) => void }) {
  const { t, locale } = useLocale()
  const isRTL = locale === "ar"
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [grade, setGrade] = useState("일반")

  const phoneLabel = locale === "ar" ? "الهاتف" : "Phone"
  const emailLabel = locale === "ar" ? "البريد الإلكتروني" : "Email"
  const cancelLabel = locale === "ar" ? "إلغاء" : locale === "en" ? "Cancel" : "취소"
  const saveLabel = locale === "ar" ? "حفظ" : locale === "en" ? "Save" : "저장"
  const gradeLabelVip = "VIP"
  const gradeLabelNew = t.custGradeNew
  const gradeLabelReg = t.custGradeRegular

  const AVATAR_COLORS = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-amber-500", "bg-teal-500"]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    const initials = name.trim().slice(0, 2)
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    const newCustomer: Customer = {
      id: `cust-new-${Date.now()}`,
      storeId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      grade,
      totalTickets: 0,
      resolvedTickets: 0,
      joinedAt: new Date().toISOString().slice(0, 10),
      tags: [],
      avatarInitials: initials,
      avatarColor: color,
      sentiment: "neutral",
    }
    onAdd(newCustomer)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-xl w-[400px] p-6 flex flex-col gap-5"
        dir={isRTL ? "rtl" : "ltr"}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">{t.custAddCustomer}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-muted-foreground">{t.custInfoName} *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full text-[13px] px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-muted-foreground">{phoneLabel} *</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="w-full text-[13px] px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-muted-foreground">{emailLabel}</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              className="w-full text-[13px] px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Grade */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-muted-foreground">{t.custFieldGrade}</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full text-[13px] px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="일반">{gradeLabelReg}</option>
              <option value="신규">{gradeLabelNew}</option>
              <option value="VIP">{gradeLabelVip}</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-[13px] text-muted-foreground hover:bg-muted transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              {saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
