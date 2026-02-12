"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Calendar, CreditCard, ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"

export type Receipt = {
    id: string
    receipt_number: string
    customer_name: string
    customer_phone: string
    total_amount: number
    created_at: string
}

export const columns: ColumnDef<Receipt>[] = [
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
                        {date.toLocaleDateString("th-TH", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                        })}
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                        {date.toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
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
                <div className="font-semibold text-foreground text-sm">
                    {row.getValue("customer_name")}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                    {row.original.customer_phone}
                </div>
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
            return (
                <div className="text-right font-bold text-lg tracking-tight text-foreground">
                    ฿{amount.toLocaleString()}
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const receipt = row.original
            return (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg h-8 w-8 hover:bg-accent text-muted-foreground hover:text-foreground"
                        asChild
                    >
                        <Link href={`/auth/receipt/${receipt.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )
        },
    },
]
