"use client"

import { useState, useCallback } from "react"
import { TopNav, MobileTopBar, MobileDrawer } from "@/components/top-nav"
import { InboxPanel } from "@/components/inbox-panel"
import { ConversationPanel } from "@/components/conversation-panel"
import { InfoPanel } from "@/components/info-panel-v2"
import { PluginSidebar } from "@/components/plugin-sidebar"
import { CustomersPage } from "@/components/customers-page"
import { MarketingPage } from "@/components/marketing-page"
import { AutoResponsePage } from "@/components/auto-response-page"
import { KnowledgeBasePage } from "@/components/knowledge-base-page"
import { ConsultationHistoryPage } from "@/components/consultation-history-page"
import { sessions } from "@/lib/data"
import { useLocale } from "@/lib/locale"
import { saudiSessionsEn, saudiSessionsAr } from "@/lib/data-saudi"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

type NavView = "inquiry" | "consultation" | "customers" | "marketing" | "autoresponse" | "knowledgebase" | "biz" | "review" | "reservation" | "order"

// Mobile inquiry sub-view: list → detail
type MobileInquiryStep = "list" | "detail"

// 스토어별 마지막 선택 세션 기억
const lastSessionMap: Record<string, string> = {
  "store-001": "sess-001",
}

export default function HomePage() {
  const { locale, isRTL, t } = useLocale()
  const [activeStoreId, setActiveStoreId] = useState("store-001")
  const [selectedSessionId, setSelectedSessionId] = useState("sess-001")
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const [activeView, setActiveView] = useState<NavView>("inquiry")
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [mobileInquiryStep, setMobileInquiryStep] = useState<MobileInquiryStep>("list")

  const handleStoreChange = useCallback((storeId: string) => {
    setActiveStoreId(storeId)
    if (lastSessionMap[storeId]) {
      setSelectedSessionId(lastSessionMap[storeId])
    } else {
      const src = locale === "ko" ? sessions : locale === "ar" ? saudiSessionsAr : saudiSessionsEn
      const first = src.find((s) => s.storeId === storeId)
      const firstId = first?.id ?? ""
      lastSessionMap[storeId] = firstId
      setSelectedSessionId(firstId)
    }
  }, [locale])

  const handleSessionSelect = useCallback((id: string) => {
    lastSessionMap[activeStoreId] = id
    setSelectedSessionId(id)
    setMobileInquiryStep("detail")
  }, [activeStoreId])

  const handleNavChange = useCallback((view: NavView) => {
    setActiveView(view)
    setMobileInquiryStep("list")
  }, [])

  const gnb = (
    <TopNav
      onStoreChange={handleStoreChange}
      onNavChange={handleNavChange}
      activeView={activeView}
    />
  )

  // ── Desktop layout ──────────────────────────────────────────────────────────
  const desktopLayout = (
    <main className="app-main hidden md:flex h-screen bg-background overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {isRTL ? <PluginSidebar /> : gnb}

      <div className="flex flex-1 overflow-hidden min-w-0 min-h-0">
        {activeView === "customers" ? (
          <div className="flex-1 min-w-0 overflow-hidden">
            <CustomersPage storeId={activeStoreId} />
          </div>
        ) : activeView === "marketing" ? (
          <div className="flex-1 min-w-0 overflow-hidden">
            <MarketingPage storeId={activeStoreId} />
          </div>
        ) : activeView === "autoresponse" ? (
          <div className="flex-1 min-w-0 overflow-hidden">
            <AutoResponsePage storeId={activeStoreId} />
          </div>
        ) : activeView === "knowledgebase" ? (
          <div className="flex-1 min-w-0 overflow-hidden">
            <KnowledgeBasePage storeId={activeStoreId} />
          </div>
        ) : activeView === "consultation" ? (
          <div className="flex-1 min-w-0 overflow-hidden">
            <ConsultationHistoryPage storeId={activeStoreId} />
          </div>
        ) : activeView === "inquiry" ? (
          <>
            <div className="flex-[3] min-w-0 overflow-hidden">
              <InboxPanel
                selectedId={selectedSessionId}
                onSelect={handleSessionSelect}
                statusMap={statusMap}
                storeId={activeStoreId}
              />
            </div>
            <div className="flex-[5] min-w-0 overflow-hidden">
              <ConversationPanel
                sessionId={selectedSessionId}
                statusMap={statusMap}
                onStatusChange={(id, status) => setStatusMap((prev) => ({ ...prev, [id]: status }))}
              />
            </div>
            <div className="flex-[4] min-w-0 overflow-hidden">
              <InfoPanel sessionId={selectedSessionId} storeId={activeStoreId} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            <p>{t.ready}</p>
          </div>
        )}
      </div>

      {isRTL ? gnb : <PluginSidebar />}
    </main>
  )

  // ── Mobile layout ───────────────────────────────────────────────────────────
  const mobileLayout = (
    <main className="app-main md:hidden flex flex-col h-[100dvh] bg-background overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Mobile top bar */}
      <MobileTopBar
        activeView={activeView}
        onMenuOpen={() => setMobileDrawerOpen(true)}
      />

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onStoreChange={handleStoreChange}
        onNavChange={handleNavChange}
        activeView={activeView}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeView === "inquiry" ? (
          <div className="flex flex-col h-full">
            {mobileInquiryStep === "list" ? (
              <div className="flex-1 overflow-hidden">
                <InboxPanel
                  selectedId={selectedSessionId}
                  onSelect={handleSessionSelect}
                  statusMap={statusMap}
                  storeId={activeStoreId}
                />
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Back header */}
                <div className="flex items-center h-11 px-3 border-b border-border bg-card flex-shrink-0">
                  <button
                    onClick={() => setMobileInquiryStep("list")}
                    className="flex items-center gap-1 text-primary text-[13px] font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t.navInquiry}
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ConversationPanel
                    sessionId={selectedSessionId}
                    statusMap={statusMap}
                    onStatusChange={(id, status) => setStatusMap((prev) => ({ ...prev, [id]: status }))}
                  />
                </div>
              </div>
            )}
          </div>
        ) : activeView === "customers" ? (
          <CustomersPage storeId={activeStoreId} />
        ) : activeView === "marketing" ? (
          <MarketingPage storeId={activeStoreId} />
        ) : activeView === "autoresponse" ? (
          <AutoResponsePage storeId={activeStoreId} />
        ) : activeView === "knowledgebase" ? (
          <KnowledgeBasePage storeId={activeStoreId} />
        ) : activeView === "consultation" ? (
          <ConsultationHistoryPage storeId={activeStoreId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm h-full">
            <p>{t.ready}</p>
          </div>
        )}
      </div>


    </main>
  )

  return (
    <>
      {desktopLayout}
      {mobileLayout}
    </>
  )
}
