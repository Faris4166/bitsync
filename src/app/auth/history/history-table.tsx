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
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                        placeholder="Search customer or receipt..."
                        className="pl-10 h-10 rounded-lg border-border bg-card shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    พบทั้งหมด {filteredReceipts.length} รายการ
                </div>
            </div>

            <Card className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50 border-b border-border">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="py-4 font-semibold text-muted-foreground tracking-wider uppercase text-[10px]">
                                <Calendar className="inline h-3.5 w-3.5 mr-1.5" /> Date / Time
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground tracking-wider uppercase text-[10px]">Receipt ID</TableHead>
                            <TableHead className="font-semibold text-muted-foreground tracking-wider uppercase text-[10px]">
                                <User className="inline h-3.5 w-3.5 mr-1.5" /> Customer
                            </TableHead>
                            <TableHead className="text-right font-semibold text-muted-foreground tracking-wider uppercase text-[10px]">
                                <CreditCard className="inline h-3.5 w-3.5 mr-1.5" /> Total
                            </TableHead>
                            <TableHead className="w-[80px]"></TableHead>
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
                                <TableRow key={receipt.id} className="hover:bg-accent/50 transition-colors border-border group">
                                    <TableCell className="py-4">
                                        <div className="font-semibold text-foreground">
                                            {new Date(receipt.created_at).toLocaleDateString('en-US', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                            {new Date(receipt.created_at).toLocaleTimeString('en-US', {
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-[11px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                                            {receipt.receipt_number}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-foreground text-sm">{receipt.customer_name}</div>
                                        <div className="text-[10px] font-medium text-muted-foreground mt-0.5">{receipt.customer_phone}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="font-bold text-lg tracking-tight text-foreground">
                                            ฿{receipt.total_amount.toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-accent text-muted-foreground hover:text-foreground" asChild>
                                            <Link href={`/auth/receipt/${receipt.id}`}>
                                                <Eye className="h-4 w-4" />
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
