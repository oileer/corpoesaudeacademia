'use client'
import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Clock, DollarSign, AlertCircle } from 'lucide-react'

interface Stats {
  totalStudents: number
  activeStudents: number
  inactiveStudents: number
  dueIn7Days: number
  monthlyRevenue: number
  pendingPayments: number
  overduePayments: number
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setStats)
  }, [])

  if (!stats) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard icon={Users} label="Total de Alunos" value={stats.totalStudents} color="bg-blue-500" />
      <StatCard icon={UserCheck} label="Alunos Ativos" value={stats.activeStudents} color="bg-green-500" />
      <StatCard icon={UserX} label="Inativos" value={stats.inactiveStudents} color="bg-gray-400" />
      <StatCard icon={Clock} label="Vencendo em 7 dias" value={stats.dueIn7Days} color="bg-yellow-500" />
      <StatCard icon={DollarSign} label="Receita do Mês" value={`R$ ${stats.monthlyRevenue.toFixed(2)}`} color="bg-emerald-600" />
      <StatCard icon={AlertCircle} label="Cobranças Pendentes" value={stats.pendingPayments} color="bg-orange-500" />
    </div>
  )
}
