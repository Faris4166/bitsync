"use client"

import React from "react"
import useSWR from "swr"
import { Loader2 } from "lucide-react"

import { DataTable } from "@/components/ui/data-table"
import { columns, Receipt } from "./columns"

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HistoryTable() {
    const {
        data: receiptsData,
        isLoading: loading,
    } = useSWR<Receipt[]>("/api/receipts", fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

    const receipts = receiptsData || []

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
        )

    return (
        <DataTable
            columns={columns}
            data={receipts}
            searchKey="customer_name"
            searchPlaceholder="ค้นหาชื่อลูกค้า..."
        />
    )
}
