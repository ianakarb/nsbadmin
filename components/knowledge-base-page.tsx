"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Brain,
  FileText,
  Globe,
  Plus,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Upload,
  X,
  Send,
  Bot,
  Zap,
  TrendingUp,
  TrendingDown,
  FileUp,
  MessageSquare,
  Phone,
} from "lucide-react"
import {
  type KBItem,
  type KBCollection,
  type SourceType,
  type LearningStatus,
  type KBChannel,
  addItem as storeAddItem,
  deleteItem as storeDeleteItem,
  subscribeKB,
} from "@/lib/kb-store"
import { getKBItemsByStore, getKBCollectionsByStore } from "@/lib/mock-store-data"
import { useLocale } from "@/lib/locale"

// ── Local type aliases (kept for component-level clarity) ──────────────────
type Channel = KBChannel
type Collection = KBCollection

// ── Helpers (locale-aware factories) ──────────────────────────────────────

type T = ReturnType<typeof useLocale>["t"]

function makeSourceMeta(t: T) {
  return {
    text: { icon: FileText, label: t.kbSourceText, color: "text-blue-600",    bg: "bg-blue-50"    },
    file: { icon: FileUp,   label: t.kbSourceFile, color: "text-primary",     bg: "bg-primary-subtle" },
    url:  { icon: Globe,    label: "URL",           color: "text-warning",     bg: "bg-warning-subtle" },
  } as const
}

function makeKBStatusMeta(t: T) {
  return {
    ready:    { icon: CheckCircle2,  label: t.kbStatusReady,    color: "text-success",       bg: "bg-success-subtle"     },
    learning: { icon: RefreshCw,     label: t.kbStatusLearning, color: "text-blue-600",      bg: "bg-blue-50"            },
    conflict: { icon: AlertTriangle, label: t.kbStatusConflict, color: "text-warning",       bg: "bg-warning-subtle"     },
    failed:   { icon: X,             label: t.kbStatusFailed,   color: "text-destructive",   bg: "bg-destructive-subtle" },
  } as const
}

function makeKBChannelMeta(t: T) {
  return {
    chat: { label: t.kbChannelChat, icon: MessageSquare, color: "text-blue-700",    bg: "bg-blue-50"       },
    call: { label: t.kbChannelCall, icon: Phone,         color: "text-primary",     bg: "bg-primary-subtle"},
    both: { label: t.kbChannelBoth, icon: Bot,           color: "text-foreground",  bg: "bg-surface-raised"},
  } as const
}

// ── Add Item Modal ─────────────────────────────────────────────────────────

