import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Student } from '@/types'
import { differenceInDays } from 'date-fns'

const statusConfig = {
  active: { label: 'Em dia', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  overdue: { label: 'Inadimplente', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
}

const planLabel: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
}

export function StudentCard({ student }: { student: Student }) {
  const daysUntilDue = differenceInDays(new Date(student.dueDate), new Date())
  const config = statusConfig[student.status]

  return (
    <Link href={`/admin/students/${student.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">{student.name}</p>
            <p className="text-sm text-gray-500">{student.cpf}</p>
            <p className="text-sm text-gray-500">{student.phone}</p>
          </div>
          <Badge className={config.className}>{config.label}</Badge>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{planLabel[student.plan] ?? student.plan}</span>
          <span>
            {daysUntilDue >= 0
              ? `Vence em ${daysUntilDue}d`
              : `Vencido há ${Math.abs(daysUntilDue)}d`}
          </span>
        </div>
      </div>
    </Link>
  )
}
