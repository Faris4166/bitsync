'use client'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import React, { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    TrendingUp,
    Users,
    CreditCard,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Package,
    Wrench,
    LayoutDashboard,
    Plus,
    Settings2,
    Eye,
    BarChart3,
    PieChartIcon,
    LineChart as LineIcon,
    AreaChart as AreaIcon,
    Type,
    LayoutGrid,
    Save,
    DollarSign,
    AlertTriangle,
    Activity,
    Target,
    Sparkles,
    Trash2,
    Palette,
    BarChart2,
    Check,
    ChevronUp,
    ChevronDown,
    GripVertical,
    RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'
import DashboardEditor from './dashboard-editor'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage as useLanguageT } from '@/components/language-provider'
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Pie,
    PieChart,
    Cell,
    Label as RechartsLabel,
    Bar,
    BarChart,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
    LineChart,
    Line
} from 'recharts'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { generateTradingInsight, AiInsight } from '@/app/actions/ai'

const ResponsiveGridLayout = WidthProvider(Responsive)

export type Receipt = {
    id: string
    total_amount: number
    labor_cost: number
    subtotal: number
    customer_name: string
    customer_phone?: string
    created_at: string
}

export type ChartType = 'area' | 'bar' | 'pie' | 'line' | 'stat' | 'radar' | 'radial'

export type DashboardItem = {
    id: string
    type: 'area' | 'bar' | 'pie' | 'line' | 'radar' | 'radial' | 'stat'
    title: string
    desc: string
    metric: 'total' | 'products' | 'labor' | 'count' | 'aov' | 'retention' | 'low_stock' | 'peak_hours' | 'inventory_value' | 'category'
    x: number
    y: number
    w: number
    h: number
    compareType?: 'none' | 'month' | 'products'
    compareMonth1?: number
    compareMonth2?: number
    color?: string // For custom override
    limit?: number // Top N items
    timeRange?: string // '7d', '30d', '90d', 'all' override
    sortBy?: 'value' | 'label' | 'date'
}

export function useChartConfig() {
    const { t } = useLanguage();
    return {
        income: {
            label: t('dashboard.total_income'),
            color: "#3b82f6", // Blue
        },
        products: {
            label: t('dashboard.products'),
            color: "#10b981", // Emerald
        },
        labor: {
            label: t('dashboard.labor'),
            color: "#f59e0b", // Amber
        },
    } satisfies ChartConfig
}

