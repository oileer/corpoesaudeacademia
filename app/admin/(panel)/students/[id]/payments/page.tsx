'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatDate } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Payment } from '@/types'
import { Plus } from 'lucide-react'

const statusLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago', overdue: 'Vencido', cancelled: 'Cancelado' }
const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default function StudentPaymentsPage() {
  const { id } = useParams<{ id: string }>()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/students/${id}/payments`)
      .then(r => r.json())
      .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function markPaid(p: Payment) {
    const res = await fetch(`/api/students/${id}/payments/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid', paymentMethod: 'pix' }),
    })
    if (res.ok) {
      toast.success('Pagamento confirmado!')
      setPayments(prev => prev.map(x => x.id === p.id ? { ...x, status: 'paid' } : x))
    } else {
      toast.error('Erro ao confirmar pagamento')
    }
  }

  if (loading) return <div className="text-gray-400 p-4">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/admin/students/${id}`} className="text-sm text-blue-600 hover:underline">← Voltar ao aluno</Link>
          <h2 className="text-xl font-bold mt-1">Pagamentos</h2>
        </div>
        <Link href={`/admin/students/${id}/payments/new`}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus size={14} className="mr-1" /> Nova Cobrança</Button>
        </Link>
      </div>

      {payments.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhum pagamento registrado.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
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
                  <td className="p-3">{p.reference}</td>
                  <td className="p-3">R$ {p.amount.toFixed(2)}</td>
                  <td className="p-3">{formatDate(p.dueDate)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[p.status]}`}>{statusLabel[p.status]}</span>
                  </td>
                  <td className="p-3">
                    {p.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => markPaid(p)}>Confirmar Pix</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
