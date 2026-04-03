import { NextRequest, NextResponse } from "next/server"

const GEMINI_MODEL = "gemini-2.5-flash"

export async function POST(req: NextRequest) {
  try {
    const { messages, customerName, channel, locale } = await req.json()

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
    }

    // Build conversation history for Gemini to respond AS THE CUSTOMER:
    // - agent/bot messages → "user" role (the "prompt" side Gemini sees)
    // - customer messages  → "model" role (what Gemini has already said as the customer)
    const rawHistory = messages
      .filter((m: any) => m.sender !== "system" && m.content)
      .map((msg: any) => ({
        role: msg.sender === "customer" ? "model" : "user",
        text: msg.content as string,
      }))

    // Merge consecutive same-role turns (Gemini requires strict alternation)
    const conversationHistory: { role: string; parts: { text: string }[] }[] = []
    for (const turn of rawHistory) {
      const last = conversationHistory[conversationHistory.length - 1]
      if (last && last.role === turn.role) {
        last.parts[0].text += "\n" + turn.text
      } else {
        conversationHistory.push({ role: turn.role, parts: [{ text: turn.text }] })
      }
    }

    // Gemini requires conversation to start with a "user" turn
    if (conversationHistory.length === 0 || conversationHistory[0].role !== "user") {
      conversationHistory.unshift({ role: "user", parts: [{ text: "안녕하세요" }] })
    }

    // Gemini plays the CUSTOMER role — responding naturally to what the agent/bot just said
    const systemPrompt =
      locale === "ar"
        ? `أنت عميل اسمك ${customerName}، تتواصل مع خدمة العملاء عبر ${channel}.
رد بشكل طبيعي كعميل حقيقي. قواعد صارمة:
- أنت لستَ موظف خدمة عملاء. أنت العميل.
- إذا حلّ الموظف مشكلتك، أظهر ارتياحك وأنهِ المحادثة بشكل طبيعي
- إذا لم تُحل المشكلة، اسأل للمتابعة أو وضّح طلبك أكثر
- في حالات نادرة فقط (أقل من 40%) اطلب التحدث مع موظف بشري
- جملة أو جملتان فقط، بأسلوب محادثة طبيعي`
        : locale === "ko"
        ? `당신은 "${customerName}"이라는 고객입니다. ${channel} 채널로 고객센터에 문의 중입니다.
당신은 상담사가 아니라 고객입니다. 중요 규칙:
- 상담사가 문제를 해결해줬다면 자연스럽게 마무리하세요 (예: "감사합니다, 해결됐네요!")
- 아직 해결이 안 됐다면 추가로 질문하거나 불만을 구체적으로 표현하세요
- 사람 상담원 연결 요청은 정말 필요할 때만 (40% 미만)
- 1~2문장으로 짧고 자연스럽게 고객처럼 답하세요. 상담사 말투 절대 금지.`
        : `You are a customer named ${customerName}, contacting support via ${channel}.
You are NOT the support agent — you are the customer. Strict rules:
- If the agent resolved your issue, wrap up naturally (e.g. "Oh great, that makes sense, thanks!")
- If the issue isn't resolved, follow up with a specific question or express frustration
- Only ask for a human agent in rare cases (<40%), when genuinely unsatisfied
- Reply as a real person: 1-2 sentences, casual conversational tone, no formal language`

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
          topP: 0.95,
          topK: 40,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Gemini API error:", JSON.stringify(errorData))
      return NextResponse.json({ error: "Gemini API error", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Sorry, I couldn't generate a response."

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error("[v0] Gemini route error:", error)
    return NextResponse.json({ error: "Failed to generate response", message: error.message }, { status: 500 })
  }
}
