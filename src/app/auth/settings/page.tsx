import React from 'react'
import { getProfile, getPaymentMethods } from './actions'
import SettingsForm from './settings-form'

export const metadata = {
  title: 'ตั้งค่าร้านค้า | Bitsync',
}

export default async function SettingsPage() {
  const profile = await getProfile()
  const paymentMethods = await getPaymentMethods()

  return (
    <div className="w-full pb-20 animate-in fade-in duration-700">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">ตั้งค่าร้านค้า</h1>
        <p className="text-sm font-medium text-muted-foreground/80">ปรับแต่งข้อมูลร้านค้า การสร้างแบรนด์ และช่องทางการชำระเงิน</p>
      </div>

      <div className="w-full">
        <SettingsForm
          initialProfile={profile}
          initialPaymentMethods={paymentMethods}
        />
      </div>
    </div>
  )
}
