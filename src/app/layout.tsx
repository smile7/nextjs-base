import type { Metadata } from 'next'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { fontVariables } from '@/config/fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Site Starter',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="bg" className={fontVariables}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  )
}
