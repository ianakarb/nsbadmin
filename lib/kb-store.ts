// ── Shared Knowledge Base Store ─────────────────────────────────────────────
// Single source of truth for KB items & collections.
// Both KnowledgeBasePage and the agent editor read/write from here.

export type SourceType     = "text" | "file" | "url"
export type LearningStatus = "ready" | "learning" | "conflict" | "failed"
export type KBChannel      = "chat" | "call" | "both"

export interface KBItem {
  id: string
  title: string
  sourceType: SourceType
  updatedAt: string
  status: LearningStatus
  channel: KBChannel
  collectionId: string
  content: string
  citedCount: number
  failRate: number
  conflictWith?: string
}

export interface KBCollection {
  id: string
  name: string
  itemCount: number
  expanded: boolean
}

import { getKBItemsByStore as getKBItemsByStoreLocale, getKBCollectionsByStore as getKBCollectionsByStoreLocale } from "./mock-store-data"

// ── Mutable singleton maps keyed by storeId ──────────────────────────────────
// Each store has its own isolated items + collections arrays.
// Components call getItemsByStore / getCollectionsByStore and mutate via addItem.

// Track current locale for data loading
let _currentLocale = "ko"

// Initialize with Korean data (default)
let _itemsMap: Record<string, KBItem[]> = {}
let _collectionsMap: Record<string, KBCollection[]> = {}

function _initializeData(locale: string) {
  if (_currentLocale === locale && Object.keys(_itemsMap).length > 0) return
  _currentLocale = locale
  _itemsMap = {
    "store-001": [...getKBItemsByStoreLocale(locale, "store-001")],
    "store-002": [...getKBItemsByStoreLocale(locale, "store-002")],
    "store-003": [...getKBItemsByStoreLocale(locale, "store-003")],
  }
  _collectionsMap = {
    "store-001": [...getKBCollectionsByStoreLocale(locale, "store-001")],
    "store-002": [...getKBCollectionsByStoreLocale(locale, "store-002")],
    "store-003": [...getKBCollectionsByStoreLocale(locale, "store-003")],
  }
}

// Initialize with default locale
_initializeData("ko")

// Legacy flat getters (return store-001 data for backward compat)
const _defaultStore = "store-001"

// Subscribers — components can register a callback to be notified of changes
type Listener = () => void
const _listeners = new Set<Listener>()

export function subscribeKB(fn: Listener) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

function _notify() {
  _listeners.forEach(fn => fn())
}

// ── Locale setter (call when locale changes) ─────────────────────────────────
export function setKBLocale(locale: string) {
  _initializeData(locale)
  _notify()
}

// ── Store-aware getters (preferred) ─────────────────────────────────────────
export function getItemsByStore(storeId: string, locale?: string): KBItem[] {
  if (locale && locale !== _currentLocale) {
    _initializeData(locale)
  }
  return _itemsMap[storeId] ?? []
}

export function getCollectionsByStore(storeId: string, locale?: string): KBCollection[] {
  if (locale && locale !== _currentLocale) {
    _initializeData(locale)
  }
  return _collectionsMap[storeId] ?? []
}

// ── Legacy flat getters (backward compat) ────────────────────────────────────
export function getItems(): KBItem[] {
  return getItemsByStore(_defaultStore)
}

export function getCollections(): KBCollection[] {
  return getCollectionsByStore(_defaultStore)
}

// ── Mutations (storeId-aware) ────────────────────────────────────────────────
export function addItem(item: KBItem, storeId: string = _defaultStore) {
  _itemsMap[storeId] = [item, ...(_itemsMap[storeId] ?? [])]
  _collectionsMap[storeId] = (_collectionsMap[storeId] ?? []).map(c =>
    c.id === item.collectionId ? { ...c, itemCount: c.itemCount + 1 } : c
  )
  _notify()
}

export function updateItem(updated: KBItem, storeId: string = _defaultStore) {
  _itemsMap[storeId] = (_itemsMap[storeId] ?? []).map(i => i.id === updated.id ? updated : i)
  _notify()
}

export function deleteItem(id: string, storeId: string = _defaultStore) {
  const item = (_itemsMap[storeId] ?? []).find(i => i.id === id)
  _itemsMap[storeId] = (_itemsMap[storeId] ?? []).filter(i => i.id !== id)
  if (item) {
    _collectionsMap[storeId] = (_collectionsMap[storeId] ?? []).map(c =>
      c.id === item.collectionId ? { ...c, itemCount: Math.max(0, c.itemCount - 1) } : c
    )
  }
  _notify()
}

export function addCollection(col: KBCollection, storeId: string = _defaultStore) {
  _collectionsMap[storeId] = [...(_collectionsMap[storeId] ?? []), col]
  _notify()
}
