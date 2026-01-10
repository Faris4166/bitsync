import React from 'react'
import Dashboard from './dashboard'

export const metadata = {
  title: 'แดชบอร์ด | Bitsync',
}

export default function HomeUserPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="w-full">
        <Dashboard />
      </div>
    </div>
  )
}
