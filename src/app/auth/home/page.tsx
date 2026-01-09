import React from 'react'
import Dashboard from './dashboard'

export const metadata = {
  title: 'แดชบอร์ด | Bitsync',
}

export default function HomeUserPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full py-8 md:py-12 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <Dashboard />
      </div>
    </div>
  )
}
