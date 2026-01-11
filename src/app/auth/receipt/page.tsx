import React from 'react'
import ReceiptForm from './receipt-form'

export const metadata = {
  title: 'สร้างใบเสร็จ | Bitsync',
}

export default function ReceiptPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">ออกใบเสร็จ</h1>
        <p className="text-sm font-medium text-muted-foreground">สร้างใบเสร็จรับเงินสำหรับลูกค้าของคุณได้อย่างรวดเร็วและเป็นมืออาชีพ</p>
      </div>

      <div className="w-full">
        <ReceiptForm />
      </div>
    </div>
  )
}
