/**
 * Saudi-environment mock data (used for English and Arabic locales).
 * - Chat channels: WebChat, WhatsApp (no KakaoTalk, no Naver)
 * - BizMessage channels: SMS, WhatsApp
 * - Store names: Saudi Arabic names with 9200-xxxxx phone numbers
 * - Customer names: Arabic names
 * - Prices in SAR (ريال)
 * - Locations: Riyadh, Jeddah, Dammam
 */

import type {
  Session,
  Customer,
  Agent,
  Reservation,
  Order,
  Review,
} from "./data"

export const saudiTeamAgents: Agent[] = [
  { id: "agent-01", name: "Sarah Al-Rashidi",   status: "online",  avatarInitials: "SR", avatarColor: "oklch(0.55 0.20 250)" },
  { id: "agent-02", name: "Mohammed Al-Otaibi", status: "busy",    avatarInitials: "MO", avatarColor: "oklch(0.55 0.18 30)"  },
  { id: "agent-03", name: "Layla Al-Harbi",     status: "online",  avatarInitials: "LH", avatarColor: "oklch(0.55 0.18 160)" },
  { id: "agent-04", name: "Ahmed Al-Shamri",    status: "offline", avatarInitials: "AS", avatarColor: "oklch(0.50 0.12 310)" },
]

export const saudiTeamAgentsAr: Agent[] = [
  { id: "agent-01", name: "سارة الرشيدي",  status: "online",  avatarInitials: "سر", avatarColor: "oklch(0.55 0.20 250)" },
  { id: "agent-02", name: "محمد العتيبي",  status: "busy",    avatarInitials: "مع", avatarColor: "oklch(0.55 0.18 30)"  },
  { id: "agent-03", name: "ليلى الحربي",   status: "online",  avatarInitials: "له", avatarColor: "oklch(0.55 0.18 160)" },
  { id: "agent-04", name: "أحمد الشمري",   status: "offline", avatarInitials: "أش", avatarColor: "oklch(0.50 0.12 310)" },
]

// ─── Stores ──────────────────────────────────────────────────────────────────
export interface SaudiStore {
  id: string
  nameEn: string
  nameAr: string
  initialsEn: string
  initialsAr: string
  phone: string
  unread?: number
}

export const saudiStores: SaudiStore[] = [
  { id: "store-001", nameEn: "Riyadh Wellness Spa", nameAr: "سبا الرياض للعناية", initialsEn: "RW", initialsAr: "ري", phone: "9200-14823", unread: 3 },
  { id: "store-002", nameEn: "Jeddah Beauty Lounge", nameAr: "صالون جدة للتجميل", initialsEn: "JB", initialsAr: "جد", phone: "9200-57391", unread: 1 },
  { id: "store-003", nameEn: "Dammam Style Studio", nameAr: "استوديو الدمام للأناقة", initialsEn: "DS", initialsAr: "دم", phone: "9200-82046" },
]

// ─── Reservations ─────────────────────────────────────────────────────────────
export const saudiCustomerReservationsEn: Record<string, Reservation[]> = {
  "cust-001": [
    { id: "rsv-001", date: "2025-02-26", time: "14:00", service: "Facial + Hair Treatment", status: "confirmed", memo: "VIP client, senior stylist assigned" },
    { id: "rsv-002", date: "2025-02-20", time: "11:00", service: "Hair Perm", status: "completed" },
    { id: "rsv-003", date: "2025-02-10", time: "15:30", service: "Haircut", status: "completed" },
  ],
  "cust-002": [
    { id: "rsv-004", date: "2025-02-28", time: "10:00", service: "Haircut + Perm", status: "confirmed" },
    { id: "rsv-005", date: "2025-02-14", time: "13:00", service: "Color Treatment", status: "completed" },
  ],
  "cust-003": [
    { id: "rsv-006", date: "2025-02-26", time: "15:00", service: "Perm + Haircut", status: "cancelled", memo: "Client requested cancellation" },
    { id: "rsv-007", date: "2025-02-18", time: "11:30", service: "Color Treatment", status: "completed" },
  ],
  "cust-007": [
    { id: "rsv-020", date: "2025-03-05", time: "11:00", service: "Haircut", status: "confirmed", memo: "First visit – short haircut requested" },
    { id: "rsv-021", date: "2025-01-18", time: "14:00", service: "Haircut + Wash", status: "completed" },
  ],
  "cust-008": [
    { id: "rsv-022", date: "2025-03-10", time: "15:00", service: "Color Treatment", status: "confirmed", memo: "Balayage – price check requested before booking" },
    { id: "rsv-023", date: "2025-02-01", time: "13:00", service: "Color Treatment", status: "completed" },
    { id: "rsv-024", date: "2024-11-20", time: "10:30", service: "Haircut", status: "completed" },
  ],
}

