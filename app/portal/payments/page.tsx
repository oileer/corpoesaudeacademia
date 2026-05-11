'use client'
import { useEffect, useState } from 'react'
import { Payment } from '@/types'

const statusLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago', overdue: 'Vencido', cancelled: 'Cancelado' }
const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function PortalPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/payments').then(r => r.json()).then(d => { setPayments(d); setLoading(false) })
  }, [])

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Meus Pagamentos</h1>
      {payments.length === 0 && <p className="text-gray-400">Nenhum pagamento registrado.</p>}
      {payments.map(p => (
        <div key={p.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{p.reference}</p>
            <p className="text-sm text-gray-400">Venc.: {new Date(p.dueDate).toLocaleDateString('pt-BR')}</p>
            {p.paidAt && <p className="text-xs text-gray-400">Pago: {new Date(p.paidAt).toLocaleDateString('pt-BR')}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold">R$ {p.amount.toFixed(2)}</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[p.status]}`}>{statusLabel[p.status]}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
