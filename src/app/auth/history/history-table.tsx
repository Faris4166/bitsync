'use client'

import React, { useState, useEffect } from 'react'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState
} from "@tanstack/react-table"
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
    ArrowUpDown,
    Loader2
} from "lucide-react"
import Link from 'next/link'
import { Card } from '@/components/ui/card'

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
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const fetchReceipts = React.useCallback(async () => {
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
    }, [])

    useEffect(() => {
        fetchReceipts()
    }, [fetchReceipts])

    const columns: ColumnDef<Receipt>[] = [
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className="-ml-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Calendar className="mr-2 h-3.5 w-3.5" />
                        วันที่ / เวลา
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return (
                    <div>
                        <div className="font-semibold text-foreground">
                            {date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                            {date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "receipt_number",
            header: "เลขอ้างอิง",
            cell: ({ row }) => (
                <span className="font-mono text-[11px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                    {row.getValue("receipt_number")}
                </span>
            ),
        },
        {
            accessorKey: "customer_name",
            header: "ลูกค้า",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-foreground text-sm">{row.getValue("customer_name")}</div>
                    <div className="text-[10px] font-medium text-muted-foreground mt-0.5">{row.original.customer_phone}</div>
                </div>
            ),
        },
        {
            accessorKey: "total_amount",
            header: ({ column }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        className="-mr-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <CreditCard className="mr-2 h-3.5 w-3.5" />
                        ยอดรวม
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_amount"))
                return <div className="text-right font-bold text-lg tracking-tight text-foreground">฿{amount.toLocaleString()}</div>
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const receipt = row.original
                return (
                    <div className="text-right">
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-accent text-muted-foreground hover:text-foreground" asChild>
                            <Link href={`/auth/receipt/${receipt.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: receipts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาชื่อลูกค้า..."
                        value={(table.getColumn("customer_name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("customer_name")?.setFilterValue(event.target.value)
                        }
                        className="pl-10 h-10 rounded-lg border-border bg-card shadow-sm"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    พบทั้งหมด {table.getFilteredRowModel().rows.length} รายการ
                </div>
            </div>

            <Card className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50 border-b border-border">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="py-4 font-semibold text-muted-foreground tracking-wider uppercase text-[10px]">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-accent/50 transition-colors border-border group"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center py-20 text-muted-foreground">
                                    <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                    ไม่พบประวัติการออกใบเสร็จ
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    ก่อนหน้า
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    ถัดไป
                </Button>
            </div>
        </div>
    )
}
