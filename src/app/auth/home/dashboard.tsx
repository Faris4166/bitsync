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
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

type Receipt = {
    id: string
    total_amount: number
    labor_cost: number
    subtotal: number
    created_at: string
}

const chartConfig = {
    income: {
        label: "รายได้",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export default function Dashboard() {
    const [receipts, setReceipts] = useState<Receipt[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const dashboardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const res = await fetch('/api/receipts')
                if (res.ok) {
                    setReceipts(await res.json())
                }
            } catch (err) {
                console.error('Fetch error:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchReceipts()
    }, [])

    // Process data for chart
    const chartData = React.useMemo(() => {
        const groups: Record<string, number> = {}
        // Get last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const label = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
            groups[label] = 0
        }

        receipts.forEach(r => {
            const label = new Date(r.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
            if (groups[label] !== undefined) {
                groups[label] += Number(r.total_amount)
            }
        })

        return Object.entries(groups).map(([date, income]) => ({ date, income }))
    }, [receipts])

    const totalIncome = receipts.reduce((sum, r) => sum + Number(r.total_amount), 0)
    const totalLabor = receipts.reduce((sum, r) => sum + Number(r.labor_cost), 0)
    const totalProducts = receipts.reduce((sum, r) => sum + Number(r.subtotal), 0)
    const totalOrders = receipts.length

    const handleExportPDF = async () => {
        if (!dashboardRef.current) return
        setIsExporting(true)
        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('l', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`dashboard-report-${new Date().toISOString().slice(0, 10)}.pdf`)
            toast.success('ดาวน์โหลดรายงานใบสรุปผลสำเร็จ')
        } catch (err) {
            toast.error('ไม่สามารถส่งออก PDF ได้')
        } finally {
            setIsExporting(false)
        }
    }

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">กำลังวิเคราะห์ข้อมูล...</p>
        </div>
    )

    return (
        <div className="space-y-8 pb-10" ref={dashboardRef}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">แผงควบคุมระบบ</h1>
                    <p className="text-muted-foreground">สรุปผลการดำเนินงานและสถิติรายได้ของคุณ</p>
                </div>
                <Button
                    className="rounded-lg shadow-sm h-10 px-4 bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all border-none"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export PDF
                </Button>
            </div>

            {/* --- STAT CARDS --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-xl border border-border shadow-sm bg-card group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">รายได้รวมทั้งหมด</CardTitle>
                        <div className="p-2.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">฿{totalIncome.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            สะสมจาก {totalOrders} รายการ
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm bg-card group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">รายได้จากสินค้า</CardTitle>
                        <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Package className="h-5 w-5 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">฿{totalProducts.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">เฉพาะยอดขายสินค้า</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm bg-card group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">รายได้จากค่าแรง</CardTitle>
                        <div className="p-2.5 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Wrench className="h-5 w-5 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">฿{totalLabor.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">รายได้จากการซ่อมและบริการ</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm bg-card group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">จำนวนใบเสร็จ</CardTitle>
                        <div className="p-2.5 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <CreditCard className="h-5 w-5 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">รายการที่ออกทั้งหมด</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- CHART SECTION --- */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 rounded-xl border border-border shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <TrendingUp className="h-4.5 w-4.5 text-primary" /> Revenues (Last 7 Days)
                        </CardTitle>
                        <CardDescription>Daily total income overview</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 pr-4 h-[350px]">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart
                                data={chartData}
                                margin={{ left: 12, right: 12, top: 20 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `฿${val.toLocaleString()}`}
                                    hide={true}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <defs>
                                    <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    dataKey="income"
                                    type="natural"
                                    fill="url(#fillIncome)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-income)"
                                    strokeWidth={3}
                                    stackId="a"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 rounded-xl border border-border shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <LayoutDashboard className="h-40 w-40 rotate-12" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Analytics Summary</CardTitle>
                        <CardDescription className="text-primary-foreground/60">Bitsync Analytics Engine</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center opacity-80 text-sm">
                                <span>รายได้จากสินค้า</span>
                                <span>฿{totalProducts.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-1000"
                                    style={{ width: totalIncome > 0 ? `${(totalProducts / totalIncome) * 100}%` : '0%' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center opacity-80 text-sm">
                                <span>รายได้จากค่าแรง</span>
                                <span>฿{totalLabor.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-400 transition-all duration-1000"
                                    style={{ width: totalIncome > 0 ? `${(totalLabor / totalIncome) * 100}%` : '0%' }}
                                />
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-xs opacity-60 uppercase tracking-widest font-bold">Total Net Balance</p>
                            <h2 className="text-3xl font-bold mt-1.5">฿{totalIncome.toLocaleString()}</h2>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
