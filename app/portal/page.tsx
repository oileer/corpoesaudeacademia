'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Student } from '@/types'
import { Dumbbell, CreditCard, LogOut } from 'lucide-react'
import Link from 'next/link'

const planLabel: Record<string, string> = { mensal: 'Mensal', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual' }

export default function PortalHome() {
  const [student, setStudent] = useState<Student | null>(null)
  const router = useRouter()

  const fetchMe = useCallback(async () => {
    const r = await fetch('/api/portal/me')
    const d = await r.json()
    if (d?.id) setStudent(d)
  }, [])

  useEffect(() => {
    fetchMe()

    const onVisible = () => { if (document.visibilityState === 'visible') fetchMe() }
    document.addEventListener('visibilitychange', onVisible)
    const interval = setInterval(fetchMe, 30000)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [fetchMe])

  async function handleLogout() {
    await signOut(auth)
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/')
  }

  if (!student) return (
    <div className="p-6 space-y-4">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
    </div>
  )

  const dueDate = student.dueDate ? new Date(student.dueDate) : null
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">Bem-vindo,</p>
          <h1 className="text-2xl font-bold">{student.name}</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors mt-1">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>

      <div className="bg-blue-600 text-white rounded-xl p-5 space-y-2">
        <p className="text-blue-100 text-sm">Plano {planLabel[student.plan] || student.plan}</p>
        {daysUntilDue !== null ? (
          daysUntilDue > 0
            ? <p className="font-medium">Vence em <span className="font-bold">{daysUntilDue} dias</span></p>
            : <p className="font-medium text-yellow-300">Plano vencido há {Math.abs(daysUntilDue)} dias</p>
        ) : null}
        {dueDate && <p className="text-blue-200 text-xs">{dueDate.toLocaleDateString('pt-BR')}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/portal/workouts" className="bg-white border rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-blue-400 transition">
          <Dumbbell className="w-8 h-8 text-blue-500" />
          <span className="font-medium text-sm">Meus Treinos</span>
        </Link>
        <Link href="/portal/payments" className="bg-white border rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-blue-400 transition">
          <CreditCard className="w-8 h-8 text-green-500" />
          <span className="font-medium text-sm">Pagamentos</span>
        </Link>
      </div>
    </div>
  )
}
