"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale"
import type { Locale } from "@/lib/locale"
import { LOCALE_LABELS } from "@/lib/locale"
import {
  Building2, Star, CalendarDays, ShoppingCart, MessageCircleQuestion,
  Megaphone, Users, Settings, Plus, Bot, Brain, ClipboardList, Globe, ChevronDown, Check,
  Menu, X, ChevronRight, Bell,
} from "lucide-react"
import { saudiStores } from "@/lib/data-saudi"

type NavView = "inquiry" | "consultation" | "customers" | "marketing" | "autoresponse" | "knowledgebase" | "biz" | "review" | "reservation" | "order"

interface TopNavProps {
  onStoreChange?: (storeId: string) => void
  onNavChange?: (view: NavView) => void
  activeView?: NavView
}

/* ─── Mobile Top Bar ──────────────────────────────────────────────────────── */
interface MobileTopBarProps {
  activeView: NavView
  onMenuOpen: () => void
}

export function MobileTopBar({ activeView, onMenuOpen }: MobileTopBarProps) {
  const { t } = useLocale()

  const VIEW_LABELS: Record<NavView, string> = {
    inquiry:       t.navInquiry,
    consultation:  t.navConsultation,
    customers:     t.navCustomers,
    marketing:     t.navMarketing,
    autoresponse:  t.navAutoResponse,
    knowledgebase: t.navKnowledge,
    biz:           t.navBiz,
    review:        t.navReview,
    reservation:   t.navReservation,
    order:         t.navOrder,
  }

  return (
    <header className="flex items-center justify-between h-12 px-4 bg-sidebar text-sidebar-foreground flex-shrink-0 md:hidden">
      <button
        onClick={onMenuOpen}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent/60 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <span className="text-[14px] font-semibold">{VIEW_LABELS[activeView]}</span>
      <div className="w-8 h-8 flex items-center justify-center rounded-lg">
        {/* placeholder to balance flex */}
      </div>
    </header>
  )
}

/* ─── Mobile Drawer ───────────────────────────────────────────────────────── */
interface MobileDrawerProps extends TopNavProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose, onStoreChange, onNavChange, activeView = "inquiry" }: MobileDrawerProps) {
  const { locale, setLocale, t, isRTL } = useLocale()
  const [langOpen, setLangOpen] = useState(false)
  const [activeStoreId, setActiveStoreId] = useState("store-001")

  const KO_STORE_NAMES: Record<string, { name: string; initials: string }> = {
    "store-001": { name: "강남 헤어샵", initials: "강남" },
    "store-002": { name: "서울 헤어샵", initials: "서울" },
    "store-003": { name: "송파 헤어샵", initials: "송파" },
  }
  const stores = saudiStores.map((s) => {
    const ko = KO_STORE_NAMES[s.id] ?? { name: s.nameEn, initials: s.initialsEn }
    return {
      id: s.id,
      name: locale === "ar" ? s.nameAr : locale === "en" ? s.nameEn : ko.name,
      initials: locale === "ar" ? s.initialsAr : locale === "en" ? s.initialsEn : ko.initials,
      phone: s.phone,
      unread: s.unread,
    }
  })

  const navGroups = [
    {
      category: t.navSupport,
      items: [
        { label: t.navInquiry,      icon: MessageCircleQuestion, view: "inquiry" as NavView, badge: 3 },
        { label: t.navConsultation, icon: ClipboardList,         view: "consultation" as NavView },
        { label: t.navAutoResponse, icon: Bot,                   view: "autoresponse" as NavView },
        { label: t.navKnowledge,    icon: Brain,                 view: "knowledgebase" as NavView },
      ],
    },
    {
      category: t.navCRM,
      items: [
        { label: t.navMarketing, icon: Megaphone, view: "marketing" as NavView },
        { label: t.navCustomers, icon: Users,     view: "customers" as NavView },
      ],
    },
  ]

