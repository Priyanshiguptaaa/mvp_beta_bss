import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/layout/Sidebar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EchoSysAI - AI Model RCA System",
  description: "Detect AI model failures, perform automated Root Cause Analysis, and get actionable insights.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-white min-h-screen"}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-white">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
} 