export type ChannelType = "webchat" | "whatsapp" | "call" | "board" | "email"
export type StatusType = "active" | "waiting" | "ai_agent" | "pending" | "resolved" | "missed"
export type PriorityType = "urgent" | "high" | "normal" | "low"

export interface Message {
  id: string
  sender: "customer" | "agent" | "system" | "bot"
  content: string
  timestamp: string
  type: "text" | "file" | "call-start" | "call-end" | "note" | "stt"
  agentName?: string
  duration?: string
  sttSpeaker?: "customer" | "agent"
}

export interface Customer {
  id: string
  storeId: string
  name: string
  phone: string
  email: string
  gender?: string
  company?: string
  plan?: string
  grade?: "VIP" | string
  totalTickets: number
  resolvedTickets: number
  joinedAt: string
  tags: string[]
  avatarInitials: string
  avatarColor: string
  sentiment: "positive" | "neutral" | "negative"
  ltv?: string
}

export interface Reservation {
  id: string
  date: string
  time: string
  service: string
  status: "confirmed" | "cancelled" | "completed" | "pending"
  memo?: string
}

export interface Order {
  id: string
  date: string
  item: string
  amount: string
  status: "paid" | "pending" | "refunded" | "cancelled"
}

export interface Review {
  id: string
  date: string
  rating: number
  content: string
  replied: boolean
}

export const customerReservations: Record<string, Reservation[]> = {
  "cust-001": [
    { id: "rsv-001", date: "2025-02-26", time: "14:00", service: "\ucf3b + \uc5fc\uc0c9", status: "confirmed", memo: "VIP \uace0\uac1d, \uc6d0\uc7a5 \ub2f4\ub2f9" },
    { id: "rsv-002", date: "2025-02-20", time: "11:00", service: "\ud380", status: "completed" },
    { id: "rsv-003", date: "2025-02-10", time: "15:30", service: "\ucf3b", status: "completed" },
  ],
  "cust-002": [
    { id: "rsv-004", date: "2025-02-28", time: "10:00", service: "\ucf3b + \ud380", status: "confirmed" },
    { id: "rsv-005", date: "2025-02-14", time: "13:00", service: "\uc5fc\uc0c9", status: "completed" },
  ],
  "cust-003": [
    { id: "rsv-006", date: "2025-02-26", time: "15:00", service: "\ud380 + \ucf3b", status: "cancelled", memo: "\uace0\uac1d \ucde8\uc18c \uc694\uccad" },
    { id: "rsv-007", date: "2025-02-18", time: "11:30", service: "\uc5fc\uc0c9", status: "completed" },
  ],
  "cust-004": [
    { id: "rsv-008", date: "2025-02-27", time: "16:00", service: "\ucf3b", status: "confirmed" },
  ],
  "cust-005": [
    { id: "rsv-009", date: "2025-02-26", time: "09:30", service: "\ucf3b + \uc5fc\uc0c9 + \ud380", status: "confirmed" },
    { id: "rsv-010", date: "2025-02-10", time: "10:00", service: "\uc5fc\uc0c9", status: "completed" },
  ],
  "cust-006": [
    { id: "rsv-011", date: "2025-02-25", time: "14:30", service: "\ucf3b", status: "completed" },
  ],
}

export const customerOrders: Record<string, Order[]> = {
  "cust-001": [
    { id: "ord-001", date: "2025-02-26", item: "\ucf3b + \uc5fc\uc0c9", amount: "\u20a9120,000", status: "paid" },
    { id: "ord-002", date: "2025-02-20", item: "\ud380 \uc2dc\uc220", amount: "\u20a995,000", status: "paid" },
    { id: "ord-003", date: "2025-01-15", item: "\uc5fc\uc0c9", amount: "\u20a980,000", status: "refunded" },
  ],
  "cust-002": [
    { id: "ord-004", date: "2025-02-14", item: "\uc5fc\uc0c9 \uc2dc\uc220", amount: "\u20a975,000", status: "paid" },
    { id: "ord-005", date: "2025-02-28", item: "\ucf3b + \ud380", amount: "\u20a9130,000", status: "pending" },
  ],
  "cust-003": [
    { id: "ord-006", date: "2025-02-18", item: "\uc5fc\uc0c9", amount: "\u20a970,000", status: "paid" },
    { id: "ord-007", date: "2025-01-22", item: "\ud380 \uc2dc\uc220", amount: "\u20a9110,000", status: "refunded" },
  ],
  "cust-004": [
    { id: "ord-008", date: "2025-02-15", item: "\ucf3b", amount: "\u20a930,000", status: "paid" },
  ],
  "cust-005": [
    { id: "ord-009", date: "2025-02-10", item: "\uc5fc\uc0c9", amount: "\u20a985,000", status: "paid" },
    { id: "ord-010", date: "2025-01-20", item: "\ucf3b + \uc5fc\uc0c9 + \ud380", amount: "\u20a9220,000", status: "paid" },
  ],
  "cust-006": [
    { id: "ord-011", date: "2025-02-25", item: "\ucf3b", amount: "\u20a928,000", status: "paid" },
  ],
}

export const customerReviews: Record<string, Review[]> = {
  "cust-001": [
    { id: "rev-001", date: "2025-02-21", rating: 4, content: "\ud380\uc774 \uc798 \ub098\uc654\uc5b4\uc694. \uc6d0\uc7a5\ub2d8 \uc2e4\ub825\uc774 \uc88b\uc73c\uc2dc\ub124\uc694.", replied: true },
    { id: "rev-002", date: "2025-02-11", rating: 3, content: "\ucf3b\uc740 \ub9cc\uc871\uc2a4\ub7ec\uc6c0\uc9c0\ub9cc \ub300\uae30\uc2dc\uac04\uc774 \uc870\uae08 \uae38\uc5c8\uc2b5\ub2c8\ub2e4.", replied: false },
  ],
  "cust-002": [
    { id: "rev-003", date: "2025-02-15", rating: 5, content: "\uc5fc\uc0c9\uc774 \ub108\ubb34 \uc608\uc068\uac8c \ub098\uc654\uc5b4\uc694!", replied: true },
  ],
  "cust-003": [
    { id: "rev-004", date: "2025-02-19", rating: 2, content: "\uc2dc\uc220\ub294 \ub9cc\uc871\uc2a4\ub7ec\uc6c0\uc9c0\ub9cc \uc608\uc57d\uacfc \ub2e4\ub974\uac8c \ucc98\ub9ac\ub418\uc5b4 \ub2f9\ud669\uc2a4\ub7ec\uc6c0\uc2b5\ub2c8\ub2e4.", replied: false },
  ],
  "cust-004": [
    { id: "rev-005", date: "2025-02-16", rating: 5, content: "\uce5c\uc808\ud558\uace0 \uae54\uafbc\ud55c \ucf3b \uc5f0\ucd9c \uac10\uc0ac\ub4dc\ub9bd\ub2c8\ub2e4.", replied: true },
  ],
  "cust-005": [
    { id: "rev-006", date: "2025-02-11", rating: 4, content: "\uc2dc\uc220 \uc2e4\ub825\uc740 \ub9cc\uc871\ud558\ub294\ub370 \ub300\uae30\uc2e4\uc774 \uc870\uae08 \ubd81\ud3b8\ud588\uc5b4\uc694.", replied: true },
  ],
  "cust-006": [],
}

export interface Agent {
  id: string
  name: string
  status: "online" | "busy" | "offline"
  avatarInitials?: string
  avatarColor?: string
}

export interface Session {
  id: string
  storeId: string
  channel: ChannelType
  status: StatusType
  priority: PriorityType
  subject: string
  category: string
  createdAt: string
  updatedAt: string
  waitTime: string
  handleTime?: string
  activeMembers?: Agent[]
  assignedAgent?: Agent
  routingQueue?: { agent: Agent; tried: boolean; current: boolean }[]
  tags: string[]
  csat?: number
  source: string
  referrer?: string
  browser?: string
  os?: string
  ip?: string
  location?: string
  customerId: string
  messages: Message[]
  softphone?: boolean   // false = 착신 전화로 수신 (소프트폰 컨트롤 없음)
}

