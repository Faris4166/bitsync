import React from 'react'
import ReceiptForm from './receipt-form'

export const metadata = {
  title: 'สร้างใบเสร็จ | Bitsync',
}

export default function ReceiptPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full py-8 md:py-12 px-4">
      <div className="w-full">
        <ReceiptForm />
      </div>
    </div>
  )
}
