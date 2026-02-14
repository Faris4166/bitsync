'use client'

import React from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import type { Layout } from 'react-grid-layout'
import { DashboardItem, ChartType } from './dashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Settings2, Trash2, Plus, LayoutGrid, Palette, BarChart3,
    PieChart, LineChart as LineIcon, AreaChart as AreaIcon,
    Type, GripVertical, Sparkles, TrendingUp, BarChart2, LayoutDashboard,
    Check, ChevronUp, ChevronDown, Activity, Target, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
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

const ChartItemSettings = ({ item, onUpdate, t, months }: {
    item: DashboardItem,
    onUpdate: (updates: Partial<DashboardItem>) => void,
    t: any,
    months: { val: number, label: string }[]
}) => {
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border/50">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                >
                    {showAdvanced ? t('dashboard.hide_advanced') : t('dashboard.advanced_settings')}
                    {showAdvanced ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('dashboard.chart_color')}</span>
                    <input
                        type="color"
                        value={item.color}
                        onChange={(e) => onUpdate({ color: e.target.value })}
                        className="h-6 w-12 p-0 border-0 rounded-md cursor-pointer bg-transparent"
                    />
                </div>
            </div>

            {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.chart_title')}</Label>
                        <Input
                            value={item.title}
                            onChange={(e) => onUpdate({ title: e.target.value })}
                            className="h-8 rounded-xl text-xs bg-muted/40 border-0 focus-visible:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.chart_metric')}</Label>
                        <Select
                            value={item.metric}
                            onValueChange={(val) => onUpdate({ metric: val as any })}
                        >
                            <SelectTrigger className="h-8 rounded-xl text-xs bg-muted/40 border-0 focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl border-primary/10">
                                <SelectItem value="total">{t('dashboard.total_income')}</SelectItem>
                                <SelectItem value="products">{t('dashboard.product_income')}</SelectItem>
                                <SelectItem value="labor">{t('dashboard.labor_income')}</SelectItem>
                                <SelectItem value="count">{t('dashboard.receipt_count')}</SelectItem>
                                <SelectItem value="aov">{t('dashboard.aov')}</SelectItem>
                                <SelectItem value="retention">{t('dashboard.retention')}</SelectItem>
                                <SelectItem value="peak_hours">{t('dashboard.peak_hours')}</SelectItem>
                                <SelectItem value="low_stock">{t('dashboard.low_stock')}</SelectItem>
                                <SelectItem value="inventory_value">{t('dashboard.inventory_value')}</SelectItem>
                                <SelectItem value="category">{t('dashboard.category')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 col-span-2">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.comparison')}</Label>
                            <Select
                                value={item.compareType || 'none'}
                                onValueChange={(val) => onUpdate({ compareType: val as any })}
                            >
                                <SelectTrigger className="h-8 rounded-xl text-xs bg-muted/40 border-0 focus:ring-primary/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-2xl border-primary/10">
                                    <SelectItem value="none">{t('dashboard.none')}</SelectItem>
                                    <SelectItem value="month">{t('dashboard.month_to_month')}</SelectItem>
                                    <SelectItem value="products">{t('dashboard.top_products')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {item.compareType === 'month' && (
                        <div className="grid grid-cols-2 gap-4 col-span-2 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.select_month')}</Label>
                                <Select
                                    value={(item.compareMonth1 ?? 0).toString()}
                                    onValueChange={(v) => onUpdate({ compareMonth1: parseInt(v) })}
                                >
                                    <SelectTrigger className="h-8 rounded-xl text-xs bg-muted/40 border-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-2xl border-primary/10">
                                        {months.map(m => (
                                            <SelectItem key={m.val} value={m.val.toString()}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.compare_with')}</Label>
                                <Select
                                    value={(item.compareMonth2 ?? 1).toString()}
                                    onValueChange={(v) => onUpdate({ compareMonth2: parseInt(v) })}
                                >
                                    <SelectTrigger className="h-8 rounded-xl text-xs bg-muted/40 border-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-2xl border-primary/10">
                                        {months.map(m => (
                                            <SelectItem key={m.val} value={m.val.toString()}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

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
            y: Infinity,
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
        pie: <PieChart className="h-4 w-4" />,
        line: <LineIcon className="h-4 w-4" />,
        stat: <LayoutGrid className="h-4 w-4" />,
        radar: <Activity className="h-4 w-4" />,
        radial: <Target className="h-4 w-4" />,
    }

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <div className="space-y-6">
                    {/* Template Gallery */}
                    <div className="bg-primary/5 rounded-3xl border border-primary/10 overflow-hidden">
                        <div className="p-6 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">{t('dashboard.templates')}</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold">{t('dashboard.why_this_chart')}</p>
                                </div>
                            </div>
                            <Button variant="default" onClick={onClose} className="rounded-2xl px-8 font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                                DONE
                            </Button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { id: 'temp-1', metric: 'total', type: 'area', title: t('dashboard.template_sales_growth'), desc: t('dashboard.best_for_trends'), color: '#3b82f6', icon: <TrendingUp className="h-5 w-5" /> },
                                { id: 'temp-2', metric: 'category', type: 'pie', title: t('dashboard.template_cat_split'), desc: t('dashboard.best_for_composition'), color: '#ec4899', icon: <PieChart className="h-5 w-5" /> },
                                { id: 'temp-3', metric: 'total', type: 'bar', title: t('dashboard.rec_comparison_title'), desc: t('dashboard.best_for_comparison'), color: '#8b5cf6', icon: <BarChart2 className="h-5 w-5" />, forceCompare: true },
                                { id: 'temp-4', metric: 'inventory_value', type: 'stat', title: t('dashboard.inventory_value'), desc: t('dashboard.best_for_metrics'), color: '#10b981', icon: <LayoutDashboard className="h-5 w-5" /> },
                                { id: 'temp-5', metric: 'category', type: 'radar', title: t('dashboard.template_multi_cat'), desc: t('dashboard.template_multi_cat_desc'), color: '#f59e0b', icon: <Activity className="h-5 w-5" /> },
                                { id: 'temp-6', metric: 'total', type: 'radial', title: t('dashboard.template_goal_progress'), desc: t('dashboard.template_goal_progress_desc'), color: '#06b6d4', icon: <Target className="h-5 w-5" /> },
                            ].map(temp => {
                                const exists = layout.some(l => l.metric === temp.metric && l.type === temp.type && (temp.forceCompare ? l.compareType === 'month' : true));
                                return (
                                    <button
                                        key={temp.id}
                                        disabled={exists}
                                        onClick={() => {
                                            const id = `item-${Date.now()}`;
                                            const now = new Date();
                                            const currentMonth = now.getMonth();
                                            const prevMonth = (currentMonth - 1 + 12) % 12;

                                            onLayoutChange([...layout, {
                                                id,
                                                type: temp.type as any,
                                                title: temp.title,
                                                color: temp.color,
                                                metric: temp.metric as any,
                                                x: 0, y: Infinity,
                                                w: temp.type === 'stat' ? 3 : temp.forceCompare ? 6 : 4,
                                                h: temp.type === 'stat' ? 2 : 4,
                                                compareType: temp.forceCompare ? 'month' : 'none',
                                                compareMonth1: currentMonth,
                                                compareMonth2: prevMonth
                                            }]);
                                        }}
                                        className={`group relative flex flex-col text-left p-5 rounded-2xl transition-all duration-300 border-2 ${exists ? 'bg-muted/50 border-transparent opacity-50 cursor-not-allowed' : 'bg-card border-transparent hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${temp.color}15`, color: temp.color }}>
                                                {temp.icon}
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-tighter leading-tight">{temp.title}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-muted-foreground leading-relaxed">{temp.desc}</p>
                                        {exists && (
                                            <div className="absolute top-2 right-2 p-1 bg-primary/20 rounded-full">
                                                <Check className="h-3 w-3 text-primary" />
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            ADD NOW <Plus className="h-3 w-3" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Guide */}
                    <div className="flex flex-wrap items-center gap-4 text-[10px] bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <div className="flex-1 flex items-center gap-2">
                            <p className="font-black text-muted-foreground uppercase tracking-widest mr-2">Advanced:</p>
                            <Button variant="outline" size="sm" onClick={() => addItem('stat')} className="rounded-xl border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 font-bold transition-all">
                                <Plus className="mr-1 h-3 w-3" /> Custom Stat
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => addItem('area')} className="rounded-xl font-bold transition-all">
                                <Plus className="mr-1 h-3 w-3" /> Custom Area
                            </Button>
                        </div>

                        {/* Magic AI Button */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white font-black shadow-lg shadow-violet-500/20 border-0">
                                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                    MAGIC AI
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] rounded-3xl border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
                                <MagicAiHandler onGenerate={(item) => onLayoutChange([...layout, item])} t={t} layout={layout} />
                            </DialogContent>
                        </Dialog>
                    </div>
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
                        <Card className="h-full rounded-2xl border border-primary/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] bg-card/60 backdrop-blur-md group overflow-hidden stat-card transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1 relative">
                            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-t-lg border-b border-border/50 relative z-20">
                                <div className="drag-handle flex items-center gap-2 cursor-move flex-1 min-w-0">
                                    <GripVertical className="h-4 w-4 text-muted-foreground/50 mr-1 shrink-0" />
                                    {chartIcons[item.type]}
                                    <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[120px]">{item.title}</span>
                                    <span className="text-[8px] px-1.5 py-0.5 h-3 leading-none opacity-50 bg-secondary text-secondary-foreground rounded-full font-bold shrink-0">{item.type}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg hover:bg-primary/10 relative z-10"
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onTouchStart={(e) => e.stopPropagation()}
                                            >
                                                <Settings2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] rounded-3xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-sm font-black uppercase tracking-widest">{t('dashboard.config_chart')}</DialogTitle>
                                                <DialogDescription>{t('dashboard.subtitle')}</DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <ChartItemSettings
                                                    item={item}
                                                    onUpdate={(updates) => updateItem(item.id, updates)}
                                                    t={t}
                                                    months={months}
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive relative z-10"
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                                <div className="p-4 rounded-full bg-primary/5 text-primary/40 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary/60 transition-all duration-500">
                                    {React.cloneElement(chartIcons[item.type] as React.ReactElement<{ className: string }>, { className: "h-8 w-8" })}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">{t(`dashboard.${item.metric as any}`)}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground/40 mt-0.5">
                                        {item.compareType === 'month' ? `Comparison: ${months.find(m => m.val === item.compareMonth1)?.label} vs ${months.find(m => m.val === item.compareMonth2)?.label}` :
                                            item.compareType === 'products' ? 'Top Items View' : 'Standard View'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    )
}

function MagicAiHandler({ onGenerate, t, layout }: { onGenerate: (item: DashboardItem) => void, t: any, layout: DashboardItem[] }) {
    const [prompt, setPrompt] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    // Import server action dynamically to avoid build issues if not present yet
    const generateChartIndex = async () => {
        if (!prompt.trim()) return
        setIsLoading(true)
        setError('')
        try {
            const { generateChartConfig } = await import('@/app/actions/ai')
            const config = await generateChartConfig(prompt, layout, 'en') // Defaulting to EN for config generation context, or use language prop

            if (config) {
                const id = `item-${Date.now()}`
                const newItem: DashboardItem = {
                    id,
                    ...config,
                    x: 0,
                    y: Infinity,
                    w: config.type === 'stat' ? 3 : 4,
                    h: config.type === 'stat' ? 2 : 4
                }
                onGenerate(newItem)
                setPrompt('')
                // Close dialog implicitly by parent if needed, or show success
                toast.success(t('dashboard.ai_chart_created'))
            } else {
                setError('Could not generate chart. Please try a different description.')
            }
        } catch (err) {
            console.error(err)
            setError('AI Service unavailable.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 bg-linear-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4 animate-pulse">
                    <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600">
                    Magic AI Chart
                </h3>
                <p className="text-muted-foreground text-xs font-medium">
                    {t('dashboard.ai_chart_desc')}
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Describe your chart</Label>
                    <textarea
                        className="w-full h-24 rounded-xl bg-muted/30 border-border/50 p-4 text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                        placeholder="e.g., Show me a pie chart of top selling products..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                generateChartIndex()
                            }
                        }}
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-xs font-bold bg-red-500/10 p-2 rounded-lg text-center">
                        {error}
                    </p>
                )}

                <Button
                    className="w-full rounded-xl h-12 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 font-bold text-white shadow-lg shadow-violet-500/25"
                    onClick={generateChartIndex}
                    disabled={isLoading || !prompt.trim()}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Magic...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Chart
                        </>
                    )}
                </Button>
            </div>

            <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                    {["Pie chart of categories", "Red bar chart for total revenue", "Stat card for low stock"].map(ex => (
                        <button
                            key={ex}
                            className="bg-background border border-border/50 rounded-lg px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-violet-500/30 transition-colors"
                            onClick={() => setPrompt(ex)}
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
