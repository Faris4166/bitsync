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
    Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'
import DashboardEditor from './dashboard-editor'
import { generateTradingInsight } from '@/app/actions/ai'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
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
    RadialBarChart
} from 'recharts'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

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
    type: ChartType
    title: string
    color: string
    metric: 'total' | 'products' | 'labor' | 'count' | 'aov' | 'retention' | 'low_stock' | 'peak_hours' | 'inventory_value' | 'category'
    x: number
    y: number
    w: number
    h: number
    compareType?: 'none' | 'month' | 'products'
    compareMonth1?: number
    compareMonth2?: number
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

    useEffect(() => {
        setMounted(true)
    }, [])

    // Load layout from profile
    useEffect(() => {
        if (profileData?.dashboard_config) {
            setLayout(profileData.dashboard_config)
        } else if (profileData && !layout.length) {
            // Default layout if none exists
            setLayout([
                { id: 'income-trend', type: 'area', title: t('dashboard.income_trend'), color: '#3b82f6', metric: 'total', x: 0, y: 0, w: 8, h: 4 },
                { id: 'distribution', type: 'pie', title: t('dashboard.income_distribution'), color: '#10b981', metric: 'products', x: 8, y: 0, w: 4, h: 4 },
                { id: 'stat-total', type: 'stat', title: t('dashboard.total_income'), color: '#3b82f6', metric: 'total', x: 0, y: 4, w: 3, h: 2 },
                { id: 'stat-products', type: 'stat', title: t('dashboard.product_income'), color: '#10b981', metric: 'products', x: 3, y: 4, w: 3, h: 2 },
                { id: 'stat-labor', type: 'stat', title: t('dashboard.labor_income'), color: '#f59e0b', metric: 'labor', x: 6, y: 4, w: 3, h: 2 },
                { id: 'stat-orders', type: 'stat', title: t('dashboard.receipt_count'), color: '#10b981', metric: 'count', x: 9, y: 4, w: 3, h: 2 },
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
            toast.success('Dashboard layout saved')
        } catch (err) {
            toast.error('Could not save layout')
        } finally {
            setIsSaving(false)
        }
    }

    const resetToDefault = () => {
        const defaultLayout: DashboardItem[] = [
            { id: 'income-trend', type: 'area', title: t('dashboard.income_trend'), color: '#3b82f6', metric: 'total', x: 0, y: 0, w: 8, h: 4 },
            { id: 'distribution', type: 'pie', title: t('dashboard.income_distribution'), color: '#10b981', metric: 'products', x: 8, y: 0, w: 4, h: 4 },
            { id: 'stat-total', type: 'stat', title: t('dashboard.total_income'), color: '#3b82f6', metric: 'total', x: 0, y: 4, w: 3, h: 2 },
            { id: 'stat-products', type: 'stat', title: t('dashboard.product_income'), color: '#10b981', metric: 'products', x: 3, y: 4, w: 3, h: 2 },
            { id: 'stat-labor', type: 'stat', title: t('dashboard.labor_income'), color: '#f59e0b', metric: 'labor', x: 6, y: 4, w: 3, h: 2 },
            { id: 'stat-orders', type: 'stat', title: t('dashboard.receipt_count'), color: '#10b981', metric: 'count', x: 9, y: 4, w: 3, h: 2 },
        ]
        setLayout(defaultLayout)
        toast.success('Layout reset to default')
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
                            setIsEditMode(false)
                            saveLayout(layout)
                        }}
                        hideHeader
                    />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AiInsightCard receipts={receipts} products={productsData} language={language} />
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{ lg: layout.map(i => ({ i: i.id, x: i.x, y: i.y, w: i.w, h: i.h })) }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={100}
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
    const data = React.useMemo(() => {
        if (item.compareType === 'month') {
            const m1 = item.compareMonth1 ?? 0
            const m2 = item.compareMonth2 ?? 1
            const totals = [0, 0]

            receipts.forEach(r => {
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

        if (item.compareType === 'products') {
            const productTotals: Record<string, number> = {}
            receipts.forEach(r => {
                const items = (r as any).items || []
                if (Array.isArray(items)) {
                    items.forEach((p: any) => {
                        const name = p.name || 'Unknown'
                        let val = 0
                        if (item.metric === 'count') val = Number(p.quantity) || 1
                        else val = (Number(p.quantity) || 1) * (Number(p.price) || 0)
                        productTotals[name] = (productTotals[name] || 0) + val
                    })
                }
            })

            return Object.entries(productTotals)
                .map(([name, value]) => ({ label: name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
        }

        if (item.metric === 'category' || item.type === 'radar') {
            const categoryTotals: Record<string, number> = {}
            receipts.forEach(r => {
                const items = (r as any).items || []
                if (Array.isArray(items)) {
                    items.forEach((p: any) => {
                        const cat = p.category || (language === 'th' ? 'อื่นๆ' : 'Other')
                        const val = (Number(p.quantity) || 1) * (Number(p.price) || 0)
                        categoryTotals[cat] = (categoryTotals[cat] || 0) + val
                    })
                }
            })
            const result = Object.entries(categoryTotals)
                .map(([name, value]) => ({ label: name, value }))
                .sort((a, b) => b.value - a.value)

            return item.type === 'radar' ? result.slice(0, 6) : result
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

        if (item.metric === 'low_stock') {
            return products
                .filter(p => (p.track_stock !== false) && (p.quantity <= 5))
                .map(p => ({ label: p.name, value: p.quantity }))
                .sort((a, b) => a.value - b.value)
                .slice(0, 10)
        }

        if (item.metric === 'aov') {
            // Group total / count by same logic as standard timeline
            // For simplicity, let's reuse the groups logic but store [sum, count]
            const groups: Record<string, [number, number]> = {}
            const isLongRange = ['180d', '365d', 'all'].includes(dateRange)

            receipts.forEach(r => {
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

            receipts.forEach(r => {
                const hour = new Date(r.created_at).getHours()
                const label = `${hour.toString().padStart(2, '0')}:00`
                if (hours[label] !== undefined) hours[label] += 1
            })

            return Object.entries(hours).map(([label, value]) => ({ label, value }))
        }

        if (item.metric === 'inventory_value') {
            const total = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0)
            return [{ label: t('dashboard.inventory_value'), value: total }]
        }

        if (item.metric === 'retention') {
            const customerMap: Record<string, number> = {}
            receipts.forEach(r => {
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
        const isLongRange = ['180d', '365d', 'all'].includes(dateRange)

        if (dateRange === '30d') {
            for (let i = 29; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })
                groups[label] = 0
            }
        } else if (isLongRange) {
            const monthsCount = dateRange === 'all' ? 12 : (parseInt(dateRange) / 30)
            for (let i = monthsCount - 1; i >= 0; i--) {
                const date = new Date()
                date.setMonth(date.getMonth() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' })
                groups[label] = 0
            }
        } else {
            for (let i = 89; i >= 0; i -= 3) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const label = date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })
                groups[label] = 0
            }
        }

        receipts.forEach(r => {
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

        return Object.entries(groups).map(([label, value]) => ({ label, value }))
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
                { name: t('dashboard.products'), value: receipts.reduce((sum, r) => sum + Number(r.subtotal), 0), fill: item.color },
                { name: t('dashboard.labor'), value: receipts.reduce((sum, r) => sum + Number(r.labor_cost), 0), fill: `${item.color}80` },
            ]
        }

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
                        <ChartContainer config={config} className="h-full w-full aspect-auto">
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
                                <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-1 text-[9px] font-bold pb-2" />
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
                                <XAxis dataKey="label" hide />
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
                        ) : (
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
        </Card>
    )
}

function AiInsightCard({ receipts, products, language }: { receipts: any[], products: any[], language: string }) {
    const { t } = useLanguage()
    const [insight, setInsight] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const handleGenerateInsight = async () => {
        setLoading(true)
        const summary = {
            totalRevenue: receipts.reduce((sum, r) => sum + Number(r.total_amount), 0),
            totalReceipts: receipts.length,
            topProducts: products.sort((a, b) => b.quantity - a.quantity).slice(0, 3).map(p => p.name)
        }
        const result = await generateTradingInsight(summary)
        setInsight(result || 'No insight available.')
        setLoading(false)
    }

    if (!insight && !loading) {
        return (
            <div className="mb-6">
                <Button
                    variant="outline"
                    className="w-full h-auto py-4 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 gap-3 group relative overflow-hidden"
                    onClick={handleGenerateInsight}
                >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <div className="flex flex-col items-start text-left">
                        <span className="font-bold text-primary text-sm flex items-center gap-2">
                            {language === 'th' ? 'ขอคำแนะนำจาก AI (รอแปป)' : 'Ask AI for Insights'}
                            <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded text-primary/80 font-mono">BETA</span>
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                            {language === 'th' ? 'วิเคราะห์ข้อมูลการขายและแนะนำกลยุทธ์' : 'Analyze sales data and suggest trading strategies'}
                        </span>
                    </div>
                </Button>
            </div>
        )
    }

    return (
        <Card className="mb-6 rounded-2xl border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="h-24 w-24 text-primary" />
            </div>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-bold text-primary">
                        {language === 'th' ? 'คำแนะนำจาก AI' : 'AI Insights'}
                    </CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10" onClick={() => setInsight('')}>
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-primary/10 rounded w-3/4" />
                        <div className="h-4 bg-primary/10 rounded w-full" />
                        <div className="h-4 bg-primary/10 rounded w-5/6" />
                    </div>
                ) : (
                    <div className="prose prose-sm text-sm text-muted-foreground leading-relaxed">
                        {insight.split('\n').map((line, i) => (
                            <p key={i} className="mb-1">{line}</p>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>{children}</div>
}
