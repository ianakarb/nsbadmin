// ── Per-store mock data ────────────────────────────────────────────────────
// Single source of truth for KB, auto-response agents, and marketing campaigns
// broken down by storeId so each page can filter to the active store.

import type { KBItem, KBCollection } from "./kb-store"

// ─────────────────────────────────────────────────────────────────────────────
// Knowledge Base
// ─────────────────────────────────────────────────────────────────────────────

export const KB_COLLECTIONS_BY_STORE: Record<string, KBCollection[]> = {
  "store-001": [
    { id: "col-1-1", name: "상품 · 서비스 안내",  itemCount: 5, expanded: true  },
    { id: "col-1-2", name: "환불 · 취소 정책",    itemCount: 3, expanded: false },
    { id: "col-1-3", name: "예약 · 운영 정보",    itemCount: 3, expanded: false },
  ],
  "store-002": [
    { id: "col-2-1", name: "시술 메뉴 안내",      itemCount: 4, expanded: true  },
    { id: "col-2-2", name: "클레임 · 보상 정책",  itemCount: 3, expanded: false },
    { id: "col-2-3", name: "매장 운영 정보",      itemCount: 2, expanded: false },
  ],
  "store-003": [
    { id: "col-3-1", name: "시술 상담 안내",      itemCount: 4, expanded: true  },
    { id: "col-3-2", name: "환불 · 취소 정책",    itemCount: 2, expanded: false },
    { id: "col-3-3", name: "멤버십 · 제휴 혜택",  itemCount: 3, expanded: false },
  ],
}

