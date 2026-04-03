import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LocaleProvider } from '@/lib/locale'
import { LocaleHtmlDir } from '@/components/locale-html-dir'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Naver-Saudi Place Platform',
  description: 'Naver-Saudi Place Platform — Omnichannel customer engagement for Saudi Arabia',
  generator: 'v0.app',
  openGraph: {
    title: 'Naver-Saudi Place Platform',
    description: 'Naver-Saudi Place Platform — Omnichannel customer engagement for Saudi Arabia',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Naver-Saudi Place Platform',
    description: 'Naver-Saudi Place Platform — Omnichannel customer engagement for Saudi Arabia',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <LocaleProvider>
          <LocaleHtmlDir />
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
