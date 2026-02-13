"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Calendar, CreditCard, ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"

import { useLanguage } from "@/components/language-provider"

export type Receipt = {
    id: string
    receipt_number: string
    customer_name: string
    customer_phone: string
    total_amount: number
    created_at: string
}

export const useColumns = (): ColumnDef<Receipt>[] => {
    const { t, language } = useLanguage()

    return [
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
                        {t('history.date_time')}
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return (
                    <div>
                        <div className="font-semibold text-foreground">
                            {date.toLocaleDateString(language === 'th' ? "th-TH" : "en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                            })}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                            {date.toLocaleTimeString(language === 'th' ? "th-TH" : "en-US", {
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
            header: t('history.receipt_no'),
            cell: ({ row }) => (
                <span className="font-mono text-[11px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                    {row.getValue("receipt_number")}
                </span>
            ),
        },
        {
            accessorKey: "customer_name",
            header: t('history.customer'),
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
                        {t('history.total_amount')}
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
            header: () => <div className="text-right">{t('history.actions')}</div>,
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
}
