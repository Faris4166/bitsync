'use client'

import HistoryTable from './history-table'
import { useLanguage } from '@/components/language-provider'
import { History } from 'lucide-react'

export default function HistoryPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t('history.title')}</h1>
        <p className="text-sm font-medium text-muted-foreground">{t('history.subtitle')}</p>
      </div>

      <div className="w-full">
        <HistoryTable />
      </div>
    </div>
  )
}
