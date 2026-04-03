import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
  }

  const { customerName, subject, locale } = await req.json()

  const systemInstruction =
    locale === "ar"
      ? `أنت عميل اسمك ${customerName} تتصل بخدمة العملاء بشأن: "${subject}". عندما تسمع أي شيء، ابدأ فوراً بالتحدث — قل "مرحباً" واشرح مشكلتك في جملة أو جملتين. أنت لست موظف دعم، أنت العميل. استخدم جملاً قصيرة وطبيعية.`
      : locale === "ko"
      ? `당신은 "${customerName}"라는 고객으로, "${subject}" 문제로 고객센터에 전화했습니다. 상대방이 말하면 즉시 먼저 "안녕하세요"라고 인사하고 바로 문제를 설명하세요. 당신은 상담사가 아닌 고객입니다. 짧고 자연스러운 한국어로 대화하세요.`
      : `You are ${customerName}, a customer calling support about: "${subject}". As soon as you hear anything, immediately start speaking — say "Hi" or "Hello" and explain your issue in 1-2 sentences. You are the CUSTOMER, not the agent. Keep replies short and natural.`

  const model = "gemini-2.0-flash-live-001"

  console.log("[v0] Returning API key token for model:", model)

  // Pass the raw API key — used as ?key= in the WebSocket URL
  return NextResponse.json({ token: apiKey, model, systemInstruction })
}
