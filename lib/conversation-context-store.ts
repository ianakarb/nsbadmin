// Lightweight pub/sub store that broadcasts the currently active conversation
// so the AI assistant panel can react to context changes without prop drilling.

import type { Message, Session } from "./data"

export interface ConversationContext {
  session: Session | null
  messages: Message[]
  customerName: string
}

let context: ConversationContext = { session: null, messages: [], customerName: "" }
const listeners = new Set<() => void>()

export function setConversationContext(next: ConversationContext) {
  context = next
  listeners.forEach((fn) => fn())
}

export function getConversationContext(): ConversationContext {
  return context
}

export function subscribeConversationContext(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