function AddItemModal({ onClose, collections, onAdd }: {
  onClose: () => void
  collections: Collection[]
  onAdd: (item: KBItem) => void
}) {
  const { t } = useLocale()
  const SOURCE_META = makeSourceMeta(t)
  const [tab, setTab] = useState<SourceType>("text")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? "")
  const [channel, setChannel] = useState<Channel>("both")
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState("")

  const canSubmit = title.trim() && (tab === "text" ? content.trim() : tab === "url" ? url.trim() : fileName)

  const handleSubmit = () => {
    if (!canSubmit) return
    const newItem: KBItem = {
      id: `kb-${Date.now()}`,
      title: title.trim(),
      sourceType: tab,
      updatedAt: new Date().toISOString().split("T")[0],
      status: "learning",
      channel,
      collectionId,
      content: tab === "text" ? content : tab === "url" ? url : `[${t.kbSourceFile}] ${fileName}`,
      citedCount: 0,
      failRate: 0,
    }
    onAdd(newItem)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl w-[560px] max-h-[88vh] flex flex-col overflow-hidden border border-border">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-primary" />
            <p className="text-base font-semibold text-foreground">{t.kbAddTitle}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source type tabs */}
        <div className="flex gap-1.5 px-6 pt-5 pb-0">
          {(["text", "file", "url"] as SourceType[]).map(srcType => {
            const m = SOURCE_META[srcType]
            return (
              <button
                key={srcType}
                onClick={() => setTab(srcType)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                  tab === srcType
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                )}
              >
                <m.icon className="w-4 h-4" />{m.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-sm text-muted-foreground font-medium mb-1.5 block">{t.kbFieldTitle}</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t.kbFieldTitlePlaceholder}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {tab === "text" && (
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-1.5 block">{t.kbFieldContent}</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                placeholder={t.kbFieldContentPlaceholder}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {tab === "file" && (
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-1.5 block">{t.kbFieldFileUpload}</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                  e.preventDefault(); setDragging(false)
                  const f = e.dataTransfer.files[0]
                  if (f) setFileName(f.name)
                }}
                className={cn(
                  "w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 transition-colors cursor-pointer",
                  dragging ? "border-primary bg-primary-subtle" : "border-border hover:border-primary/50 bg-surface"
                )}
              >
                {fileName ? (
                  <>
                    <CheckCircle2 className="w-7 h-7 text-success" />
                    <p className="text-sm font-medium text-foreground">{fileName}</p>
                    <button onClick={() => setFileName("")} className="text-xs text-muted-foreground hover:text-destructive">{t.kbFileRemove}</button>
                  </>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t.kbFileDragHint}</p>
                    <label className="text-sm text-primary font-medium cursor-pointer hover:underline">
                      {t.kbFileSelect}
                      <input type="file" className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx"
                        onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name) }} />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "url" && (
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-1.5 block">{t.kbFieldWebUrl}</label>
              <div className="flex gap-2">
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="flex-1 text-sm px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="px-4 py-2.5 rounded-lg bg-surface text-foreground text-sm font-medium hover:bg-surface-raised transition-colors flex items-center gap-1.5 border border-border">
                  <Globe className="w-4 h-4" />{t.kbCrawlBtn}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{t.kbCrawlHint}</p>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground font-medium mb-1.5 block">{t.kbFieldCollection}</label>
              <select
                value={collectionId}
                onChange={e => setCollectionId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground font-medium mb-1.5 block">{t.kbFieldChannel}</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as Channel)}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="both">{t.kbChannelBothOption}</option>
                <option value="chat">{t.kbChannelChatOption}</option>
                <option value="call">{t.kbChannelCallOption}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground border border-border hover:bg-surface transition-colors"
          >
            {t.kbCancelBtn}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors",
              canSubmit ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-surface text-muted-foreground cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />{t.kbAddBtn}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Preview Panel ──────────────────────────────────────────────────────────

function PreviewPanel({ item, onClose }: { item: KBItem; onClose: () => void }) {
  const { t } = useLocale()
  const SOURCE_META = makeSourceMeta(t)
  const STATUS_META = makeKBStatusMeta(t)
  const [simInput, setSimInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([])
  const [loading, setLoading] = useState(false)

  const SRC  = SOURCE_META[item.sourceType]
  const STAT = STATUS_META[item.status]

  const handleSend = () => {
    if (!simInput.trim()) return
    const q = simInput.trim()
    setMessages(p => [...p, { role: "user", text: q }])
    setSimInput("")
    setLoading(true)
    setTimeout(() => {
      const answer = `"${item.title}" ${t.kbSimPrompt}.\n\n${item.content.slice(0, 120)}${item.content.length > 120 ? "..." : ""}`
      setMessages(p => [...p, { role: "ai", text: answer }])
      setLoading(false)
    }, 900)
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", SRC.bg)}>
            <SRC.icon className={cn("w-4 h-4", SRC.color)} />
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
          <span className={cn("flex-shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", STAT.bg, STAT.color)}>
            <STAT.icon className={cn("w-3 h-3", item.status === "learning" && "animate-spin")} />
            {STAT.label}
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-2 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: source */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          <div className="px-5 py-2.5 border-b border-border flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.kbPreviewSource}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {item.status === "conflict" && (
              <div className="px-4 py-3 rounded-xl bg-warning-subtle border border-warning/30 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.kbConflictTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.kbConflictDesc}</p>
                </div>
              </div>
            )}

            <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{item.content}</pre>

            {/* Chunking */}
            <div className="p-4 rounded-xl bg-surface border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{t.kbChunkingTitle}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-surface-raised px-2 py-0.5 rounded-full">{t.kbChunkingAuto}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{t.kbChunkSize}</span>
                <input type="range" min={128} max={1024} defaultValue={512} className="flex-1 accent-primary" />
                <span className="text-xs text-foreground font-mono w-8 text-right">512</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary-subtle text-primary border border-primary/20 font-medium">Chunk {i}</span>
                ))}
              </div>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <p className="text-xs text-muted-foreground font-medium">{t.kbCitedCount}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{item.citedCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <p className="text-xs text-muted-foreground font-medium">{t.kbFailRate}</p>
                </div>
                <p className={cn("text-2xl font-bold", item.failRate > 10 ? "text-destructive" : "text-foreground")}>{item.failRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI simulator */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-2.5 border-b border-border flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.kbSimTitle}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-subtle flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium mb-1">{t.kbSimPrompt}</p>
                <p className="text-xs text-muted-foreground mb-4">{t.kbSimHint}</p>
                <div className="flex flex-col gap-2 w-full">
                  {[t.kbSimQ1, t.kbSimQ2, t.kbSimQ3].map(q => (
                    <button
                      key={q}
                      onClick={() => setSimInput(q)}
                      className="w-full text-left text-sm px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-surface transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-primary-subtle flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-surface text-foreground rounded-bl-sm border border-border"
                )}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-subtle flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex gap-1 px-4 py-2.5 bg-surface rounded-2xl rounded-bl-sm border border-border">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2 bg-surface rounded-xl border border-border px-4 py-2.5">
              <input
                value={simInput}
                onChange={e => setSimInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={t.kbSimPlaceholder}
                className="flex-1 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!simInput.trim()}
                className={cn("flex-shrink-0 transition-colors", simInput.trim() ? "text-primary hover:opacity-70" : "text-muted-foreground/40")}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export function KnowledgeBasePage({ storeId = "store-001" }: { storeId?: string }) {
  const { locale } = useLocale()
  const [items, setItems]             = useState<KBItem[]>(() => getKBItemsByStore(locale, storeId))
  const [collections, setCollections] = useState<Collection[]>(() => getKBCollectionsByStore(locale, storeId))
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [search, setSearch]                         = useState("")
  const [statusFilter, setStatusFilter]             = useState<LearningStatus | "all">("all")
  const [showAddModal, setShowAddModal]             = useState(false)
  const [previewItem, setPreviewItem]               = useState<KBItem | null>(null)
  const [activeTab, setActiveTab]                   = useState<"list" | "analytics">("list")
  const [showSidebar, setShowSidebar]               = useState(false)
  const [mobileView, setMobileView]                 = useState<"list" | "detail">("list")

  // Reset when storeId or locale changes
  useEffect(() => {
    setItems([...getKBItemsByStore(locale, storeId)])
    setCollections([...getKBCollectionsByStore(locale, storeId)])
    setSelectedCollectionId(null)
    setPreviewItem(null)
  }, [storeId, locale])

  // Re-sync on KB store mutations
  useEffect(() => {
    return subscribeKB(() => {
      setItems([...getKBItemsByStore(locale, storeId)])
      setCollections([...getKBCollectionsByStore(locale, storeId)])
    })
  }, [storeId, locale])

  const toggleCollection = (id: string) =>
    setCollections(prev => prev.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c))

  const addItem = (item: KBItem) => {
    storeAddItem(item, storeId) // store notifies all subscribers
  }

  const deleteItem = (id: string) => {
    storeDeleteItem(id, storeId)
    if (previewItem?.id === id) setPreviewItem(null)
  }

  const filtered = items.filter(item => {
    const matchCollection = !selectedCollectionId || item.collectionId === selectedCollectionId
    const matchSearch     = !search || item.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus     = statusFilter === "all" || item.status === statusFilter
    return matchCollection && matchSearch && matchStatus
  })

  const { t } = useLocale()
  const SOURCE_META = makeSourceMeta(t)
  const STATUS_META = makeKBStatusMeta(t)
  const CHANNEL_META = makeKBChannelMeta(t)

  const totalReady    = items.filter(i => i.status === "ready").length
  const totalConflict = items.filter(i => i.status === "conflict").length
  const totalLearning = items.filter(i => i.status === "learning").length

  // Handle mobile item click - show detail view
  const handleItemClick = (item: KBItem) => {
    const isSelected = previewItem?.id === item.id
    if (isSelected) {
      setPreviewItem(null)
      setMobileView("list")
    } else {
      setPreviewItem(item)
      setMobileView("detail")
    }
  }

  // Sidebar content (shared between desktop and mobile drawer)
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-1">
          <Brain className="w-5 h-5 text-primary" />
          <p className="text-base font-bold text-foreground">{t.kbPageTitle}</p>
        </div>
        <p className="text-xs text-muted-foreground ml-[30px]">{t.kbPageDesc}</p>
      </div>

      {/* Summary */}
      <div className="px-3 py-3 border-b border-border flex flex-col gap-1">
        <button
          onClick={() => { setSelectedCollectionId(null); setStatusFilter("all"); setShowSidebar(false) }}
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            !selectedCollectionId && statusFilter === "all"
              ? "bg-primary-subtle text-primary"
              : "text-muted-foreground hover:bg-surface hover:text-foreground"
          )}
        >
          <span>{t.kbAllDocs}</span>
          <span className="text-xs font-semibold tabular-nums">{items.length}</span>
        </button>

        {totalConflict > 0 && (
          <button
            onClick={() => { setStatusFilter(statusFilter === "conflict" ? "all" : "conflict"); setShowSidebar(false) }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              statusFilter === "conflict"
                ? "bg-warning-subtle text-warning"
                : "text-warning bg-warning-subtle/60 hover:bg-warning-subtle"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.kbConflictCount} {totalConflict}{t.kbConflictUnit}
          </button>
        )}
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-4 mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.kbCollectionLabel}</p>
          <button
            onClick={() => {
              const name = prompt("새 컬렉션 이름")
              if (!name) return
              setCollections(p => [...p, { id: `col-${Date.now()}`, name, itemCount: 0, expanded: true }])
            }}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {collections.map(col => (
          <button
            key={col.id}
            onClick={() => {
              toggleCollection(col.id)
              setSelectedCollectionId(col.id === selectedCollectionId ? null : col.id)
              setShowSidebar(false)
            }}
            className={cn(
              "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
              selectedCollectionId === col.id
                ? "bg-primary-subtle text-primary"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            )}
          >
            {col.expanded
              ? <FolderOpen className="w-4 h-4 flex-shrink-0" />
              : <Folder     className="w-4 h-4 flex-shrink-0" />
            }
            {col.expanded
              ? <ChevronDown  className="w-3 h-3 flex-shrink-0" />
              : <ChevronRight className="w-3 h-3 flex-shrink-0" />
            }
            <span className="text-sm font-medium flex-1 truncate">{col.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex h-full bg-background">

      {/* ── Desktop Left sidebar: collections ─────────────────────────────── */}
      <div className="hidden md:flex w-[240px] flex-shrink-0 bg-card border-r border-border flex-col">
        {sidebarContent}
      </div>

      {/* ── Mobile sidebar drawer ─────────────────────────────────────────── */}
      {showSidebar && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-card shadow-xl">
            <button
              onClick={() => setShowSidebar(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">

        {/* Header bar - Desktop */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 bg-card border-b border-border gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-surface w-[240px]">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.kbSearchPlaceholder}
                className="flex-1 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Status filter pills */}
            <div className="flex gap-1.5">
              {(["all", "ready", "learning", "conflict", "failed"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                    statusFilter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {f === "all" ? t.kbFilterAll : STATUS_META[f].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* List / Analytics toggle */}
            <div className="flex gap-0.5 p-0.5 rounded-lg bg-surface border border-border">
              {(["list", "analytics"] as const).map(tabKey => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === tabKey
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tabKey === "list"
                    ? <><FileText className="w-3.5 h-3.5" />{t.kbTabList}</>
                    : <><BarChart2 className="w-3.5 h-3.5" />{t.kbTabAnalytics}</>
                  }
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />{t.kbAddBtn2}
            </button>
          </div>
        </div>

        {/* Header bar - Mobile */}
        <div className="md:hidden flex flex-col bg-card border-b border-border">
          {/* Top row */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Folder className="w-5 h-5" />
              <span className="text-sm font-medium">{t.kbCollectionLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search row */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-surface">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.kbSearchPlaceholder}
                className="flex-1 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Tabs row */}
          <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
            <div className="flex gap-0.5 p-0.5 rounded-lg bg-surface border border-border flex-shrink-0">
              {(["list", "analytics"] as const).map(tabKey => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    activeTab === tabKey
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tabKey === "list"
                    ? <><FileText className="w-3 h-3" />{t.kbTabList}</>
                    : <><BarChart2 className="w-3 h-3" />{t.kbTabAnalytics}</>
                  }
                </button>
              ))}
            </div>

            {/* Status filter pills - horizontal scroll on mobile */}
            <div className="flex gap-1.5 flex-shrink-0">
              {(["all", "ready", "learning", "conflict", "failed"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap",
                    statusFilter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border"
                  )}
                >
                  {f === "all" ? t.kbFilterAll : STATUS_META[f].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content - Desktop */}
        <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">

          {/* List / Analytics panel */}
          <div className={cn("flex flex-col overflow-hidden", previewItem ? "w-[55%]" : "flex-1")}>

            {activeTab === "analytics" ? (
              /* ── Analytics view ─────────────────────────────────────────── */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: t.kbStatReady,    value: totalReady,    icon: CheckCircle2,  color: "text-success",     bg: "bg-success-subtle"     },
                    { label: t.kbStatLearning, value: totalLearning, icon: RefreshCw,     color: "text-blue-600",    bg: "bg-blue-50"            },
                    { label: t.kbStatConflict, value: totalConflict, icon: AlertTriangle, color: "text-warning",     bg: "bg-warning-subtle"     },
                  ].map(s => (
                    <div key={s.label} className="p-5 rounded-xl border border-border bg-card">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                        <s.icon className={cn("w-5 h-5", s.color)} />
                      </div>
                      <p className="text-3xl font-bold text-foreground">{s.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{t.kbTopCitedTitle}</p>
                  </div>
                  {[...items].sort((a, b) => b.citedCount - a.citedCount).slice(0, 6).map((item, i) => {
                    const SRC = SOURCE_META[item.sourceType]
                    const max = items.reduce((m, it) => Math.max(m, it.citedCount), 1)
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 px-5 py-3.5 border-b border-border/60 last:border-0 hover:bg-surface transition-colors cursor-pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        <span className="text-sm font-bold text-muted-foreground/50 w-5">{i + 1}</span>
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", SRC.bg)}>
                          <SRC.icon className={cn("w-3.5 h-3.5", SRC.color)} />
                        </div>
                        <p className="text-sm text-foreground flex-1 truncate">{item.title}</p>
                        <div className="flex-1 max-w-[140px]">
                          <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(item.citedCount / max) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground w-10 text-right tabular-nums">{item.citedCount}</span>
                        <span className={cn("text-xs w-14 text-right tabular-nums", item.failRate > 10 ? "text-destructive font-semibold" : "text-muted-foreground")}>
                          {item.failRate}{t.kbFailRateSuffix}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* ── List view ──────────────────────────────────────────────── */
              <div className="flex-1 overflow-y-auto">
                {/* Table header */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-surface sticky top-0">
                  <div className="w-8" />
                  <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.kbTableTitle}</div>
                  <div className="w-[88px] text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.kbTableSource}</div>
                  <div className="w-[100px] text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.kbTableStatus}</div>
                  <div className="w-[80px] text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.kbTableChannel}</div>
                  <div className="w-[90px] text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.kbTableUpdated}</div>
                  <div className="w-7" />
                </div>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
                      <Brain className="w-7 h-7 text-muted-foreground/30" />
                    </div>
                    <p className="text-base text-foreground font-medium">{t.kbEmptyTitle}</p>
                    <p className="text-sm text-muted-foreground mt-1.5">{t.kbEmptyDesc}</p>
                  </div>
                ) : (
                  filtered.map(item => {
                    const SRC  = SOURCE_META[item.sourceType]
                    const STAT = STATUS_META[item.status]
                    const CH   = CHANNEL_META[item.channel]
                    const isSelected = previewItem?.id === item.id

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "flex items-center gap-3 px-5 py-3.5 border-b border-border/60 cursor-pointer transition-colors group",
                          isSelected ? "bg-primary-subtle" : "hover:bg-surface"
                        )}
                      >
                        {/* Source icon */}
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", SRC.bg)}>
                          <SRC.icon className={cn("w-4 h-4", SRC.color)} />
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                            {item.conflictWith && (
                              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {item.content.slice(0, 55)}{item.content.length > 55 ? "..." : ""}
                          </p>
                        </div>

                        {/* Source badge */}
                        <div className="w-[88px]">
                          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", SRC.bg, SRC.color)}>
                            {SRC.label}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="w-[100px] flex items-center gap-1.5">
                          <STAT.icon className={cn("w-3.5 h-3.5 flex-shrink-0", STAT.color, item.status === "learning" && "animate-spin")} />
                          <span className={cn("text-xs font-medium", STAT.color)}>{STAT.label}</span>
                        </div>

                        {/* Channel */}
                        <div className="w-[80px]">
                          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", CH.bg, CH.color)}>
                            {CH.label}
                          </span>
                        </div>

                        {/* Updated */}
                        <div className="w-[90px]">
                          <p className="text-xs text-muted-foreground">{item.updatedAt}</p>
                        </div>

                        {/* Delete */}
                        <div className="w-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); deleteItem(item.id) }}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Preview panel - Desktop */}
          {previewItem && (
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-l border-border">
              <PreviewPanel item={previewItem} onClose={() => setPreviewItem(null)} />
            </div>
          )}
        </div>

        {/* Content - Mobile */}
        <div className="md:hidden flex-1 flex flex-col min-h-0 overflow-hidden">
          {mobileView === "list" ? (
            /* Mobile List View */
            activeTab === "analytics" ? (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {/* Stats - stacked vertically on mobile */}
                <div className="flex flex-col gap-3">
                  {[
                    { label: t.kbStatReady,    value: totalReady,    icon: CheckCircle2,  color: "text-success",     bg: "bg-success-subtle"     },
                    { label: t.kbStatLearning, value: totalLearning, icon: RefreshCw,     color: "text-blue-600",    bg: "bg-blue-50"            },
                    { label: t.kbStatConflict, value: totalConflict, icon: AlertTriangle, color: "text-warning",     bg: "bg-warning-subtle"     },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", s.bg)}>
                        <s.icon className={cn("w-5 h-5", s.color)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{t.kbTopCitedTitle}</p>
                  </div>
                  {[...items].sort((a, b) => b.citedCount - a.citedCount).slice(0, 5).map((item, i) => {
                    const SRC = SOURCE_META[item.sourceType]
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-border/60 last:border-0"
                        onClick={() => handleItemClick(item)}
                      >
                        <span className="text-sm font-bold text-muted-foreground/50 w-5">{i + 1}</span>
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", SRC.bg)}>
                          <SRC.icon className={cn("w-3.5 h-3.5", SRC.color)} />
                        </div>
                        <p className="text-sm text-foreground flex-1 truncate">{item.title}</p>
                        <span className="text-sm font-semibold text-foreground tabular-nums">{item.citedCount}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Mobile List - Card style */
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-3">
                      <Brain className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-base text-foreground font-medium">{t.kbEmptyTitle}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.kbEmptyDesc}</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {filtered.map(item => {
                      const SRC  = SOURCE_META[item.sourceType]
                      const STAT = STATUS_META[item.status]
                      const CH   = CHANNEL_META[item.channel]

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="flex flex-col gap-2 px-4 py-3.5 border-b border-border/60 active:bg-surface transition-colors"
                        >
                          {/* Top row: icon + title + status */}
                          <div className="flex items-start gap-3">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", SRC.bg)}>
                              <SRC.icon className={cn("w-5 h-5", SRC.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                                {item.conflictWith && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {item.content.slice(0, 40)}{item.content.length > 40 ? "..." : ""}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          </div>

                          {/* Bottom row: badges */}
                          <div className="flex items-center gap-2 ml-[52px]">
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", SRC.bg, SRC.color)}>
                              {SRC.label}
                            </span>
                            <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", STAT.bg, STAT.color)}>
                              <STAT.icon className={cn("w-3 h-3", item.status === "learning" && "animate-spin")} />
                              {STAT.label}
                            </span>
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", CH.bg, CH.color)}>
                              {CH.label}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">{item.updatedAt}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          ) : (
            /* Mobile Detail View */
            previewItem && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Back button header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                  <button
                    onClick={() => { setMobileView("list"); setPreviewItem(null) }}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    <span className="text-sm font-medium">{t.kbBackToList || "목록으로"}</span>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <PreviewPanel item={previewItem} onClose={() => { setMobileView("list"); setPreviewItem(null) }} />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          collections={collections}
          onAdd={addItem}
        />
      )}
    </div>
  )
}
