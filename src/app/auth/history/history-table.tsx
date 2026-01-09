'use client'

import React, { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Search,
    Eye,
    History,
    Calendar,
    User,
    CreditCard,
    ExternalLink,
    Loader2
} from "lucide-react"
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type Receipt = {
    id: string
    receipt_number: string
    customer_name: string
    customer_phone: string
    total_amount: number
    created_at: string
}

export default function HistoryTable() {
    const [receipts, setReceipts] = useState<Receipt[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const res = await fetch('/api/receipts')
                if (res.ok) {
                    const data = await res.json()
                    setReceipts(data)
                }
            } catch (err) {
                console.error('Error fetching receipts:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchReceipts()
    }, [])

    const filteredReceipts = receipts.filter(r =>
        r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        r.receipt_number.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">กำลังโหลดประวัติ...</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="หาชื่อลูกค้า หรือเลขที่ใบเสร็จ..."
                        className="pl-10 rounded-2xl shadow-sm border-none bg-card/50"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    พบทั้งหมด {filteredReceipts.length} รายการ
                </div>
            </div>

            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-none">
                            <TableHead className="py-6 font-bold text-slate-900"><Calendar className="inline h-4 w-4 mr-2" /> วันที่ / เวลา</TableHead>
                            <TableHead className="font-bold text-slate-900"># เลขที่ใบเสร็จ</TableHead>
                            <TableHead className="font-bold text-slate-900"><User className="inline h-4 w-4 mr-2" /> ชื่อลูกค้า</TableHead>
                            <TableHead className="text-right font-bold text-slate-900"><CreditCard className="inline h-4 w-4 mr-2" /> ยอดรวม</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReceipts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                    <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                    ไม่พบประวัติการออกใบเสร็จ
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReceipts.map((receipt) => (
                                <TableRow key={receipt.id} className="hover:bg-muted/30 transition-colors border-muted/50">
                                    <TableCell className="py-5">
                                        <div className="font-medium text-slate-900">
                                            {new Date(receipt.created_at).toLocaleDateString('th-TH', {
                                                day: '2-digit', month: '2-digit', year: '2-digit'
                                            })}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(receipt.created_at).toLocaleTimeString('th-TH', {
                                                hour: '2-digit', minute: '2-digit'
                                            })} น.
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm font-bold text-primary">
                                        {receipt.receipt_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-slate-900">{receipt.customer_name}</div>
                                        <div className="text-xs text-muted-foreground">{receipt.customer_phone}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="font-black text-lg text-slate-900">
                                            ฿{receipt.total_amount.toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all" asChild>
                                            <Link href={`/auth/receipt/${receipt.id}`}>
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
