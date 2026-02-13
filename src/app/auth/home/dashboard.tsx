'use client'

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
    LayoutDashboard
} from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
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
    Label as RechartsLabel
} from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

type Receipt = {
    id: string
    total_amount: number
    labor_cost: number
    subtotal: number
    created_at: string
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

    const [isExporting, setIsExporting] = useState(false)
    const dashboardRef = useRef<HTMLDivElement>(null)
    const [dateRange, setDateRange] = useState('30d')

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
                </div>
            </div>

            {/* --- STAT CARDS --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-xl border border-border shadow-sm bg-card group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">{t('dashboard.total_income')}</CardTitle>
                        <div className="p-2.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">฿{totalIncome.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t('dashboard.items_sold').replace('{count}', totalOrders.toString())}
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm bg-card group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">{t('dashboard.product_income')}</CardTitle>
                        <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Package className="h-5 w-5 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">฿{totalProducts.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">{t('dashboard.item_sales_only')}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm bg-card group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">{t('dashboard.labor_income')}</CardTitle>
                        <div className="p-2.5 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Wrench className="h-5 w-5 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">฿{totalLabor.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">{t('dashboard.service_income')}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm bg-card group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">{t('dashboard.receipt_count')}</CardTitle>
                        <div className="p-2.5 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <CreditCard className="h-5 w-5 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">{t('dashboard.total_receipts')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- CHART SECTION --- */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Area Chart */}
                <Card className="lg:col-span-8 rounded-2xl border border-border shadow-md bg-card overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" /> {t('dashboard.income_trend')}
                                </CardTitle>
                                <CardDescription>{t('dashboard.income_trend_desc') || t('dashboard.subtitle')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 h-[400px]">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart
                                data={areaChartData}
                                margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                                    tickMargin={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                                    tickFormatter={(value) => `฿${value.toLocaleString()}`}
                                    width={80}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="var(--color-income)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart / Distribution */}
                <Card className="lg:col-span-4 rounded-2xl border border-border shadow-md bg-card overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> {t('dashboard.income_distribution')}
                        </CardTitle>
                        <CardDescription>{t('dashboard.income_distribution_desc') || (t('dashboard.products') + ' vs ' + t('dashboard.labor'))}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pt-6 pb-2">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-4/3 w-full max-h-[300px]">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={pieChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    outerRadius={80}
                                    strokeWidth={5}
                                    paddingAngle={5}
                                >
                                    <RechartsLabel
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                                                            className="fill-foreground text-2xl font-bold"
                                                        >
                                                            ฿{(totalIncome / 1000).toFixed(1)}K
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) + 24}
                                                            className="fill-muted-foreground text-xs"
                                                        >
                                                            {t('dashboard.net_total')}
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-2" />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm pt-0 pb-6 items-start px-6">
                        <div className="flex items-center gap-2 font-bold leading-none">
                            {t('dashboard.income_distribution')} <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            {t('dashboard.products')} {((totalProducts / totalIncome) * 100).toFixed(1)}% | {t('dashboard.labor')} {((totalLabor / totalIncome) * 100).toFixed(1)}%
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Final Summary Card (Luxury Dark) */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="luxury-summary-card rounded-2xl border-none shadow-xl bg-linear-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <LayoutDashboard className="h-48 w-48 rotate-12" />
                    </div>
                    <CardContent className="p-8 relative">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">{t('dashboard.performance')}</p>
                        <h3 className="text-2xl font-bold mb-6">{t('dashboard.summary')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-slate-300 font-medium">{t('dashboard.product_income')}</span>
                                </div>
                                <span className="text-lg font-bold">฿{totalProducts.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="text-slate-300 font-medium">{t('dashboard.labor_income')}</span>
                                </div>
                                <span className="text-lg font-bold">฿{totalLabor.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-lg bg-card p-1">
                    <div className="h-full w-full rounded-[15px] bg-muted/30 p-8 flex flex-col justify-center border border-border/50">
                        <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-2">{t('dashboard.net_total')}</span>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground mb-4 tabular-nums">฿{totalIncome.toLocaleString()}</h2>
                        <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full text-sm">
                            <Users className="h-4 w-4" />
                            <span>{t('dashboard.net_total_desc')}</span>
                        </div>
                        <p className="mt-8 text-sm text-muted-foreground leading-relaxed">
                            {t('dashboard.financial_logic_desc') || 'The system has calculated and reduced financial risks from all outstanding items.'}
                        </p>
                    </div>
                </Card>
            </div>
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
            `}</style>
        </div>
    )
}

function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>{children}</div>
}
