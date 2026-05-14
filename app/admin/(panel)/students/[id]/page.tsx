'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Student, StudentStatus } from '@/types'
import { Pencil, Dumbbell, CreditCard, Camera, Unlock, CheckCircle, AlertCircle, XCircle, ChevronDown } from 'lucide-react'

const statusConfig: Record<StudentStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active:  { label: 'Em dia',       color: 'bg-green-100 text-green-700 border-green-200',  icon: CheckCircle },
  overdue: { label: 'Inadimplente', color: 'bg-red-100 text-red-700 border-red-200',        icon: AlertCircle },
  inactive:{ label: 'Inativo',      color: 'bg-gray-100 text-gray-500 border-gray-200',     icon: XCircle },
}

const planLabel: Record<string, string> = {
  mensal: 'Mensal', monthly: 'Mensal',
  trimestral: 'Trimestral', quarterly: 'Trimestral',
  semestral: 'Semestral', semiannual: 'Semestral',
  anual: 'Anual', annual: 'Anual',
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/students/${id}`).then(r => r.json()).then(setStudent)
  }, [id])

  async function changeStatus(status: StudentStatus) {
    setShowStatusMenu(false)
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setStudent(s => s ? { ...s, status } : s)
      toast.success(`Status alterado para "${statusConfig[status].label}"`)
    } else {
      toast.error('Erro ao alterar status')
    }
  }

  async function handleUnlockWorkout() {
    const until = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workoutUnlockedUntil: until }),
    })
    if (res.ok) {
      toast.success('Treino liberado por 31 dias!')
      setStudent(s => s ? { ...s, workoutUnlockedUntil: until } : s)
    } else toast.error('Erro ao liberar treino')
  }

  if (!student) return <div className="p-6 text-gray-400">Carregando...</div>

  const cfg = statusConfig[student.status] ?? statusConfig.inactive
  const StatusIcon = cfg.icon

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{student.name}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/students/${id}/edit`}>
            <Button variant="outline" size="sm"><Pencil size={14} className="mr-1" /> Editar</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-3 mb-4">
        {([
          ['CPF', student.cpf],
          ['WhatsApp', student.phone],
          ['Nascimento', student.birthdate],
          ['Plano', planLabel[student.plan] ?? student.plan],
          ['Valor', student.planValue != null ? `R$ ${student.planValue.toFixed(2)}` : null],
          ['Início', student.startDate],
          ['Vencimento', student.dueDate],
        ] as [string, string | null | undefined][]).map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{value ?? '—'}</span>
          </div>
        ))}

        {student.instagramHandle && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500 flex items-center gap-1"><Camera size={13} /> Instagram</span>
            <a href={`https://instagram.com/${student.instagramHandle}`} target="_blank" rel="noopener noreferrer"
              className="font-medium text-purple-600 hover:underline">@{student.instagramHandle}</a>
          </div>
        )}

        {student.workoutUnlockedUntil && (
          <div className="flex justify-between">
            <span className="text-gray-500">Treino liberado até</span>
            <span className="font-medium text-green-600">{new Date(student.workoutUnlockedUntil).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {/* Status com dropdown para mudar */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-gray-500 font-medium">Status</span>
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(v => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:opacity-80 ${cfg.color}`}
            >
              <StatusIcon size={13} />
              {cfg.label}
              <ChevronDown size={12} className={`transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border shadow-lg z-10 overflow-hidden min-w-[160px]">
                {(Object.entries(statusConfig) as [StudentStatus, typeof statusConfig[StudentStatus]][]).map(([key, val]) => {
                  const Icon = val.icon
                  return (
                    <button key={key} onClick={() => changeStatus(key)}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${student.status === key ? 'font-semibold' : ''}`}>
                      <Icon size={14} className={
                        key === 'active' ? 'text-green-600' :
                        key === 'overdue' ? 'text-red-500' : 'text-gray-400'
                      } />
                      {val.label}
                      {student.status === key && <span className="ml-auto text-xs text-gray-400">atual</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href={`/admin/students/${id}/workouts`}>
          <Button variant="outline"><Dumbbell size={16} className="mr-2" /> Treinos</Button>
        </Link>
        <Link href={`/admin/students/${id}/payments`}>
          <Button variant="outline"><CreditCard size={16} className="mr-2" /> Pagamentos</Button>
        </Link>
        <Button variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" onClick={handleUnlockWorkout}>
          <Unlock size={16} className="mr-2" /> Liberar Treino
        </Button>
      </div>
    </div>
  )
}
