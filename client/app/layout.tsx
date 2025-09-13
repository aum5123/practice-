import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Slack Clone - Team Chat Application',
  description: 'A real-time team chat application built with Next.js and WebSockets',
  keywords: ['chat', 'team', 'real-time', 'websocket', 'slack-clone'],
  authors: [{ name: 'Fullstack Engineer' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