export const KB_ITEMS_BY_STORE: Record<string, KBItem[]> = {
  "store-001": [
    { id: "kb-1-1",  title: "서비스 메뉴 및 가격표",     sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-1-1", content: "헤어 커트 30,000원\n파마 80,000원~\n염색 60,000원~\n트리트먼트 40,000원\n\n* 모든 서비스는 예약 필수", citedCount: 142, failRate: 2 },
    { id: "kb-1-2",  title: "브랜드 소개 및 철학",        sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-1-1", content: "2015년 강남에서 시작, 10년간 고객 만족 최우선. 모든 스타일리스트 5년 이상 경력.", citedCount: 38, failRate: 8 },
    { id: "kb-1-3",  title: "공식 홈페이지 크롤링",       sourceType: "url",  updatedAt: "2025-05-26", status: "learning", channel: "both", collectionId: "col-1-1", content: "https://gangnam-hairshop.com 크롤링 중...", citedCount: 0, failRate: 0 },
    { id: "kb-1-4",  title: "자주 묻는 질문 (FAQ)",      sourceType: "text", updatedAt: "2025-05-25", status: "conflict", channel: "both", collectionId: "col-1-1", content: "Q. 주차 가능한가요?\nA. 지하 2층 주차장 (2시간 무료)\n\nQ. 예약 없이 방문 가능한가요?\nA. 당일 예약은 전화로 문의.", citedCount: 89, failRate: 15, conflictWith: "kb-1-1" },
    { id: "kb-1-5",  title: "봄 프로모션 안내",          sourceType: "file", updatedAt: "2025-05-24", status: "ready",    channel: "chat", collectionId: "col-1-1", content: "5~6월 여름 준비 프로모션\n- 펌+염색 패키지 15% 할인\n- SNS 공유 시 트리트먼트 무료", citedCount: 21, failRate: 5 },
    { id: "kb-1-6",  title: "환불 정책 v2",              sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-1-2", content: "시술 전 취소: 전액 환불\n시술 중 취소: 50% 환불\n시술 완료 후: 환불 불가\n재시술: 7일 이내 1회 가능", citedCount: 67, failRate: 4 },
    { id: "kb-1-7",  title: "예약 취소 및 변경 안내",     sourceType: "file", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-1-2", content: "예약 취소는 방문 24시간 전까지 무료\n24시간 이내 취소 시 예약금 10,000원 차감", citedCount: 53, failRate: 3 },
    { id: "kb-1-8",  title: "보상 정책 안내",            sourceType: "url",  updatedAt: "2025-05-18", status: "failed",   channel: "call", collectionId: "col-1-2", content: "크롤링 실패: 접근 차단된 URL", citedCount: 0, failRate: 0 },
    { id: "kb-1-9",  title: "영업시간 및 위치",          sourceType: "text", updatedAt: "2025-05-15", status: "ready",    channel: "both", collectionId: "col-1-3", content: "영업시간: 매일 10:00~20:00 (화요일 휴무)\n주소: 서울시 강남구 압구정로 123\n전화: 02-1234-5678", citedCount: 198, failRate: 1 },
    { id: "kb-1-10", title: "스타일리스트 소개",         sourceType: "file", updatedAt: "2025-05-10", status: "ready",    channel: "chat", collectionId: "col-1-3", content: "김민준 실장 - 10년 경력, 펌 전문\n이수진 디자이너 - 7년 경력, 컬러 전문\n박지호 디자이너 - 5년 경력, 커트 전문", citedCount: 44, failRate: 6 },
    { id: "kb-1-11", title: "주차 안내",                sourceType: "text", updatedAt: "2025-05-08", status: "ready",    channel: "both", collectionId: "col-1-3", content: "건물 지하 2층 주차장 무료 2시간 제공. 초과 시 10분당 500원.", citedCount: 31, failRate: 2 },
  ],
  "store-002": [
    { id: "kb-2-1",  title: "서울점 시술 메뉴 및 가격",  sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-2-1", content: "커트 35,000원\n샴푸 블로우 20,000원\n펌 90,000원~\n염색 70,000원~\n클리닉 트리트먼트 50,000원", citedCount: 118, failRate: 3 },
    { id: "kb-2-2",  title: "노출 교정 서비스 안내",     sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-2-1", content: "염색 후 노출 클레임 발생 시 14일 이내 무료 재시술 제공. 예약 필수.", citedCount: 76, failRate: 5 },
    { id: "kb-2-3",  title: "정기권 할인 정책",          sourceType: "text", updatedAt: "2025-05-25", status: "ready",    channel: "both", collectionId: "col-2-1", content: "6회권: 10% 할인\n12회권: 15% 할인\n유효기간: 구매 후 12개월", citedCount: 54, failRate: 4 },
    { id: "kb-2-4",  title: "신메뉴 샴푸 패키지",        sourceType: "file", updatedAt: "2025-05-24", status: "learning", channel: "chat", collectionId: "col-2-1", content: "5월 신메뉴: 두피 케어 샴푸 패키지 80,000원 출시", citedCount: 0, failRate: 0 },
    { id: "kb-2-5",  title: "클레임 처리 절차",          sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-2-2", content: "1. 클레임 접수 (앱/전화)\n2. 담당 디자이너 확인\n3. 재시술 또는 환불 결정\n4. 처리 완료 후 보상 쿠폰 발행", citedCount: 89, failRate: 6 },
    { id: "kb-2-6",  title: "환불 정책",                sourceType: "text", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-2-2", content: "시술 전: 100% 환불\n시술 중: 50% 환불\n시술 완료: 클레임 검토 후 결정", citedCount: 61, failRate: 3 },
    { id: "kb-2-7",  title: "보상 쿠폰 정책",            sourceType: "file", updatedAt: "2025-05-18", status: "ready",    channel: "both", collectionId: "col-2-2", content: "클레임 인정 시 다음 방문 20% 할인 쿠폰 자동 발행", citedCount: 33, failRate: 7 },
    { id: "kb-2-8",  title: "서울점 영업시간",           sourceType: "text", updatedAt: "2025-05-15", status: "ready",    channel: "both", collectionId: "col-2-3", content: "영업시간: 월~토 09:30~20:00, 일요일 10:00~18:00\n주소: 서울시 마포구 홍대로 45\n전화: 02-9876-5432", citedCount: 203, failRate: 1 },
    { id: "kb-2-9",  title: "주차 및 교통 안내",         sourceType: "text", updatedAt: "2025-05-12", status: "ready",    channel: "both", collectionId: "col-2-3", content: "건물 내 주차 불가. 근처 공영주차장 이용 안내.\n지하철 2호선 홍대입구역 3번 출구 도보 3분.", citedCount: 87, failRate: 2 },
  ],
  "store-003": [
    { id: "kb-3-1",  title: "송파점 시술 메뉴 및 가격",  sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-3-1", content: "커트 28,000원\n펌 75,000원~\n염색 55,000원~\n드라이 15,000원", citedCount: 95, failRate: 2 },
    { id: "kb-3-2",  title: "신규 고객 상담 안내",       sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-3-1", content: "신규 고객은 무료 헤어 컨설팅 20분 제공. 예약 시 '신규' 입력.", citedCount: 41, failRate: 6 },
    { id: "kb-3-3",  title: "추천 제품 목록",            sourceType: "file", updatedAt: "2025-05-26", status: "ready",    channel: "chat", collectionId: "col-3-1", content: "펌 후: 케라틴 컨디셔너 / 염색 후: 컬러 보호 샴푸 / 두피 케어: 스케일링 에센스", citedCount: 28, failRate: 9 },
    { id: "kb-3-4",  title: "드라이 동반 서비스",        sourceType: "text", updatedAt: "2025-05-24", status: "learning", channel: "both", collectionId: "col-3-1", content: "드라이 동반 서비스: 10,000원 추가. 사전 예약 필수.", citedCount: 0, failRate: 0 },
    { id: "kb-3-5",  title: "환불 및 취소 정책",         sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-3-2", content: "취소: 방문 24시간 전 100% 환불\n당일 취소: 예약금 50% 차감\n시술 후: 환불 불가 (재시술 협의 가능)", citedCount: 58, failRate: 5 },
    { id: "kb-3-6",  title: "중복결제 처리 절차",        sourceType: "text", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-3-2", content: "중복 결제 확인 후 영업일 2~3일 이내 전액 환불 처리.", citedCount: 45, failRate: 4 },
    { id: "kb-3-7",  title: "멤버십 혜택 안내",          sourceType: "text", updatedAt: "2025-05-18", status: "ready",    channel: "both", collectionId: "col-3-3", content: "실버: 5% 할인\n골드: 10% 할인 + 무료 트리트먼트 1회/월\nVIP: 15% 할인 + 전담 디자이너 배정", citedCount: 72, failRate: 3 },
    { id: "kb-3-8",  title: "제휴 할인 브랜드",          sourceType: "file", updatedAt: "2025-05-15", status: "ready",    channel: "chat", collectionId: "col-3-3", content: "롯데카드 5% 추가 할인\n네이버페이 포인트 3% 적립\n현대백화점 멤버 10% 할인", citedCount: 36, failRate: 7 },
    { id: "kb-3-9",  title: "송파점 영업시간 및 위치",   sourceType: "text", updatedAt: "2025-05-12", status: "ready",    channel: "both", collectionId: "col-3-3", content: "영업시간: 매일 10:00~20:00 (매월 첫 번째 월요일 휴무)\n주소: 서울시 송파구 올림픽로 200\n전화: 02-5678-1234", citedCount: 167, failRate: 1 },
  ],
}

// ── EN ───────────────────────────────────────────────────────────────────────
export const KB_COLLECTIONS_BY_STORE_EN: Record<string, KBCollection[]> = {
  "store-001": [
    { id: "col-1-1", name: "Products & Services",       itemCount: 5, expanded: true  },
    { id: "col-1-2", name: "Refund & Cancellation",     itemCount: 3, expanded: false },
    { id: "col-1-3", name: "Booking & Operations",      itemCount: 3, expanded: false },
  ],
  "store-002": [
    { id: "col-2-1", name: "Treatment Menu",             itemCount: 4, expanded: true  },
    { id: "col-2-2", name: "Claims & Compensation",      itemCount: 3, expanded: false },
    { id: "col-2-3", name: "Branch Operations",          itemCount: 2, expanded: false },
  ],
  "store-003": [
    { id: "col-3-1", name: "Treatment Consultation",    itemCount: 4, expanded: true  },
    { id: "col-3-2", name: "Refund & Cancellation",     itemCount: 2, expanded: false },
    { id: "col-3-3", name: "Membership & Benefits",     itemCount: 3, expanded: false },
  ],
}

export const KB_ITEMS_BY_STORE_EN: Record<string, KBItem[]> = {
  "store-001": [
    { id: "kb-1-1",  title: "Service Menu & Price List",      sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-1-1", content: "Haircut SAR 120\nPerm SAR 350+\nColor SAR 280+\nTreatment SAR 180\n\n* Reservation required for all services", citedCount: 142, failRate: 2 },
    { id: "kb-1-2",  title: "Brand Story & Philosophy",       sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-1-1", content: "Founded in Riyadh in 2015, 10 years of customer satisfaction first. All stylists have 5+ years of experience.", citedCount: 38, failRate: 8 },
    { id: "kb-1-3",  title: "Official Website Crawling",      sourceType: "url",  updatedAt: "2025-05-26", status: "learning", channel: "both", collectionId: "col-1-1", content: "https://riyadh-wellnessspa.com crawling in progress...", citedCount: 0, failRate: 0 },
    { id: "kb-1-4",  title: "Frequently Asked Questions",     sourceType: "text", updatedAt: "2025-05-25", status: "conflict", channel: "both", collectionId: "col-1-1", content: "Q. Is parking available?\nA. B2 parking (2 hours free)\n\nQ. Can I walk in without a reservation?\nA. Same-day reservations by phone only.", citedCount: 89, failRate: 15, conflictWith: "kb-1-1" },
    { id: "kb-1-5",  title: "Spring Promotion Guide",         sourceType: "file", updatedAt: "2025-05-24", status: "ready",    channel: "chat", collectionId: "col-1-1", content: "Summer prep promotion (May–June)\n- Perm + Color package 15% off\n- Free treatment with social media share", citedCount: 21, failRate: 5 },
    { id: "kb-1-6",  title: "Refund Policy v2",              sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-1-2", content: "Before service: full refund\nDuring service: 50% refund\nAfter completion: no refund\nRedo: once within 7 days", citedCount: 67, failRate: 4 },
    { id: "kb-1-7",  title: "Booking Cancellation & Change",  sourceType: "file", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-1-2", content: "Free cancellation up to 24 hours before visit.\nWithin 24 hours: SAR 50 deposit deducted.", citedCount: 53, failRate: 3 },
    { id: "kb-1-8",  title: "Compensation Policy",           sourceType: "url",  updatedAt: "2025-05-18", status: "failed",   channel: "call", collectionId: "col-1-2", content: "Crawl failed: URL access blocked", citedCount: 0, failRate: 0 },
    { id: "kb-1-9",  title: "Operating Hours & Location",    sourceType: "text", updatedAt: "2025-05-15", status: "ready",    channel: "both", collectionId: "col-1-3", content: "Hours: Daily 10:00–20:00 (closed Tuesday)\nAddress: King Fahd Road, Riyadh\nPhone: 9200-14823", citedCount: 198, failRate: 1 },
    { id: "kb-1-10", title: "Stylist Profiles",             sourceType: "file", updatedAt: "2025-05-10", status: "ready",    channel: "chat", collectionId: "col-1-3", content: "Ahmed Al-Rashid – 10 yrs, perm specialist\nSara Al-Qahtani – 7 yrs, color specialist\nFatima Nour – 5 yrs, cut specialist", citedCount: 44, failRate: 6 },
    { id: "kb-1-11", title: "Parking Information",          sourceType: "text", updatedAt: "2025-05-08", status: "ready",    channel: "both", collectionId: "col-1-3", content: "B2 parking: 2 hours free. SAR 5 per 10 minutes thereafter.", citedCount: 31, failRate: 2 },
  ],
  "store-002": [
    { id: "kb-2-1",  title: "Jeddah Branch Menu & Prices",   sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-2-1", content: "Cut SAR 130\nShampoo & Blow SAR 80\nPerm SAR 400+\nColor SAR 300+\nClinic Treatment SAR 200", citedCount: 118, failRate: 3 },
    { id: "kb-2-2",  title: "Color Correction Service",      sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-2-1", content: "Free redo within 14 days if color claim occurs. Reservation required.", citedCount: 76, failRate: 5 },
    { id: "kb-2-3",  title: "Membership Pass Discounts",    sourceType: "text", updatedAt: "2025-05-25", status: "ready",    channel: "both", collectionId: "col-2-1", content: "6-visit pass: 10% off\n12-visit pass: 15% off\nValidity: 12 months from purchase", citedCount: 54, failRate: 4 },
    { id: "kb-2-4",  title: "New Shampoo Package",          sourceType: "file", updatedAt: "2025-05-24", status: "learning", channel: "chat", collectionId: "col-2-1", content: "New: Scalp care shampoo package SAR 300 launched in May", citedCount: 0, failRate: 0 },
    { id: "kb-2-5",  title: "Claims Process",               sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-2-2", content: "1. Submit claim (app/phone)\n2. Stylist review\n3. Redo or refund decision\n4. Compensation coupon issued", citedCount: 89, failRate: 6 },
    { id: "kb-2-6",  title: "Refund Policy",                sourceType: "text", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-2-2", content: "Before: 100% refund\nDuring: 50% refund\nAfter: reviewed case by case", citedCount: 61, failRate: 3 },
    { id: "kb-2-7",  title: "Compensation Coupon Policy",   sourceType: "file", updatedAt: "2025-05-18", status: "ready",    channel: "both", collectionId: "col-2-2", content: "Approved claim: 20% discount coupon for next visit issued automatically", citedCount: 33, failRate: 7 },
    { id: "kb-2-8",  title: "Jeddah Branch Hours",          sourceType: "text", updatedAt: "2025-05-15", status: "ready",    channel: "both", collectionId: "col-2-3", content: "Hours: Mon–Sat 09:30–20:00, Sun 10:00–18:00\nAddress: Al-Tahlia Street, Jeddah\nPhone: 9200-57391", citedCount: 203, failRate: 1 },
    { id: "kb-2-9",  title: "Parking & Transport",          sourceType: "text", updatedAt: "2025-05-12", status: "ready",    channel: "both", collectionId: "col-2-3", content: "No in-building parking. Nearby public parking available.\n5 min walk from Al-Tahlia metro.", citedCount: 87, failRate: 2 },
  ],
  "store-003": [
    { id: "kb-3-1",  title: "Dammam Branch Menu & Prices",  sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-3-1", content: "Cut SAR 110\nPerm SAR 320+\nColor SAR 250+\nBlowout SAR 60", citedCount: 95, failRate: 2 },
    { id: "kb-3-2",  title: "New Customer Consultation",    sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-3-1", content: "New customers receive a free 20-min hair consultation. Enter 'new' when booking.", citedCount: 41, failRate: 6 },
    { id: "kb-3-3",  title: "Recommended Products",        sourceType: "file", updatedAt: "2025-05-26", status: "ready",    channel: "chat", collectionId: "col-3-1", content: "Post-perm: Keratin conditioner / Post-color: Color protect shampoo / Scalp: Scaling essence", citedCount: 28, failRate: 9 },
    { id: "kb-3-4",  title: "Blowout Add-on Service",      sourceType: "text", updatedAt: "2025-05-24", status: "learning", channel: "both", collectionId: "col-3-1", content: "Blowout add-on: SAR 40 extra. Pre-booking required.", citedCount: 0, failRate: 0 },
    { id: "kb-3-5",  title: "Refund & Cancellation Policy", sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-3-2", content: "Cancel 24h+ before: 100% refund\nSame-day cancel: 50% deposit deducted\nAfter service: no refund (redo negotiable)", citedCount: 58, failRate: 5 },
    { id: "kb-3-6",  title: "Duplicate Payment Process",   sourceType: "text", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-3-2", content: "Full refund processed within 2–3 business days after confirming duplicate charge.", citedCount: 45, failRate: 4 },
    { id: "kb-3-7",  title: "Membership Benefits",         sourceType: "text", updatedAt: "2025-05-18", status: "ready",    channel: "both", collectionId: "col-3-3", content: "Silver: 5% off\nGold: 10% off + 1 free treatment/month\nVIP: 15% off + dedicated stylist", citedCount: 72, failRate: 3 },
    { id: "kb-3-8",  title: "Partner Brand Discounts",     sourceType: "file", updatedAt: "2025-05-15", status: "ready",    channel: "chat", collectionId: "col-3-3", content: "Al Rajhi Bank: 5% extra off\nSTC Pay points: 3% cashback\nPremium members: 10% off", citedCount: 36, failRate: 7 },
    { id: "kb-3-9",  title: "Dammam Branch Hours & Location", sourceType: "text", updatedAt: "2025-05-12", status: "ready",    channel: "both", collectionId: "col-3-3", content: "Hours: Daily 10:00–20:00 (closed 1st Monday of month)\nAddress: Prince Mohammed Street, Dammam\nPhone: 9200-82046", citedCount: 167, failRate: 1 },
  ],
}

// ── AR ───────────────────────────────────────────────────────────────────────
export const KB_COLLECTIONS_BY_STORE_AR: Record<string, KBCollection[]> = {
  "store-001": [
    { id: "col-1-1", name: "المنتجات والخدمات",       itemCount: 5, expanded: true  },
    { id: "col-1-2", name: "الاسترداد والإلغاء",       itemCount: 3, expanded: false },
    { id: "col-1-3", name: "الحجز والتشغيل",           itemCount: 3, expanded: false },
  ],
  "store-002": [
    { id: "col-2-1", name: "قائمة الخدمات",            itemCount: 4, expanded: true  },
    { id: "col-2-2", name: "المطالبات والتعويضات",      itemCount: 3, expanded: false },
    { id: "col-2-3", name: "تشغيل الفرع",              itemCount: 2, expanded: false },
  ],
  "store-003": [
    { id: "col-3-1", name: "استشارة الخدمات",          itemCount: 4, expanded: true  },
    { id: "col-3-2", name: "الاسترداد والإلغاء",        itemCount: 2, expanded: false },
    { id: "col-3-3", name: "العضوية والمزايا",           itemCount: 3, expanded: false },
  ],
}

export const KB_ITEMS_BY_STORE_AR: Record<string, KBItem[]> = {
  "store-001": [
    { id: "kb-1-1",  title: "قائمة الخدمات والأسعار",        sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-1-1", content: "قص الشعر 120 ر.س\nبيرم 350 ر.س+\nصبغ 280 ر.س+\nعلاج 180 ر.س\n\n* الحجز مطلوب لجميع الخدمات", citedCount: 142, failRate: 2 },
    { id: "kb-1-2",  title: "قصة العلامة وفلسفتها",          sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-1-1", content: "تأسست في الرياض 2015، 10 سنوات في خدمة العملاء بأعلى مستوى. جميع المصففين بخبرة 5 سنوات+.", citedCount: 38, failRate: 8 },
    { id: "kb-1-3",  title: "زحف الموقع الرسمي",             sourceType: "url",  updatedAt: "2025-05-26", status: "learning", channel: "both", collectionId: "col-1-1", content: "جارٍ زحف https://riyadh-wellnessspa.com...", citedCount: 0, failRate: 0 },
    { id: "kb-1-4",  title: "الأسئلة الشائعة",               sourceType: "text", updatedAt: "2025-05-25", status: "conflict", channel: "both", collectionId: "col-1-1", content: "س. هل يتوفر موقف سيارات?\nج. الطابق B2 (ساعتان مجاناً)\n\nس. هل يمكن الحضور بدون حجز?\nج. الحجز في نفس اليوم عبر الهاتف فقط.", citedCount: 89, failRate: 15, conflictWith: "kb-1-1" },
    { id: "kb-1-5",  title: "دليل عروض الربيع",              sourceType: "file", updatedAt: "2025-05-24", status: "ready",    channel: "chat", collectionId: "col-1-1", content: "عروض التحضير للصيف (مايو–يونيو)\n- باقة بيرم + صبغ خصم 15%\n- علاج مجاني عند المشاركة على السوشيال ميديا", citedCount: 21, failRate: 5 },
    { id: "kb-1-6",  title: "سياسة الاسترداد v2",            sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-1-2", content: "قبل الخدمة: استرداد كامل\nأثناء الخدمة: 50% استرداد\nبعد الانتهاء: لا استرداد\nإعادة خدمة: مرة واحدة خلال 7 أيام", citedCount: 67, failRate: 4 },
    { id: "kb-1-7",  title: "إلغاء الحجز وتغييره",           sourceType: "file", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-1-2", content: "إلغاء مجاني قبل 24 ساعة من الزيارة.\nخلال 24 ساعة: خصم 50 ر.س من العربون.", citedCount: 53, failRate: 3 },
    { id: "kb-1-8",  title: "سياسة التعويض",                 sourceType: "url",  updatedAt: "2025-05-18", status: "failed",   channel: "call", collectionId: "col-1-2", content: "فشل الزحف: الرابط محجوب", citedCount: 0, failRate: 0 },
    { id: "kb-1-9",  title: "ساعات العمل والموقع",           sourceType: "text", updatedAt: "2025-05-15", status: "ready",    channel: "both", collectionId: "col-1-3", content: "ساعات العمل: يومياً 10:00–20:00 (إغلاق الثلاثاء)\nالعنوان: طريق الملك فهد، الرياض\nالهاتف: 9200-14823", citedCount: 198, failRate: 1 },
    { id: "kb-1-10", title: "ملفات المصففين",                sourceType: "file", updatedAt: "2025-05-10", status: "ready",    channel: "chat", collectionId: "col-1-3", content: "أحمد الراشد – 10 سنوات، متخصص بيرم\nسارة القحطاني – 7 سنوات، متخصصة صبغ\nفاطمة نور – 5 سنوات، متخصصة قص", citedCount: 44, failRate: 6 },
    { id: "kb-1-11", title: "معلومات الموقف",                sourceType: "text", updatedAt: "2025-05-08", status: "ready",    channel: "both", collectionId: "col-1-3", content: "موقف B2: ساعتان مجاناً. 5 ر.س لكل 10 دقائق إضافية.", citedCount: 31, failRate: 2 },
  ],
  "store-002": [
    { id: "kb-2-1",  title: "قائمة فرع جدة والأسعار",       sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-2-1", content: "قص 130 ر.س\nغسيل وتجفيف 80 ر.س\nبيرم 400 ر.س+\nصبغ 300 ر.س+\nعلاج 200 ر.س", citedCount: 118, failRate: 3 },
    { id: "kb-2-2",  title: "خدمة تصحيح اللون",             sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-2-1", content: "إعادة خدمة مجانية خلال 14 يوماً عند وجود مشكلة لون. الحجز مطلوب.", citedCount: 76, failRate: 5 },
    { id: "kb-2-3",  title: "خصومات بطاقة الاشتراك",        sourceType: "text", updatedAt: "2025-05-25", status: "ready",    channel: "both", collectionId: "col-2-1", content: "بطاقة 6 زيارات: خصم 10%\nبطاقة 12 زيارة: خصم 15%\nصلاحية: 12 شهراً من الشراء", citedCount: 54, failRate: 4 },
    { id: "kb-2-4",  title: "باقة شامبو جديدة",             sourceType: "file", updatedAt: "2025-05-24", status: "learning", channel: "chat", collectionId: "col-2-1", content: "جديد: باقة شامبو العناية بفروة الرأس 300 ر.س أُطلقت في مايو", citedCount: 0, failRate: 0 },
    { id: "kb-2-5",  title: "إجراءات المطالبات",            sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-2-2", content: "1. تقديم المطالبة (تطبيق/هاتف)\n2. مراجعة المصفف\n3. قرار بإعادة الخدمة أو الاسترداد\n4. إصدار كوبون التعويض", citedCount: 89, failRate: 6 },
    { id: "kb-2-6",  title: "سياسة الاسترداد",              sourceType: "text", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-2-2", content: "قبل: استرداد 100%\nأثناء: استرداد 50%\nبعد: تقييم حالة بحالة", citedCount: 61, failRate: 3 },
    { id: "kb-2-7",  title: "سياسة كوبون التعويض",          sourceType: "file", updatedAt: "2025-05-18", status: "ready",    channel: "both", collectionId: "col-2-2", content: "مطالبة معتمدة: كوبون خصم 20% على الزيارة القادمة يُصدر تلقائياً", citedCount: 33, failRate: 7 },
    { id: "kb-2-8",  title: "ساعات فرع جدة",                sourceType: "text", updatedAt: "2025-05-15", status: "ready",    channel: "both", collectionId: "col-2-3", content: "ساعات: الاثنين–السبت 09:30–20:00، الأحد 10:00–18:00\nالعنوان: شارع التحلية، جدة\nالهاتف: 9200-57391", citedCount: 203, failRate: 1 },
    { id: "kb-2-9",  title: "الموقف والمواصلات",            sourceType: "text", updatedAt: "2025-05-12", status: "ready",    channel: "both", collectionId: "col-2-3", content: "لا يوجد موقف داخل المبنى. موقف عام قريب متاح.\n5 دقائق سيراً من محطة التحلية.", citedCount: 87, failRate: 2 },
  ],
  "store-003": [
    { id: "kb-3-1",  title: "قائمة فرع الدمام والأسعار",    sourceType: "file", updatedAt: "2025-05-28", status: "ready",    channel: "both", collectionId: "col-3-1", content: "قص 110 ر.س\nبيرم 320 ر.س+\nصبغ 250 ر.س+\nتجفيف 60 ر.س", citedCount: 95, failRate: 2 },
    { id: "kb-3-2",  title: "استشارة العملاء الجدد",        sourceType: "text", updatedAt: "2025-05-27", status: "ready",    channel: "chat", collectionId: "col-3-1", content: "العملاء الجدد يحصلون على استشارة شعر مجانية 20 دقيقة. اكتب 'جديد' عند الحجز.", citedCount: 41, failRate: 6 },
    { id: "kb-3-3",  title: "المنتجات الموصى بها",          sourceType: "file", updatedAt: "2025-05-26", status: "ready",    channel: "chat", collectionId: "col-3-1", content: "بعد البيرم: مرطب كيراتين / بعد الصبغ: شامبو حماية اللون / فروة الرأس: essence تقشير", citedCount: 28, failRate: 9 },
    { id: "kb-3-4",  title: "خدمة التجفيف الإضافية",        sourceType: "text", updatedAt: "2025-05-24", status: "learning", channel: "both", collectionId: "col-3-1", content: "خدمة تجفيف إضافية: 40 ر.س. الحجز المسبق مطلوب.", citedCount: 0, failRate: 0 },
    { id: "kb-3-5",  title: "سياسة الاسترداد والإلغاء",     sourceType: "text", updatedAt: "2025-05-22", status: "ready",    channel: "both", collectionId: "col-3-2", content: "إلغاء قبل 24 ساعة: استرداد 100%\nإلغاء في نفس اليوم: خصم 50% من العربون\nبعد الخدمة: لا استرداد (إعادة قابلة للتفاوض)", citedCount: 58, failRate: 5 },
    { id: "kb-3-6",  title: "إجراء الدفع المكرر",           sourceType: "text", updatedAt: "2025-05-20", status: "ready",    channel: "both", collectionId: "col-3-2", content: "استرداد كامل خلال 2–3 أيام عمل بعد تأكيد الدفع المكرر.", citedCount: 45, failRate: 4 },
    { id: "kb-3-7",  title: "مزايا العضوية",                sourceType: "text", updatedAt: "2025-05-18", status: "ready",    channel: "both", collectionId: "col-3-3", content: "فضي: خصم 5%\nذهبي: خصم 10% + علاج مجاني/شهر\nVIP: خصم 15% + مصفف مخصص", citedCount: 72, failRate: 3 },
    { id: "kb-3-8",  title: "خصومات العلامات الشريكة",      sourceType: "file", updatedAt: "2025-05-15", status: "ready",    channel: "chat", collectionId: "col-3-3", content: "بنك الراجحي: خصم إضافي 5%\nSTC Pay: استرداد 3% نقاط\nالأعضاء المميزون: خصم 10%", citedCount: 36, failRate: 7 },
    { id: "kb-3-9",  title: "ساعات وموقع فرع الدمام",       sourceType: "text", updatedAt: "2025-05-12", status: "ready",    channel: "both", collectionId: "col-3-3", content: "ساعات: يومياً 10:00–20:00 (إغلاق أول اثنين كل شهر)\nالعنوان: شارع الأمير محمد، الدمام\nالهاتف: 9200-82046", citedCount: 167, failRate: 1 },
  ],
}

export function getKBCollectionsByStore(locale: string, storeId: string): KBCollection[] {
  const map = locale === "ar" ? KB_COLLECTIONS_BY_STORE_AR : locale === "en" ? KB_COLLECTIONS_BY_STORE_EN : KB_COLLECTIONS_BY_STORE
  return map[storeId] ?? map["store-001"]
}

export function getKBItemsByStore(locale: string, storeId: string): KBItem[] {
  const map = locale === "ar" ? KB_ITEMS_BY_STORE_AR : locale === "en" ? KB_ITEMS_BY_STORE_EN : KB_ITEMS_BY_STORE
  return map[storeId] ?? map["store-001"]
}

// ── EN/AR Marketing Campaigns ─────────────────────────────────────────────────
export const CAMPAIGNS_BY_STORE_EN: Record<string, StoreCampaign[]> = {
  "store-001": [
    { id: "camp-1-1", name: "Riyadh VIP Spring Coupon", status: "active", segmentId: "seg-vip", targetType: "segment", targetLabel: "VIP Customers", channels: ["kakao", "sms"], messageType: "coupon", sentCount: 3, openRate: 100, clickRate: 67, redemptionRate: 50, scheduledAt: "2025-03-01T10:00:00", createdAt: "2025-02-25", message: "Hello {{customer_name}}! Here is your exclusive VIP coupon {{coupon_code}} for Riyadh Spa. Enjoy 20% off this month." },
    { id: "camp-1-2", name: "Negative Customer Satisfaction Survey", status: "active", segmentId: "seg-negative", targetType: "segment", targetLabel: "Negative Sentiment", channels: ["email"], messageType: "survey", sentCount: 1, openRate: 100, clickRate: 0, redemptionRate: 0, createdAt: "2025-02-26", message: "Hello {{customer_name}}. We sincerely apologize for your recent experience. Please complete our short survey to help us improve." },
    { id: "camp-1-3", name: "New Customer Revisit Campaign", status: "paused", segmentId: "seg-new", targetType: "segment", targetLabel: "New Customers", channels: ["sms"], messageType: "revisit", sentCount: 2, openRate: 50, clickRate: 0, redemptionRate: 0, createdAt: "2025-02-20", message: "{{customer_name}}, thank you for your first visit! Enjoy 10% off on your next visit." },
    { id: "camp-1-4", name: "Post-CS Resolution Thank You", status: "active", segmentId: "seg-cs-heavy", targetType: "segment", targetLabel: "CS-Heavy Customers", channels: ["kakao"], messageType: "custom", sentCount: 5, openRate: 80, clickRate: 20, redemptionRate: 0, createdAt: "2025-02-18", message: "{{customer_name}}, your {{cs_category}} inquiry has been resolved. Please contact us anytime for further assistance." },
    { id: "camp-1-5", name: "Review Request for Unreviewed Customers", status: "draft", segmentId: "seg-no-review", targetType: "segment", targetLabel: "No Review Yet", channels: ["sms", "email"], messageType: "survey", sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0, createdAt: "2025-02-27", message: "{{customer_name}}, thank you for visiting! Leave us a review and receive a complimentary beverage coupon." },
  ],
  "store-002": [
    { id: "camp-2-1", name: "Color Claim Customer Care", status: "active", segmentId: "seg-claim", targetType: "segment", targetLabel: "Claim Customers", channels: ["kakao"], messageType: "custom", sentCount: 4, openRate: 100, clickRate: 75, redemptionRate: 50, createdAt: "2025-02-22", message: "{{customer_name}}, we are sorry for the inconvenience. A 20% compensation coupon has been issued for you." },
    { id: "camp-2-2", name: "Membership Pass Expiry Reminder", status: "active", segmentId: "seg-subscription", targetType: "segment", targetLabel: "Pass Holders", channels: ["sms", "kakao"], messageType: "coupon", sentCount: 8, openRate: 88, clickRate: 50, redemptionRate: 38, scheduledAt: "2025-03-05T09:00:00", createdAt: "2025-02-24", message: "{{customer_name}}, your membership pass expires in 14 days. Renew now and get 1 extra visit free!" },
    { id: "camp-2-3", name: "New Shampoo Package Launch", status: "scheduled", segmentId: "seg-all", targetType: "all", targetLabel: "All Customers", channels: ["kakao", "push"], messageType: "custom", sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0, scheduledAt: "2025-03-10T10:00:00", createdAt: "2025-02-28", message: "{{customer_name}}! Our new scalp care shampoo package is here. 10% launch discount applied!" },
  ],
  "store-003": [
    { id: "camp-3-1", name: "Duplicate Payment Compensation", status: "completed", segmentId: "seg-refund", targetType: "segment", targetLabel: "Refund Customers", channels: ["kakao", "sms"], messageType: "coupon", sentCount: 6, openRate: 100, clickRate: 83, redemptionRate: 67, createdAt: "2025-02-20", message: "{{customer_name}}, we apologize for the duplicate payment. Here is your 30% discount coupon {{coupon_code}} for your next visit." },
    { id: "camp-3-2", name: "New Customer Membership Drive", status: "active", segmentId: "seg-new", targetType: "segment", targetLabel: "New Customers", channels: ["sms"], messageType: "revisit", sentCount: 3, openRate: 67, clickRate: 33, redemptionRate: 33, createdAt: "2025-02-23", message: "{{customer_name}}, join our membership now and instantly receive Silver tier with 5% off!" },
    { id: "camp-3-3", name: "VIP Dedicated Stylist Assignment", status: "active", segmentId: "seg-vip", targetType: "segment", targetLabel: "VIP Customers", channels: ["kakao"], messageType: "custom", sentCount: 2, openRate: 100, clickRate: 100, redemptionRate: 50, createdAt: "2025-02-25", message: "{{customer_name}}, congratulations on reaching VIP status! You now have a dedicated stylist assigned to you." },
    { id: "camp-3-4", name: "Product Recommendation Follow-up", status: "draft", segmentId: "seg-all", targetType: "all", targetLabel: "All Customers", channels: ["email", "push"], messageType: "custom", sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0, createdAt: "2025-02-28", message: "{{customer_name}}, here are personalized product recommendations for your post-treatment care. Check the app!" },
  ],
}

export const CAMPAIGNS_BY_STORE_AR: Record<string, StoreCampaign[]> = {
  "store-001": [
    { id: "camp-1-1", name: "كوبون VIP ربيع الرياض", status: "active", segmentId: "seg-vip", targetType: "segment", targetLabel: "عملاء VIP", channels: ["kakao", "sms"], messageType: "coupon", sentCount: 3, openRate: 100, clickRate: 67, redemptionRate: 50, scheduledAt: "2025-03-01T10:00:00", createdAt: "2025-02-25", message: "مرحباً {{customer_name}}! إليك كوبون VIP الحصري {{coupon_code}} لسبا الرياض. استمتع بخصم 20% هذا الشهر." },
    { id: "camp-1-2", name: "استطلاع رضا العملاء السلبيين", status: "active", segmentId: "seg-negative", targetType: "segment", targetLabel: "مشاعر سلبية", channels: ["email"], messageType: "survey", sentCount: 1, openRate: 100, clickRate: 0, redemptionRate: 0, createdAt: "2025-02-26", message: "مرحباً {{customer_name}}، نعتذر جداً عن تجربتك الأخيرة. يرجى الإجابة على استطلاعنا القصير لمساعدتنا في التحسين." },
    { id: "camp-1-3", name: "حملة إعادة زيارة العملاء الجدد", status: "paused", segmentId: "seg-new", targetType: "segment", targetLabel: "عملاء جدد", channels: ["sms"], messageType: "revisit", sentCount: 2, openRate: 50, clickRate: 0, redemptionRate: 0, createdAt: "2025-02-20", message: "{{customer_name}}، شكراً لزيارتك الأولى! استمتع بخصم 10% في زيارتك القادمة." },
    { id: "camp-1-4", name: "شكر ما بعد حل مشكلة الدعم", status: "active", segmentId: "seg-cs-heavy", targetType: "segment", targetLabel: "عملاء الدعم المتكرر", channels: ["kakao"], messageType: "custom", sentCount: 5, openRate: 80, clickRate: 20, redemptionRate: 0, createdAt: "2025-02-18", message: "{{customer_name}}، تم حل استفسارك بخصوص {{cs_category}}. تواصل معنا في أي وقت لمزيد من المساعدة." },
    { id: "camp-1-5", name: "طلب مراجعة العملاء غير المراجِعين", status: "draft", segmentId: "seg-no-review", targetType: "segment", targetLabel: "بدون مراجعة بعد", channels: ["sms", "email"], messageType: "survey", sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0, createdAt: "2025-02-27", message: "{{customer_name}}، شكراً لزيارتك! اترك تقييماً واحصل على كوبون مشروب مجاني." },
  ],
  "store-002": [
    { id: "camp-2-1", name: "رعاية عملاء مشكلة اللون", status: "active", segmentId: "seg-claim", targetType: "segment", targetLabel: "عملاء المطالبات", channels: ["kakao"], messageType: "custom", sentCount: 4, openRate: 100, clickRate: 75, redemptionRate: 50, createdAt: "2025-02-22", message: "{{customer_name}}، نعتذر عن الإزعاج. تم إصدار كوبون تعويض بخصم 20% لك." },
    { id: "camp-2-2", name: "تذكير انتهاء بطاقة الاشتراك", status: "active", segmentId: "seg-subscription", targetType: "segment", targetLabel: "حاملو البطاقة", channels: ["sms", "kakao"], messageType: "coupon", sentCount: 8, openRate: 88, clickRate: 50, redemptionRate: 38, scheduledAt: "2025-03-05T09:00:00", createdAt: "2025-02-24", message: "{{customer_name}}، بطاقتك تنتهي خلال 14 يوماً. جددها الآن واحصل على زيارة إضافية مجانية!" },
    { id: "camp-2-3", name: "إطلاق باقة الشامبو الجديدة", status: "scheduled", segmentId: "seg-all", targetType: "all", targetLabel: "جميع العملاء", channels: ["kakao", "push"], messageType: "custom", sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0, scheduledAt: "2025-03-10T10:00:00", createdAt: "2025-02-28", message: "{{customer_name}}! باقة شامبو العناية بفروة الرأس الجديدة متاحة الآن. خصم 10% على الإطلاق!" },
  ],
  "store-003": [
    { id: "camp-3-1", name: "تعويض الدفع المكرر", status: "completed", segmentId: "seg-refund", targetType: "segment", targetLabel: "عملاء الاسترداد", channels: ["kakao", "sms"], messageType: "coupon", sentCount: 6, openRate: 100, clickRate: 83, redemptionRate: 67, createdAt: "2025-02-20", message: "{{customer_name}}، نعتذر عن الدفع المكرر. إليك كوبون خصم 30% {{coupon_code}} لزيارتك القادمة." },
    { id: "camp-3-2", name: "حملة تسجيل العملاء الجدد في العضوية", status: "active", segmentId: "seg-new", targetType: "segment", targetLabel: "عملاء جدد", channels: ["sms"], messageType: "revisit", sentCount: 3, openRate: 67, clickRate: 33, redemptionRate: 33, createdAt: "2025-02-23", message: "{{customer_name}}، انضم لعضويتنا الآن واحصل على مستوى فضي فوراً بخصم 5%!" },
    { id: "camp-3-3", name: "تخصيص مصفف VIP مخصص", status: "active", segmentId: "seg-vip", targetType: "segment", targetLabel: "عملاء VIP", channels: ["kakao"], messageType: "custom", sentCount: 2, openRate: 100, clickRate: 100, redemptionRate: 50, createdAt: "2025-02-25", message: "{{customer_name}}، مبروك على بلوغك مستوى VIP! لديك الآن مصفف مخصص." },
    { id: "camp-3-4", name: "متابعة توصية المنتجات", status: "draft", segmentId: "seg-all", targetType: "all", targetLabel: "جميع العملاء", channels: ["email", "push"], messageType: "custom", sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0, createdAt: "2025-02-28", message: "{{customer_name}}، إليك توصيات منتجات مخصصة لعنايتك بعد الخدمة. تحقق من التطبيق!" },
  ],
}

export function getCampaignsByStore(locale: string, storeId: string): StoreCampaign[] {
  const map = locale === "ar" ? CAMPAIGNS_BY_STORE_AR : locale === "en" ? CAMPAIGNS_BY_STORE_EN : CAMPAIGNS_BY_STORE
  return map[storeId] ?? map["store-001"]
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-response Agents
// ─────────────────────────────────────────────────────────────────────────────

export interface StoreAgent {
  id: string
  name: string
  persona: string
  greeting: string
  temperature: number
  model: string
  fallback: string
  selectedKB: string[]
  voiceStyle: string
  sttEngine: string
  ttsEngine: string
}

export const AGENTS_BY_STORE: Record<string, StoreAgent[]> = {
  "store-001": [
    {
      id: "agent-1-1",
      name: "강남점 기본 상담 에이전트",
      persona: "친절하고 전문적인 강남점 상담사입니다. 예약, 가격, 스타일리스트 관련 문의에 신속히 답변합니다.",
      greeting: "안녕하세요! 강남 헤어샵입니다. 무엇을 도와드릴까요?",
      temperature: 0.7,
      model: "GPT-4o (권장)",
      fallback: "상담원에게 연결",
      selectedKB: ["kb-1-1", "kb-1-4", "kb-1-9"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (한국어 여성)",
    },
    {
      id: "agent-1-2",
      name: "강남점 VIP 전담 에이전트",
      persona: "VIP 고객 전담 프리미엄 상담사. 최우선 처리 및 격식 있는 응대를 제공합니다.",
      greeting: "안녕하세요, VIP 고객님. 강남점 전담 AI 상담사가 연결되었습니다.",
      temperature: 0.4,
      model: "Claude 3.5 Sonnet",
      fallback: "VIP 전담 상담원 연결",
      selectedKB: ["kb-1-1", "kb-1-2", "kb-1-5", "kb-1-9"],
      voiceStyle: "formal",
      sttEngine: "OpenAI Whisper",
      ttsEngine: "ElevenLabs",
    },
    {
      id: "agent-1-3",
      name: "예약 전문 에이전트",
      persona: "예약·변경·취소 전문 상담사. 가능 일정을 빠르게 안내합니다.",
      greeting: "안녕하세요! 예약 전문 상담사입니다. 예약·변경·취소 무엇이든 도와드리겠습니다.",
      temperature: 0.3,
      model: "GPT-4o (권장)",
      fallback: "이메일 접수 안내",
      selectedKB: ["kb-1-6", "kb-1-7"],
      voiceStyle: "professional",
      sttEngine: "Clova Speech (네이버)",
      ttsEngine: "Clova Voice (네이버)",
    },
  ],
  "store-002": [
    {
      id: "agent-2-1",
      name: "서울점 기본 상담 에이전트",
      persona: "서울 홍대점 상담사입니다. 시술 문의, 정기권, 클레임 처리를 전문으로 합니다.",
      greeting: "안녕하세요! 서울 헤어샵 홍대점입니다. 무엇이든 도와드릴게요!",
      temperature: 0.7,
      model: "GPT-4o (권장)",
      fallback: "상담원에게 연결",
      selectedKB: ["kb-2-1", "kb-2-3", "kb-2-8"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (한국어 여성)",
    },
    {
      id: "agent-2-2",
      name: "클레임 전담 에이전트",
      persona: "고객 불만 및 클레임 전담 상담사. 공감하고 신속하게 해결책을 제시합니다.",
      greeting: "안녕하세요. 불편함을 드려 죄송합니다. 클레임 전담 상담사가 도와드리겠습니다.",
      temperature: 0.5,
      model: "Claude 3.5 Sonnet",
      fallback: "매니저 연결",
      selectedKB: ["kb-2-5", "kb-2-6", "kb-2-7"],
      voiceStyle: "professional",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (한국어 여성)",
    },
  ],
  "store-003": [
    {
      id: "agent-3-1",
      name: "송파점 기본 상담 에이전트",
      persona: "송파 헤어샵 상담사입니다. 친근하고 따뜻한 톤으로 고객을 응대합니다.",
      greeting: "안녕하세요! 송파 헤어샵이에요. 편하게 말씀해 주세요~",
      temperature: 0.8,
      model: "GPT-4o (권장)",
      fallback: "상담원에게 연결",
      selectedKB: ["kb-3-1", "kb-3-2", "kb-3-9"],
      voiceStyle: "friendly",
      sttEngine: "Clova Speech (네이버)",
      ttsEngine: "Clova Voice (네이버)",
    },
    {
      id: "agent-3-2",
      name: "멤버십 · 혜택 전담 에이전트",
      persona: "멤버십·제휴 혜택 전담 상담사. 다양한 할인 혜택을 정확하게 안내합니다.",
      greeting: "안녕하세요! 송파 헤어샵 멤버십 전담 상담사입니다. 혜택 관련 문의 도와드릴게요.",
      temperature: 0.5,
      model: "GPT-4o (권장)",
      fallback: "상담원에게 연결",
      selectedKB: ["kb-3-7", "kb-3-8"],
      voiceStyle: "professional",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (한국어 여성)",
    },
    {
      id: "agent-3-3",
      name: "제품 추천 에이전트",
      persona: "시술 후 홈케어 제품을 전문적으로 추천하는 상담사입니다.",
      greeting: "안녕하세요! 시술 후 관리에 대해 궁금하신 점을 말씀해 주세요.",
      temperature: 0.6,
      model: "GPT-4o (권장)",
      fallback: "이메일 접수 안내",
      selectedKB: ["kb-3-3", "kb-3-4"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (한국어 여성)",
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Locale-aware agent data
// ─────────────────────────────────────────────────────────────────────────────

const AGENTS_BY_STORE_EN: Record<string, StoreAgent[]> = {
  "store-001": [
    {
      id: "agent-1-1",
      name: "Gangnam General Support Agent",
      persona: "A friendly and professional advisor for Gangnam Hair Salon. Quickly answers inquiries about bookings, prices, and stylists.",
      greeting: "Hello! Welcome to Gangnam Hair Salon. How can I help you?",
      temperature: 0.7,
      model: "GPT-4o (Recommended)",
      fallback: "Connect to Agent",
      selectedKB: ["kb-1-1", "kb-1-4", "kb-1-9"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (English Female)",
    },
    {
      id: "agent-1-2",
      name: "Gangnam VIP Dedicated Agent",
      persona: "Premium advisor for VIP customers. Always prioritizes and responds in a formal, professional manner.",
      greeting: "Hello, valued VIP customer. Your dedicated Gangnam AI advisor is now connected.",
      temperature: 0.4,
      model: "Claude 3.5 Sonnet",
      fallback: "Connect to VIP Dedicated Agent",
      selectedKB: ["kb-1-1", "kb-1-2", "kb-1-5", "kb-1-9"],
      voiceStyle: "formal",
      sttEngine: "OpenAI Whisper",
      ttsEngine: "ElevenLabs",
    },
    {
      id: "agent-1-3",
      name: "Booking Specialist Agent",
      persona: "Specialist for bookings, changes, and cancellations. Quickly guides available schedules.",
      greeting: "Hello! I'm your booking specialist. I can help with bookings, changes, or cancellations.",
      temperature: 0.3,
      model: "GPT-4o (Recommended)",
      fallback: "Email Submission Guidance",
      selectedKB: ["kb-1-6", "kb-1-7"],
      voiceStyle: "professional",
      sttEngine: "OpenAI Whisper",
      ttsEngine: "Google TTS (English Female)",
    },
  ],
  "store-002": [
    {
      id: "agent-2-1",
      name: "Seoul Branch General Agent",
      persona: "Advisor for Seoul Hongdae Branch. Specializes in treatment inquiries, membership passes, and claims.",
      greeting: "Hello! Welcome to Seoul Hair Salon Hongdae. How can I help you?",
      temperature: 0.7,
      model: "GPT-4o (Recommended)",
      fallback: "Connect to Agent",
      selectedKB: ["kb-2-1", "kb-2-3", "kb-2-8"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (English Female)",
    },
    {
      id: "agent-2-2",
      name: "Claims Dedicated Agent",
      persona: "Specialist for customer complaints and claims. Empathizes and quickly offers solutions.",
      greeting: "Hello. We sincerely apologize for the inconvenience. Our claims specialist is here to help.",
      temperature: 0.5,
      model: "Claude 3.5 Sonnet",
      fallback: "Connect to Manager",
      selectedKB: ["kb-2-5", "kb-2-6", "kb-2-7"],
      voiceStyle: "professional",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (English Female)",
    },
  ],
  "store-003": [
    {
      id: "agent-3-1",
      name: "Songpa Branch General Agent",
      persona: "Advisor for Songpa Hair Salon. Engages customers with a warm and friendly tone.",
      greeting: "Hello! Welcome to Songpa Hair Salon. Feel free to ask us anything!",
      temperature: 0.8,
      model: "GPT-4o (Recommended)",
      fallback: "Connect to Agent",
      selectedKB: ["kb-3-1", "kb-3-2", "kb-3-9"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (English Female)",
    },
    {
      id: "agent-3-2",
      name: "Membership & Benefits Agent",
      persona: "Specialist for membership and partner discount benefits. Provides accurate guidance on all discounts.",
      greeting: "Hello! I'm the Songpa Hair Salon membership specialist. How can I help with your benefits?",
      temperature: 0.5,
      model: "GPT-4o (Recommended)",
      fallback: "Connect to Agent",
      selectedKB: ["kb-3-7", "kb-3-8"],
      voiceStyle: "professional",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (English Female)",
    },
    {
      id: "agent-3-3",
      name: "Product Recommendation Agent",
      persona: "Specialist in recommending home-care products after salon treatments.",
      greeting: "Hello! Ask me anything about post-treatment care and product recommendations.",
      temperature: 0.6,
      model: "GPT-4o (Recommended)",
      fallback: "Email Submission Guidance",
      selectedKB: ["kb-3-3", "kb-3-4"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (English Female)",
    },
  ],
}

const AGENTS_BY_STORE_AR: Record<string, StoreAgent[]> = {
  "store-001": [
    {
      id: "agent-1-1",
      name: "وكيل دعم غانغنام الأساسي",
      persona: "مستشار ودود ومحترف لصالون غانغنام للشعر. يجيب بسرعة على استفسارات الحجز والأسعار والمصففين.",
      greeting: "مرحباً! أهلاً بك في صالون غانغنام للشعر. كيف يمكنني مساعدتك؟",
      temperature: 0.7,
      model: "GPT-4o (موصى به)",
      fallback: "التواصل مع أحد أفراد الفريق",
      selectedKB: ["kb-1-1", "kb-1-4", "kb-1-9"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (عربي أنثى)",
    },
    {
      id: "agent-1-2",
      name: "وكيل VIP المخصص لغانغنام",
      persona: "مستشار متميز لعملاء VIP. يعطي الأولوية القصوى ويتعامل بأسلوب احترافي ورسمي.",
      greeting: "مرحباً عزيزي عميل VIP. تم توصيلك بمستشار AI المخصص لصالون غانغنام.",
      temperature: 0.4,
      model: "Claude 3.5 Sonnet",
      fallback: "التواصل مع وكيل VIP المخصص",
      selectedKB: ["kb-1-1", "kb-1-2", "kb-1-5", "kb-1-9"],
      voiceStyle: "formal",
      sttEngine: "OpenAI Whisper",
      ttsEngine: "ElevenLabs",
    },
    {
      id: "agent-1-3",
      name: "وكيل الحجز المتخصص",
      persona: "متخصص في الحجوزات والتعديلات والإلغاءات. يرشد بسرعة إلى المواعيد المتاحة.",
      greeting: "مرحباً! أنا مساعد الحجز المتخصص. يمكنني مساعدتك في الحجز أو التعديل أو الإلغاء.",
      temperature: 0.3,
      model: "GPT-4o (موصى به)",
      fallback: "إرشادات تقديم البريد الإلكتروني",
      selectedKB: ["kb-1-6", "kb-1-7"],
      voiceStyle: "professional",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (عربي أنثى)",
    },
  ],
  "store-002": [
    {
      id: "agent-2-1",
      name: "وكيل فرع سيول الأساسي",
      persona: "مستشار لفرع هونغدي بسيول. متخصص في استفسارات العلاجات وبطاقات الاشتراك والمطالبات.",
      greeting: "مرحباً! أهلاً بك في صالون سيول للشعر - فرع هونغدي. كيف يمكنني مساعدتك؟",
      temperature: 0.7,
      model: "GPT-4o (موصى به)",
      fallback: "التواصل مع أحد أفراد الفريق",
      selectedKB: ["kb-2-1", "kb-2-3", "kb-2-8"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (عربي أنثى)",
    },
    {
      id: "agent-2-2",
      name: "وكيل المطالبات المخصص",
      persona: "متخصص في شكاوى العملاء والمطالبات. يتعاطف ويقدم الحلول بسرعة.",
      greeting: "مرحباً. نعتذر جداً عن الإزعاج. أخصائي المطالبات لدينا هنا لمساعدتك.",
      temperature: 0.5,
      model: "Claude 3.5 Sonnet",
      fallback: "التواصل مع المدير",
      selectedKB: ["kb-2-5", "kb-2-6", "kb-2-7"],
      voiceStyle: "professional",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (عربي أنثى)",
    },
  ],
  "store-003": [
    {
      id: "agent-3-1",
      name: "وكيل فرع سونغبا الأساسي",
      persona: "مستشار لصالون سونغبا للشعر. يتعامل مع العملاء بأسلوب دافئ وودود.",
      greeting: "مرحباً! أهلاً بك في صالون سونغبا للشعر. لا تتردد في طرح أي سؤال!",
      temperature: 0.8,
      model: "GPT-4o (موصى به)",
      fallback: "التواصل مع أحد أفراد الفريق",
      selectedKB: ["kb-3-1", "kb-3-2", "kb-3-9"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (عربي أنثى)",
    },
    {
      id: "agent-3-2",
      name: "وكيل العضوية والمزايا",
      persona: "متخصص في مزايا العضوية والشراكات. يقدم إرشادات دقيقة حول جميع الخصومات.",
      greeting: "مرحباً! أنا مختص عضوية صالون سونغبا. كيف يمكنني مساعدتك بمزاياك؟",
      temperature: 0.5,
      model: "GPT-4o (موصى به)",
      fallback: "التواصل مع أحد أفراد الفريق",
      selectedKB: ["kb-3-7", "kb-3-8"],
      voiceStyle: "professional",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (عربي أنثى)",
    },
    {
      id: "agent-3-3",
      name: "وكيل توصية المنتجات",
      persona: "متخصص في توصية منتجات العناية المنزلية بعد علاجات الصالون.",
      greeting: "مرحباً! اسألني أي شيء عن العناية بعد العلاج والمنتجات الموصى بها.",
      temperature: 0.6,
      model: "GPT-4o (موصى به)",
      fallback: "إرشادات تقديم البريد الإلكتروني",
      selectedKB: ["kb-3-3", "kb-3-4"],
      voiceStyle: "friendly",
      sttEngine: "Google STT",
      ttsEngine: "Google TTS (عربي أنثى)",
    },
  ],
}

export function getAgentsByStore(locale: string, storeId: string): StoreAgent[] {
  const map = locale === "ar" ? AGENTS_BY_STORE_AR : locale === "en" ? AGENTS_BY_STORE_EN : AGENTS_BY_STORE
  return (map[storeId] ?? map["store-001"]) as StoreAgent[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Marketing Campaigns
// ─────────────────────────────────────────────────────────────────────────────

export interface StoreCampaign {
  id: string
  name: string
  status: "active" | "paused" | "draft" | "completed" | "scheduled"
  segmentId: string
  targetType: "segment" | "all" | "custom"
  targetLabel: string
  channels: ("kakao" | "sms" | "email" | "push" | "whatsapp")[]
  messageType: "coupon" | "survey" | "revisit" | "custom"
  sentCount: number
  openRate: number
  clickRate: number
  redemptionRate: number
  scheduledAt?: string
  createdAt: string
  message: string
}

export const CAMPAIGNS_BY_STORE: Record<string, StoreCampaign[]> = {
  "store-001": [
    {
      id: "camp-1-1", name: "강남점 VIP 봄 쿠폰 발송", status: "active",
      segmentId: "seg-vip", targetType: "segment", targetLabel: "VIP 고객",
      channels: ["kakao", "sms"], messageType: "coupon",
      sentCount: 3, openRate: 100, clickRate: 67, redemptionRate: 50,
      scheduledAt: "2025-03-01T10:00:00", createdAt: "2025-02-25",
      message: "안녕하세요 {{customer_name}}님! 강남점 VIP 특별 할인 쿠폰 {{coupon_code}}을 드립니다. 이번 달 20% 할인 혜택을 누려보세요.",
    },
    {
      id: "camp-1-2", name: "부정 고객 만족도 조사", status: "active",
      segmentId: "seg-negative", targetType: "segment", targetLabel: "부정 고객",
      channels: ["email"], messageType: "survey",
      sentCount: 1, openRate: 100, clickRate: 0, redemptionRate: 0,
      createdAt: "2025-02-26",
      message: "안녕하세요 {{customer_name}}님. 지난 방문에서 불편함을 느끼셨다면 진심으로 사과드립니다. 짧은 설문에 참여해 주시면 서비스 개선에 도움이 됩니다.",
    },
    {
      id: "camp-1-3", name: "신규 고객 재방문 유도", status: "paused",
      segmentId: "seg-new", targetType: "segment", targetLabel: "신규 고객",
      channels: ["sms"], messageType: "revisit",
      sentCount: 2, openRate: 50, clickRate: 0, redemptionRate: 0,
      createdAt: "2025-02-20",
      message: "{{customer_name}}님, 첫 방문 감사합니다! 다음 방문 시 10% 할인 혜택을 드립니다.",
    },
    {
      id: "camp-1-4", name: "CS 해결 후 감사 메시지", status: "active",
      segmentId: "seg-cs-heavy", targetType: "segment", targetLabel: "CS 다발 고객",
      channels: ["kakao"], messageType: "custom",
      sentCount: 5, openRate: 80, clickRate: 20, redemptionRate: 0,
      createdAt: "2025-02-18",
      message: "{{customer_name}}님, {{cs_category}} 문의가 해결되었습니다. 추가 문의는 언제든지 연락해 주세요.",
    },
    {
      id: "camp-1-5", name: "리뷰 미작성 고객 후기 요청", status: "draft",
      segmentId: "seg-no-review", targetType: "segment", targetLabel: "리뷰 미작성",
      channels: ["sms", "email"], messageType: "survey",
      sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0,
      createdAt: "2025-02-27",
      message: "{{customer_name}}님, 방문해 주셔서 감사합니다. 소중한 후기를 남겨 주시면 음료 쿠폰을 드립니다!",
    },
  ],
  "store-002": [
    {
      id: "camp-2-1", name: "노출 교정 고객 케어 메시지", status: "active",
      segmentId: "seg-claim", targetType: "segment", targetLabel: "클레임 고객",
      channels: ["kakao"], messageType: "custom",
      sentCount: 4, openRate: 100, clickRate: 75, redemptionRate: 50,
      createdAt: "2025-02-22",
      message: "{{customer_name}}님, 이번에 불편함을 드려 죄송합니다. 20% 보상 쿠폰을 발급해 드렸습니다.",
    },
    {
      id: "camp-2-2", name: "정기권 만료 임박 알림", status: "active",
      segmentId: "seg-subscription", targetType: "segment", targetLabel: "정기권 보유 고객",
      channels: ["sms", "kakao"], messageType: "coupon",
      sentCount: 8, openRate: 88, clickRate: 50, redemptionRate: 38,
      scheduledAt: "2025-03-05T09:00:00", createdAt: "2025-02-24",
      message: "{{customer_name}}님, 정기권 만료 14일 전입니다. 지금 갱신하시면 추가 1회 무료!",
    },
    {
      id: "camp-2-3", name: "신규 샴푸 패키지 출시 안내", status: "scheduled",
      segmentId: "seg-all", targetType: "all", targetLabel: "전체 고객",
      channels: ["kakao", "push"], messageType: "custom",
      sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0,
      scheduledAt: "2025-03-10T10:00:00", createdAt: "2025-02-28",
      message: "{{customer_name}}님! 두피 케어 샴푸 패키지가 출시되었습니다. 출시 기념 10% 할인 적용 중!",
    },
  ],
  "store-003": [
    {
      id: "camp-3-1", name: "중복결제 피해 고객 보상", status: "completed",
      segmentId: "seg-refund", targetType: "segment", targetLabel: "환불 고객",
      channels: ["kakao", "sms"], messageType: "coupon",
      sentCount: 6, openRate: 100, clickRate: 83, redemptionRate: 67,
      createdAt: "2025-02-20",
      message: "{{customer_name}}님, 이중 결제로 불편을 드려 죄송합니다. 다음 방문 30% 할인 쿠폰 {{coupon_code}}을 드립니다.",
    },
    {
      id: "camp-3-2", name: "신규 고객 멤버십 가입 유도", status: "active",
      segmentId: "seg-new", targetType: "segment", targetLabel: "신규 고객",
      channels: ["sms"], messageType: "revisit",
      sentCount: 3, openRate: 67, clickRate: 33, redemptionRate: 33,
      createdAt: "2025-02-23",
      message: "{{customer_name}}님, 멤버십 가입 시 즉시 실버 등급으로 5% 할인 혜택을 받으세요!",
    },
    {
      id: "camp-3-3", name: "VIP 전담 디자이너 배정 안내", status: "active",
      segmentId: "seg-vip", targetType: "segment", targetLabel: "VIP 고객",
      channels: ["kakao"], messageType: "custom",
      sentCount: 2, openRate: 100, clickRate: 100, redemptionRate: 50,
      createdAt: "2025-02-25",
      message: "{{customer_name}}님, VIP 등급 달성을 축하합니다! 이제 전담 디자이너가 배정됩니다.",
    },
    {
      id: "camp-3-4", name: "제품 추천 후속 메시지", status: "draft",
      segmentId: "seg-all", targetType: "all", targetLabel: "전체 고객",
      channels: ["email", "push"], messageType: "custom",
      sentCount: 0, openRate: 0, clickRate: 0, redemptionRate: 0,
      createdAt: "2025-02-28",
      message: "{{customer_name}}님, 시술 후 케어에 딱 맞는 제품을 추천해 드릴게요. 앱에서 확인하세요!",
    },
  ],
}