export const teamAgents: Agent[] = [
  { id: "agent-01", name: "\uc624\uc0c1\ub2f4", status: "online",  avatarInitials: "\uc624\uc0c1", avatarColor: "oklch(0.55 0.20 250)" },
  { id: "agent-02", name: "\uae40\uae30\uc220", status: "busy",    avatarInitials: "\uae40\uae30", avatarColor: "oklch(0.55 0.18 30)"  },
  { id: "agent-03", name: "\uc774\ubbfc\uc8fc", status: "online",  avatarInitials: "\uc774\ubbfc", avatarColor: "oklch(0.55 0.18 160)" },
  { id: "agent-04", name: "\ubc15\uc900\uc11c", status: "offline", avatarInitials: "\ubc15\uc900", avatarColor: "oklch(0.50 0.12 310)" },
]

export const customers: Record<string, Customer> = {
  "cust-001": {
    id: "cust-001",
    storeId: "store-001",
    name: "\uae40\ubbfc\uc9c0",
    phone: "010-9234-5678",
    email: "minji.kim@gmail.com",
    gender: "\uc5ec\uc131",
    company: "\uac15\ub0a8 \ud5e4\uc5b4\uc0f5",
    grade: "VIP",
    totalTickets: 14,
    resolvedTickets: 12,
    joinedAt: "2023-03-15",
    tags: ["\uc608\uc57d\ubb38\uc758", "\ud658\ubd88"],
    avatarInitials: "\uae40\ubbfc",
    avatarColor: "oklch(0.62 0.22 255)",
    sentiment: "neutral",
    ltv: "\u20a91,240,000",
  },
  "cust-002": {
    id: "cust-002",
    storeId: "store-001",
    name: "\uc774\uc900\ud601",
    phone: "010-5512-9832",
    email: "junhyuk.lee@naver.com",
    gender: "\ub0a8\uc131",
    company: "\uac15\ub0a8 \ud5e4\uc5b4\uc0f5",
    grade: "\uc2e0\uaddc",
    totalTickets: 3,
    resolvedTickets: 2,
    joinedAt: "2024-01-20",
    tags: ["\uc5fc\uc0c9\ubb38\uc758"],
    avatarInitials: "\uc774\uc900",
    avatarColor: "oklch(0.65 0.18 150)",
    sentiment: "positive",
    ltv: "\u20a9380,000",
  },
  "cust-003": {
    id: "cust-003",
    storeId: "store-001",
    name: "\ubc15\uc11c\uc5f0",
    phone: "010-3345-7821",
    email: "seoyeon.park@gmail.com",
    gender: "\uc5ec\uc131",
    company: "\uac15\ub0a8 \ud5e4\uc5b4\uc0f5",
    grade: "VIP",
    totalTickets: 28,
    resolvedTickets: 25,
    joinedAt: "2022-08-01",
    tags: ["\ud658\ubd88", "\uc911\ubcf5\uacb0\uc81c"],
    avatarInitials: "\ubc15\uc11c",
    avatarColor: "oklch(0.60 0.20 30)",
    sentiment: "negative",
    ltv: "\u20a93,100,000",
  },
  "cust-004": {
    id: "cust-004",
    storeId: "store-001",
    name: "\ucd5c\ud558\uc740",
    phone: "010-8821-3304",
    email: "haeun.choi@kakao.com",
    gender: "\uc5ec\uc131",
    company: "\uac15\ub0a8 \ud5e4\uc5b4\uc0f5",
    grade: "\uc77c\ubc18",
    totalTickets: 7,
    resolvedTickets: 6,
    joinedAt: "2023-11-05",
    tags: ["\uc608\uc57d\uc548\ub0b4"],
    avatarInitials: "\ucd5c\ud558",
    avatarColor: "oklch(0.68 0.16 200)",
    sentiment: "positive",
    ltv: "\u20a9560,000",
  },
  "cust-005": {
    id: "cust-005",
    storeId: "store-001",
    name: "\uc815\ub3c4\uc724",
    phone: "010-2278-6643",
    email: "doyun.jung@gmail.com",
    gender: "\ub0a8\uc131",
    company: "\uac15\ub0a8 \ud5e4\uc5b4\uc0f5",
    grade: "\uc77c\ubc18",
    totalTickets: 5,
    resolvedTickets: 4,
    joinedAt: "2024-03-10",
    tags: ["\ud574\uc9c0\ubb38\uc758"],
    avatarInitials: "\uc815\ub3c4",
    avatarColor: "oklch(0.63 0.14 260)",
    sentiment: "neutral",
    ltv: "\u20a9410,000",
  },
  "cust-006": {
    id: "cust-006",
    storeId: "store-001",
    name: "\uac15\ubbfc\ud638",
    phone: "010-7731-2290",
    email: "minho.kang@naver.com",
    gender: "\ub0a8\uc131",
    company: "\uac15\ub0a8 \ud5e4\uc5b4\uc0f5",
    grade: "\uc2e0\uaddc",
    totalTickets: 2,
    resolvedTickets: 1,
    joinedAt: "2025-01-10",
    tags: ["\uc571\ubb38\uc758"],
    avatarInitials: "\uac15\ubbfc",
    avatarColor: "oklch(0.58 0.15 310)",
    sentiment: "positive",
    ltv: "\u20a9130,000",
  },
}

