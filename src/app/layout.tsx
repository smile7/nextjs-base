import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Site Starter',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  )
}
