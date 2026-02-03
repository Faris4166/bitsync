import React from 'react'
import ProductManagement from './product-form'

export const metadata = {
  title: 'จัดการสินค้า | Bitsync',
}

export default function ProductsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">จัดการสินค้า</h1>
        <p className="text-sm font-medium text-muted-foreground">จัดการรายการสินค้า ราคา และสต็อกสินค้าของคุณ</p>
      </div> */}

      <div className="w-full">
        <ProductManagement />
      </div>
    </div>
  )
}