  const localeOrder: Locale[] = ["ko", "en", "ar"]

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 bottom-0 z-50 w-72 bg-sidebar flex flex-col overflow-hidden md:hidden",
          isRTL ? "right-0" : "left-0"
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <span className="text-sidebar-foreground font-bold text-base">Saudi Project</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stores */}
        <div className="px-3 py-2 border-b border-sidebar-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 px-1 mb-1.5">{t.navStoreLabel}</p>
          <div className="flex flex-col gap-0.5">
            {stores.map((store) => {
              const isActive = activeStoreId === store.id
              return (
                <button
                  key={store.id}
                  onClick={() => {
                    setActiveStoreId(store.id)
                    onStoreChange?.(store.id)
                    onClose()
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className={cn(
                    "w-6 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[9px] font-bold",
                    isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-foreground/10 text-sidebar-foreground/60"
                  )}>
                    <span suppressHydrationWarning>{store.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5 text-start">
                    <p className="text-[13px] font-medium leading-none truncate" suppressHydrationWarning>{store.name}</p>
                    <p className="text-[11px] text-sidebar-foreground/50 leading-none">{store.phone}</p>
                  </div>
                  {store.unread ? (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {store.unread}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 gnb-scrollbar">
          {navGroups.map((group) => (
            <div key={group.category} className="mb-2">
              <p className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/35" suppressHydrationWarning>
                {group.category}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = activeView === item.view
                  return (
                    <button
                      key={item.view}
                      onClick={() => { onNavChange?.(item.view); onClose() }}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                      )}
                    >
                      <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                      <span className="text-[14px] leading-none" suppressHydrationWarning>{item.label}</span>
                      {"badge" in item && item.badge ? (
                        <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: language + profile */}
        <div className="px-3 py-3 border-t border-sidebar-border flex flex-col gap-1">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg border border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all"
            >
              <Globe className="w-4 h-4 flex-shrink-0 text-sidebar-primary" />
              <span className="flex-1 text-[13px] font-medium text-start" suppressHydrationWarning>{LOCALE_LABELS[locale]}</span>
              <ChevronRight className={cn("w-3.5 h-3.5 text-sidebar-foreground/40 transition-transform", langOpen && "rotate-90")} />
            </button>
            {langOpen && (
              <div className="mt-1 rounded-xl border border-sidebar-border bg-sidebar-accent overflow-hidden">
                {localeOrder.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLocale(l); setLangOpen(false) }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors hover:bg-sidebar-accent/80",
                      locale === l ? "text-sidebar-foreground font-semibold" : "text-sidebar-foreground/60"
                    )}
                  >
                    <span className="flex-1 text-start" suppressHydrationWarning>{LOCALE_LABELS[l]}</span>
                    {locale === l && <Check className="w-3.5 h-3.5 text-sidebar-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-sidebar-accent/60 cursor-pointer transition-all">
            <div className="relative w-8 h-8 rounded-full bg-sidebar-primary/25 border border-sidebar-primary/50 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-sidebar-primary" suppressHydrationWarning>{t.agentInitials}</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-sidebar-primary border-2 border-sidebar" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-sidebar-foreground leading-none" suppressHydrationWarning>{t.agentName}</span>
              <span className="text-[11px] text-sidebar-foreground/50 mt-0.5" suppressHydrationWarning>{t.online}</span>
            </div>
            <Settings className="w-4 h-4 text-sidebar-foreground/40 ml-auto" />
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Mobile Bottom Nav ───────────────────────────────────────────────────── */
interface MobileBottomNavProps {
  activeView: NavView
  onNavChange: (view: NavView) => void
}

export function MobileBottomNav({ activeView, onNavChange }: MobileBottomNavProps) {
  const { t } = useLocale()

  const tabs: { icon: React.ElementType; view: NavView; label: string; badge?: number }[] = [
    { icon: MessageCircleQuestion, view: "inquiry",       label: t.navInquiry,      badge: 3 },
    { icon: ClipboardList,         view: "consultation",  label: t.navConsultation },
    { icon: Megaphone,             view: "marketing",     label: t.navMarketing },
    { icon: Users,                 view: "customers",     label: t.navCustomers },
    { icon: Brain,                 view: "knowledgebase", label: t.navKnowledge },
  ]

  return (
    <nav className="flex items-stretch h-[60px] border-t border-border bg-background flex-shrink-0 md:hidden safe-bottom">
      {tabs.map((tab) => {
        const isActive = activeView === tab.view
        return (
          <button
            key={tab.view}
            onClick={() => onNavChange(tab.view)}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.badge && !isActive ? (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[9px] leading-none font-medium truncate max-w-[56px]" suppressHydrationWarning>
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

export function TopNav({ onStoreChange, onNavChange, activeView = "inquiry" }: TopNavProps) {
  const { locale, setLocale, t, isRTL } = useLocale()
  const [activeStoreId, setActiveStoreId] = useState("store-001")
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const KO_STORE_NAMES: Record<string, { name: string; initials: string }> = {
    "store-001": { name: "강남 헤어샵", initials: "강남" },
    "store-002": { name: "서울 헤어샵", initials: "서울" },
    "store-003": { name: "송파 헤어샵", initials: "송파" },
  }
  const stores = saudiStores.map((s) => {
    const ko = KO_STORE_NAMES[s.id] ?? { name: s.nameEn, initials: s.initialsEn }
    return {
      id: s.id,
      name: locale === "ar" ? s.nameAr : locale === "en" ? s.nameEn : ko.name,
      initials: locale === "ar" ? s.initialsAr : locale === "en" ? s.initialsEn : ko.initials,
      phone: s.phone,
      unread: s.unread,
    }
  })

  const navGroups = [
    {
      category: t.navSupport,
      items: [
        { label: t.navInquiry,      icon: MessageCircleQuestion, view: "inquiry" as NavView, badge: 3 },
        { label: t.navConsultation, icon: ClipboardList,         view: "consultation" as NavView },
        { label: t.navAutoResponse, icon: Bot,                   view: "autoresponse" as NavView },
        { label: t.navKnowledge,    icon: Brain,                 view: "knowledgebase" as NavView },
      ],
    },
    {
      category: t.navCRM,
      items: [
        { label: t.navMarketing, icon: Megaphone, view: "marketing" as NavView },
        { label: t.navCustomers, icon: Users,     view: "customers" as NavView },
      ],
    },
  ]

  const localeOrder: Locale[] = ["ko", "en", "ar"]

  return (
    <nav
      className="flex flex-col h-full w-52 bg-sidebar flex-shrink-0 py-4 gap-1"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Logo */}
      <div className="px-4 mb-3 flex items-center">
        <span className="text-sidebar-foreground font-bold text-base tracking-tight">Saudi Project</span>
      </div>

      {/* Store list */}
      <div className="px-2 mb-1">
        <p className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-wider px-2 mb-1.5">
          {t.navStoreLabel}
        </p>
        <div className="flex flex-col gap-0.5">
          {stores.map((store) => {
            const isActive = activeStoreId === store.id
            return (
              <button
                key={store.id}
                onClick={() => { setActiveStoreId(store.id); onStoreChange?.(store.id) }}
                className={cn(
                  "relative w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                {/* 스토어 아바타 */}
                <div className={cn(
                  "w-6 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[9px] font-bold leading-none",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-sidebar-foreground/10 text-sidebar-foreground/60"
                )}>
                  <span suppressHydrationWarning>{store.initials}</span>
                </div>

                {/* 스토어명 + 전화번호 */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5 text-start">
                  <span className="text-[12px] font-medium leading-none truncate" suppressHydrationWarning>
                    {store.name}
                  </span>
                  <span className={cn(
                    "text-[10px] leading-none tabular-nums",
                    isActive ? "text-sidebar-foreground/60" : "text-sidebar-foreground/35"
                  )}>
                    {store.phone}
                  </span>
                </div>

                {/* 미읽음 뱃지 */}
                {store.unread ? (
                  <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {store.unread}
                  </span>
                ) : null}

                {/* 활성 인디케이터 — CSS ltr/rtl handled by dir attribute */}
                {isActive && (
                  <span className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-1 h-4",
                    isRTL ? "left-0 rounded-r-full" : "right-0 rounded-l-full",
                    "bg-sidebar-primary"
                  )} />
                )}
              </button>
            )
          })}

          {/* 스토어 추가 */}
          <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/30 transition-all">
            <div className="w-6 h-6 rounded-md border border-dashed border-sidebar-foreground/20 flex items-center justify-center flex-shrink-0">
              <Plus className="w-3 h-3" />
            </div>
            <span className="text-[12px]" suppressHydrationWarning>{t.navAddStore}</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-sidebar-border mx-4 mb-1" />

      {/* Main nav */}
      <div className="flex flex-col flex-1 px-2 overflow-y-auto gnb-scrollbar">
        {navGroups.map((group) => (
          <div key={group.category} className="mb-1">
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/35 select-none" suppressHydrationWarning>
              {group.category}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = activeView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => onNavChange?.(item.view)}
                    className={cn(
                      "relative flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[13px] leading-none" suppressHydrationWarning>{item.label}</span>
                    {"badge" in item && item.badge ? (
                      <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center flex-shrink-0">
                        {item.badge}
                      </span>
                    ) : null}
                    {isActive && (
                      <span className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-1 h-5",
                        isRTL ? "left-0 rounded-r-full" : "right-0 rounded-l-full",
                        "bg-sidebar-primary"
                      )} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className={cn(
        "flex flex-col gap-0.5 px-2 border-t border-sidebar-border pt-3 mt-1"
      )}>

        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all">
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span className="text-[13px] leading-none" suppressHydrationWarning>{t.navSettings}</span>
        </button>

        {/* Language dropdown */}
        <div ref={langRef} className="relative px-1">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 border border-sidebar-foreground/20 hover:border-sidebar-foreground/35 transition-all"
          >
            <Globe className="w-4 h-4 flex-shrink-0 text-sidebar-primary" />
            <span className="flex-1 text-[13px] leading-none text-start font-medium" suppressHydrationWarning>
              {LOCALE_LABELS[locale]}
            </span>
            <ChevronDown className={cn(
              "w-3.5 h-3.5 flex-shrink-0 text-sidebar-foreground/40 transition-transform duration-150",
              langOpen && "rotate-180"
            )} />
          </button>

          {langOpen && (
            <div className={cn(
              "absolute bottom-full mb-1 w-44 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50",
              isRTL ? "right-0" : "left-0"
            )}>
              {localeOrder.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setLangOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent",
                    locale === l ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  <span className="flex-1 text-start" suppressHydrationWarning>{LOCALE_LABELS[l]}</span>
                  {locale === l && <Check className="w-3.5 h-3.5 flex-shrink-0 text-sidebar-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg hover:bg-sidebar-accent/60 cursor-pointer transition-all">
          <div className="relative w-7 h-7 rounded-full bg-sidebar-primary/25 border border-sidebar-primary/50 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-sidebar-primary" suppressHydrationWarning>
              {t.agentInitials}
            </span>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-sidebar-primary border border-sidebar" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-medium text-sidebar-foreground leading-none truncate" suppressHydrationWarning>
              {t.agentName}
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5" suppressHydrationWarning>
              {t.online}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
