import React from 'react'
import HistoryTable from './history-table'
import { History } from 'lucide-react'

export const metadata = {
  title: 'ประวัติใบเสร็จ | Bitsync',
}

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ประวัติใบเสร็จ</h1>
          <p className="text-muted-foreground">ตรวจสอบและจัดการใบเสร็จที่เคยออกทั้งหมด</p>
        </div>
      </div>

      <HistoryTable />
    </div>
  )
}
