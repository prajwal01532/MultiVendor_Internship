import { Geist, Geist_Mono } from 'next/font/google'
import { ModuleProvider } from '../components/context/ModuleContext'
import { ModuleDetector } from '../components/ModuleDetector'
import { metadata } from './metadata'
import NavbarController from '@/components/navigation/NavbarController'
import ModuleNav from '@/components/navigation/ModuleNav'
import "./globals.css"
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export { metadata }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ModuleProvider>
        <body className=''>
          
         
         
          
          <main>{children}</main>
          <Toaster position="top-right" />
        </body>
      </ModuleProvider>
    </html>
  )
}