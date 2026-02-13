'use client'

import React from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import type { Layout } from 'react-grid-layout'
import { DashboardItem, ChartType } from './dashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings2, Trash2, Plus, LayoutGrid, Palette, BarChart3, PieChartIcon, LineChart as LineIcon, AreaChart as AreaIcon, Type, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/components/language-provider'

interface DashboardEditorProps {
    layout: DashboardItem[]
    onLayoutChange: (newItems: DashboardItem[]) => void
    onClose: () => void
    hideHeader?: boolean
}

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function DashboardEditor({ layout, onLayoutChange, onClose, hideHeader }: DashboardEditorProps) {
    const { t } = useLanguage()

    const months = [
        { val: 0, label: t('dashboard.jan') },
        { val: 1, label: t('dashboard.feb') },
        { val: 2, label: t('dashboard.mar') },
        { val: 3, label: t('dashboard.apr') },
        { val: 4, label: t('dashboard.may') },
        { val: 5, label: t('dashboard.jun') },
        { val: 6, label: t('dashboard.jul') },
        { val: 7, label: t('dashboard.aug') },
        { val: 8, label: t('dashboard.sep') },
        { val: 9, label: t('dashboard.oct') },
        { val: 10, label: t('dashboard.nov') },
        { val: 11, label: t('dashboard.dec') },
    ]
    const handleLayoutChange = (newLayout: readonly any[]) => {
        const updatedItems = layout.map(item => {
            const layoutItem = newLayout.find(l => l.i === item.id)
            if (layoutItem) {
                return {
                    ...item,
                    x: layoutItem.x,
                    y: layoutItem.y,
                    w: layoutItem.w,
                    h: layoutItem.h
                }
            }
            return item
        })
        onLayoutChange(updatedItems)
    }

    const addItem = (type: ChartType) => {
        const id = `item-${Date.now()}`
        const newItem: DashboardItem = {
            id,
            type,
            title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            color: '#3b82f6',
            metric: 'total',
            x: 0,
            y: Infinity, // Add at the bottom
            w: type === 'stat' ? 3 : 4,
            h: type === 'stat' ? 2 : 4
        }
        onLayoutChange([...layout, newItem])
    }

    const removeItem = (id: string) => {
        onLayoutChange(layout.filter(i => i.id !== id))
    }

    const updateItem = (id: string, updates: Partial<DashboardItem>) => {
        onLayoutChange(layout.map(item => item.id === id ? { ...item, ...updates } : item))
    }

    const chartIcons = {
        area: <AreaIcon className="h-4 w-4" />,
        bar: <BarChart3 className="h-4 w-4" />,
        pie: <PieChartIcon className="h-4 w-4" />,
        line: <LineIcon className="h-4 w-4" />,
        stat: <LayoutGrid className="h-4 w-4" />,
    }

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => addItem('stat')} className="rounded-xl border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500">
                            <Plus className="mr-1 h-4 w-4" /> Stat
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addItem('area')} className="rounded-xl">
                            <Plus className="mr-1 h-4 w-4" /> Area
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addItem('bar')} className="rounded-xl">
                            <Plus className="mr-1 h-4 w-4" /> Bar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addItem('line')} className="rounded-xl">
                            <Plus className="mr-1 h-4 w-4" /> Line
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addItem('pie')} className="rounded-xl">
                            <Plus className="mr-1 h-4 w-4" /> Pie
                        </Button>
                    </div>
                    <Button variant="default" onClick={onClose} className="rounded-xl px-6 shadow-lg shadow-primary/20">
                        Done Customizing
                    </Button>
                </div>
            )}

            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout.map(i => ({ i: i.id, x: i.x, y: i.y, w: i.w, h: i.h })) }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                draggableHandle=".drag-handle"
                onLayoutChange={(current) => handleLayoutChange(current)}
                margin={[20, 20]}
            >
                {layout.map(item => (
                    <div key={item.id} className="relative group">
                        <Card className="h-full border-2 border-dashed border-primary/20 bg-muted/5 flex flex-col">
                            <div className="drag-handle flex items-center justify-between p-3 cursor-move bg-muted/40 rounded-t-lg border-b border-border/50">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground/50 mr-1" />
                                    {chartIcons[item.type]}
                                    <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[120px]">{item.title}</span>
                                    <span className="text-[8px] px-1.5 py-0.5 h-3 leading-none opacity-50 bg-secondary text-secondary-foreground rounded-full font-bold">{item.type}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10">
                                                <Settings2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>{t('dashboard.config_chart')}</DialogTitle>
                                                <DialogDescription>{t('dashboard.subtitle')}</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-6 py-4">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2"><Type className="h-4 w-4" /> {t('common.name')}</Label>
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Metric</Label>
                                                    <Select
                                                        value={item.metric}
                                                        onValueChange={(v: any) => updateItem(item.id, { metric: v })}
                                                    >
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="total">{t('dashboard.total_income')}</SelectItem>
                                                            <SelectItem value="products">{t('dashboard.product_income')}</SelectItem>
                                                            <SelectItem value="labor">{t('dashboard.labor_income')}</SelectItem>
                                                            <SelectItem value="count">{t('dashboard.receipt_count')}</SelectItem>
                                                            <SelectItem value="aov">{t('dashboard.aov')}</SelectItem>
                                                            <SelectItem value="retention">{t('dashboard.retention')}</SelectItem>
                                                            <SelectItem value="peak_hours">{t('dashboard.peak_hours')}</SelectItem>
                                                            <SelectItem value="low_stock">{t('dashboard.low_stock')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-4 pt-2 border-t">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('dashboard.compare_mode')}</Label>
                                                    <Select
                                                        value={item.compareType || 'none'}
                                                        onValueChange={(v: any) => updateItem(item.id, { compareType: v })}
                                                    >
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="none">{t('dashboard.none')}</SelectItem>
                                                            <SelectItem value="month">{t('dashboard.month_to_month')}</SelectItem>
                                                            <SelectItem value="products">{t('dashboard.top_products')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {item.compareType === 'month' && (
                                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">{t('dashboard.select_month')}</Label>
                                                            <Select
                                                                value={(item.compareMonth1 ?? 0).toString()}
                                                                onValueChange={(v) => updateItem(item.id, { compareMonth1: parseInt(v) })}
                                                            >
                                                                <SelectTrigger className="rounded-xl h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl">
                                                                    {months.map(m => (
                                                                        <SelectItem key={m.val} value={m.val.toString()}>{m.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">{t('dashboard.compare_with')}</Label>
                                                            <Select
                                                                value={(item.compareMonth2 ?? 1).toString()}
                                                                onValueChange={(v) => updateItem(item.id, { compareMonth2: parseInt(v) })}
                                                            >
                                                                <SelectTrigger className="rounded-xl h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl">
                                                                    {months.map(m => (
                                                                        <SelectItem key={m.val} value={m.val.toString()}>{m.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> {t('settings.theme_color')}</Label>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {['#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#f43f5e', '#22c55e'].map(c => (
                                                            <button
                                                                key={c}
                                                                className={cn(
                                                                    "h-7 w-7 rounded-full border-2 transition-all",
                                                                    item.color === c ? "border-primary scale-110 shadow-sm" : "border-transparent opacity-80"
                                                                )}
                                                                style={{ backgroundColor: c }}
                                                                onClick={() => updateItem(item.id, { color: c })}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="text-center opacity-40">
                                    {chartIcons[item.type]}
                                    <p className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.type} Preview</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    )
}