export const saudiCustomerReservationsAr: Record<string, Reservation[]> = {
  "cust-001": [
    { id: "rsv-001", date: "2025-02-26", time: "14:00", service: "علاج الوجه + علاج الشعر", status: "confirmed", memo: "عميل VIP، مُعيَّن لكبير المصففين" },
    { id: "rsv-002", date: "2025-02-20", time: "11:00", service: "بيرم الشعر", status: "completed" },
    { id: "rsv-003", date: "2025-02-10", time: "15:30", service: "قص الشعر", status: "completed" },
  ],
  "cust-002": [
    { id: "rsv-004", date: "2025-02-28", time: "10:00", service: "قص + بيرم", status: "confirmed" },
    { id: "rsv-005", date: "2025-02-14", time: "13:00", service: "صبغ الشعر", status: "completed" },
  ],
  "cust-007": [
    { id: "rsv-020", date: "2025-03-05", time: "11:00", service: "قص الشعر", status: "confirmed", memo: "أول زيارة – طلب قصة قصيرة" },
    { id: "rsv-021", date: "2025-01-18", time: "14:00", service: "قص وغسيل الشعر", status: "completed" },
  ],
  "cust-008": [
    { id: "rsv-022", date: "2025-03-10", time: "15:00", service: "صبغ الشعر", status: "confirmed", memo: "بالياج – طلب مراجعة الأسعار قبل الحجز" },
    { id: "rsv-023", date: "2025-02-01", time: "13:00", service: "صبغ الشعر", status: "completed" },
    { id: "rsv-024", date: "2024-11-20", time: "10:30", service: "قص الشعر", status: "completed" },
  ],
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const saudiCustomerOrdersEn: Record<string, Order[]> = {
  "cust-001": [
    { id: "ord-001", date: "2025-02-26", item: "Facial + Hair Treatment", amount: "SAR 320", status: "paid" },
    { id: "ord-002", date: "2025-02-20", item: "Hair Perm", amount: "SAR 250", status: "paid" },
    { id: "ord-003", date: "2025-01-15", item: "Color Treatment", amount: "SAR 200", status: "refunded" },
  ],
  "cust-002": [
    { id: "ord-004", date: "2025-02-14", item: "Color Treatment", amount: "SAR 195", status: "paid" },
    { id: "ord-005", date: "2025-02-28", item: "Haircut + Perm", amount: "SAR 340", status: "pending" },
  ],
  "cust-007": [
    { id: "ord-020", date: "2025-01-18", item: "Haircut + Wash", amount: "SAR 90", status: "paid" },
    { id: "ord-021", date: "2025-03-05", item: "Haircut", amount: "SAR 70", status: "pending" },
  ],
  "cust-008": [
    { id: "ord-022", date: "2024-11-20", item: "Haircut", amount: "SAR 80", status: "paid" },
    { id: "ord-023", date: "2025-02-01", item: "Color Treatment", amount: "SAR 220", status: "paid" },
    { id: "ord-024", date: "2025-03-10", item: "Color Treatment (Balayage)", amount: "SAR 380", status: "pending" },
  ],
}

export const saudiCustomerOrdersAr: Record<string, Order[]> = {
  "cust-001": [
    { id: "ord-001", date: "2025-02-26", item: "علاج الوجه + علاج الشعر", amount: "٣٢٠ ريال", status: "paid" },
    { id: "ord-002", date: "2025-02-20", item: "بيرم الشعر", amount: "٢٥٠ ريال", status: "paid" },
    { id: "ord-003", date: "2025-01-15", item: "صبغ الشعر", amount: "٢٠٠ ريال", status: "refunded" },
  ],
  "cust-007": [
    { id: "ord-020", date: "2025-01-18", item: "قص وغسيل الشعر", amount: "٩٠ ريال", status: "paid" },
    { id: "ord-021", date: "2025-03-05", item: "قص الشعر", amount: "٧٠ ريال", status: "pending" },
  ],
  "cust-008": [
    { id: "ord-022", date: "2024-11-20", item: "قص الشعر", amount: "٨٠ ريال", status: "paid" },
    { id: "ord-023", date: "2025-02-01", item: "صبغ الشعر", amount: "٢٢٠ ريال", status: "paid" },
    { id: "ord-024", date: "2025-03-10", item: "صبغ الشعر (بالياج)", amount: "٣٨٠ ريال", status: "pending" },
  ],
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const saudiCustomerReviewsEn: Record<string, Review[]> = {
  "cust-001": [
    { id: "rev-001", date: "2025-02-21", rating: 4, content: "The perm came out beautifully. The stylist was very skilled.", replied: true },
    { id: "rev-002", date: "2025-02-11", rating: 3, content: "Haircut was satisfying but the wait time was a bit long.", replied: false },
  ],
  "cust-002": [
    { id: "rev-003", date: "2025-02-15", rating: 5, content: "The color treatment turned out amazing!", replied: true },
  ],
  "cust-007": [
    { id: "rev-020", date: "2025-01-19", rating: 5, content: "Great haircut! The stylist was very friendly and did exactly what I asked for.", replied: true },
  ],
  "cust-008": [
    { id: "rev-021", date: "2025-02-02", rating: 4, content: "The color treatment was lovely. Considering booking balayage next time.", replied: true },
    { id: "rev-022", date: "2024-11-21", rating: 3, content: "The haircut was okay but I had to wait longer than expected.", replied: false },
  ],
}

export const saudiCustomerReviewsAr: Record<string, Review[]> = {
  "cust-001": [
    { id: "rev-001", date: "2025-02-21", rating: 4, content: "خرج البيرم بشكل جميل جدًا، المصففة ماهرة جدًا.", replied: true },
  ],
  "cust-002": [
    { id: "rev-003", date: "2025-02-15", rating: 5, content: "الصبغة طلعت رائعة!", replied: true },
  ],
  "cust-007": [
    { id: "rev-020", date: "2025-01-19", rating: 5, content: "قصة شعر رائعة! المصفف كان ودودًا جدًا ونفّذ ما طلبته بالضبط.", replied: true },
  ],
  "cust-008": [
    { id: "rev-021", date: "2025-02-02", rating: 4, content: "الصبغة طلعت جميلة. أفكر في حجز بالياج المرة القادمة.", replied: true },
    { id: "rev-022", date: "2024-11-21", rating: 3, content: "القصة كانت مقبولة لكن الانتظار كان أطول من المتوقع.", replied: false },
  ],
}

// ─── Customers (English) ─────────────────────────────────────────────────────
export const saudiCustomersEn: Record<string, Customer> = {
  "cust-001": {
    id: "cust-001", storeId: "store-001",
    name: "Noura Al-Qahtani", phone: "+966-50-123-4567", email: "noura.alqahtani@gmail.com",
    gender: "Female", company: "Riyadh Wellness Spa",
    grade: "VIP", totalTickets: 14, resolvedTickets: 12, joinedAt: "2023-03-15",
    tags: ["Reservation", "Refund"],
    avatarInitials: "NQ", avatarColor: "oklch(0.62 0.22 255)",
    sentiment: "neutral", ltv: "SAR 4,800",
  },
  "cust-002": {
    id: "cust-002", storeId: "store-001",
    name: "Fahad Al-Dosari", phone: "+966-55-234-5678", email: "fahad.aldosari@gmail.com",
    gender: "Male", company: "Riyadh Wellness Spa",
    grade: "New", totalTickets: 3, resolvedTickets: 2, joinedAt: "2024-01-20",
    tags: ["Color Inquiry"],
    avatarInitials: "FD", avatarColor: "oklch(0.65 0.18 150)",
    sentiment: "positive", ltv: "SAR 1,100",
  },
  "cust-003": {
    id: "cust-003", storeId: "store-001",
    name: "Hessa Al-Mutairi", phone: "+966-56-345-6789", email: "hessa.almutairi@gmail.com",
    gender: "Female", company: "Riyadh Wellness Spa",
    grade: "VIP", totalTickets: 28, resolvedTickets: 25, joinedAt: "2022-08-01",
    tags: ["Refund", "Duplicate Payment"],
    avatarInitials: "HM", avatarColor: "oklch(0.60 0.20 30)",
    sentiment: "negative", ltv: "SAR 12,400",
  },
  "cust-004": {
    id: "cust-004", storeId: "store-001",
    name: "Reem Al-Shehri", phone: "+966-59-456-7890", email: "reem.alshehri@gmail.com",
    gender: "Female", company: "Riyadh Wellness Spa",
    grade: "Regular", totalTickets: 7, resolvedTickets: 6, joinedAt: "2023-11-05",
    tags: ["Booking Inquiry"],
    avatarInitials: "RS", avatarColor: "oklch(0.68 0.16 200)",
    sentiment: "positive", ltv: "SAR 2,200",
  },
  "cust-005": {
    id: "cust-005", storeId: "store-001",
    name: "Khalid Al-Ghamdi", phone: "+966-50-567-8901", email: "khalid.alghamdi@gmail.com",
    gender: "Male", company: "Riyadh Wellness Spa",
    grade: "Regular", totalTickets: 5, resolvedTickets: 4, joinedAt: "2024-03-10",
    tags: ["Cancellation Inquiry"],
    avatarInitials: "KG", avatarColor: "oklch(0.63 0.14 260)",
    sentiment: "neutral", ltv: "SAR 1,600",
  },
  "cust-006": {
    id: "cust-006", storeId: "store-001",
    name: "Maha Al-Zahrani", phone: "+966-54-678-9012", email: "maha.alzahrani@gmail.com",
    gender: "Female", company: "Riyadh Wellness Spa",
    grade: "New", totalTickets: 2, resolvedTickets: 1, joinedAt: "2025-01-10",
    tags: ["App Inquiry"],
    avatarInitials: "MZ", avatarColor: "oklch(0.58 0.15 310)",
    sentiment: "positive", ltv: "SAR 500",
  },
  "cust-101": {
    id: "cust-101", storeId: "store-002",
    name: "Lina Al-Otaibi", phone: "+966-55-111-2233", email: "lina.alotaibi@gmail.com",
    gender: "Female", company: "Jeddah Beauty Lounge",
    grade: "VIP", totalTickets: 11, resolvedTickets: 10, joinedAt: "2023-06-01",
    tags: ["Complaint", "Damage Claim"],
    avatarInitials: "LO", avatarColor: "oklch(0.60 0.20 340)",
    sentiment: "negative", ltv: "SAR 3,800",
  },
  "cust-102": {
    id: "cust-102", storeId: "store-002",
    name: "Omar Al-Harbi", phone: "+966-50-222-3344", email: "omar.alharbi@gmail.com",
    gender: "Male", company: "Jeddah Beauty Lounge",
    grade: "Regular", totalTickets: 4, resolvedTickets: 3, joinedAt: "2024-05-10",
    tags: ["Shampoo Inquiry"],
    avatarInitials: "OH", avatarColor: "oklch(0.65 0.15 180)",
    sentiment: "positive", ltv: "SAR 1,250",
  },
  "cust-103": {
    id: "cust-103", storeId: "store-002",
    name: "Dalal Al-Anazi", phone: "+966-56-333-4455", email: "dalal.alanazi@gmail.com",
    gender: "Female", company: "Jeddah Beauty Lounge",
    grade: "Regular", totalTickets: 6, resolvedTickets: 5, joinedAt: "2023-12-20",
    tags: ["Membership", "Discount"],
    avatarInitials: "DA", avatarColor: "oklch(0.63 0.18 60)",
    sentiment: "neutral", ltv: "SAR 2,000",
  },
  "cust-104": {
    id: "cust-104", storeId: "store-002",
    name: "Turki Al-Rashidi", phone: "+966-59-444-5566", email: "turki.alrashidi@gmail.com",
    gender: "Male", company: "Jeddah Beauty Lounge",
    grade: "New", totalTickets: 2, resolvedTickets: 2, joinedAt: "2025-01-05",
    tags: ["Hours Inquiry"],
    avatarInitials: "TR", avatarColor: "oklch(0.58 0.12 220)",
    sentiment: "positive", ltv: "SAR 580",
  },
  "cust-201": {
    id: "cust-201", storeId: "store-003",
    name: "Abeer Al-Shamri", phone: "+966-54-555-6677", email: "abeer.alshamri@gmail.com",
    gender: "Female", company: "Dammam Style Studio",
    grade: "VIP", totalTickets: 19, resolvedTickets: 17, joinedAt: "2022-11-15",
    tags: ["Refund", "Duplicate Payment"],
    avatarInitials: "AS", avatarColor: "oklch(0.62 0.22 20)",
    sentiment: "negative", ltv: "SAR 9,200",
  },
  "cust-202": {
    id: "cust-202", storeId: "store-003",
    name: "Saleh Al-Bishi", phone: "+966-50-666-7788", email: "saleh.albishi@gmail.com",
    gender: "Male", company: "Dammam Style Studio",
    grade: "New", totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-20",
    tags: ["New Customer"],
    avatarInitials: "SB", avatarColor: "oklch(0.67 0.14 140)",
    sentiment: "positive", ltv: "SAR 200",
  },
  "cust-203": {
    id: "cust-203", storeId: "store-003",
    name: "Wafa Al-Sulami", phone: "+966-55-777-8899", email: "wafa.alsulami@gmail.com",
    gender: "Female", company: "Dammam Style Studio",
    grade: "Regular", totalTickets: 8, resolvedTickets: 7, joinedAt: "2023-09-01",
    tags: ["Perm", "Product Inquiry"],
    avatarInitials: "WS", avatarColor: "oklch(0.65 0.19 280)",
    sentiment: "neutral", ltv: "SAR 2,760",
  },
  "cust-007": {
    id: "cust-007", storeId: "store-001",
    name: "", phone: "+966-50-888-9900", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-27",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.70 0.05 0)",
    sentiment: "neutral",
  },
  "cust-008": {
    id: "cust-008", storeId: "store-001",
    name: "", phone: "+966-56-991-1020", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-27",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.70 0.05 0)",
    sentiment: "neutral",
  },
  "cust-105": {
    id: "cust-105", storeId: "store-002",
    name: "", phone: "+966-54-112-2334", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-27",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.70 0.05 0)",
    sentiment: "neutral",
  },
  "cust-106": {
    id: "cust-106", storeId: "store-002",
    name: "", phone: "+966-59-223-3445", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-27",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.70 0.05 0)",
    sentiment: "neutral",
  },
  "cust-204": {
    id: "cust-204", storeId: "store-003",
    name: "", phone: "+966-50-334-4556", email: "",
    totalTickets: 1, resolvedTickets: 0, joinedAt: "2025-02-27",
    tags: [], avatarInitials: "", avatarColor: "oklch(0.70 0.05 0)",
    sentiment: "neutral",
  },
}

// ─── Customers (Arabic) ──────────────────────────────────────────────────────
export const saudiCustomersAr: Record<string, Customer> = {
  ...Object.fromEntries(
    Object.entries(saudiCustomersEn).map(([k, v]) => [k, { ...v }])
  ),
  "cust-001": { ...saudiCustomersEn["cust-001"], name: "نورة القحطاني", gender: "أنثى", company: "سبا الرياض للعناية", grade: "VIP", tags: ["حجز", "استرداد"], avatarInitials: "نق" },
  "cust-002": { ...saudiCustomersEn["cust-002"], name: "فهد الدوسري", gender: "ذكر", company: "سبا الرياض للعناية", grade: "جديد", tags: ["استفسار صبغ"], avatarInitials: "فد" },
  "cust-003": { ...saudiCustomersEn["cust-003"], name: "حصة المطيري", gender: "أنثى", company: "سبا الرياض للعناية", grade: "VIP", tags: ["استرداد", "دفع مزدوج"], avatarInitials: "حم" },
  "cust-004": { ...saudiCustomersEn["cust-004"], name: "ريم الشهري", gender: "أنثى", company: "سبا الرياض للعناية", grade: "عادي", tags: ["استفسار حجز"], avatarInitials: "رش" },
  "cust-005": { ...saudiCustomersEn["cust-005"], name: "خالد الغامدي", gender: "ذكر", company: "سبا الرياض للعناية", grade: "عادي", tags: ["استفسار إلغاء"], avatarInitials: "خغ" },
  "cust-006": { ...saudiCustomersEn["cust-006"], name: "مها الزهراني", gender: "أنثى", company: "سبا الرياض للعناية", grade: "جديد", tags: ["استفسار تطبيق"], avatarInitials: "مز" },
  "cust-101": { ...saudiCustomersEn["cust-101"], name: "لينا العتيبي", gender: "أنثى", company: "صالون جدة للتجميل", grade: "VIP", tags: ["شكوى", "تعويض"], avatarInitials: "لع" },
  "cust-102": { ...saudiCustomersEn["cust-102"], name: "عمر الحربي", gender: "ذكر", company: "صالون جدة للتجميل", grade: "عادي", tags: ["استفسار شامبو"], avatarInitials: "عح" },
  "cust-103": { ...saudiCustomersEn["cust-103"], name: "دلال العنزي", gender: "أنثى", company: "صالون جدة للتجميل", grade: "عادي", tags: ["عضوية", "خصم"], avatarInitials: "دع" },
  "cust-104": { ...saudiCustomersEn["cust-104"], name: "تركي الرشيدي", gender: "ذكر", company: "صالون جدة للتجميل", grade: "جديد", tags: ["استفسار أوقات"], avatarInitials: "تر" },
  "cust-201": { ...saudiCustomersEn["cust-201"], name: "عبير الشمري", gender: "أنثى", company: "استوديو الدمام للأناقة", grade: "VIP", tags: ["استرداد", "دفع مزدوج"], avatarInitials: "عش" },
  "cust-202": { ...saudiCustomersEn["cust-202"], name: "صالح البيشي", gender: "ذكر", company: "استوديو الدمام للأناقة", grade: "جديد", tags: ["عميل جديد"], avatarInitials: "صب" },
  "cust-203": { ...saudiCustomersEn["cust-203"], name: "وفاء السلمي", gender: "أنثى", company: "استوديو الدمام للأناقة", grade: "عادي", tags: ["بيرم", "استفسار منتج"], avatarInitials: "وس" },
}

// ─── Sessions (English) ───────────────────────────────────────────────────────
export const saudiSessionsEn: Session[] = [
  // store-001 Riyadh
  {
    id: "sess-001", storeId: "store-001", channel: "webchat", status: "active",
    priority: "urgent", subject: "Booking system down since morning",
    category: "Booking / Payment", createdAt: "2025-02-26T09:12:00", updatedAt: "2025-02-26T09:38:00",
    waitTime: "2 min", handleTime: "26 min",
    activeMembers: [
      { id: "agent-01", name: "Sarah Al-Rashidi", status: "online" },
      { id: "agent-03", name: "Layla Al-Harbi", status: "online" },
    ],
    tags: ["Booking Error", "Urgent"],
    source: "Website", browser: "Chrome 121", os: "iOS 17",
    ip: "185.220.xxx.xxx", location: "Riyadh, Saudi Arabia",
    customerId: "cust-001",
    messages: [
      { id: "msg-001", sender: "customer", content: "Hello, the booking system has been down since this morning. Customers keep getting errors.", timestamp: "09:12", type: "text" },
      { id: "msg-002", sender: "bot", content: "Thank you for contacting us! Regarding your booking issue, please wait a moment and we will connect you with a team member.", timestamp: "09:12", type: "text" },
      { id: "msg-003", sender: "agent", agentName: "Sarah Al-Rashidi", content: "Hello Noura, this is Sarah. I apologize for the inconvenience. Could you please send a screenshot of the error message?", timestamp: "09:15", type: "text" },
      { id: "msg-004", sender: "customer", content: "Since 9 AM I keep getting 'Booking Unavailable'. The admin panel also shows no available slots.", timestamp: "09:17", type: "text" },
      { id: "msg-005", sender: "agent", agentName: "Layla Al-Harbi", content: "This is Layla. I checked and there was a temporary error in the booking module after the server update. We are fixing it now and it should be resolved within 10 minutes.", timestamp: "09:22", type: "text" },
      { id: "msg-006", sender: "customer", content: "Today is very busy, please resolve it quickly!", timestamp: "09:25", type: "text" },
      { id: "msg-007", sender: "agent", agentName: "Sarah Al-Rashidi", content: "We apologize. We are processing it as urgent. We will notify you via WhatsApp once resolved.", timestamp: "09:30", type: "text" },
      { id: "msg-008", sender: "customer", content: "Thank you, please hurry.", timestamp: "09:38", type: "text" },
    ],
  },
  {
    id: "sess-002", storeId: "store-001", channel: "call", status: "active",
    priority: "high", subject: "Kiosk receipt not printing",
    category: "Technical Support", createdAt: "2025-02-26T09:05:00", updatedAt: "2025-02-26T09:40:00",
    waitTime: "0 min", handleTime: "35 min",
    activeMembers: [{ id: "agent-01", name: "Sarah Al-Rashidi" }],
    routingQueue: [
      { agent: { id: "agent-01", name: "Sarah Al-Rashidi", status: "busy" }, tried: true, current: true },
      { agent: { id: "agent-03", name: "Layla Al-Harbi", status: "online" }, tried: false, current: false },
      { agent: { id: "agent-04", name: "Ahmed Al-Shamri", status: "offline" }, tried: false, current: false },
    ],
    tags: ["Kiosk", "Technical"],
    source: "Phone", location: "Riyadh, Saudi Arabia",
    softphone: false, customerId: "cust-002",
    messages: [
      { id: "msg-c1", sender: "system", content: "Call connected — 09:05:14", timestamp: "09:05", type: "call-start" },
      { id: "msg-c2", sender: "customer", content: "Hello, payment goes through at the kiosk but no receipt is printed.", timestamp: "09:05", type: "stt", sttSpeaker: "customer" },
      { id: "msg-c3", sender: "agent", agentName: "Sarah Al-Rashidi", content: "Hello, is the receipt not printing at all, or is it printing incorrectly?", timestamp: "09:06", type: "stt", sttSpeaker: "agent" },
      { id: "msg-c4", sender: "customer", content: "Not printing at all. Since yesterday.", timestamp: "09:06", type: "stt", sttSpeaker: "customer" },
      { id: "msg-c5", sender: "agent", agentName: "Sarah Al-Rashidi", content: "Understood. It looks like a printer driver update is needed. I will handle it remotely right now. Please wait a moment.", timestamp: "09:09", type: "stt", sttSpeaker: "agent" },
      { id: "msg-c6", sender: "customer", content: "Thank you.", timestamp: "09:10", type: "stt", sttSpeaker: "customer" },
      { id: "msg-c7", sender: "agent", agentName: "Sarah Al-Rashidi", content: "[Call Note] Kiosk printer not printing receipts. Driver outdated. Remote update in progress.", timestamp: "09:12", type: "note" },
    ],
  },
  {
    id: "sess-003", storeId: "store-001", channel: "whatsapp", status: "ai_agent",
    priority: "urgent", subject: "Duplicate charge refund request",
    category: "Refund / Cancellation", createdAt: "2025-02-26T09:35:00", updatedAt: "2025-02-26T09:42:00",
    waitTime: "7 min", activeMembers: [],
    tags: ["Refund", "Duplicate Payment", "Urgent"],
    source: "Mobile App", os: "iOS 17", location: "Riyadh, Saudi Arabia",
    customerId: "cust-003",
    messages: [
      { id: "msg-w1", sender: "customer", content: "I was charged twice. Please check and refund one payment.", timestamp: "09:35", type: "text" },
      { id: "msg-w2", sender: "bot", content: "I can help with that right away. Could you share the date and amount of the duplicate charge so I can verify?", timestamp: "09:35", type: "text" },
      { id: "msg-w3", sender: "customer", content: "It was today at 9:35 AM, SAR 450 charged twice.", timestamp: "09:38", type: "text" },
      { id: "msg-w4", sender: "bot", content: "Confirmed — I can see two charges of SAR 450 at 09:35. The duplicate has been flagged for reversal. Refunds typically process within 3–5 business days depending on your bank.", timestamp: "09:39", type: "text" },
      { id: "msg-w5", sender: "customer", content: "Can it be done faster?", timestamp: "09:41", type: "text" },
      { id: "msg-w6", sender: "bot", content: "The cancellation is processed on our end immediately. The timeline depends on your card issuer — you can also call them directly to expedite. I've sent you a cancellation confirmation via email.", timestamp: "09:42", type: "text" },
    ],
  },
  {
    id: "sess-004", storeId: "store-001", channel: "webchat", status: "waiting",
    priority: "normal", subject: "How to use the booking block feature",
    category: "How-To", createdAt: "2025-02-26T09:38:00", updatedAt: "2025-02-26T09:41:00",
    waitTime: "3 min", activeMembers: [],
    tags: ["How-To"],
    source: "Website", browser: "Edge 121", os: "Windows 11",
    location: "Riyadh, Saudi Arabia", customerId: "cust-004",
    messages: [
      { id: "msg-n1", sender: "customer", content: "Hello. How do I use the booking block feature? I want to block specific dates.", timestamp: "09:38", type: "text" },
      { id: "msg-n2", sender: "bot", content: "Sure! Go to Admin Panel → Booking Management → Block Dates. Select the date or time slot you want to block and tap 'Add Block'.", timestamp: "09:38", type: "text" },
      { id: "msg-n3", sender: "customer", content: "Can I block every Monday repeatedly?", timestamp: "09:40", type: "text" },
      { id: "msg-n4", sender: "bot", content: "Yes! When adding a block, choose the 'Repeat' option and select 'Every Monday'. You can also set a start and end date if you only want it for a specific period.", timestamp: "09:40", type: "text" },
    ],
  },
  {
    id: "sess-005", storeId: "store-001", channel: "call", status: "waiting",
    priority: "high", subject: "Service cancellation and data deletion request",
    category: "Account / Subscription", createdAt: "2025-02-26T09:40:00", updatedAt: "2025-02-26T09:43:00",
    waitTime: "3 min",
    routingQueue: [
      { agent: { id: "agent-02", name: "Mohammed Al-Otaibi", status: "busy" }, tried: true, current: false },
      { agent: { id: "agent-01", name: "Sarah Al-Rashidi", status: "online" }, tried: false, current: true },
      { agent: { id: "agent-03", name: "Layla Al-Harbi", status: "online" }, tried: false, current: false },
    ],
    tags: ["Cancellation", "Data"],
    source: "Phone", location: "Riyadh, Saudi Arabia", customerId: "cust-005",
    messages: [
      { id: "msg-h1", sender: "system", content: "Incoming call waiting — 09:40:05", timestamp: "09:40", type: "call-start" },
    ],
  },
  {
    id: "sess-006", storeId: "store-001", channel: "webchat", status: "waiting",
    priority: "normal", subject: "Booking via app not working",
    category: "App / Service", createdAt: "2025-02-26T08:50:00", updatedAt: "2025-02-26T08:50:00",
    waitTime: "52 min", activeMembers: [],
    tags: ["App Error", "Booking"],
    source: "Website", location: "Riyadh, Saudi Arabia", customerId: "cust-006",
    messages: [
      { id: "msg-b1", sender: "customer", content: "Hello. I keep getting a 'Registration Failed' error when trying to book a haircut via the app. Device: iPhone 15, iOS 17.3, App version 2.4.1", timestamp: "08:50", type: "text" },
    ],
  },
  {
    id: "sess-007", storeId: "store-001", channel: "webchat", status: "resolved",
    priority: "normal", subject: "Request to update business hours",
    category: "Info Update", createdAt: "2025-02-26T07:30:00", updatedAt: "2025-02-26T08:15:00",
    waitTime: "0 min", handleTime: "45 min",
    activeMembers: [{ id: "agent-03", name: "Layla Al-Harbi", status: "online" }],
    csat: 5, tags: ["Info Update"],
    source: "Website", location: "Riyadh, Saudi Arabia", customerId: "cust-004",
    messages: [
      { id: "msg-r1", sender: "customer", content: "Hello. Our business hours have changed. Please update: Sat-Wed 10:00-20:00, Thu-Fri 10:00-21:00, Fri 14:00-21:00 (after Jumu'ah prayer).", timestamp: "07:30", type: "text" },
      { id: "msg-r2", sender: "agent", agentName: "Layla Al-Harbi", content: "Hello, this is Layla. The business hours have been updated as requested. Please verify in both the app and website.", timestamp: "08:15", type: "text" },
      { id: "msg-r3", sender: "customer", content: "Thank you! Confirmed.", timestamp: "08:18", type: "text" },
    ],
  },
  {
    id: "sess-008", storeId: "store-001", channel: "call", status: "waiting",
    priority: "normal", subject: "Haircut booking inquiry",
    category: "Booking / Payment", createdAt: "2025-02-27T11:05:00", updatedAt: "2025-02-27T11:05:00",
    waitTime: "2 min", activeMembers: [], tags: [],
    source: "Phone", location: "Riyadh, Saudi Arabia", customerId: "cust-007",
    messages: [
      { id: "msg-008-1", sender: "system", content: "Incoming call waiting — 11:05:00", timestamp: "11:05", type: "call-start" },
    ],
  },
  {
    id: "sess-009", storeId: "store-001", channel: "webchat", status: "ai_agent",
    priority: "normal", subject: "Color treatment price inquiry",
    category: "Service Consultation", createdAt: "2025-02-27T11:10:00", updatedAt: "2025-02-27T11:12:00",
    waitTime: "2 min", activeMembers: [], tags: [],
    source: "Website", browser: "Chrome 121", os: "Android 14", location: "Riyadh, Saudi Arabia",
    customerId: "cust-008",
    messages: [
      { id: "msg-009-1", sender: "customer", content: "How much is a color treatment?", timestamp: "11:10", type: "text" },
      { id: "msg-009-2", sender: "bot", content: "Color treatment pricing depends on hair length: short hair starts at SAR 180, medium at SAR 250, and long hair from SAR 320. Bleaching, if needed, is an additional SAR 100–150.", timestamp: "11:10", type: "text" },
      { id: "msg-009-3", sender: "customer", content: "What about bleach + color together?", timestamp: "11:12", type: "text" },
      { id: "msg-009-4", sender: "bot", content: "A bleach + color package typically ranges from SAR 380–480 depending on hair length and condition. We offer a free consultation to give you an exact quote. Would you like to book?", timestamp: "11:12", type: "text" },
    ],
  },
  // store-002 Jeddah
  {
    id: "sess-101", storeId: "store-002", channel: "webchat", status: "active",
    priority: "high", subject: "Hair damage claim after color treatment",
    category: "Complaint", createdAt: "2025-02-26T10:05:00", updatedAt: "2025-02-26T10:30:00",
    waitTime: "1 min", handleTime: "25 min",
    activeMembers: [{ id: "agent-01", name: "Sarah Al-Rashidi", status: "online" }],
    tags: ["Complaint", "Color"],
    source: "Website", browser: "Safari 17", os: "iOS 17", location: "Jeddah, Saudi Arabia",
    customerId: "cust-101",
    messages: [
      { id: "msg-101-1", sender: "customer", content: "My hair became very dry and damaged after the color treatment. I want a corrective treatment.", timestamp: "10:05", type: "text" },
      { id: "msg-101-2", sender: "bot", content: "I'm sorry to hear that — hair damage after a treatment is something we take seriously. Could you share when the treatment was done and which stylist you saw? I'll look into this right away.", timestamp: "10:05", type: "text" },
      { id: "msg-101-3", sender: "agent", agentName: "Sarah Al-Rashidi", content: "Hello. After assessing the condition, we will schedule a corrective treatment appointment for you.", timestamp: "10:08", type: "text" },
      { id: "msg-101-4", sender: "customer", content: "Please resolve this quickly. I have an important event.", timestamp: "10:15", type: "text" },
    ],
  },
  {
    id: "sess-102", storeId: "store-002", channel: "call", status: "waiting",
    priority: "normal", subject: "Shampoo treatment duration inquiry",
    category: "Booking / Payment", createdAt: "2025-02-26T10:20:00", updatedAt: "2025-02-26T10:23:00",
    waitTime: "3 min",
    routingQueue: [
      { agent: { id: "agent-02", name: "Mohammed Al-Otaibi", status: "busy" }, tried: true, current: false },
      { agent: { id: "agent-01", name: "Sarah Al-Rashidi", status: "online" }, tried: false, current: true },
    ],
    tags: ["Shampoo", "Service Inquiry"],
    source: "Phone", location: "Jeddah, Saudi Arabia", customerId: "cust-102",
    messages: [
      { id: "msg-102-1", sender: "system", content: "Incoming call waiting — 10:20:00", timestamp: "10:20", type: "call-start" },
    ],
  },
  {
    id: "sess-103", storeId: "store-002", channel: "whatsapp", status: "ai_agent",
    priority: "normal", subject: "Membership discount not applied",
    category: "Discount / Coupon", createdAt: "2025-02-26T09:50:00", updatedAt: "2025-02-26T10:00:00",
    waitTime: "5 min", activeMembers: [],
    tags: ["Discount", "Membership"],
    source: "Mobile App", os: "Android 14", location: "Jeddah, Saudi Arabia",
    customerId: "cust-103",
    messages: [
      { id: "msg-103-1", sender: "customer", content: "I have a membership but the discount doesn't seem to be applied today.", timestamp: "09:50", type: "text" },
      { id: "msg-103-2", sender: "bot", content: "Membership discounts apply automatically at checkout. Did you receive a booking confirmation email showing the discounted amount?", timestamp: "09:51", type: "text" },
      { id: "msg-103-3", sender: "customer", content: "Even after completing the booking the discount amount is not showing.", timestamp: "09:58", type: "text" },
      { id: "msg-103-4", sender: "bot", content: "I checked your account — your membership has 1 session remaining and it is linked to your booking. The discount may appear as unchecked in the payment screen. Please go back to the payment step and make sure 'Use Membership' is toggled on.", timestamp: "09:59", type: "text" },
    ],
  },
  {
    id: "sess-104", storeId: "store-002", channel: "whatsapp", status: "resolved",
    priority: "low", subject: "Business hours inquiry",
    category: "Info Update", createdAt: "2025-02-26T08:00:00", updatedAt: "2025-02-26T08:30:00",
    waitTime: "0 min", handleTime: "30 min",
    activeMembers: [{ id: "agent-03", name: "Layla Al-Harbi", status: "online" }],
    csat: 5, tags: ["Business Hours"],
    source: "Mobile App", os: "Android 14", location: "Jeddah, Saudi Arabia",
    customerId: "cust-104",
    messages: [
      { id: "msg-104-1", sender: "customer", content: "Are you open on Fridays?", timestamp: "08:00", type: "text" },
      { id: "msg-104-2", sender: "agent", agentName: "Layla Al-Harbi", content: "Yes, on Fridays we are open 14:00-21:00 (after Jumu'ah prayer).", timestamp: "08:10", type: "text" },
      { id: "msg-104-3", sender: "customer", content: "Thank you!", timestamp: "08:12", type: "text" },
    ],
  },
  {
    id: "sess-105", storeId: "store-002", channel: "call", status: "waiting",
    priority: "normal", subject: "Haircut + styling inquiry",
    category: "Service Consultation", createdAt: "2025-02-27T10:55:00", updatedAt: "2025-02-27T10:55:00",
    waitTime: "4 min", activeMembers: [], tags: [],
    source: "Phone", location: "Jeddah, Saudi Arabia", customerId: "cust-105",
    messages: [
      { id: "msg-105-1", sender: "system", content: "Incoming call waiting — 10:55:00", timestamp: "10:55", type: "call-start" },
    ],
  },
  {
    id: "sess-106", storeId: "store-002", channel: "webchat", status: "pending",
    priority: "normal", subject: "Booking cancellation request",
    category: "Refund / Cancellation", createdAt: "2025-02-27T09:40:00", updatedAt: "2025-02-27T09:45:00",
    waitTime: "0 min", handleTime: "5 min", activeMembers: [],
    tags: ["Cancellation"],
    source: "Website", browser: "Safari 17", os: "iOS 17", location: "Jeddah, Saudi Arabia",
    customerId: "cust-106",
    messages: [
      { id: "msg-106-1", sender: "customer", content: "Can I cancel tomorrow's booking?", timestamp: "09:40", type: "text" },
      { id: "msg-106-2", sender: "bot", content: "Yes, you can cancel tomorrow's booking. Per our policy, cancellations more than 24 hours before the appointment are fully refunded. Shall I proceed with the cancellation?", timestamp: "09:40", type: "text" },
      { id: "msg-106-3", sender: "customer", content: "Yes please, go ahead.", timestamp: "09:41", type: "text" },
      { id: "msg-106-4", sender: "bot", content: "Done — your booking has been cancelled and a full refund has been initiated. You'll receive a confirmation email shortly.", timestamp: "09:41", type: "text" },
    ],
  },
  // store-003 Dammam
  {
    id: "sess-201", storeId: "store-003", channel: "webchat", status: "active",
    priority: "urgent", subject: "Double-charged booking refund request",
    category: "Refund / Cancellation", createdAt: "2025-02-26T09:55:00", updatedAt: "2025-02-26T10:20:00",
    waitTime: "0 min", handleTime: "25 min",
    activeMembers: [{ id: "agent-02", name: "Mohammed Al-Otaibi", status: "online" }],
    tags: ["Refund", "Duplicate Payment", "Urgent"],
    source: "Website", browser: "Chrome 121", os: "Windows 11", location: "Dammam, Saudi Arabia",
    customerId: "cust-201",
    messages: [
      { id: "msg-201-1", sender: "customer", content: "I was charged twice for yesterday's haircut + perm booking. Please refund one.", timestamp: "09:55", type: "text" },
      { id: "msg-201-2", sender: "bot", content: "Checking your payment record.", timestamp: "09:55", type: "text" },
      { id: "msg-201-3", sender: "agent", agentName: "Mohammed Al-Otaibi", content: "Confirmed. There is a duplicate charge. Processing the refund immediately.", timestamp: "10:02", type: "text" },
    ],
  },
  {
    id: "sess-202", storeId: "store-003", channel: "call", status: "ai_agent",
    priority: "normal", subject: "New customer service consultation",
    category: "Service Consultation", createdAt: "2025-02-26T10:10:00", updatedAt: "2025-02-26T10:15:00",
    waitTime: "5 min", activeMembers: [],
    tags: ["New Customer", "Service Consultation"],
    source: "Phone", location: "Dammam, Saudi Arabia", customerId: "cust-202",
    messages: [
      { id: "msg-202-1", sender: "system", content: "Incoming call waiting — 10:10:00", timestamp: "10:10", type: "call-start" },
      { id: "msg-202-2", sender: "customer", content: "I'm a new customer and I'd like to hear about the different services available.", timestamp: "10:12", type: "stt", sttSpeaker: "customer" },
      { id: "msg-202-3", sender: "bot", content: "Welcome! Our most popular services are: Haircut from SAR 80, Perm from SAR 250, and Color Treatment from SAR 180. Are you interested in any specific treatment?", timestamp: "10:13", type: "text" },
      { id: "msg-202-4", sender: "customer", content: "How much for a perm and color together?", timestamp: "10:14", type: "stt", sttSpeaker: "customer" },
      { id: "msg-202-5", sender: "bot", content: "A perm + color package starts at SAR 380. First-time customers also receive a 10% welcome discount! Would you like to book a consultation visit?", timestamp: "10:15", type: "text" },
    ],
  },
  {
    id: "sess-203", storeId: "store-003", channel: "whatsapp", status: "waiting",
    priority: "normal", subject: "Recommended products after perm",
    category: "Product Inquiry", createdAt: "2025-02-26T09:30:00", updatedAt: "2025-02-26T09:35:00",
    waitTime: "8 min", activeMembers: [],
    tags: ["Perm", "Product"],
    source: "Mobile App", location: "Dammam, Saudi Arabia", customerId: "cust-203",
    messages: [
      { id: "msg-203-1", sender: "customer", content: "Can you recommend good hair products to use after a perm?", timestamp: "09:30", type: "text" },
      { id: "msg-203-2", sender: "bot", content: "After a perm, moisture and heat protection are key. Our stylist recommends a keratin leave-in conditioner and a silicone-free perm-specific serum. Both are available in-store with a 10% discount.", timestamp: "09:31", type: "text" },
      { id: "msg-203-3", sender: "customer", content: "Can I order them online?", timestamp: "09:33", type: "text" },
      { id: "msg-203-4", sender: "bot", content: "Yes! Visit our online store at store.example.com and use code PERM10 for the same discount.", timestamp: "09:34", type: "text" },
    ],
  },
  {
    id: "sess-204", storeId: "store-003", channel: "webchat", status: "active",
    priority: "normal", subject: "Blow-dry companion request",
    category: "Service Consultation", createdAt: "2025-02-27T11:00:00", updatedAt: "2025-02-27T11:08:00",
    waitTime: "0 min", handleTime: "8 min",
    activeMembers: [{ id: "agent-02", name: "Mohammed Al-Otaibi", status: "online" }],
    tags: [],
    source: "Website", browser: "Chrome 121", os: "Windows 11", location: "Dammam, Saudi Arabia",
    customerId: "cust-204",
    messages: [
      { id: "msg-204-1", sender: "customer", content: "Can someone assist me with blow-drying?", timestamp: "11:00", type: "text" },
      { id: "msg-204-2", sender: "agent", agentName: "Mohammed Al-Otaibi", content: "Yes, we offer a blow-dry assistance service. Would you like to book?", timestamp: "11:03", type: "text" },
    ],
  },
  // ── Board sessions ────────────────────────────────────────────────────────
  {
    id: "sess-b01", storeId: "store-001", channel: "board", status: "waiting",
    priority: "normal", subject: "App booking keeps failing",
    category: "App / Service", createdAt: "2025-02-26T08:50:00", updatedAt: "2025-02-26T08:50:00",
    waitTime: "52 min", activeMembers: [],
    tags: ["App Error", "Booking"],
    source: "Board", location: "Riyadh, Saudi Arabia", customerId: "cust-006",
    messages: [
      { id: "msg-b01-1", sender: "customer", content: "Hello. I keep getting a 'Registration failed' error when I try to book a haircut on the app. Device: iPhone 15, iOS 17.3, App version 2.4.1.", timestamp: "08:50", type: "text" },
    ],
  },
  {
    id: "sess-b02", storeId: "store-001", channel: "board", status: "ai_agent",
    priority: "normal", subject: "How do I change my membership plan?",
    category: "Membership", createdAt: "2025-02-26T09:10:00", updatedAt: "2025-02-26T09:20:00",
    waitTime: "0 min", handleTime: "10 min", activeMembers: [],
    tags: ["Membership", "Plan Change"],
    source: "Board", location: "Jeddah, Saudi Arabia", customerId: "cust-003",
    messages: [
      { id: "msg-b02-1", sender: "customer", content: "Hi, I want to upgrade my membership from Silver to Gold. How do I do that?", timestamp: "09:10", type: "text" },
      { id: "msg-b02-2", sender: "bot", content: "Great choice! You can upgrade your plan from My Account → Membership → Change Plan. Select Gold and proceed to payment. The upgrade takes effect immediately.", timestamp: "09:11", type: "text" },
      { id: "msg-b02-3", sender: "customer", content: "Does upgrading mid-month carry over my remaining days?", timestamp: "09:15", type: "text" },
      { id: "msg-b02-4", sender: "bot", content: "Yes — any remaining days on your current plan are prorated and added to your new Gold membership cycle.", timestamp: "09:16", type: "text" },
    ],
  },
  {
    id: "sess-b03", storeId: "store-001", channel: "board", status: "active",
    priority: "high", subject: "Charged after cancellation",
    category: "Billing", createdAt: "2025-02-26T10:00:00", updatedAt: "2025-02-26T10:30:00",
    waitTime: "1 min", handleTime: "30 min",
    activeMembers: [{ id: "agent-01", name: "Sarah Al-Rashidi", status: "online" }],
    tags: ["Billing", "Cancellation"],
    source: "Board", location: "Riyadh, Saudi Arabia", customerId: "cust-004",
    messages: [
      { id: "msg-b03-1", sender: "customer", content: "I cancelled my appointment 3 days ago but I was still charged today. This is unacceptable.", timestamp: "10:00", type: "text" },
      { id: "msg-b03-2", sender: "bot", content: "I'm sorry to hear that. I can see a cancellation request on file from 3 days ago. This charge appears to be an error. I'll escalate this immediately to ensure a full refund is processed.", timestamp: "10:01", type: "text" },
      { id: "msg-b03-3", sender: "agent", agentName: "Sarah Al-Rashidi", content: "Hello, I'm Sarah. I've reviewed your case — this was indeed an error on our end. A full refund of SAR 320 has been issued. You'll receive it within 3 business days.", timestamp: "10:28", type: "text" },
      { id: "msg-b03-4", sender: "customer", content: "Thank you Sarah. I appreciate you sorting it out quickly.", timestamp: "10:30", type: "text" },
    ],
  },
  {
    id: "sess-b04", storeId: "store-001", channel: "board", status: "resolved",
    priority: "low", subject: "Operating hours on public holidays",
    category: "General Inquiry", createdAt: "2025-02-25T14:00:00", updatedAt: "2025-02-25T14:10:00",
    waitTime: "0 min", handleTime: "10 min", activeMembers: [], csat: 5,
    tags: ["Hours"],
    source: "Board", location: "Dammam, Saudi Arabia", customerId: "cust-005",
    messages: [
      { id: "msg-b04-1", sender: "customer", content: "Are you open on National Day?", timestamp: "14:00", type: "text" },
      { id: "msg-b04-2", sender: "bot", content: "Yes! We are open on National Day from 12:00 PM to 9:00 PM with a special holiday schedule. Book early as slots fill up fast.", timestamp: "14:01", type: "text" },
      { id: "msg-b04-3", sender: "customer", content: "Perfect, thank you!", timestamp: "14:05", type: "text" },
    ],
  },
  // ── Email sessions ────────────────────────────────────────────────────────
  {
    id: "sess-em01", storeId: "store-001", channel: "email", status: "waiting",
    priority: "high", subject: "Refund still not processed after 2 weeks",
    category: "Refund / Billing", createdAt: "2025-02-26T09:00:00", updatedAt: "2025-02-26T09:00:00",
    waitTime: "1 hr", activeMembers: [],
    tags: ["Refund", "Delayed"],
    source: "Email", customerId: "cust-001",
    messages: [
      { id: "msg-em01-1", sender: "customer", content: "Hello, I submitted a refund request on February 12th and it still hasn't been processed. Could you please look into this?", timestamp: "09:00", type: "text" },
      { id: "msg-em01-2", sender: "bot", content: "Hello! I've located your refund request from Feb 12th. I can see it was delayed due to a processing error on our end — not your bank. I'm manually triggering the refund now. You'll receive a confirmation by end of day.", timestamp: "09:01", type: "text" },
      { id: "msg-em01-3", sender: "customer", content: "Two weeks is a very long time. I hope this doesn't happen again.", timestamp: "09:05", type: "text" },
      { id: "msg-em01-4", sender: "bot", content: "You're absolutely right, and I sincerely apologize for the delay. As a goodwill gesture, I've also applied a SAR 50 credit to your account. The refund itself will reflect within 1–2 business days.", timestamp: "09:06", type: "text" },
    ],
  },
  {
    id: "sess-em02", storeId: "store-001", channel: "email", status: "active",
    priority: "normal", subject: "Membership renewal inquiry",
    category: "Membership", createdAt: "2025-02-26T10:30:00", updatedAt: "2025-02-26T10:45:00",
    waitTime: "0 min", handleTime: "15 min",
    activeMembers: [{ id: "agent-01", name: "Sarah Al-Rashidi", status: "online" }],
    tags: ["Membership", "Renewal"],
    source: "Email", customerId: "cust-002",
    messages: [
      { id: "msg-em02-1", sender: "customer", content: "Hi, my membership expires at the end of this month. Does it auto-renew? And how do I update my payment method?", timestamp: "10:30", type: "text" },
      { id: "msg-em02-2", sender: "bot", content: "Hi! Yes, your membership auto-renews 3 days before expiry — you'll receive an SMS reminder. To update your payment method, go to My Account → Payment Methods.", timestamp: "10:31", type: "text" },
      { id: "msg-em02-3", sender: "customer", content: "What if I want to cancel the renewal?", timestamp: "10:35", type: "text" },
      { id: "msg-em02-4", sender: "agent", agentName: "Sarah Al-Rashidi", content: "You can cancel auto-renewal anytime before the renewal date from My Account → Membership → Cancel Renewal. Your access continues until the end of the current billing period.", timestamp: "10:45", type: "text" },
    ],
  },
  {
    id: "sess-em03", storeId: "store-001", channel: "email", status: "ai_agent",
    priority: "normal", subject: "Appointment rescheduling request",
    category: "Booking", createdAt: "2025-02-26T11:20:00", updatedAt: "2025-02-26T11:25:00",
    waitTime: "0 min", handleTime: "5 min", activeMembers: [],
    tags: ["Reschedule"],
    source: "Email", customerId: "cust-003",
    messages: [
      { id: "msg-em03-1", sender: "customer", content: "Hi, I have a booking for the day after tomorrow at 2:00 PM. Is it possible to move it to 4:00 PM?", timestamp: "11:20", type: "text" },
      { id: "msg-em03-2", sender: "bot", content: "Hi! I checked the schedule — the 4:00 PM slot on that day is available. Shall I move your appointment from 2:00 PM to 4:00 PM?", timestamp: "11:22", type: "text" },
      { id: "msg-em03-3", sender: "customer", content: "Yes please, go ahead.", timestamp: "11:24", type: "text" },
      { id: "msg-em03-4", sender: "bot", content: "Done! Your appointment has been rescheduled to 4:00 PM. A confirmation email has been sent to you.", timestamp: "11:25", type: "text" },
    ],
  },
  {
    id: "sess-em04", storeId: "store-001", channel: "email", status: "resolved",
    priority: "low", subject: "Weekend operating hours",
    category: "General Inquiry", createdAt: "2025-02-25T14:00:00", updatedAt: "2025-02-25T14:10:00",
    waitTime: "0 min", handleTime: "10 min", activeMembers: [], csat: 5,
    tags: ["Hours"],
    source: "Email", customerId: "cust-004",
    messages: [
      { id: "msg-em04-1", sender: "customer", content: "What are your weekend opening hours?", timestamp: "14:00", type: "text" },
      { id: "msg-em04-2", sender: "bot", content: "Our weekend hours are Saturday 10:00 AM – 9:00 PM and Friday 2:00 PM – 9:00 PM (after Friday prayers). We are closed on some public holidays — we post updates on our social media.", timestamp: "14:01", type: "text" },
      { id: "msg-em04-3", sender: "customer", content: "Great, thanks!", timestamp: "14:05", type: "text" },
    ],
  },
]

// ─── Sessions (Arabic) ────────────────────────────────────────────────────────
export const saudiSessionsAr: Session[] = saudiSessionsEn.map((s) => {
  const agentMap: Record<string, string> = {
    "Sarah Al-Rashidi": "سارة الرشيدي",
    "Layla Al-Harbi": "ليلى الحربي",
    "Mohammed Al-Otaibi": "محمد العتيبي",
    "Ahmed Al-Shamri": "أحمد الشمري",
  }
  const subjectMap: Record<string, string> = {
    "sess-001": "نظام الحجز متوقف منذ الصباح",
    "sess-002": "الكشك لا يطبع الإيصالات",
    "sess-003": "طلب استرداد بسبب خصم مزدوج",
    "sess-004": "كيفية استخدام ميزة حظر الحجز",
    "sess-005": "طلب إلغاء الخدمة وحذف البيانات",
    "sess-006": "الحجز عبر التطبيق لا يعمل",
    "sess-007": "طلب تحديث ساعات العمل",
    "sess-008": "استفسار حجز قص الشعر",
    "sess-009": "استفسار عن سعر الصبغ",
    "sess-101": "شكوى تلف الشعر بعد الصبغ",
    "sess-102": "استفسار عن مدة علاج الشامبو",
    "sess-103": "خصم العضوية غير مطبق",
    "sess-104": "استفسار ساعات العمل",
    "sess-105": "استفسار قص + تصفيف",
    "sess-106": "طلب إلغاء الحجز",
    "sess-201": "طلب استرداد حجز مزدوج",
    "sess-202": "استشارة خدمة لعميل جديد",
    "sess-203": "المنتجات الموصى بها بعد البيرم",
    "sess-204": "طلب مرافقة تجفيف الشعر",
    "sess-b01": "فشل حجز التطبيق باستمرار",
    "sess-b02": "كيفية تغيير خطة العضوية",
    "sess-b03": "تم الخصم بعد الإلغاء",
    "sess-b04": "ساعات العمل في الأعياد الرسمية",
    "sess-em01": "لم يُعالَج الاسترداد بعد أسبوعين",
    "sess-em02": "استفسار تجديد العضوية",
    "sess-em03": "طلب إعادة جدولة الموعد",
    "sess-em04": "ساعات العمل في عطلة نهاية الأسبوع",
  }
  const locationMap: Record<string, string> = {
    "Riyadh, Saudi Arabia": "الرياض، المملكة العربية السعودية",
    "Jeddah, Saudi Arabia": "جدة، المملكة العربية السعودية",
    "Dammam, Saudi Arabia": "الدمام، المملكة العربية السعودية",
  }
  // Arabic translations for every message content string
  const contentMap: Record<string, string> = {
    // sess-001
    "msg-001": "مرحباً، نظام الحجز متوقف منذ الصباح. العملاء يتلقون أخطاء باستمرار.",
    "msg-002": "شكراً لتواصلك معنا! بخصوص مشكلة الحجز، يرجى الانتظار قليلاً وسنقوم بتوصيلك بأحد أفراد الفريق.",
    "msg-003": "مرحباً نورة، أنا سارة. أعتذر عن الإزعاج. هل يمكنك إرسال لقطة شاشة لرسالة الخطأ؟",
    "msg-004": "منذ الساعة 9 صباحاً وأنا أحصل على رسالة 'الحجز غير متاح'. لوحة الإدارة أيضاً لا تُظهر أي مواعيد متاحة.",
    "msg-005": "أنا ليلى. لقد تحققت وكان هناك خطأ مؤقت في وحدة الحجز بعد تحديث الخادم. نقوم بإصلاحه الآن وسيُحل خلال 10 دقائق.",
    "msg-006": "اليوم مزدحم جداً، يرجى الإسراع في الحل!",
    "msg-007": "نعتذر. نعالجه على وجه الاستعجال. سنُعلمك عبر واتساب فور الحل.",
    "msg-008": "شكراً، يرجى الإسراع.",
    // sess-002
    "msg-c1": "تم الاتصال — 09:05:14",
    "msg-c2": "مرحباً، عملية الدفع تتم في الكشك لكن لا تتم طباعة الإيصال.",
    "msg-c3": "مرحباً، هل الإيصال لا يُطبع إطلاقاً أم يُطبع بشكل غير صحيح؟",
    "msg-c4": "لا يُطبع إطلاقاً. منذ أمس.",
    "msg-c5": "مفهوم. يبدو أن الأمر يتعلق بتحديث مطلوب لمشغّل الطابعة. سأتولى ذلك عن بُعد الآن. يرجى الانتظار لحظة.",
    "msg-c6": "شكراً.",
    "msg-c7": "[ملاحظة مكالمة] الكشك لا يطبع الإيصالات. المشغّل قديم. جارٍ التحديث عن بُعد.",
    // sess-003
    "msg-w1": "تم خصم المبلغ مرتين. يرجى التحقق واسترداد أحد المبالغ.",
    "msg-w2": "يسعدني مساعدتك فوراً. هل يمكنك تزويدي بتاريخ ومبلغ الخصم المكرر للتحقق؟",
    "msg-w3": "كان اليوم الساعة 9:35 صباحاً، خُصم مبلغ 450 ريال مرتين.",
    "msg-w4": "تأكدت — يظهر لديّ خصمان بقيمة 450 ريال عند الساعة 09:35. تم إلغاء المبلغ المكرر. عادةً تستغرق المعالجة 3-5 أيام عمل.",
    "msg-w5": "هل يمكن أن يكون أسرع؟",
    "msg-w6": "تمت معالجة الإلغاء من طرفنا فوراً. المدة المتبقية تعتمد على البنك الخاص بك. يمكنك التواصل معه مباشرة لتسريع العملية. أرسلنا لك تأكيد الإلغاء عبر البريد الإلكتروني.",
    // sess-004
    "msg-n1": "مرحباً. كيف أستخدم ميزة حظر الحجز؟ أريد حظر تواريخ معينة.",
    "msg-n2": "بالتأكيد! اذهب إلى لوحة الإدارة ← إدارة الحجوزات ← حظر التواريخ. اختر التاريخ أو الوقت المطلوب ثم اضغط 'إضافة حظر'.",
    "msg-n3": "هل يمكن حظر كل يوم اثنين بشكل متكرر؟",
    "msg-n4": "نعم! عند إضافة الحظر، اختر خيار 'تكرار' وحدد 'كل يوم اثنين'. يمكنك أيضاً تحديد تاريخ بداية ونهاية إذا أردت تطبيقه لفترة معينة فقط.",
    // sess-005
    "msg-h1": "مكالمة واردة قيد الانتظار — 09:40:05",
    // sess-006
    "msg-b1": "مرحباً. أتلقى خطأ 'فشل التسجيل' عند محاولة حجز قص شعر عبر التطبيق. الجهاز: iPhone 15، iOS 17.3، إصدار التطبيق 2.4.1",
    // sess-007
    "msg-r1": "مرحباً. تغيّرت أوقات عملنا. يرجى التحديث: السبت-الأربعاء 10:00-20:00، الخميس-الجمعة 10:00-21:00، الجمعة 14:00-21:00 (بعد صلاة الجمعة).",
    "msg-r2": "مرحباً، أنا ليلى. تم تحديث أوقات العمل وفقاً للطلب. يرجى التحقق من التطبيق والموقع الإلكتروني.",
    "msg-r3": "شكراً! تم التأكيد.",
    // sess-008
    "msg-008-1": "مكالمة واردة قيد الانتظار — 11:05:00",
    // sess-009
    "msg-009-1": "كم سعر علاج الصبغ؟",
    "msg-009-2": "يعتمد سعر الصبغ على طول الشعر: الشعر القصير يبدأ من 180 ريال، والمتوسط 250 ريال، والطويل من 320 ريال. التبييض إذا لزم يضاف 100-150 ريال.",
    "msg-009-3": "ماذا عن التبييض مع الصبغ معاً؟",
    "msg-009-4": "باقة التبييض والصبغ تبدأ من 380-480 ريال حسب طول الشعر وحالته. نقدم استشارة مجانية لتحديد السعر ال��قيق. هل تودّ الحجز؟",
    // sess-101
    "msg-101-1": "شعري أصبح جافاً وتالفاً جداً بعد علاج الصبغ. أريد علاجاً تصحيحياً.",
    "msg-101-2": "أعتذر بصدق — تلف الشعر بعد العلاج أمر نأخذه بجدية. هل يمكنك إخباري بتاريخ الجلسة واسم المصفف؟ سأتحقق من الأمر فوراً.",
    "msg-101-3": "مرحباً. بعد ��قييم الحالة، سنحدد لك موعداً للعلاج التصحيحي.",
    "msg-101-4": "يرجى الإسراع في الحل. لديّ مناسبة مهمة.",
    // sess-102
    "msg-102-1": "مكالمة واردة قيد الانتظار — 10:20:00",
    // sess-103
    "msg-103-1": "لديّ عضوية لكن يبدو أن الخصم لم يُطبَّق اليوم.",
    "msg-103-2": "تُطبَّق خصومات العضوية تلقائياً عند الدفع. هل وصلتك رسالة تأكيد الحجز تُظهر المبلغ بعد الخصم؟",
    "msg-103-3": "حتى بعد إتمام الحجز لا يظهر مبلغ الخصم.",
    "msg-103-4": "تحققت من حسابك — رصيد العضوية 1 جلسة وهي مرتبطة بحجزك. ربما يكون خيار 'استخدام العضوية' غير مفعّل في شاشة الدفع. يرجى الرجوع وتفعيل هذا الخيار.",
    // sess-104
    "msg-104-1": "هل أنتم مفتوحون يوم الجمعة؟",
    "msg-104-2": "نعم، يوم الجمعة نعمل من 14:00 إلى 21:00 (بعد صلاة الجمعة).",
    "msg-104-3": "شكراً!",
    // sess-105
    "msg-105-1": "مكالمة واردة قيد الانتظار — 10:55:00",
    // sess-106
    "msg-106-1": "هل يمكنني إلغاء الحجز لغداً؟",
    "msg-106-2": "نعم، يمكنك الإلغاء. وفقاً لسياستنا، الإلغاء قبل 24 ساعة من الموعد يُسترد بالكامل. هل أتابع الإلغاء؟",
    "msg-106-3": "نعم، تفضل.",
    "msg-106-4": "تم — تم إلغاء حجزك ومعالجة استرداد المبلغ كاملاً. ستصلك رسالة تأكيد قريباً.",
    // sess-201
    "msg-201-1": "تم خصم مبلغ مضاعف لحجز قص الشعر والبيرم أمس. يرجى استرداد أحد المبالغ.",
    "msg-201-2": "تحققت — يظهر خصمان بنفس المبلغ لحجز أمس. تم تحديد المبلغ المكرر للإلغاء فوراً.",
    "msg-201-3": "تم التأكيد. يوجد خصم مزدوج. جارٍ معالجة الاسترداد فوراً.",
    // sess-202
    "msg-202-1": "مكالمة واردة قيد الانتظار — 10:10:00",
    "msg-202-2": "أنا عميل جديد وأودّ الاستفسار عن الخدمات المتاحة.",
    "msg-202-3": "أهلاً بك! خدماتنا الأكثر طلباً: قص الشعر من 80 ريال، البيرم من 250 ريال، والصبغ من 180 ريال. ما الخدمة التي تهمّك؟",
    "msg-202-4": "كم يكلف البيرم والصبغ معاً؟",
    "msg-202-5": "باقة البيرم والصبغ تبدأ من 380 ريال. كعميل جديد، تحصل على خصم ترحيبي 10%! هل تودّ حجز زيارة استشارية؟",
    // sess-203
    "msg-203-1": "هل يمكنكم التوصية بمنتجات جيدة لاستخدامها بعد البيرم؟",
    "msg-203-2": "بعد البيرم، الترطيب وحماية الشعر من الحرارة أمران أساسيان. نوصي بكريم مرطب بالكيراتين وسيروم مخصص للبيرم خالٍ من السيليكون. كلاهما متوفر في المتجر بخصم 10%.",
    "msg-203-3": "هل يمكن الطلب أونلاين؟",
    "msg-203-4": "نعم! زُر متجرنا الإلكتروني store.example.com واستخدم كود PERM10 للحصول على نفس الخصم.",
    // sess-204
    "msg-204-1": "هل يمكن أن يساعدني أحد في تجفيف الشعر؟",
    "msg-204-2": "نعم، نوفر خدمة مساعدة التجفيف. هل تودّ الحجز؟",
    // sess-b01
    "msg-b01-1": "مرحباً. أتلقى خطأ 'فشل التسجيل' باستمرار عند محاولة حجز قصة شعر عبر التطبيق. الجهاز: iPhone 15، iOS 17.3، إصدار التطبيق 2.4.1.",
    // sess-b02
    "msg-b02-1": "مرحباً، أريد ترقية عضويتي من الفضية إلى الذهبية. كيف أفعل ذلك؟",
    "msg-b02-2": "خيار رائع! يمكنك الترقية من حسابي ← العضوية ← تغيير الخطة. اختر الذهبية وأتمّ الدفع. تدخل الترقية حيز التنفيذ فوراً.",
    "msg-b02-3": "هل الترقية ��ي منتصف الشهر تحتسب الأيام المتبقية؟",
    "msg-b02-4": "نعم — يتم احتساب الأيام المتبقية من خطتك الحالية ونقلها إلى دورة العضوية الذهبية الجديدة.",
    // sess-b03
    "msg-b03-1": "أجريت إلغاءً قبل 3 أيام لكن جرى خصم مبلغ اليوم. هذا غير مقبول.",
    "msg-b03-2": "أعتذر بشدة. يظهر لديّ طلب الإلغاء منذ 3 أيام. يبدو أن هذا الخصم خطأ من طرفنا. سأقوم برفع الأمر فوراً لضمان الاسترداد الكامل.",
    "msg-b03-3": "مرحباً، أنا سارة. راجعت حالتك — الخطأ كان من طرفنا. تم إصدار استرداد كامل بمبلغ 320 ريال. ستستلمه خلال 3 أيام عمل.",
    "msg-b03-4": "شكراً سارة. أقدّر تعاملك السريع مع الموضوع.",
    // sess-b04
    "msg-b04-1": "هل أنتم مفتوحون في اليوم الوطني؟",
    "msg-b04-2": "نعم! نعمل في اليوم الوطني من 12:00 ظهراً حتى 9:00 مساءً بجدول عطلة خاص. احجز مبكراً إذ تمتلئ المواعيد بسرعة.",
    "msg-b04-3": "ممتاز، شكراً!",
    // sess-em01
    "msg-em01-1": "مرحباً، قدّمت طلب استرداد في 12 فبراير ولم تتم معالجته حتى الآن. هل يمكنكم المتابعة؟",
    "msg-em01-2": "مرحباً! وجدت طلب الاسترداد بتاريخ 12 فبراير. يظهر أن التأخير ناتج عن خطأ في المعالجة من طرفنا وليس البنك. أجري الاسترداد يدوياً الآن وستصلك رسالة تأكيد اليوم.",
    "msg-em01-3": "أسبوعان وقت طويل جداً. أتمنى ألا يتكرر هذا.",
    "msg-em01-4": "أنت محق تماماً، وأعتذر بصدق على التأخير. كإيماءة حسن نية، أضفت رصيداً بقيمة 50 ريال لحسابك. سيُعكس الاسترداد خلال 1-2 يوم عمل.",
    // sess-em02
    "msg-em02-1": "مرحباً، ستنتهي عضويتي نهاية هذا الشهر. هل تتجدد تلقائياً؟ وكيف أحدّث طريقة الدفع؟",
    "msg-em02-2": "مرحباً! نعم، تتجدد العضوية تلقائياً قبل 3 أيام من الانتهاء وسيصلك تذكير بالرسائل القصيرة. لتحديث طريقة الدفع اذهب إلى حسابي ← طرق الدفع.",
    "msg-em02-3": "ماذا لو أردت إلغاء التجديد؟",
    "msg-em02-4": "يمكنك إلغاء التجديد التلقائي في أي وقت قبل موعده من حسابي ← العضوية ← إلغاء التجديد. يستمر وصولك حتى نهاية فترة الاشتراك الحالية.",
    // sess-em03
    "msg-em03-1": "مرحباً، لديّ حجز بعد غد الساعة 2:00 مساءً. هل يمكن تحويله للساعة 4:00 مساءً؟",
    "msg-em03-2": "مرحباً! تحققت من الجدول — موعد الساعة 4:00 مساءً في ذلك اليوم متاح. هل أحوّل موعدك من 2:00 إلى 4:00 مساءً؟",
    "msg-em03-3": "نعم من فضلك، تفضل.",
    "msg-em03-4": "تم! حُوّل موعدك إلى الساعة 4:00 مساءً وأُرسل لك بريد إلكتروني تأكيد.",
    // sess-em04
    "msg-em04-1": "ما هي أوقات عملكم في عطلة نهاية الأسبوع؟",
    "msg-em04-2": "أوقات عمل نهاية الأسبوع: السبت 10:00 صباحاً - 9:00 مساءً، الجمعة 2:00 مساءً - 9:00 مساءً (بعد صلاة الجمعة). نُغلق في بعض الأعياد الرسمية ونُعلن عبر صفحاتنا.",
    "msg-em04-3": "ممتاز، شكراً!",
  }

  return {
    ...s,
    subject: subjectMap[s.id] ?? s.subject,
    location: s.location ? locationMap[s.location] ?? s.location : s.location,
    activeMembers: s.activeMembers?.map((a) => ({ ...a, name: agentMap[a.name] ?? a.name })),
    routingQueue: s.routingQueue?.map((r) => ({ ...r, agent: { ...r.agent, name: agentMap[r.agent.name] ?? r.agent.name } })),
    messages: s.messages.map((m) => ({
      ...m,
      content: contentMap[m.id] ?? m.content,
      agentName: m.agentName ? agentMap[m.agentName] ?? m.agentName : m.agentName,
    })),
  }
})