import useSWR from 'swr'

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Dashboard() {
    const { t, language } = useLanguage()
    const chartConfig = useChartConfig()
    const { data: receiptsData, error, isLoading: swrLoading } = useSWR<Receipt[]>('/api/receipts', fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

    const { data: profileData, mutate: mutateProfile } = useSWR('/api/profile', fetcher)
    const { data: productsData = [] } = useSWR<any[]>('/api/products', fetcher)

    const [isExporting, setIsExporting] = useState(false)
    const dashboardRef = useRef<HTMLDivElement>(null)
    const [dateRange, setDateRange] = useState('30d')
    const [isEditMode, setIsEditMode] = useState(false)
    const [layout, setLayout] = useState<DashboardItem[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [aiInsight, setAiInsight] = useState<AiInsight | null>(null)
    const [loadingInsight, setLoadingInsight] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const [autoChatQuery, setAutoChatQuery] = useState('')
    const [quotaCooldown, setQuotaCooldown] = useState(0)

    // Quota Cooldown Timer
    useEffect(() => {
        if (quotaCooldown > 0) {
            const timer = setInterval(() => {
                setQuotaCooldown(prev => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [quotaCooldown])



    useEffect(() => {
        setMounted(true)
    }, [])

    const refreshInsight = async () => {
        if (quotaCooldown > 0) return

        setLoadingInsight(true)
        try {
            const data = await generateTradingInsight(receiptsData || [], dateRange, language === 'th' ? 'th' : 'en')
            setAiInsight(data)

            // Cache the successful result
            if (data && data.trend) {
                const cacheKey = `bitsync_ai_insight_${dateRange}_${new Date().toDateString()}`
                localStorage.setItem(cacheKey, JSON.stringify(data))
            }
        } catch (err: any) {
            console.error("AI Insight Fetch Error:", err)
            const isRateLimit = err.message?.includes('429') || err.message?.includes('Quota') || err.status === 429

            if (isRateLimit) {
                setQuotaCooldown(60) // Lock for 60 seconds
                toast.error(language === 'th' ? 'โควตาเต็ม กรุณารอสักครู่' : 'Quota exceeded, please wait')
            }
        } finally {
            setLoadingInsight(false)
        }
    }

    useEffect(() => {
        if (mounted && receiptsData && receiptsData.length > 0) {
            // Check cache first to avoid hitting API rate limits
            const cacheKey = `bitsync_ai_insight_${dateRange}_${new Date().toDateString()}`
            const cached = localStorage.getItem(cacheKey)

            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    setAiInsight(parsed)
                    setLoadingInsight(false)
                    return
                } catch (e) {
                    localStorage.removeItem(cacheKey)
                }
            }
            // Auto-fetch REMOVED. User must click to generate.
            setLoadingInsight(false)
        }
    }, [receiptsData, dateRange, language, mounted])

    // Load layout from profile
    useEffect(() => {
        if (profileData?.dashboard_config) {
            setLayout(profileData.dashboard_config)
        } else if (profileData && !layout.length) {
            // Default layout if none exists
            setLayout([
                { id: 'income-trend', type: 'area', title: t('dashboard.income_trend'), desc: 'รายได้ตามช่วงเวลา', color: '#3b82f6', metric: 'total', x: 0, y: 0, w: 8, h: 5 },
                { id: 'distribution', type: 'pie', title: t('dashboard.income_distribution'), desc: 'แบ่งตามหมวดหมู่', color: '#10b981', metric: 'products', x: 8, y: 0, w: 4, h: 5 },
                { id: 'stat-total', type: 'stat', title: t('dashboard.total_income'), desc: 'รายได้รวม', color: '#3b82f6', metric: 'total', x: 0, y: 5, w: 3, h: 2 },
                { id: 'stat-products', type: 'stat', title: t('dashboard.product_income'), desc: 'จากสินค้า', color: '#10b981', metric: 'products', x: 3, y: 5, w: 3, h: 2 },
                { id: 'stat-labor', type: 'stat', title: t('dashboard.labor_income'), desc: 'จากค่าแรง', color: '#f59e0b', metric: 'labor', x: 6, y: 5, w: 3, h: 2 },
                { id: 'stat-orders', type: 'stat', title: t('dashboard.receipt_count'), desc: 'จำนวนออเดอร์', color: '#10b981', metric: 'count', x: 9, y: 5, w: 3, h: 2 },
            ])
        }
    }, [profileData, t])

    const saveLayout = async (newLayout: DashboardItem[]) => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dashboard_config: newLayout })
            })
            if (!res.ok) throw new Error('Failed to save')
            mutateProfile()
            toast.success('บันทึกการจัดวางเรียบร้อย')
        } catch (err) {
            toast.error('ไม่สามารถบันทึกได้')
        } finally {
            setIsSaving(false)
        }
    }

    const resetToDefault = () => {
        const defaultLayout: DashboardItem[] = [
            { id: 'income-trend', type: 'area', title: t('dashboard.income_trend'), desc: 'รายได้ตามช่วงเวลา', color: '#3b82f6', metric: 'total', x: 0, y: 0, w: 8, h: 5 },
            { id: 'distribution', type: 'pie', title: t('dashboard.income_distribution'), desc: 'แบ่งตามหมวดหมู่', color: '#10b981', metric: 'products', x: 8, y: 0, w: 4, h: 5 },
            { id: 'stat-total', type: 'stat', title: t('dashboard.total_income'), desc: 'รายได้รวม', color: '#3b82f6', metric: 'total', x: 0, y: 5, w: 3, h: 2 },
            { id: 'stat-products', type: 'stat', title: t('dashboard.product_income'), desc: 'จากสินค้า', color: '#10b981', metric: 'products', x: 3, y: 5, w: 3, h: 2 },
            { id: 'stat-labor', type: 'stat', title: t('dashboard.labor_income'), desc: 'จากค่าแรง', color: '#f59e0b', metric: 'labor', x: 6, y: 5, w: 3, h: 2 },
            { id: 'stat-orders', type: 'stat', title: t('dashboard.receipt_count'), desc: 'จำนวนออเดอร์', color: '#10b981', metric: 'count', x: 9, y: 5, w: 3, h: 2 },
        ]
        setLayout(defaultLayout)
        toast.success('รีเซ็ตค่าเริ่มต้นเรียบร้อย')
    }

    const addItem = (type: ChartType) => {
        const id = `item-${Date.now()}`
        const titleMap: Record<string, string> = {
            area: language === 'th' ? 'กราฟพื้นที่' : 'Area Chart',
            bar: language === 'th' ? 'กราฟแท่ง' : 'Bar Chart',
            pie: language === 'th' ? 'กราฟวงกลม' : 'Pie Chart',
            line: language === 'th' ? 'กราฟเส้น' : 'Line Chart',
            radar: language === 'th' ? 'กราฟเรดาร์' : 'Radar Chart',
            radial: language === 'th' ? 'กราฟวงกลมความคืบหน้า' : 'Radial Chart',
            stat: language === 'th' ? 'การ์ดสถิติ' : 'Stat Card'
        }
        const title = `${titleMap[type] || 'Chart'} ${language === 'th' ? '(ใหม่)' : '(New)'}`

        const newItem: DashboardItem = {
            id,
            type,
            title,
            desc: language === 'th' ? 'กราฟใหม่' : 'New Chart',
            color: '#3b82f6',
            metric: 'total',
            x: 0,
            y: Infinity,
            w: type === 'stat' ? 3 : 6,
            h: type === 'stat' ? 2 : 5
        }
        setLayout([...layout, newItem])
        toast.info(`Added ${type} chart`)
    }

    const receipts = receiptsData || []
    const isLoading = swrLoading

    const isInitialLoading = isLoading && receipts.length === 0

    // Filter receipts by date range
    const filteredReceipts = React.useMemo(() => {
        if (dateRange === 'all') return receipts
        const now = new Date()
        const days = parseInt(dateRange)
        const cutoff = new Date(now.setDate(now.getDate() - days))
        return receipts.filter(r => new Date(r.created_at) >= cutoff)
    }, [receipts, dateRange])

    // Process data for chart
    const areaChartData = React.useMemo(() => {
        const groups: Record<string, number> = {}
        const isLongRange = ['180d', '365d', 'all'].includes(dateRange)

        if (dateRange === '30d') {
            for (let i = 29; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })
                groups[label] = 0
            }
        } else if (isLongRange) {
            // Group by month
            const months = dateRange === 'all' ? 12 : (parseInt(dateRange) / 30)
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date()
                date.setMonth(date.getMonth() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' })
                groups[label] = 0
            }
        } else {
            // 90d, group by week or simplified days
            for (let i = 89; i >= 0; i -= 3) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })
                groups[label] = 0
            }
        }

        filteredReceipts.forEach(r => {
            const date = new Date(r.created_at)
            const label = isLongRange
                ? date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' })
                : date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })

            if (groups[label] !== undefined) {
                groups[label] += Number(r.total_amount)
            }
        })

        return Object.entries(groups).map(([date, income]) => ({ date, income }))
    }, [filteredReceipts, dateRange, language])

    const pieChartData = React.useMemo(() => [
        { name: t('dashboard.products'), value: filteredReceipts.reduce((sum, r) => sum + Number(r.subtotal), 0), fill: "var(--color-products)" },
        { name: t('dashboard.labor'), value: filteredReceipts.reduce((sum, r) => sum + Number(r.labor_cost), 0), fill: "var(--color-labor)" },
    ], [filteredReceipts, t])

    const { totalIncome, totalLabor, totalProducts, totalOrders } = React.useMemo(() => ({
        totalIncome: filteredReceipts.reduce((sum, r) => sum + Number(r.total_amount), 0),
        totalLabor: filteredReceipts.reduce((sum, r) => sum + Number(r.labor_cost), 0),
        totalProducts: filteredReceipts.reduce((sum, r) => sum + Number(r.subtotal), 0),
        totalOrders: filteredReceipts.length
    }), [filteredReceipts])

    const handleExportPDF = React.useCallback(async () => {
        if (!dashboardRef.current) return
        setIsExporting(true)
        try {
            const html2canvas = (await import('html2canvas')).default
            const jsPDF = (await import('jspdf')).default

            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#ffffff',
                windowWidth: 1400,
                onclone: (clonedDoc) => {
                    const dashboard = clonedDoc.getElementById('dashboard-container')
                    if (!dashboard) return

                    // Deep sanitize all elements to remove oklch/lab
                    const elements = dashboard.getElementsByTagName('*')
                    for (let i = 0; i < elements.length; i++) {
                        const el = elements[i] as HTMLElement
                        const style = window.getComputedStyle(el)

                        // Force a safe background and border color if they look like they use oklch
                        // (Usually they show up as 'rgb' in computed style, but html2canvas's parser 
                        // might still be hitting the raw CSS rules)

                        // Explicitly overwrite problematic styles with safe fallbacks
                        if (el.classList.contains('bg-primary')) el.style.backgroundColor = '#3b82f6'
                        if (el.classList.contains('text-primary')) el.style.color = '#3b82f6'
                        if (el.classList.contains('bg-card')) el.style.backgroundColor = '#ffffff'
                        if (el.classList.contains('border-border')) el.style.borderColor = '#e5e7eb'

                        // Remove animations as they cause ghosting
                        el.style.animation = 'none'
                        el.style.transition = 'none'
                    }

                    // Special handling for the dark luxury card
                    const luxuryCard = clonedDoc.querySelector('.luxury-summary-card') as HTMLElement
                    if (luxuryCard) {
                        luxuryCard.style.background = '#1e293b'
                        luxuryCard.style.color = '#ffffff'
                    }

                    // Hide no-print elements
                    const noPrint = clonedDoc.querySelectorAll('.no-print')
                    noPrint.forEach(el => (el as HTMLElement).style.display = 'none')
                }
            })

            const imgData = canvas.toDataURL('image/png', 1.0)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
            pdf.save(`dashboard-report-${new Date().toISOString().slice(0, 10)}.pdf`)
            toast.success(t('dashboard.export_success'))
        } catch (err) {
            console.error('PDF Export Error:', err)
            toast.error(t('dashboard.export_error'))
        } finally {
            setIsExporting(false)
        }
    }, [dashboardRef, t])

    if (isInitialLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">{t('dashboard.analyzing')}</p>
        </div>
    )

    return (
        <div id="dashboard-container" className="space-y-8 pb-10" ref={dashboardRef}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                        <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">{t('dashboard.insight')}</h1>
                        <p className="text-muted-foreground font-medium">{t('dashboard.subtitle')}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {isEditMode ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                            <Button
                                variant="outline"
                                onClick={resetToDefault}
                                className="rounded-xl h-10 border-border shadow-sm font-bold gap-2 text-muted-foreground"
                            >
                                <Wrench className="h-4 w-4" /> Reset
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => {
                                    setIsEditMode(false)
                                    saveLayout(layout)
                                }}
                                disabled={isSaving}
                                className="rounded-xl h-10 shadow-lg shadow-primary/20 font-bold gap-2"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save & Done
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setIsEditMode(true)}
                            className="rounded-xl h-10 border-border shadow-sm font-bold gap-2 relative z-30"
                        >
                            <Settings2 className="h-4 w-4" /> Customize Dashboard
                        </Button>
                    )}

                    {!isEditMode && (
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl border-border bg-card shadow-sm font-medium">
                                <Calendar className="mr-2 h-4 w-4 opacity-50" />
                                <SelectValue placeholder={t('dashboard.select_range')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border shadow-xl">
                                <SelectItem value="30d">{t('dashboard.month_1')}</SelectItem>
                                <SelectItem value="90d">{t('dashboard.month_3')}</SelectItem>
                                <SelectItem value="180d">{t('dashboard.month_6')}</SelectItem>
                                <SelectItem value="365d">{t('dashboard.year_1')}</SelectItem>
                                <SelectItem value="all">{t('dashboard.all')}</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* AI Insight Card */}
            {mounted && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                    <AiInsightCard
                        insight={aiInsight}
                        isLoading={loadingInsight}
                        cooldown={quotaCooldown}
                        onAsk={(q) => {
                            setAutoChatQuery(q)
                            setChatOpen(true)
                        }}
                        onGenerate={refreshInsight}
                    />
                </div>
            )}

            {mounted && receiptsData && (
                <AiChatDialog
                    data={receiptsData}
                    t={t}
                    language={language}
                    isOpen={chatOpen}
                    onOpenChange={setChatOpen}
                    autoQuery={autoChatQuery}
                />
            )}

            {isEditMode && (
                <div className="flex flex-wrap items-center gap-2 pb-6 animate-in fade-in slide-in-from-top-4 duration-500 overflow-x-auto no-scrollbar">
                    <Button variant="secondary" size="sm" onClick={() => addItem('stat')} className="rounded-lg gap-2 border border-border">
                        <Plus className="h-4 w-4" /> Add Stat
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => addItem('area')} className="rounded-lg gap-2 border border-border">
                        <AreaIcon className="h-4 w-4" /> Add Area Chart
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => addItem('bar')} className="rounded-lg gap-2 border border-border">
                        <BarChart3 className="h-4 w-4" /> Add Bar Chart
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => addItem('line')} className="rounded-lg gap-2 border border-border">
                        <LineIcon className="h-4 w-4" /> Add Line Chart
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => addItem('pie')} className="rounded-lg gap-2 border border-border">
                        <PieChartIcon className="h-4 w-4" /> Add Pie Chart
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => addItem('radar')} className="rounded-lg gap-2 border border-border">
                        <Activity className="h-4 w-4" /> Add Radar Chart
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => addItem('radial')} className="rounded-lg gap-2 border border-border">
                        <Target className="h-4 w-4" /> Add Radial Chart
                    </Button>
                </div>
            )}

            {isEditMode ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <DashboardEditor
                        layout={layout}
                        onLayoutChange={(newItems) => setLayout(newItems)}
                        onClose={() => {
                            saveLayout(layout)
                            setIsEditMode(false)
                        }}
                        mutateProfile={mutateProfile}
                    />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{ lg: layout.map(i => ({ i: i.id, x: i.x, y: i.y, w: i.w, h: i.h })) }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={120}
                        isDraggable={false}
                        isResizable={false}
                        margin={[20, 20]}
                    >
                        {layout.map((item) => (
                            <div key={item.id}>
                                <DashboardCard item={item} receipts={filteredReceipts} products={productsData} dateRange={dateRange} mounted={mounted} />
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                </div>
            )}
            <style jsx global>{`
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-reverse {
                    animation: spin-reverse 1.2s linear infinite;
                }
                .pdf-exporting {
                    width: 1400px !important;
                    background: white !important;
                    padding: 40px !important;
                    color: black !important;
                    /* Force HEX overrides for common variables that use oklch */
                    --background: #ffffff !important;
                    --foreground: #000000 !important;
                    --primary: #3b82f6 !important;
                    --primary-foreground: #ffffff !important;
                    --card: #ffffff !important;
                    --card-foreground: #000000 !important;
                    --muted: #f3f4f6 !important;
                    --muted-foreground: #6b7280 !important;
                    --border: #e5e7eb !important;
                    --accent: #f3f4f6 !important;
                    --secondary: #f3f4f6 !important;
                }
                .pdf-exporting * {
                    border-color: #e5e7eb !important;
                    /* Ensure no oklch colors are leaked through computed styles */
                    outline-color: #e5e7eb !important;
                }
                /* Special fixes for the Luxury Card in PDF */
                .pdf-exporting .bg-gradient-to-br,
                .pdf-exporting .bg-linear-to-br {
                    background: #1e293b !important; /* Fixed slate-800 for PDF */
                }
                .pdf-exporting .no-print {
                    display: none !important;
                }
                .pdf-exporting .grid {
                    display: grid !important;
                }
                .pdf-exporting .animate-pulse,
                .pdf-exporting .animate-spin {
                    animation: none !important;
                }
                /* react-grid-layout handles mobile stacking naturally with cols={{xxs: 2}} */
                .layout .react-grid-item.react-grid-placeholder {
                    background: var(--primary) !important;
                    border-radius: 1rem !important;
                    opacity: 0.1 !important;
                }
            `}</style>
        </div>
    )
}

