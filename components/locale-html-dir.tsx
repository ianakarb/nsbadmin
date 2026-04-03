"use client"

import { useEffect } from "react"
import { useLocale } from "@/lib/locale"

/**
 * Syncs the <html> dir attribute with the current locale.
 * Place this inside the LocaleProvider in layout.
 */
export function LocaleHtmlDir() {
  const { isRTL, locale } = useLocale()

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute("dir", isRTL ? "rtl" : "ltr")
    html.setAttribute("lang", locale === "ar" ? "ar" : locale === "en" ? "en" : "ko")

    // Toggle body class so CSS can flip the app-main flex direction
    if (isRTL) {
      document.body.classList.add("rtl-layout")
    } else {
      document.body.classList.remove("rtl-layout")
    }
  }, [isRTL, locale])

  return null
}
