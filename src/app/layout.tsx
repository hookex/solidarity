import './globals.css'
import { Inter } from 'next/font/google'
import { Footer } from './components/Footer/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI 搜索',
  description: 'AI 搜索服务',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={`${inter.className} overscroll-none touch-pan-y`} style={{ overscrollBehavior: 'none' }}>
        {children}
        <Footer />
      </body>
    </html>
  )
}
