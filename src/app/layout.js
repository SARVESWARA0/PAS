import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata = {
  title: "My Website",
  description: "A simple website",
  // Removed viewport property
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <main className="min-h-screen min-w-screen">{children}</main>
      </body>
    </html>
  )
}

