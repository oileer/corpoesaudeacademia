'use client'
import { useEffect, useState } from 'react'
import { Payment } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const statusLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago', overdue: 'Vencido', cancelled: 'Cancelado' }
const statusColor: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', paid: 'bg-green-100 text-green-800', overdue: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-800' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = filter ? `/api/payments?status=${filter}` : '/api/payments'
    fetch(url).then(r => r.json()).then(data => { setPayments(data); setLoading(false) })
  }, [filter])

  async function markPaid(p: Payment) {
    const res = await fetch(`/api/students/${p.studentId}/payments/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid', paymentMethod: 'pix' }),
    })
    if (res.ok) {
      toast.success('Pagamento confirmado!')
      setPayments(prev => prev.map(x => x.id === p.id ? { ...x, status: 'paid' } : x))
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <div className="flex gap-2">
          {['', 'pending', 'paid', 'overdue'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-sm border ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>
              {s === '' ? 'Todos' : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Aluno</th>
              <th className="text-left p-3">Referência</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-left p-3">Vencimento</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.studentId}</td>
                <td className="p-3">{p.reference}</td>
                <td className="p-3">R$ {p.amount.toFixed(2)}</td>
                <td className="p-3">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[p.status]}`}>{statusLabel[p.status]}</span>
                </td>
                <td className="p-3">
                  {p.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => markPaid(p)}>Confirmar</Button>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">Nenhum pagamento encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
