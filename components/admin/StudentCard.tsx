import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Student } from '@/types'
import { differenceInDays } from 'date-fns'
import { Dumbbell } from 'lucide-react'

const statusConfig = {
  active: { label: 'Em dia', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  overdue: { label: 'Inadimplente', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
}

const planLabel: Record<string, string> = {
  mensal: 'Mensal', monthly: 'Mensal',
  trimestral: 'Trimestral', quarterly: 'Trimestral',
  semestral: 'Semestral', semiannual: 'Semestral',
  anual: 'Anual', annual: 'Anual',
}

export function workoutStatus(student: Student): 'unlocked' | 'locked' | 'expiring' {
  if (!student.workoutUnlockedUntil) return 'locked'
  const days = differenceInDays(new Date(student.workoutUnlockedUntil), new Date())
  if (days < 0) return 'locked'
  if (days <= 5) return 'expiring'
  return 'unlocked'
}

export function StudentCard({ student }: { student: Student }) {
  const daysUntilDue = student.dueDate ? differenceInDays(new Date(student.dueDate), new Date()) : null
  const config = statusConfig[student.status] ?? statusConfig.inactive
  const wStatus = workoutStatus(student)

  return (
    <Link href={`/admin/students/${student.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <p className="font-semibold text-gray-900 truncate">{student.name}</p>
            <p className="text-sm text-gray-500">{student.phone}</p>
          </div>
          <Badge className={config.className}>{config.label}</Badge>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{planLabel[student.plan] ?? student.plan}</span>
          <span>
            {daysUntilDue !== null
              ? daysUntilDue >= 0 ? `Vence em ${daysUntilDue}d` : `Vencido há ${Math.abs(daysUntilDue)}d`
              : '—'}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1.5">
          <Dumbbell size={12} className={
            wStatus === 'unlocked' ? 'text-green-500' :
            wStatus === 'expiring' ? 'text-amber-500' : 'text-gray-300'
          } />
          <span className={`text-xs font-medium ${
            wStatus === 'unlocked' ? 'text-green-600' :
            wStatus === 'expiring' ? 'text-amber-600' : 'text-gray-400'
          }`}>
            {wStatus === 'unlocked' && `Treino liberado até ${new Date(student.workoutUnlockedUntil!).toLocaleDateString('pt-BR')}`}
            {wStatus === 'expiring' && `Expira em ${differenceInDays(new Date(student.workoutUnlockedUntil!), new Date())}d`}
            {wStatus === 'locked' && 'Treino bloqueado'}
          </span>
        </div>
      </div>
    </Link>
  )
}
