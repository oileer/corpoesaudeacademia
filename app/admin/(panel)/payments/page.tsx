'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Student } from '@/types'
import { Search, CreditCard, CheckCircle, Clock, AlertCircle, Dumbbell } from 'lucide-react'
import { workoutStatus } from '@/components/admin/StudentCard'

interface StudentWithPayment extends Student {
  lastPaymentStatus?: string
  lastPaymentRef?: string
  lastPaymentDue?: string
  lastPaymentId?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  paid:    { label: 'Em dia',     color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  pending: { label: 'Pendente',   color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  overdue: { label: 'Vencido',    color: 'bg-red-100 text-red-700',      icon: AlertCircle },
  none:    { label: 'Sem cobr.', color: 'bg-gray-100 text-gray-500',    icon: CreditCard },
}

export default function PaymentsPage() {
  const [students, setStudents] = useState<StudentWithPayment[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const [studentsRes, paymentsRes] = await Promise.all([
        fetch('/api/students').then(r => r.ok ? r.json() : []),
        fetch('/api/payments').then(r => r.ok ? r.json() : []),
      ])
      const studentList: Student[] = Array.isArray(studentsRes) ? studentsRes : []
      const paymentList: any[] = Array.isArray(paymentsRes) ? paymentsRes : []

    // Para cada aluno, pegar o pagamento mais recente
    const enriched: StudentWithPayment[] = studentList.map(s => {
      const mine = paymentList
        .filter(p => p.studentId === s.id)
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      const latest = mine[0]
      return {
        ...s,
        lastPaymentStatus: latest?.status ?? 'none',
        lastPaymentRef: latest?.reference,
        lastPaymentDue: latest?.dueDate,
        lastPaymentId: latest?.id,
      }
    })
    setStudents(enriched)
    } catch (e) {
      console.error('Erro ao carregar pagamentos:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function markPaid(studentId: string, paymentId: string) {
    const res = await fetch(`/api/students/${studentId}/payments/${paymentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid', paymentMethod: 'pix' }),
    })
    if (res.ok) {
      toast.success('Pagamento confirmado!')
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, lastPaymentStatus: 'paid' } : s
      ))
    } else {
      toast.error('Erro ao confirmar pagamento')
    }
  }

  const filtered = students.filter(s => {
    const q = search.replace(/\D/g, '') || search.toLowerCase()
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
      || s.cpf.replace(/\D/g, '').includes(q)
      || (s.phone ?? '').replace(/\D/g, '').includes(q)
    const matchFilter = filter === 'all' || s.lastPaymentStatus === filter
    return matchSearch && matchFilter
  })

  const counts = {
    all: students.length,
    paid: students.filter(s => s.lastPaymentStatus === 'paid').length,
    pending: students.filter(s => s.lastPaymentStatus === 'pending').length,
    overdue: students.filter(s => s.lastPaymentStatus === 'overdue').length,
    none: students.filter(s => s.lastPaymentStatus === 'none').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
        <p className="text-gray-500 text-sm mt-1">Situação financeira de todos os alunos</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['paid','pending','overdue','none'] as const).map(s => {
          const cfg = statusConfig[s]
          const Icon = cfg.icon
          return (
            <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`rounded-xl border p-4 text-left transition-all ${filter === s ? 'ring-2 ring-blue-500' : ''} ${cfg.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} />
                <span className="text-xs font-medium">{cfg.label}</span>
              </div>
              <p className="text-2xl font-bold">{counts[s]}</p>
            </button>
          )
        })}
      </div>

      {/* Busca */}
      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Buscar por nome, CPF ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => {
                const cfg = statusConfig[s.lastPaymentStatus ?? 'none']
                const Icon = cfg.icon
                const ws = workoutStatus(s as any)
                return (
                  <div key={s.id} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/students/${s.id}`} className="font-semibold text-gray-900 hover:text-blue-600 truncate block">{s.name}</Link>
                        <p className="text-xs text-gray-400 capitalize">{s.plan} {s.lastPaymentDue ? `· vence ${new Date(s.lastPaymentDue).toLocaleDateString('pt-BR')}` : ''}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0 ${cfg.color}`}>
                        <Icon size={11} />{cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${ws === 'locked' ? 'text-gray-400' : ws === 'expiring' ? 'text-amber-600' : 'text-green-600'}`}>
                        <Dumbbell size={11} />
                        {ws === 'locked' ? 'Treino bloqueado' : ws === 'expiring' ? 'Expirando' : 'Treino liberado'}
                      </span>
                      <div className="flex gap-2">
                        {(s.lastPaymentStatus === 'pending' || s.lastPaymentStatus === 'overdue') && s.lastPaymentId && (
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300 text-xs h-7 px-2"
                            onClick={() => markPaid(s.id, s.lastPaymentId!)}>
                            ✓ Confirmar Pix
                          </Button>
                        )}
                        <Link href={`/admin/students/${s.id}/payments/new`}>
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2">+ Cobrar</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
          })}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nenhum aluno encontrado</p>
          )}
        </div>
      )}
    </div>
  )
}
