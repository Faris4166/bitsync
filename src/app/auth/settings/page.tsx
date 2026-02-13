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
      <div className="w-full">
        <SettingsForm
          initialProfile={profile}
          initialPaymentMethods={paymentMethods}
        />
      </div>
    </div>
  )
}