// --- COMPONENTS ---

function DashboardCard({ item, receipts, products, dateRange, mounted }: { item: DashboardItem, receipts: Receipt[], products: any[], dateRange: string, mounted: boolean }) {
    const { t, language } = useLanguage()

    // Process data based on metric

    // Predefined palette for categorical charts (max 10)
    const CHART_PALETTE = [
        "#3b82f6", // Blue
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#8b5cf6", // Violet
        "#ec4899", // Pink
        "#06b6d4", // Cyan
        "#f97316", // Orange
        "#6366f1", // Indigo
        "#84cc16", // Lime
    ]

    // Process data based on metric
    const data = React.useMemo(() => {
        // Filter receipts by item-specific timeRange if present, else use global dateRange
        const effectiveRange = item.timeRange || dateRange
        let filteredReceipts = receipts

        if (effectiveRange !== 'all' && !item.compareType) {
            const now = new Date()
            const past = new Date()
            if (effectiveRange === '7d') past.setDate(now.getDate() - 7)
            if (effectiveRange === '30d') past.setDate(now.getDate() - 30)
            if (effectiveRange === '90d') past.setDate(now.getDate() - 90)
            if (effectiveRange === '180d') past.setDate(now.getDate() - 180)
            if (effectiveRange === '365d') past.setDate(now.getDate() - 365)

            filteredReceipts = receipts.filter(r => new Date(r.created_at) >= past)
        }

        if (item.compareType === 'month') {
            const m1 = item.compareMonth1 ?? 0
            const m2 = item.compareMonth2 ?? 1
            const totals = [0, 0]

            filteredReceipts.forEach(r => {
                const date = new Date(r.created_at)
                if (date.getMonth() === m1) {
                    if (item.metric === 'total') totals[0] += Number(r.total_amount)
                    if (item.metric === 'products') totals[0] += Number(r.subtotal)
                    if (item.metric === 'labor') totals[0] += Number(r.labor_cost)
                    if (item.metric === 'count') totals[0] += 1
                }
                if (date.getMonth() === m2) {
                    if (item.metric === 'total') totals[1] += Number(r.total_amount)
                    if (item.metric === 'products') totals[1] += Number(r.subtotal)
                    if (item.metric === 'labor') totals[1] += Number(r.labor_cost)
                    if (item.metric === 'count') totals[1] += 1
                }
            })

            const getMonthLabel = (m: number) => {
                const date = new Date()
                date.setMonth(m)
                return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short' })
            }

            return [
                { label: getMonthLabel(m1), value: totals[0], fill: item.color },
                { label: getMonthLabel(m2), value: totals[1], fill: `${item.color}80` }
            ]
        }

        if (item.compareType === 'products' || item.metric === 'category' || item.metric === 'low_stock') {
            const productTotals: Record<string, number> = {}

            if (item.metric === 'low_stock') {
                return products
                    .filter(p => (p.track_stock !== false) && (p.quantity <= (item.limit || 10)))
                    .map((p, i) => ({
                        label: p.name,
                        value: p.quantity,
                        fill: CHART_PALETTE[i % CHART_PALETTE.length]
                    }))
                    .sort((a, b) => a.value - b.value)
            }

            filteredReceipts.forEach(r => {
                const items = (r as any).items || []
                if (Array.isArray(items)) {
                    items.forEach((p: any) => {
                        const name = item.metric === 'category' ? (p.category || (language === 'th' ? 'อื่นๆ' : 'Other')) : (p.name || 'Unknown')
                        let val = 0
                        if (item.metric === 'count') val = Number(p.quantity) || 1
                        else val = (Number(p.quantity) || 1) * (Number(p.price) || 0)

                        productTotals[name] = (productTotals[name] || 0) + val
                    })
                }
            })

            let result = Object.entries(productTotals)
                .map(([name, value], index) => ({
                    label: name,
                    value,
                    fill: CHART_PALETTE[index % CHART_PALETTE.length]
                }))

            // Sorting
            if (item.sortBy === 'label') result.sort((a, b) => a.label.localeCompare(b.label))
            else result.sort((a, b) => b.value - a.value) // Default sort by value desc

            // Limit (Default to 10 for all charts)
            const defaultLimit = 10
            const limit = item.limit || defaultLimit
            result = result.slice(0, limit)

            return result
        }

        if (item.type === 'radial') {
            // For radial, we show progress vs a monthly target
            const currentMonthRevenue = receipts
                .filter(r => new Date(r.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, r) => sum + Number(r.total_amount), 0)

            const target = 500000 // Sample target, could be configurable
            const percentage = Math.min(100, Math.round((currentMonthRevenue / target) * 100))

            return [
                { label: 'Progress', value: percentage, fill: item.color },
                { label: 'Remaining', value: 100 - percentage, fill: `${item.color}20` }
            ]
        }


        if (item.metric === 'aov') {
            // Group total / count by time
            const groups: Record<string, [number, number]> = {}
            const isLongRange = ['180d', '365d', 'all'].includes(effectiveRange)

            filteredReceipts.forEach(r => {
                const date = new Date(r.created_at)
                const labelStr = isLongRange
                    ? date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' })
                    : date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })

                if (!groups[labelStr]) groups[labelStr] = [0, 0]
                groups[labelStr][0] += Number(r.total_amount)
                groups[labelStr][1] += 1
            })

            return Object.entries(groups).map(([label, [sum, count]]) => ({
                label,
                value: count > 0 ? sum / count : 0
            }))
        }

        if (item.metric === 'peak_hours') {
            const hours: Record<string, number> = {}
            for (let i = 0; i < 24; i++) {
                const label = `${i.toString().padStart(2, '0')}:00`
                hours[label] = 0
            }

            filteredReceipts.forEach(r => {
                const hour = new Date(r.created_at).getHours()
                const label = `${hour.toString().padStart(2, '0')}:00`
                if (hours[label] !== undefined) hours[label] += 1
            })

            return Object.entries(hours).map(([label, value]) => ({ label, value, fill: item.color }))
        }

        if (item.metric === 'inventory_value') {
            const total = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0)
            return [{ label: t('dashboard.inventory_value'), value: total, fill: item.color }]
        }

        if (item.metric === 'retention') {
            const customerMap: Record<string, number> = {}
            filteredReceipts.forEach(r => {
                const key = r.customer_phone || r.customer_name
                if (key) {
                    customerMap[key] = (customerMap[key] || 0) + 1
                }
            })

            const counts = { returning: 0, new: 0 }
            Object.values(customerMap).forEach(count => {
                if (count > 1) counts.returning++
                else counts.new++
            })

            return [
                { label: t('dashboard.returning_customers'), value: counts.returning, fill: item.color },
                { label: t('dashboard.new_customers'), value: counts.new, fill: `${item.color}40` }
            ]
        }

        // Standard timeline logic (existing)
        const groups: Record<string, number> = {}
        const isLongRange = ['180d', '365d', 'all'].includes(effectiveRange)

        if (effectiveRange === '30d') {
            for (let i = 29; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })
                groups[label] = 0
            }
        } else if (isLongRange) {
            const monthsCount = effectiveRange === 'all' ? 12 : (parseInt(effectiveRange) / 30)
            for (let i = monthsCount - 1; i >= 0; i--) {
                const date = new Date()
                date.setMonth(date.getMonth() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' })
                groups[label] = 0
            }
        } else {
            // 7 days or default
            for (let i = 6; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })
                groups[label] = 0
            }
        }

        filteredReceipts.forEach(r => {
            const date = new Date(r.created_at)
            const label = isLongRange
                ? date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' })
                : date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })

            if (groups[label] !== undefined) {
                let val = 0
                if (item.metric === 'total') val = Number(r.total_amount)
                if (item.metric === 'products') val = Number(r.subtotal)
                if (item.metric === 'labor') val = Number(r.labor_cost)
                if (item.metric === 'count') val = 1
                groups[label] += val
            }
        })

        return Object.entries(groups).map(([label, value]) => ({ label, value, fill: item.color }))
    }, [receipts, dateRange, language, item])

    const totalValue = data.reduce((sum, d) => sum + d.value, 0)

    const config: ChartConfig = {
        value: {
            label: item.title,
            color: item.color,
        }
    }

    if (item.type === 'stat') {
        const icon = item.metric === 'total' ? <TrendingUp className="h-5 w-5" /> :
            item.metric === 'products' ? <Package className="h-5 w-5" /> :
                item.metric === 'labor' ? <Wrench className="h-5 w-5" /> :
                    item.metric === 'aov' ? <DollarSign className="h-5 w-5" /> :
                        item.metric === 'retention' ? <Users className="h-5 w-5" /> :
                            item.metric === 'category' ? <PieChartIcon className="h-5 w-5" /> :
                                item.metric === 'inventory_value' ? <Package className="h-5 w-5" /> :
                                    item.metric === 'low_stock' ? <AlertTriangle className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />

        let displayValue: any = totalValue
        if (item.metric === 'aov') {
            const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.total_amount), 0)
            const count = receipts.length
            displayValue = count > 0 ? (totalRevenue / count) : 0
        } else if (item.metric === 'low_stock') {
            displayValue = products.filter(p => (p.track_stock !== false) && (p.quantity <= 5)).length
        } else if (item.metric === 'inventory_value') {
            displayValue = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0)
        } else if (item.metric === 'retention') {
            const customerMap: Record<string, number> = {}
            receipts.forEach(r => {
                const key = r.customer_phone || r.customer_name
                if (key) customerMap[key] = (customerMap[key] || 0) + 1
            })
            const totalCust = Object.keys(customerMap).length
            const returningCust = Object.values(customerMap).filter(c => c > 1).length
            displayValue = totalCust > 0 ? `${Math.round((returningCust / totalCust) * 100)}%` : '0%'
        }

        return (
            <Card className="h-full rounded-2xl border border-primary/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] bg-card/60 backdrop-blur-md group overflow-hidden stat-card transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1 relative">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-5 pt-5 relative z-10">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 truncate mr-2">{item.title}</CardTitle>
                    <div className="p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-xs" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                        {React.cloneElement(icon as React.ReactElement<any>, { className: "h-4 w-4" })}
                    </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="text-3xl font-black tracking-tighter flex items-baseline gap-1">
                        {item.metric === 'count' || item.metric === 'low_stock' ? displayValue :
                            item.metric === 'retention' ? displayValue :
                                <><span className="text-sm font-bold opacity-40">฿</span>{Number(displayValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</>}
                    </div>
                    {item.metric === 'total' && (
                        <div className="flex items-center gap-2 mt-2">
                            <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                                <TrendingUp className="h-3 w-3" />
                                LIVE
                            </div>
                            <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                {receipts.length} {t('dashboard.receipt_count')}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    if (item.type === 'pie') {
        let pieData = data.map((d: any) => ({ name: d.label, value: d.value, fill: d.fill || item.color }))

        // If simple timeline data or single value, show a meaningful split or the data itself
        if (pieData.length > 5 || (pieData.length === 0 && receipts.length > 0)) {
            // Fallback to Products vs Labor split if the metric doesn't slice well naturally
            pieData = [
                { name: t('dashboard.products'), value: receipts.reduce((sum, r) => sum + Number(r.subtotal), 0), fill: "#10b981" }, // Emerald
                { name: t('dashboard.labor'), value: receipts.reduce((sum, r) => sum + Number(r.labor_cost), 0), fill: "#f59e0b" }, // Amber
            ]
        }

        const pieConfig = { ...config }
        pieData.forEach((d: any) => {
            pieConfig[d.name] = {
                label: d.name,
                color: d.fill
            }
        })

        return (
            <Card className="h-full rounded-2xl border border-primary/10 shadow-sm bg-card/50 backdrop-blur-xs overflow-hidden flex flex-col group transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
                <CardHeader className="border-b border-border/20 bg-muted/5 py-3 px-4 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 dashboard-chart-container overflow-hidden">
                    {!mounted ? (
                        <div className="w-full h-full min-h-[150px] flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
                        </div>
                    ) : (
                        <ChartContainer config={pieConfig} className="h-full w-full aspect-auto">
                            <PieChart margin={{ top: 0, bottom: 20, left: 0, right: 0 }}>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel className="rounded-xl border-border shadow-2xl backdrop-blur-md bg-card/80" />} />
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius="45%"
                                    outerRadius="75%"
                                    strokeWidth={0}
                                    paddingAngle={2}
                                />
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="flex-wrap gap-1 text-[9px] font-bold pb-2" />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full rounded-2xl border border-primary/10 shadow-sm bg-card/50 backdrop-blur-xs overflow-hidden flex flex-col group transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
            <CardHeader className="border-b border-border/20 bg-muted/5 py-2.5 px-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 dashboard-chart-container overflow-hidden">
                {!mounted ? (
                    <div className="w-full h-full min-h-[150px] flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
                    </div>
                ) : (
                    <ChartContainer config={config} className="h-full w-full aspect-auto">
                        {item.type === 'area' ? (
                            <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={`grad-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={item.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={item.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/10" />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                                />
                                <YAxis hide />
                                <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-border shadow-2xl backdrop-blur-md bg-card/80" />} />
                                <Area type="monotone" dataKey="value" stroke={item.color} strokeWidth={3} fillOpacity={1} fill={`url(#grad-${item.id})`} />
                            </AreaChart>
                        ) : item.type === 'radar' ? (
                            <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%" className="transition-transform duration-1000">
                                <PolarGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                <PolarAngleAxis dataKey="label" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 8, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} hide />
                                <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-border shadow-2xl backdrop-blur-md bg-card/80" />} />
                                <Radar
                                    name={item.title}
                                    dataKey="value"
                                    stroke={item.color}
                                    fill={item.color}
                                    fillOpacity={0.4}
                                    className="animate-in fade-in zoom-in-50 duration-1000"
                                />
                            </RadarChart>
                        ) : item.type === 'radial' ? (
                            <RadialBarChart
                                data={data}
                                innerRadius="60%"
                                outerRadius="100%"
                                barSize={15}
                                startAngle={90}
                                endAngle={450}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar
                                    background
                                    dataKey="value"
                                    cornerRadius={10}
                                    label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <ChartTooltip content={<ChartTooltipContent hideLabel className="rounded-xl border-border shadow-2xl backdrop-blur-md bg-card/80" />} />
                                <RechartsLabel
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            const progress = (data[0] as any).value
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-2xl font-black"
                                                    >
                                                        {progress}%
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 20}
                                                        className="fill-muted-foreground text-[10px] font-bold uppercase"
                                                    >
                                                        Goal
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </RadialBarChart>
                        ) : (item.type === 'bar' || item.compareType === 'month' || item.compareType === 'products') ? (
                            <BarChart data={data} margin={{ left: 10, right: 10, top: 20, bottom: 20 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/20" />
                                <XAxis
                                    dataKey="label"
                                    hide={false}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9, fontWeight: 500 }}
                                    interval={0}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={5}
                                />
                                <YAxis hide />
                                <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-border shadow-2xl backdrop-blur-md bg-card/80" />} />
                                <Bar
                                    dataKey="value"
                                    radius={[4, 4, 0, 0]}
                                    fill={item.color}
                                    barSize={30}
                                >
                                    {data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill || item.color} fillOpacity={0.8 + (index * 0.1)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        ) : item.type === 'line' ? (
                            <LineChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/20" />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                                />
                                <YAxis hide />
                                <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-border shadow-2xl backdrop-blur-md bg-card/80" />} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={item.color}
                                    strokeWidth={3}
                                    dot={{ fill: item.color, r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        ) : (
                            // Default Fallback
                            <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/20" />
                                <XAxis dataKey="label" hide />
                                <YAxis hide />
                                <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-border shadow-2xl backdrop-blur-md bg-card/80" />} />
                                <Area type="linear" dataKey="value" stroke={item.color} strokeWidth={2.5} fill="transparent" />
                            </AreaChart>
                        )}
                    </ChartContainer>
                )}
            </CardContent>
        </Card >
    )
}


function AiInsightCard({
    insight,
    isLoading,
    cooldown = 0,
    onAsk,
    onGenerate
}: {
    insight: AiInsight | null,
    isLoading: boolean,
    cooldown?: number,
    onAsk: (q: string) => void,
    onGenerate: () => void
}) {
    const { t } = useLanguage()
    const [query, setQuery] = useState('')

    if (!insight && !isLoading) {
        return (
            <Card className="rounded-2xl border-dashed border-2 border-border/60 bg-muted/5 p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
                <div className="p-4 rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-lg">{t('dashboard.ai_insight_title')}</h3>
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                        กดปุ่มด้านล่างเพื่อเริ่มการวิเคราะห์ข้อมูลด้วย AI
                    </p>
                </div>
                <Button
                    onClick={onGenerate}
                    disabled={cooldown > 0}
                    className={cn(
                        "rounded-full shadow-lg shadow-violet-200 dark:shadow-none px-8 h-12 font-black transition-all",
                        cooldown > 0 ? "bg-muted text-muted-foreground border-border" : "bg-violet-600 hover:bg-violet-700 text-white"
                    )}
                >
                    {cooldown > 0 ? (
                        <>
                            <RotateCcw className="mr-2 h-4 w-4 animate-spin-reverse" />
                            รออีก {cooldown} วินาที
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            วิเคราะห์ข้อมูล
                        </>
                    )}
                </Button>
            </Card>
        )
    }

    return (
        <Card className="rounded-2xl border-none shadow-xl bg-linear-to-r from-violet-600/10 via-fuchsia-500/10 to-transparent overflow-hidden relative group">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md dark:bg-black/20" />
            <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-linear-to-br from-violet-500 to-fuchsia-600 rounded-2xl shadow-lg shadow-violet-500/30 shrink-0 animate-pulse">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                                    {isLoading ? t('dashboard.analyzing_business') : t('dashboard.ai_insight_title')}
                                </h3>
                                {!isLoading && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onGenerate}
                                        className="h-8 w-8 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-600"
                                        title="วิเคราะห์ใหม่"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                )}
                                {insight?.trend && (
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ml-auto",
                                        insight.trend === 'up' ? "bg-emerald-500/20 text-emerald-600" :
                                            insight.trend === 'down' ? "bg-red-500/20 text-red-600" :
                                                "bg-gray-500/20 text-gray-600"
                                    )}>
                                        {insight.trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                                            insight.trend === 'down' ? <TrendingUp className="h-3 w-3 rotate-180" /> :
                                                <Activity className="h-3 w-3" />}
                                        {insight.trend}
                                    </span>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-muted/50 rounded w-1/2 animate-pulse" />
                                </div>
                            ) : (
                                <div className="animate-in fade-in duration-500 space-y-3">
                                    <p className="text-base font-semibold text-foreground/90 leading-relaxed">
                                        {insight?.summary}
                                    </p>
                                    <div className="p-3 bg-card/50 rounded-xl border border-white/20 shadow-sm">
                                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                            <Sparkles className="h-3 w-3 text-violet-500" />
                                            <span className="font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Recommendation:</span>
                                            {insight?.recommendation}
                                        </p>
                                    </div>

                                    {/* Prominent Action Button for Quota or Error scenarios */}
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={onGenerate}
                                        disabled={cooldown > 0}
                                        className={cn(
                                            "w-full rounded-xl font-bold gap-2 py-5 transition-all text-sm",
                                            cooldown > 0
                                                ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                                                : "bg-violet-600/10 hover:bg-violet-600/20 text-violet-600 border border-violet-600/20 shadow-sm"
                                        )}
                                    >
                                        <RotateCcw className={cn("h-4 w-4", cooldown > 0 && "animate-spin-reverse")} />
                                        {cooldown > 0 ? `รอโควตาอีก ${cooldown} วินาที` : "กดที่นี่เพื่อวิเคราะห์อีกครั้ง"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Quick Ask Input */}
                        {!isLoading && (
                            <div className="relative animate-in slide-in-from-bottom-2 duration-500 delay-100">
                                <input
                                    type="text"
                                    placeholder="ถามเรื่องข้อมูลยอดขายเพิ่มเติม..."
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/50 dark:bg-black/20 border border-violet-500/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm placeholder:text-muted-foreground/60 transition-all shadow-sm hover:shadow-md"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && query.trim()) {
                                            onAsk(query)
                                            setQuery('')
                                        }
                                    }}
                                />
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-violet-600/90 text-white hover:bg-violet-700 transition-colors shadow-sm"
                                    onClick={() => {
                                        if (query.trim()) {
                                            onAsk(query)
                                            setQuery('')
                                        }
                                    }}
                                >
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>{children}</div>
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

function AiChatDialog({
    data,
    t,
    language,
    isOpen,
    onOpenChange,
    autoQuery
}: {
    data: any[],
    t: any,
    language: string,
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    autoQuery?: string
}) {
    // Internal state for messages
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: t('dashboard.ai_chat_welcome') || 'Hello! Ask me anything about your sales data.' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const hasAutoQueried = useRef(false)

    // Handle auto-query when opened - PRE-FILL ONLY, DON'T AUTO-SEND
    useEffect(() => {
        if (isOpen && autoQuery && !hasAutoQueried.current) {
            hasAutoQueried.current = true
            setInput(autoQuery)
        }
        if (!isOpen) {
            hasAutoQueried.current = false
        }
    }, [isOpen, autoQuery])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input
        if (!textToSend.trim() || isLoading) return

        if (!textOverride) setInput('')
        const newMessages = [...messages, { role: 'user' as const, content: textToSend }]
        setMessages([...newMessages, { role: 'assistant', content: '' }])
        setIsLoading(true)

        try {
            const { streamChatWithData } = await import('@/app/actions/ai')

            const history = newMessages.slice(1).map(m => ({
                role: m.role,
                content: m.content
            }))

            const response = await streamChatWithData(textToSend, data, language as 'th' | 'en', history)

            setMessages(prev => {
                const last = prev[prev.length - 1]
                if (last && last.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, content: response }]
                }
                return prev
            })
        } catch (error: any) {
            console.error("Chat Error:", error)
            const errorMsg = error?.message || (language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'Error occurred. Please try again.')
            setMessages(prev => {
                const last = prev[prev.length - 1]
                if (last && last.role === 'assistant' && !last.content) {
                    return [...prev.slice(0, -1), { role: 'assistant', content: errorMsg }]
                }
                return [...prev, { role: 'assistant', content: errorMsg }]
            })
            toast.error(language === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI' : 'AI Connection Error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {/* Floating Trigger Button (only if closed) */}
            {!isOpen && (
                <DialogTrigger asChild>
                    <Button
                        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-linear-to-tr from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 border-2 border-white/20 z-50 animate-in zoom-in duration-300"
                        onClick={() => onOpenChange(true)}
                    >
                        <Sparkles className="h-6 w-6 text-white" />
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[400px] h-[600px] flex flex-col p-0 gap-0 rounded-3xl overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader className="p-4 bg-muted/30 border-b border-border/40 shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                        <Sparkles className="h-4 w-4" />
                        AI Partner {isLoading && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className="h-8 w-8 shrink-0 border border-border/50 bg-muted/50">
                                {m.role === 'assistant' ? (
                                    <>
                                        <AvatarImage src="/ai-avatar.png" />
                                        <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-600 text-white">
                                            <Sparkles className="h-4 w-4" />
                                        </AvatarFallback>
                                    </>
                                ) : (
                                    <>
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                        </AvatarFallback>
                                    </>
                                )}
                            </Avatar>
                            <div className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium shadow-sm whitespace-pre-wrap leading-relaxed transition-all duration-300",
                                m.role === 'user'
                                    ? "bg-violet-600 text-white rounded-tr-none"
                                    : "bg-muted/50 border border-border/50 rounded-tl-none text-foreground/90"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 justify-start animate-in fade-in duration-300">
                            <Avatar className="h-8 w-8 shrink-0 border border-border/50 bg-muted/50">
                                <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-600 text-white">
                                    <Sparkles className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 self-center">
                                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-background/50 border-t border-border/40 shrink-0">
                    <div className="relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder={t('dashboard.ai_chat_placeholder') || "Ask about your data..."}
                            className="w-full pl-4 pr-12 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 resize-none text-sm min-h-[50px] max-h-[100px] scrollbar-hide shadow-none"
                            rows={1}
                        />
                        <Button
                            size="icon"
                            className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all active:scale-95"
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                        >
                            <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
