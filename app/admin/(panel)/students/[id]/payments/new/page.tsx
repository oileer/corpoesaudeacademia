'use client'
import { useParams } from 'next/navigation'
import PaymentForm from '@/components/admin/PaymentForm'

export default function NewPaymentPage() {
  const { id } = useParams() as { id: string }
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Nova Cobrança</h1>
      <PaymentForm studentId={id} />
    </div>
  )
}