export const sessions: Session[] = [
  {
    id: "sess-001",
    storeId: "store-001",
    channel: "webchat",
    status: "active",
    priority: "urgent",
    subject: "\uc608\uc57d \uc624\ub958\ub85c \uc778\ud55c \uc11c\ube44\uc2a4 \uc911\ub2e8",
    category: "\uc608\uc57d/\uacb0\uc81c",
    createdAt: "2025-02-26T09:12:00",
    updatedAt: "2025-02-26T09:38:00",
    waitTime: "2\ubd84",
    handleTime: "26\ubd84",
    activeMembers: [
      { id: "agent-01", name: "\uc624\uc0c1\ub2f4", status: "online" },
      { id: "agent-03", name: "\uc774\ubbfc\uc8fc", status: "online" },
    ],
    tags: ["\uc608\uc57d\uc624\ub958", "\uae34\uae09"],
    source: "\uc6f9\uc0ac\uc774\ud2b8",
    browser: "Chrome 121",
    os: "macOS 14",
    ip: "121.161.xxx.xxx",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-001",
    messages: [
      {
        id: "msg-001",
        sender: "customer",
        content: "\uc548\ub155\ud558\uc138\uc694, \uc624\ub298 \uc624\uc804\ubd80\ud130 \uc608\uc57d\uc774 \uc548 \ub418\uace0 \uc788\uc5b4\uc694. \uace0\uac1d\ub4e4\uc774 \uacc4\uc18d \uc624\ub958\uac00 \ub09c\ub2e4\uace0 \uc5f0\ub77d\uc774 \uc640\uc11c\uc694.",
        timestamp: "09:12",
        type: "text",
      },
      {
        id: "msg-002",
        sender: "bot",
        content: "\uc548\ub155\ud558\uc138\uc694! \uc0c1\ub2f4 \ucc57\ubd07\uc785\ub2c8\ub2e4. \uc608\uc57d \uad00\ub828 \ubb38\uc758 \uc8fc\uc168\uad70\uc694. \uc7a0\uc2dc\ub9cc \uae30\ub2e4\ub824 \uc8fc\uc2dc\uba74 \ud300\uc6d0\uc744 \uc5f0\uacb0\ud574 \ub4dc\ub9ac\uac2c\uc2b5\ub2c8\ub2e4.",
        timestamp: "09:12",
        type: "text",
      },
      {
        id: "msg-003",
        sender: "agent",
        agentName: "\uc624\uc0c1\ub2f4",
        content: "\uc548\ub155\ud558\uc138\uc694 \uae40\ubbfc\uc9c0\ub2d8, \uc624\uc0c1\ub2f4\uc785\ub2c8\ub2e4. \ubd88\ud3b8\uc744 \ub4dc\ub824 \uc8c4\uc1a1\ud569\ub2c8\ub2e4. \uc5b4\ub5a4 \uc624\ub958 \uba54\uc2dc\uc9c0\uac00 \ub728\ub294\uc9c0 \uc2a4\ud06c\ub9b0\uc0f7 \ubcf4\ub0b4\uc8fc\uc2e4 \uc218 \uc788\uc73c\uc2e0\uac00\uc694?",
        timestamp: "09:15",
        type: "text",
      },
      {
        id: "msg-004",
        sender: "customer",
        content: "\ub124, \uc624\uc804 9\uc2dc\ubd80\ud130 \uacc4\uc18d \'\uc608\uc57d \ubd88\uac00\' \uba54\uc2dc\uc9c0\uac00 \ub098\uc640\uc694. \uad00\ub9ac\uc790 \ud398\uc774\uc9c0\uc5d0\uc11c\ub3c4 \ud655\uc778\ud588\ub294\ub370 \uc608\uc57d \uc2ac\ub86f\uc774 \uc548 \ubcf4\uc5ec\uc694.",
        timestamp: "09:17",
        type: "text",
      },
      {
        id: "msg-005",
        sender: "agent",
        agentName: "\uc774\ubbfc\uc8fc",
        content: "\uc774\ubbfc\uc8fc\uc785\ub2c8\ub2e4. \ud655\uc778\ud574\ubcf4\ub2c8 \uc11c\ubc84 \uc5c5\ub370\uc774\ud2b8 \uc774\ud6c4 \uc608\uc57d \ubaa8\ub4c8\uc5d0 \uc77c\uc2dc\uc801\uc778 \uc624\ub958\uac00 \uc0dd\uacbc\uc2b5\ub2c8\ub2e4. \uc9c0\uae08 \ubc14\ub85c \uc218\uc815 \uc911\uc774\uace0 10\ubd84 \ub0b4\ub85c \ubcf5\uad6c\ub420 \uc608\uc815\uc785\ub2c8\ub2e4.",
        timestamp: "09:22",
        type: "text",
      },
      {
        id: "msg-006",
        sender: "customer",
        content: "\uc624\ub298 \uc608\uc57d \uc190\ub2d8\uc774 \ub9ce\uc740 \ub0a0\uc778\ub370 \ube68\ub9ac \ud574\uacb0\ud574\uc8fc\uc138\uc694!",
        timestamp: "09:25",
        type: "text",
      },
      {
        id: "msg-007",
        sender: "agent",
        agentName: "\uc624\uc0c1\ub2f4",
        content: "\uc8c4\uc1a1\ud569\ub2c8\ub2e4. \ud604\uc7ac \uae34\uae09 \ucc98\ub9ac \uc911\uc785\ub2c8\ub2e4. \ubcf5\uad6c \uc644\ub8cc \uc989\uc2dc \ubb38\uc790\ub85c \uc54c\ub9bc \ub4dc\ub9ac\uaca0\uc2b5\ub2c8\ub2e4.",
        timestamp: "09:30",
        type: "text",
      },
      {
        id: "msg-008",
        sender: "customer",
        content: "\ub124, \uac10\uc0ac\ud569\ub2c8\ub2e4. \ube68\ub9ac \ubd80\ud0c1\ub4dc\ub824\uc694.",
        timestamp: "09:38",
        type: "text",
      },
    ],
  },
  {
    id: "sess-002",
    storeId: "store-001",
    channel: "call",
    status: "active",
    priority: "high",
    subject: "\ud0a4\uc624\uc2a4\ud06c \uc5f0\ub3d9 \uc624\ub958 \ubb38\uc758",
    category: "\uae30\uc220\uc9c0\uc6d0",
    createdAt: "2025-02-26T09:05:00",
    updatedAt: "2025-02-26T09:40:00",
    waitTime: "0\ubd84",
    handleTime: "35\ubd84",
    routingQueue: [
      { agent: { id: "agent-01", name: "\uc624\uc0c1\ub2f4", status: "busy" }, tried: true, current: true },
      { agent: { id: "agent-03", name: "\uc774\ubbfc\uc8fc", status: "online" }, tried: false, current: false },
      { agent: { id: "agent-04", name: "\ubc15\uc900\uc11c", status: "offline" }, tried: false, current: false },
    ],
    tags: ["\ud0a4\uc624\uc2a4\ud06c", "\uae30\uc220"],
    source: "\uc804\ud654",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    softphone: false,
    customerId: "cust-002",
    messages: [
      {
        id: "msg-c1",
        sender: "system",
        content: "\ud1b5\ud654 \uc5f0\uacb0\ub428 \u2014 09:05:14",
        timestamp: "09:05",
        type: "call-start",
      },
      {
        id: "msg-c2",
        sender: "customer",
        content: "\uc5ec\ubcf4\uc138\uc694, \ud0a4\uc624\uc2a4\ud06c\uc5d0\uc11c \uacb0\uc81c\ub294 \ub418\ub294\ub370 \uc601\uc218\uc99d\uc774 \uc548 \ub098\uc640\uc694.",
        timestamp: "09:05",
        type: "stt",
        sttSpeaker: "customer",
      },
      {
        id: "msg-c3",
        sender: "agent",
        agentName: "\uc624\uc0c1\ub2f4",
        content: "\ub124, \uc548\ub155\ud558\uc138\uc694. \uc601\uc218\uc99d\uc774 \uc544\uc608 \uc548 \ub098\uc624\uc2dc\ub294 \uac74\uac00\uc694, \uc544\ub2c8\uba74 \uac04\ud5d0\uc801\uc73c\ub85c \uadf8\ub7ec\uc138\uc694?",
        timestamp: "09:06",
        type: "stt",
        sttSpeaker: "agent",
      },
      {
        id: "msg-c4",
        sender: "customer",
        content: "\uc544\uc608 \uc548 \ub098\uc640\uc694. \uc5b4\uc81c\ubd80\ud130\uc694.",
        timestamp: "09:06",
        type: "stt",
        sttSpeaker: "customer",
      },
      {
        id: "msg-c5",
        sender: "agent",
        agentName: "\uc624\uc0c1\ub2f4",
        content: "\uc54c\uaca0\uc2b5\ub2c8\ub2e4. \ud504\ub9b0\ud130 \ub4dc\ub77c\uc774\ubc84 \uc5c5\ub370\uc774\ud2b8\uac00 \ud544\uc694\ud55c \uac83 \uac19\uc544\uc694. \uc9c0\uae08 \uc6d0\uaca9\uc73c\ub85c \ubc14\ub85c \uc9c4\ud589\ud574\ub4dc\ub9b4\uac8c\uc694. \uc7a0\uae04\ub9cc \uae30\ub2e4\ub824\uc8fc\uc138\uc694.",
        timestamp: "09:09",
        type: "stt",
        sttSpeaker: "agent",
      },
      {
        id: "msg-c6",
        sender: "customer",
        content: "\ub124, \ubd80\ud0c1\ub4dc\ub9bd\ub2c8\ub2e4.",
        timestamp: "09:10",
        type: "stt",
        sttSpeaker: "customer",
      },
      {
        id: "msg-c7",
        sender: "agent",
        agentName: "\uc624\uc0c1\ub2f4",
        content: "[\ud1b5\ud654 \uba54\ubaa8] \ud0a4\uc624\uc2a4\ud06c \ud504\ub9b0\ud130 \uc601\uc218\uc99d \ubbf8\ucd9c\ub825. \ub4dc\ub77c\uc774\ubc84 \uad6c\ubc84\uc804. \uc6d0\uaca9 \uc5c5\ub370\uc774\ud2b8 \uc9c4\ud589 \uc911.",
        timestamp: "09:12",
        type: "note",
      },
    ],
  },
  {
    id: "sess-003",
    storeId: "store-001",
    channel: "whatsapp",
    status: "ai_agent",
    priority: "urgent",
    subject: "\uc911\ubcf5 \uccad\uad6c \ud658\ubd88 \uc694\uccad",
    category: "\ud658\ubd88/\ucde8\uc18c",
    createdAt: "2025-02-26T09:35:00",
    updatedAt: "2025-02-26T09:42:00",
    waitTime: "7\ubd84",
    activeMembers: [],
    tags: ["\ud658\ubd88", "\uc911\ubcf5\uacb0\uc81c", "\uae34\uae09"],
    source: "\ubaa8\ubc14\uc77c\uc571",
    os: "iOS 17",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-003",
    messages: [
      { id: "msg-w1", sender: "customer", content: "결제가 두 번 청구됐어요. 확인하고 환불해주세요.", timestamp: "09:35", type: "text" },
      { id: "msg-w2", sender: "bot", content: "안녕하세요! 중복 결제 확인해드릴게요. 결제하신 날짜와 금액을 알려주시면 바로 조회해드리겠습니다.", timestamp: "09:35", type: "text" },
      { id: "msg-w3", sender: "customer", content: "오늘 오전 9시 35분에 120,000원씩 두 번 빠져나갔어요.", timestamp: "09:38", type: "text" },
      { id: "msg-w4", sender: "bot", content: "확인했습니다. 09:35분에 동일 금액 2건이 결제된 것이 맞습니다. 중복 결제 건은 자동 환불 처리되며, 통상 영업일 기준 3~5일 이내 카드사에 따라 취소됩니다. 취소 완료 시 문자로 안내해드릴게요.", timestamp: "09:39", type: "text" },
      { id: "msg-w5", sender: "customer", content: "그렇게 오래 걸려요? 더 빨리는 안 되나요?", timestamp: "09:41", type: "text" },
      { id: "msg-w6", sender: "bot", content: "카드사 처리 기준상 최소 3영업일이 소요됩니다. 다만 당일 취소 처리는 완료됐으니 실제 반영은 카드사마다 조금 다를 수 있어요. 혹시 더 급하신 사정이 있으시면 카드사 고객센터에 직접 취소 확인 요청도 가능합니다.", timestamp: "09:42", type: "text" },
    ],
  },
  {
    id: "sess-004",
    storeId: "store-001",
    channel: "webchat",
    status: "waiting",
    priority: "normal",
    subject: "\uc608\uc57d \uc2dc\uc2a4\ud15c \uc0ac\uc6a9\ubc95 \ubb38\uc758",
    category: "\uc0ac\uc6a9\ubc29\ubc95",
    createdAt: "2025-02-26T09:38:00",
    updatedAt: "2025-02-26T09:41:00",
    waitTime: "3\ubd84",
    activeMembers: [],
    tags: ["\uc0ac\uc6a9\ubc95"],
    source: "\uc6f9\uc0ac\uc774\ud2b8",
    browser: "Edge 121",
    os: "Windows 11",
    location: "\uacbd\uae30, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-004",
    messages: [
      { id: "msg-n1", sender: "customer", content: "안녕하세요. 예약 차단 기능은 어떻게 사용하나요? 특정 날짜에 예약을 막고 싶어요.", timestamp: "09:38", type: "text" },
      { id: "msg-n2", sender: "bot", content: "안녕하세요! 예약 차단 설정 방법 안내해드릴게요. 관리자 페이지 > 예약 관리 > 차단 날짜 설정 메뉴에서 원하시는 날짜 또는 시간대를 선택 후 '차단 추가' 버튼을 누르시면 됩니다.", timestamp: "09:38", type: "text" },
      { id: "msg-n3", sender: "customer", content: "반복적으로 매주 월요일을 막는 건 안 되나요?", timestamp: "09:40", type: "text" },
      { id: "msg-n4", sender: "bot", content: "가능합니다! 차단 설정 시 '반복' 옵션에서 '매주 월요일'을 선택하시면 자동으로 매주 적용됩니다. 특정 기간만 반복하려면 시작일과 종료일도 함께 설정해 주세요.", timestamp: "09:40", type: "text" },
    ],
  },
  {
    id: "sess-005",
    storeId: "store-001",
    channel: "call",
    status: "waiting",
    priority: "high",
    subject: "\uc11c\ube44\uc2a4 \ud574\uc9c0 \ubc0f \ub370\uc774\ud130 \uc694\uccad",
    category: "\uacc4\uc815/\uad6c\ub3c5",
    createdAt: "2025-02-26T09:40:00",
    updatedAt: "2025-02-26T09:43:00",
    waitTime: "3\ubd84",
    routingQueue: [
      { agent: { id: "agent-02", name: "\uae40\uae30\uc220", status: "busy" }, tried: true, current: false },
      { agent: { id: "agent-01", name: "\uc624\uc0c1\ub2f4", status: "online" }, tried: false, current: true },
      { agent: { id: "agent-03", name: "\uc774\ubbfc\uc8fc", status: "online" }, tried: false, current: false },
    ],
    tags: ["\ud574\uc9c0", "\ub370\uc774\ud130"],
    source: "\uc804\ud654",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-005",
    messages: [
      {
        id: "msg-h1",
        sender: "system",
        content: "\uc218\uc2e0 \ub300\uae30 \uc911 \u2014 09:40:05",
        timestamp: "09:40",
        type: "call-start",
      },
    ],
  },
  {
    id: "sess-006",
    storeId: "store-001",
    channel: "board",
    status: "waiting",
    priority: "normal",
    subject: "\uc571\uc5d0\uc11c \uc608\uc57d \ub4f1\ub85d\uc774 \uc548 \ub429\ub2c8\ub2e4",
    category: "\uc571/\uc11c\ube44\uc2a4",
    createdAt: "2025-02-26T08:50:00",
    updatedAt: "2025-02-26T08:50:00",
    waitTime: "52\ubd84",
    activeMembers: [],
    tags: ["\uc571\uc624\ub958", "\uc608\uc57d"],
    source: "\uac8c\uc2dc\ud310",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-006",
    messages: [
      {
        id: "msg-b1",
        sender: "customer",
        content: "\uc548\ub155\ud558\uc138\uc694. \uc571\uc5d0\uc11c \ucf3b \uc608\uc57d\uc744 \ud558\ub824\uace0 \ud558\ub294\ub370 \uacc4\uc18d \'\ub4f1\ub85d \uc2e4\ud328\' \uc624\ub958\uac00 \ub0a9\ub2c8\ub2e4. \uae30\uae30: \uc544\uc774\ud3f0 15, iOS 17.3, \uc571 \ubc84\uc804 2.4.1",
        timestamp: "08:50",
        type: "text",
      },
    ],
  },
  {
    id: "sess-007",
    storeId: "store-001",
    channel: "board",
    status: "resolved",
    priority: "normal",
    subject: "\uc601\uc5c5\uc2dc\uac04 \ubcc0\uacbd \ubc18\uc601 \uc694\uccad",
    category: "\uc815\ubcf4\uc218\uc815",
    createdAt: "2025-02-26T07:30:00",
    updatedAt: "2025-02-26T08:15:00",
    waitTime: "0\ubd84",
    handleTime: "45\ubd84",
    activeMembers: [{ id: "agent-03", name: "\uc774\ubbfc\uc8fc", status: "online" }],
    csat: 5,
    tags: ["\uc815\ubcf4\uc218\uc815"],
    source: "\uac8c\uc2dc\ud310",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-004",
    messages: [
      {
        id: "msg-r1",
        sender: "customer",
        content: "\uc548\ub155\ud558\uc138\uc694. \uc601\uc5c5\uc2dc\uac04\uc774 \ubcc0\uacbd\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \uc6d4-\ud654-\uc218-\ubaa9 10:00~20:00, \uae08-\ud1a0 10:00~21:00, \uc77c 11:00~18:00\ub85c \uc218\uc815 \ubd80\ud0c1\ub4dc\ub9bd\ub2c8\ub2e4.",
        timestamp: "07:30",
        type: "text",
      },
      {
        id: "msg-r2",
        sender: "agent",
        agentName: "\uc774\ubbfc\uc8fc",
        content: "\uc548\ub155\ud558\uc138\uc694, \uc774\ubbfc\uc8fc\uc785\ub2c8\ub2e4. \ub9d0\uc528\ud558\uc2e0 \uc601\uc5c5\uc2dc\uac04 \ubcc0\uacbd \ucc98\ub9ac \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4. \uc571\uacfc \uc6f9 \ubaa8\ub450 \ubc18\uc601\ub418\uc5c8\uc73c\ub2c8 \ud655\uc778 \ubd80\ud0c1\ub4dc\ub9bd\ub2c8\ub2e4.",
        timestamp: "08:15",
        type: "text",
      },
      {
        id: "msg-r3",
        sender: "customer",
        content: "\uac10\uc0ac\ud569\ub2c8\ub2e4! \ud655\uc778\ud588\uc2b5\ub2c8\ub2e4.",
        timestamp: "08:18",
        type: "text",
      },
    ],
  },
  // store-001 이름 없는 고객 세션
  {
    id: "sess-008",
    storeId: "store-001",
    channel: "call",
    status: "waiting",
    priority: "normal",
    subject: "\ucee4\ud2b8 \uc608\uc57d \ubb38\uc758",
    category: "\uc608\uc57d/\uacb0\uc81c",
    createdAt: "2025-02-27T11:05:00",
    updatedAt: "2025-02-27T11:05:00",
    waitTime: "2\ubd84",
    activeMembers: [],
    tags: [],
    source: "\uc804\ud654",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-007",
    messages: [
      { id: "msg-008-1", sender: "system", content: "\uc218\uc2e0 \ub300\uae30 \uc911 \u2014 11:05:00", timestamp: "11:05", type: "call-start" },
    ],
  },
  {
    id: "sess-009",
    storeId: "store-001",
    channel: "webchat",
    status: "ai_agent",
    priority: "normal",
    subject: "\uc5fc\uc0c9 \uac00\uaca9 \ubb38\uc758",
    category: "\uc2dc\uc220\uc0c1\ub2f4",
    createdAt: "2025-02-27T11:10:00",
    updatedAt: "2025-02-27T11:12:00",
    waitTime: "2\ubd84",
    activeMembers: [],
    tags: [],
    source: "\uc6f9\uc0ac\uc774\ud2b8",
    browser: "Chrome 121",
    os: "Android 14",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-008",
    messages: [
      { id: "msg-009-1", sender: "customer", content: "염색 얼마에요?", timestamp: "11:10", type: "text" },
      { id: "msg-009-2", sender: "bot", content: "염색 시술 가격은 모발 길이와 종류에 따라 다릅니다. 단발 기준 전체 염색 80,000원~, 중간 길이 100,000원~, 긴 머리 120,000원~입니다. 탈색이 필요한 경우 추가 비용이 발생할 수 있어요.", timestamp: "11:10", type: "text" },
      { id: "msg-009-3", sender: "customer", content: "탈색 포함하면 얼마 정도 예상하면 되나요?", timestamp: "11:12", type: "text" },
      { id: "msg-009-4", sender: "bot", content: "탈색 + 염색 패키지는 보통 160,000원~200,000원 사이입니다. 정확한 금액은 모발 상태에 따라 달라지므로 방문 전 상담을 통해 확정해드릴 수 있어요. 예약 원하시면 바로 도와드릴까요?", timestamp: "11:12", type: "text" },
    ],
  },
  // ── store-002: 서울 헤어샵 ──
  {
    id: "sess-101",
    storeId: "store-002",
    channel: "webchat",
    status: "active",
    priority: "high",
    subject: "\uc5fc\uc0c9 \uc2dc\uc220 \ud6c4 \ub178\ucd9c \ud604\uc0c1 \ucee8\ud074\ub808\uc784",
    category: "\ucee8\ud074\ub808\uc784",
    createdAt: "2025-02-26T10:05:00",
    updatedAt: "2025-02-26T10:30:00",
    waitTime: "1\ubd84",
    handleTime: "25\ubd84",
    activeMembers: [{ id: "agent-01", name: "\uc624\uc0c1\ub2f4", status: "online" }],
    tags: ["\ucee8\ud074\ub808\uc784", "\uc5fc\uc0c9"],
    source: "\uc6f9\uc0ac\uc774\ud2b8",
    browser: "Safari 17",
    os: "iOS 17",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-101",
    messages: [
      { id: "msg-101-1", sender: "customer", content: "\uc5fc\uc0c9\uc744 \ud588\ub294\ub370 \uba38\ub9ac\uac00 \ub108\ubb34 \ub9d0\uc774 \ube60\uc84c\uc5b4\uc694. \ub178\ucd9c \uad50\uc815\uc744 \ubc1b\uace0 \uc2f6\uc5b4\uc694.", timestamp: "10:05", type: "text" },
      { id: "msg-101-2", sender: "bot", content: "불편을 드려 정말 죄송합니다. 염색 후 노출 현상은 저희가 책임지고 해결해드립니다. 시술 받으신 날짜와 담당 원장님 성함을 알려주시면 바로 확인해드릴게요.", timestamp: "10:05", type: "text" },
      { id: "msg-101-3", sender: "agent", agentName: "\uc624\uc0c1\ub2f4", content: "\uc548\ub155\ud558\uc138\uc694. \uc0c1\ud0dc \ud655\uc778 \ud6c4 \ub178\ucd9c \uad50\uc815 \uc77c\uc815\uc744 \uc7a1\uc544\ub4dc\ub9ac\uaca0\uc2b5\ub2c8\ub2e4.", timestamp: "10:08", type: "text" },
      { id: "msg-101-4", sender: "customer", content: "\ube68\ub9ac \ud574\uacb0\ud574\uc8fc\uc138\uc694. \uc911\uc694\ud55c \uc57d\uc18d\uc774 \uc788\uc5b4\uc11c\uc694.", timestamp: "10:15", type: "text" },
    ],
  },
  {
    id: "sess-102",
    storeId: "store-002",
    channel: "call",
    status: "waiting",
    priority: "normal",
    subject: "\uc0e4\ub9f4\ud478 \uc2dc\uc220 \uc2dc\uac04 \ubb38\uc758",
    category: "\uc608\uc57d/\uacb0\uc81c",
    createdAt: "2025-02-26T10:20:00",
    updatedAt: "2025-02-26T10:23:00",
    waitTime: "3\ubd84",
    routingQueue: [
      { agent: { id: "agent-02", name: "\uae40\uae30\uc220", status: "busy" }, tried: true, current: false },
      { agent: { id: "agent-01", name: "\uc624\uc0c1\ub2f4", status: "online" }, tried: false, current: true },
    ],
    tags: ["\uc0e4\ub9f4\ud478", "\uc2dc\uc220\ubb38\uc758"],
    source: "\uc804\ud654",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-102",
    messages: [
      { id: "msg-102-1", sender: "system", content: "\uc218\uc2e0 \ub300\uae30 \uc911 \u2014 10:20:00", timestamp: "10:20", type: "call-start" },
    ],
  },
  {
    id: "sess-103",
    storeId: "store-002",
    channel: "board",
    status: "ai_agent",
    priority: "normal",
    subject: "\uc815\uae30\uad8c \ud560\uc778 \uc801\uc6a9 \ubb38\uc758",
    category: "\ud560\uc778/\ucff5\ud3f0",
    createdAt: "2025-02-26T09:50:00",
    updatedAt: "2025-02-26T10:00:00",
    waitTime: "5\ubd84",
    activeMembers: [],
    tags: ["\ud560\uc778", "\uc815\uae30\uad8c"],
    source: "\uac8c\uc2dc\ud310",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-103",
    messages: [
      { id: "msg-103-1", sender: "customer", content: "\uc815\uae30\uad8c \uc0ac\uc6a9 \uc911\uc778\ub370 \uc624\ub298 \ud560\uc778\uc774 \uc801\uc6a9\uc774 \ub548 \uac83 \uac19\uc544\uc694.", timestamp: "09:50", type: "text" },
      { id: "msg-103-2", sender: "bot", content: "정기권 할인은 예약 완료 직후 결제 화면에 자동 적용됩니다. 혹시 예약 완료 후 할인이 반영된 최종 금액이 이메일로 발송되셨나요?", timestamp: "09:51", type: "text" },
      { id: "msg-103-3", sender: "customer", content: "예약 완료 후에도 할인 금액이 안 보여요.", timestamp: "09:58", type: "text" },
      { id: "msg-103-4", sender: "bot", content: "확인해보니 정기권 잔여 횟수가 1회 남아있고, 예약에 정상 연결되어 있습니다. 결제 화면에서 '정기권 사용' 항목이 체크 해제되어 있을 수 있어요. 결제 전 해당 항목을 다시 활성화해 보시겠어요?", timestamp: "09:59", type: "text" },
    ],
  },
  {
    id: "sess-104",
    storeId: "store-002",
    channel: "whatsapp",
    status: "resolved",
    priority: "low",
    subject: "\uc601\uc5c5\uc2dc\uac04 \ubb38\uc758",
    category: "\uc815\ubcf4\uc218\uc815",
    createdAt: "2025-02-26T08:00:00",
    updatedAt: "2025-02-26T08:30:00",
    waitTime: "0\ubd84",
    handleTime: "30\ubd84",
    activeMembers: [{ id: "agent-03", name: "\uc774\ubbfc\uc8fc", status: "online" }],
    csat: 5,
    tags: ["\uc601\uc5c5\uc2dc\uac04"],
    source: "\ubaa8\ubc14\uc77c\uc571",
    os: "Android 14",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-104",
    messages: [
      { id: "msg-104-1", sender: "customer", content: "\uc77c\uc694\uc77c \uc601\uc5c5\ud558\uc2dc\ub098\uc694?", timestamp: "08:00", type: "text" },
      { id: "msg-104-2", sender: "agent", agentName: "\uc774\ubbfc\uc8fc", content: "\ub124, \uc77c\uc694\uc77c 11:00~18:00 \uc601\uc5c5\ud569\ub2c8\ub2e4.", timestamp: "08:10", type: "text" },
      { id: "msg-104-3", sender: "customer", content: "\uac10\uc0ac\ud569\ub2c8\ub2e4!", timestamp: "08:12", type: "text" },
    ],
  },
  // store-002 이름 없는 고객 세션
  {
    id: "sess-105",
    storeId: "store-002",
    channel: "call",
    status: "waiting",
    priority: "normal",
    subject: "\ucee4\ud2b8 + \uc2a4\ud0c0\uc77c\ub9c1 \ubb38\uc758",
    category: "\uc2dc\uc220\uc0c1\ub2f4",
    createdAt: "2025-02-27T10:55:00",
    updatedAt: "2025-02-27T10:55:00",
    waitTime: "4\ubd84",
    activeMembers: [],
    tags: [],
    source: "\uc804\ud654",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-105",
    messages: [
      { id: "msg-105-1", sender: "system", content: "\uc218\uc2e0 \ub300\uae30 \uc911 \u2014 10:55:00", timestamp: "10:55", type: "call-start" },
    ],
  },
  {
    id: "sess-106",
    storeId: "store-002",
    channel: "webchat",
    status: "pending",
    priority: "normal",
    subject: "\uc608\uc57d \ucde8\uc18c \uc694\uccad",
    category: "\ud658\ubd88/\ucde8\uc18c",
    createdAt: "2025-02-27T09:40:00",
    updatedAt: "2025-02-27T09:45:00",
    waitTime: "0\ubd84",
    handleTime: "5\ubd84",
    activeMembers: [],
    tags: ["\ucde8\uc18c"],
    source: "\uc6f9\uc0ac\uc774\ud2b8",
    browser: "Safari 17",
    os: "iOS 17",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-106",
    messages: [
      { id: "msg-106-1", sender: "customer", content: "\ub0b4\uc77c \uc608\uc57d \ucde8\uc18c \uac00\ub2a5\ud55c\uac00\uc694?", timestamp: "09:40", type: "text" },
      { id: "msg-106-2", sender: "bot", content: "내일 예약 취소는 가능합니다. 취소 정책에 따라 시술 24시간 이전 취소는 100% 환불, 12시간 이내 취소는 50% 환불됩니다. 취소를 진행할까요?", timestamp: "09:40", type: "text" },
      { id: "msg-106-3", sender: "customer", content: "네, 취소해 주세요.", timestamp: "09:41", type: "text" },
      { id: "msg-106-4", sender: "bot", content: "내일 예약이 취소 완료됐습니다. 결제하신 금액은 100% 환불 처리되며 영업일 기준 3~5일 내 반영됩니다.", timestamp: "09:41", type: "text" },
    ],
  },
  // ── store-003: 송파 헤어샵 ──
  {
    id: "sess-201",
    storeId: "store-003",
    channel: "webchat",
    status: "active",
    priority: "urgent",
    subject: "\uc608\uc57d \uc911\ubcf5 \uacb0\uc81c \ud658\ubd88 \uc694\uccad",
    category: "\ud658\ubd88/\ucde8\uc18c",
    createdAt: "2025-02-26T09:55:00",
    updatedAt: "2025-02-26T10:20:00",
    waitTime: "0\ubd84",
    handleTime: "25\ubd84",
    activeMembers: [{ id: "agent-02", name: "\uae40\uae30\uc220", status: "online" }],
    tags: ["\ud658\ubd88", "\uc911\ubcf5\uacb0\uc81c", "\uae34\uae09"],
    source: "\uc6f9\uc0ac\uc774\ud2b8",
    browser: "Chrome 121",
    os: "Windows 11",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-201",
    messages: [
      { id: "msg-201-1", sender: "customer", content: "\uc5b4\uc81c \ucf3b + \ud380\uc744 \uc608\uc57d\ud588\ub294\ub370 \uacb0\uc81c\uac00 \ub450 \ubc88 \ub428\uc5b4\uc694. \ud558\ub098 \ud658\ubd88\ud574 \uc8fc\uc138\uc694.", timestamp: "09:55", type: "text" },
      { id: "msg-201-2", sender: "bot", content: "중복 결제 확인했습니다. 어제 커트 + 펌 예약 건으로 동일 금액 2건이 결제된 것이 맞습니다. 중복된 1건은 즉시 취소 처리하겠습니다.", timestamp: "09:55", type: "text" },
      { id: "msg-201-3", sender: "agent", agentName: "\uae40\uae30\uc220", content: "\ud655\uc778\ud588\uc2b5\ub2c8\ub2e4. \uc911\ubcf5 \uacb0\uc81c\uac00 \ub9de\uc2b5\ub2c8\ub2e4. \ubc14\ub85c \ud658\ubd88 \ucc98\ub9ac \ub4e4\uc5b4\uac00\uaca0\uc2b5\ub2c8\ub2e4.", timestamp: "10:02", type: "text" },
    ],
  },
  {
    id: "sess-202",
    storeId: "store-003",
    channel: "call",
    status: "ai_agent",
    priority: "normal",
    subject: "\uc2e0\uaddc \uace0\uac1d \uc2dc\uc220 \uc0c1\ub2f4",
    category: "\uc2dc\uc220\uc0c1\ub2f4",
    createdAt: "2025-02-26T10:10:00",
    updatedAt: "2025-02-26T10:15:00",
    waitTime: "5\ubd84",
    activeMembers: [],
    tags: ["\uc2e0\uaddc", "\uc2dc\uc220\uc0c1\ub2f4"],
    source: "\uc804\ud654",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-202",
    messages: [
      { id: "msg-202-1", sender: "system", content: "\uc218\uc2e0 \ub300\uae30 \uc911 \u2014 10:10:00", timestamp: "10:10", type: "call-start" },
      { id: "msg-202-2", sender: "customer", content: "\ucc98\uc74c \ub0b4\uc6d0\uc778\ub370 \uc5ec\ub7ec \uc2dc\uc220 \uc815\ubcf4\ub97c \ub4e3\uace0 \uc2f6\uc5b4\uc694.", timestamp: "10:12", type: "stt", sttSpeaker: "customer" },
      { id: "msg-202-3", sender: "bot", content: "처음 방문 환영합니다! 저희 대표 시술은 커트 30,000원, 펌 80,000원~, 염색 90,000원~입니다. 어떤 시술에 관심 있으신가요?", timestamp: "10:13", type: "text" },
      { id: "msg-202-4", sender: "customer", content: "볼륨 펌이랑 염색 같이 하면 얼마예요?", timestamp: "10:14", type: "stt", sttSpeaker: "customer" },
      { id: "msg-202-5", sender: "bot", content: "볼륨 펌 + 염색 패키지 기준 160,000원~200,000원입니다. 모발 길이와 상태에 따라 달라질 수 있고, 첫 방문 고객님께는 10% 할인 적용됩니다. 예약 진행해드릴까요?", timestamp: "10:15", type: "text" },
    ],
  },
  {
    id: "sess-203",
    storeId: "store-003",
    channel: "board",
    status: "waiting",
    priority: "normal",
    subject: "\ud380 \uc2dc\uc220 \ud6c4 \ucd94\ucc9c \uc81c\ud488 \ubb38\uc758",
    category: "\uc81c\ud488\ubb38\uc758",
    createdAt: "2025-02-26T09:30:00",
    updatedAt: "2025-02-26T09:35:00",
    waitTime: "8\ubd84",
    activeMembers: [],
    tags: ["\ud380", "\uc81c\ud488"],
    source: "\uac8c\uc2dc\ud310",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-203",
    messages: [
      { id: "msg-203-1", sender: "customer", content: "\ud380 \uc2dc\uc220 \ud6c4 \uc0ac\uc6a9\ud558\uba74 \uc88b\uc740 \ud584\uc5b4 \uc81c\ud488 \ucd94\ucc9c\ud574 \uc8fc\uc2e4 \uc218 \uc788\ub098\uc694?", timestamp: "09:30", type: "text" },
      { id: "msg-203-2", sender: "bot", content: "펌 후에는 수분 공급과 열 손상 케어가 중요합니다. 저희 원장님이 추천하시는 제품은 케라틴 트리트먼트 (모이스처 라인)과 실리콘 없는 펌 전용 에센스입니다. 현재 매장에서 구매 시 10% 할인도 가능해요!", timestamp: "09:31", type: "text" },
      { id: "msg-203-3", sender: "customer", content: "온라인으로 구매 가능한가요?", timestamp: "09:33", type: "text" },
      { id: "msg-203-4", sender: "bot", content: "네, 저희 공식 온라인 스토어(store.example.com)에서도 구매 가능합니다. 매장 방문 고객 전용 쿠폰 코드 'PERM10'을 입력하시면 동일 할인 적용됩니다.", timestamp: "09:34", type: "text" },
    ],
  },
  // store-003 이름 없는 고객 세션
  {
    id: "sess-204",
    storeId: "store-003",
    channel: "webchat",
    status: "active",
    priority: "normal",
    subject: "\ub4dc\ub77c\uc774\ub2f9 \ub3d9\ubc18 \uc694\uccad",
    category: "\uc2dc\uc220\uc0c1\ub2f4",
    createdAt: "2025-02-27T11:00:00",
    updatedAt: "2025-02-27T11:08:00",
    waitTime: "0\ubd84",
    handleTime: "8\ubd84",
    activeMembers: [{ id: "agent-02", name: "\uae40\uae30\uc220", status: "online" }],
    tags: [],
    source: "\uc6f9\uc0ac\uc774\ud2b8",
    browser: "Chrome 121",
    os: "Windows 11",
    location: "\uc11c\uc6b8, \ub300\ud55c\ubbfc\uad6d",
    customerId: "cust-204",
    messages: [
      { id: "msg-204-1", sender: "customer", content: "\ub4dc\ub77c\uc774\ub2f9 \ud560 \ub54c \ub3d9\ubc18\ud574 \uc8fc\uc2dc\ub098\uc694?", timestamp: "11:00", type: "text" },
      { id: "msg-204-2", sender: "agent", agentName: "\uae40\uae30\uc220", content: "\ub124, \ub4dc\ub77c\uc774\ub2f9 \ub3d9\ubc18 \uc11c\ube44\uc2a4 \uc81c\uacf5\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4. \uc608\uc57d\ud558\uc2dc\uaca0\uc5b4\uc694?", timestamp: "11:03", type: "text" },
    ],
  },
  // ── Email sessions ──────────────────────────────────────────────────────────
  {
    id: "sess-e01",
    storeId: "store-001",
    channel: "email",
    status: "waiting",
    priority: "high",
    subject: "환불 처리가 2주째 안 되고 있어요",
    category: "환불/결제",
    createdAt: "2025-02-26T09:00:00",
    updatedAt: "2025-02-26T09:00:00",
    waitTime: "1시간",
    handleTime: "0분",
    activeMembers: [],
    tags: ["환불", "미처리"],
    source: "이메일",
    customerId: "cust-001",
    messages: [
      { id: "msg-e01-1", sender: "customer", content: "안녕하세요. 지난 2월 12일에 환불 신청을 했는데 아직도 처리가 안 되고 있습니다. 담당자 연결 부탁드립니다.", timestamp: "09:00", type: "text" },
      { id: "msg-e01-2", sender: "bot", content: "안녕하세요, 김민지 고객님. 환불 신청 접수 확인했습니다. 2월 12일 신청 건 기준으로 조회해보니 카드사 처리 지연으로 인해 아직 반영이 안 된 상태입니다. 오늘 중으로 카드사에 직접 촉구 처리해드리겠습니다.", timestamp: "09:01", type: "text" },
      { id: "msg-e01-3", sender: "customer", content: "2주나 지났는데 카드사 지연이라고요? 이건 좀 너무 오래된 것 같은데요.", timestamp: "09:05", type: "text" },
      { id: "msg-e01-4", sender: "bot", content: "죄송합니다, 고객님. 확인 결과 저희 내부 처리 오류였습니다. 즉시 수동으로 환불 처리해드리겠습니다. 오늘 중으로 완료되며 문자로 안내드리겠습니다.", timestamp: "09:06", type: "text" },
    ],
  },
  {
    id: "sess-e02",
    storeId: "store-001",
    channel: "email",
    status: "active",
    priority: "normal",
    subject: "멤버십 갱신 안내 문의",
    category: "멤버십",
    createdAt: "2025-02-26T10:30:00",
    updatedAt: "2025-02-26T10:45:00",
    waitTime: "0분",
    handleTime: "15분",
    activeMembers: [{ id: "agent-01", name: "오상담", status: "online" }],
    tags: ["멤버십", "갱신"],
    source: "이메일",
    customerId: "cust-002",
    messages: [
      { id: "msg-e02-1", sender: "customer", content: "안녕하세요. 멤버십이 이번 달 말에 만료되는데 자동 갱신이 되나요? 갱신 방법을 알고 싶습니다.", timestamp: "10:30", type: "text" },
      { id: "msg-e02-2", sender: "bot", content: "안녕하세요! 멤버십은 만료일 3일 전에 자동 갱신 안내 문자가 발송됩니다. 자동 갱신을 원하지 않으시면 만료일 전날까지 취소 신청이 가능합니다. 현재 등록된 결제 수단으로 갱신됩니다.", timestamp: "10:31", type: "text" },
      { id: "msg-e02-3", sender: "customer", content: "결제 수단을 변경하고 싶은데 어떻게 하면 되나요?", timestamp: "10:35", type: "text" },
      { id: "msg-e02-4", sender: "agent", agentName: "오상담", content: "마이페이지 > 결제 수단 관리에서 카드 정보를 변경하시면 됩니다. 갱신 전에 변경하시면 새 카드로 자동 결제됩니다.", timestamp: "10:45", type: "text" },
    ],
  },
  {
    id: "sess-e03",
    storeId: "store-001",
    channel: "email",
    status: "ai_agent",
    priority: "normal",
    subject: "예약 변경 가능 여부 확인",
    category: "예약",
    createdAt: "2025-02-26T11:20:00",
    updatedAt: "2025-02-26T11:25:00",
    waitTime: "0분",
    handleTime: "5분",
    activeMembers: [],
    tags: ["예약변경"],
    source: "이메일",
    customerId: "cust-003",
    messages: [
      { id: "msg-e03-1", sender: "customer", content: "안녕하세요. 모레 오후 2시로 예약되��� 있는데, 오후 4시로 변경이 가능한가요?", timestamp: "11:20", type: "text" },
      { id: "msg-e03-2", sender: "bot", content: "안녕하세요! 확인해보니 모레 오후 4시에 잔여 슬롯이 있습니다. 기존 예약(오후 2시)을 오후 4시로 변경해드릴까요?", timestamp: "11:22", type: "text" },
      { id: "msg-e03-3", sender: "customer", content: "네, 변경해주세요.", timestamp: "11:24", type: "text" },
      { id: "msg-e03-4", sender: "bot", content: "변경 완료됐습니다. 모레 오후 4시 예약이 확정되었으며 확인 이메일을 발송해드렸습니다.", timestamp: "11:25", type: "text" },
    ],
  },
  {
    id: "sess-e04",
    storeId: "store-001",
    channel: "email",
    status: "resolved",
    priority: "low",
    subject: "영업시간 문의",
    category: "일반문의",
    createdAt: "2025-02-25T14:00:00",
    updatedAt: "2025-02-25T14:10:00",
    waitTime: "0분",
    handleTime: "10분",
    activeMembers: [],
    tags: ["영업시간"],
    source: "이메일",
    customerId: "cust-004",
    messages: [
      { id: "msg-e04-1", sender: "customer", content: "주말 영업시간이 어떻게 되나요?", timestamp: "14:00", type: "text" },
      { id: "msg-e04-2", sender: "bot", content: "주말(토·일) 영업시간은 오전 10시~오후 8시입니다. 공휴일은 별도 공지를 통해 안내드립니다.", timestamp: "14:01", type: "text" },
      { id: "msg-e04-3", sender: "customer", content: "감사합니다!", timestamp: "14:05", type: "text" },
    ],
  },
]

