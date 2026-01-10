import React from 'react'
import HistoryTable from './history-table'
import { History } from 'lucide-react'

export const metadata = {
  title: 'ประวัติใบเสร็จ | Bitsync',
}

export default function HistoryPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-sm font-medium text-muted-foreground">Review and manage all your past receipts and sales.</p>
      </div>

      <div className="w-full">
        <HistoryTable />
      </div>
    </div>
  )
}
