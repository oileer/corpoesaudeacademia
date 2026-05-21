'use client'
import { useEffect, useState, useCallback } from 'react'
import { Payment } from '@/types'
import { formatDate } from '@/lib/auth'
import { RefreshCw } from 'lucide-react'

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
  const [refreshing, setRefreshing] = useState(false)

  const fetchPayments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const r = await fetch('/api/portal/payments')
      const d = await r.json()
      if (Array.isArray(d)) setPayments(d)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()

    const onVisible = () => { if (document.visibilityState === 'visible') fetchPayments(true) }
    document.addEventListener('visibilitychange', onVisible)
    const interval = setInterval(() => fetchPayments(true), 30000)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [fetchPayments])

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meus Pagamentos</h1>
        <button onClick={() => fetchPayments(true)} disabled={refreshing} className="text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {payments.length === 0 && <p className="text-gray-400">Nenhum pagamento registrado.</p>}
      {payments.map(p => (
        <div key={p.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{p.reference}</p>
            <p className="text-sm text-gray-400">Venc.: {formatDate(p.dueDate)}</p>
            {p.paidAt && <p className="text-xs text-gray-400">Pago: {formatDate(p.paidAt)}</p>}
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
