'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Student } from '@/types'
import { Pencil, Dumbbell, CreditCard, UserX } from 'lucide-react'

const statusLabel = { active: 'Em dia', overdue: 'Inadimplente', inactive: 'Inativo' }
const planLabel: Record<string, string> = { monthly: 'Mensal', quarterly: 'Trimestral', semiannual: 'Semestral', annual: 'Anual' }

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const router = useRouter()

  useEffect(() => { fetch(`/api/students/${id}`).then((r) => r.json()).then(setStudent) }, [id])

  async function handleDeactivate() {
    if (!confirm('Inativar este aluno? O acesso dele será desabilitado.')) return
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Aluno inativado'); router.push('/admin/students') }
    else toast.error('Erro ao inativar')
  }

  if (!student) return <div className="p-6 text-gray-400">Carregando...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{student.name}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/students/${id}/edit`}>
            <Button variant="outline" size="sm"><Pencil size={14} className="mr-1" /> Editar</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDeactivate} className="text-red-600 border-red-200 hover:bg-red-50">
            <UserX size={14} className="mr-1" /> Inativar
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6 space-y-3 mb-4">
        {[['CPF', student.cpf], ['WhatsApp', student.phone], ['Nascimento', student.birthdate], ['Plano', planLabel[student.plan] ?? student.plan], ['Valor', `R$ ${student.planValue.toFixed(2)}`], ['Início', student.startDate], ['Vencimento', student.dueDate]].map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <Badge>{statusLabel[student.status]}</Badge>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href={`/admin/students/${id}/workouts`}><Button variant="outline"><Dumbbell size={16} className="mr-2" /> Treinos</Button></Link>
        <Link href={`/admin/students/${id}/payments`}><Button variant="outline"><CreditCard size={16} className="mr-2" /> Pagamentos</Button></Link>
      </div>
    </div>
  )
}