export const additionalCustomers: Record<string, Customer> = {
  "cust-101": {
    id: "cust-101", storeId: "store-002",
    name: "\uc724\uc124\ud76c", phone: "010-4421-8873", email: "seolhee.yoon@gmail.com",
    gender: "\uc5ec\uc131", company: "\uc11c\uc6b8 \ud5e4\uc5b4\uc0f5",
    grade: "VIP", totalTickets: 11, resolvedTickets: 10, joinedAt: "2023-06-01",
    tags: ["\ucee8\ud074\ub808\uc784", "\ub178\ucd9c\uad50\uc815"], avatarInitials: "\uc724\uc124",
    avatarColor: "oklch(0.60 0.20 340)", sentiment: "negative", ltv: "\u20a9980,000",
  },
  "cust-102": {
    id: "cust-102", storeId: "store-002",
    name: "\ud55c\uc131\uc900", phone: "010-3312-6690", email: "sungjun.han@naver.com",
    gender: "\ub0a8\uc131", company: "\uc11c\uc6b8 \ud5e4\uc5b4\uc0f5",
    grade: "\uc77c\ubc18", totalTickets: 4, resolvedTickets: 3, joinedAt: "2024-05-10",
    tags: ["\uc0e4\ub9f4\ud478"], avatarInitials: "\ud55c\uc131",
    avatarColor: "oklch(0.65 0.15 180)", sentiment: "positive", ltv: "\u20a9320,000",
  },
  "cust-103": {
    id: "cust-103", storeId: "store-002",
    name: "\uc784\ub098\uc740", phone: "010-7823-4491", email: "naeun.lim@kakao.com",
    gender: "\uc5ec\uc131", company: "\uc11c\uc6b8 \ud5e4\uc5b4\uc0f5",
    grade: "\uc77c\ubc18", totalTickets: 6, resolvedTickets: 5, joinedAt: "2023-12-20",
    tags: ["\uc815\uae30\uad8c", "\ud560\uc778"], avatarInitials: "\uc784\ub098",
    avatarColor: "oklch(0.63 0.18 60)", sentiment: "neutral", ltv: "\u20a9510,000",
  },
  "cust-104": {
    id: "cust-104", storeId: "store-002",
    name: "\uc870\ud604\uc6b0", phone: "010-9901-2234", email: "hyunwoo.jo@gmail.com",
    gender: "\ub0a8\uc131", company: "\uc11c\uc6b8 \ud5e4\uc5b4\uc0f5",
    grade: "\uc2e0\uaddc", totalTickets: 2, resolvedTickets: 2, joinedAt: "2025-01-05",
    tags: ["\uc601\uc5c5\ubb38\uc758"], avatarInitials: "\uc870\ud604",
    avatarColor: "oklch(0.58 0.12 220)", sentiment: "positive", ltv: "\u20a9150,000",
  },
  "cust-201": {
    id: "cust-201", storeId: "store-003",
    name: "\ubc15\uc9c0\uc218", phone: "010-5521-3387", email: "jisu.park@naver.com",
    gender: "\uc5ec\uc131", company: "\uc1a1\ud30c \ud5e4\uc5b4\uc0f5",
    grade: "VIP", totalTickets: 19, resolvedTickets: 17, joinedAt: "2022-11-15",
    tags: ["\ud658\ubd88", "\uc911\ubcf5\uacb0\uc81c"], avatarInitials: "\ubc15\uc9c0",
    avatarColor: "oklch(0.62 0.22 20)", sentiment: "negative", ltv: "\u20a92,300,000",
  },
  "cust-202": {
    id: "cust-202", storeId: "store-003",
    name: "\uc624\ubbfc\uc900", phone: "010-6612-8845", email: "minjun.oh@gmail.com",
    gender: "\ub0a8\uc131", company: "\uc1a1\ud30c \ud5e4\uc5b4\uc0f5",
    grade: "\uc2e0\uaddc", totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-20",
    tags: ["\uc2e0\uaddc"], avatarInitials: "\uc624\ubbfc",
    avatarColor: "oklch(0.67 0.14 140)", sentiment: "positive", ltv: "\u20a950,000",
  },
  "cust-203": {
    id: "cust-203", storeId: "store-003",
    name: "\uc774\uc720\ub9ac", phone: "010-2234-5510", email: "yuri.lee@kakao.com",
    gender: "\uc5ec\uc131", company: "\uc1a1\ud30c \ud5e4\uc5b4\uc0f5",
    grade: "\uc77c\ubc18", totalTickets: 8, resolvedTickets: 7, joinedAt: "2023-09-01",
    tags: ["\ud380", "\uc81c\ud488\ubb38\uc758"], avatarInitials: "\uc774\uc720",
    avatarColor: "oklch(0.65 0.19 280)", sentiment: "neutral", ltv: "\u20a9690,000",
  },
  // store-001 이름 없는 고객
  "cust-007": {
    id: "cust-007", storeId: "store-001",
    name: "", phone: "010-3392-8841", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-27",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.60 0.10 200)", sentiment: "neutral",
  },
  "cust-008": {
    id: "cust-008", storeId: "store-001",
    name: "", phone: "010-7751-2209", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-27",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.60 0.10 40)", sentiment: "neutral",
  },
  // store-002 이름 없는 고객
  "cust-105": {
    id: "cust-105", storeId: "store-002",
    name: "", phone: "010-4481-6630", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-27",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.60 0.10 120)", sentiment: "neutral",
  },
  "cust-106": {
    id: "cust-106", storeId: "store-002",
    name: "", phone: "010-9023-5517", email: "",
    totalTickets: 2, resolvedTickets: 1, joinedAt: "2025-01-15",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.60 0.10 300)", sentiment: "neutral",
  },
  // store-003 이름 없는 고객
  "cust-204": {
    id: "cust-204", storeId: "store-003",
    name: "", phone: "010-6634-1182", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-26",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.60 0.10 260)", sentiment: "neutral",
  },
}
