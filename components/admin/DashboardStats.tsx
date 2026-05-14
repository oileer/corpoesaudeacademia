'use client'
import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Clock, TrendingUp, AlertCircle, Dumbbell, Lock, ChevronDown } from 'lucide-react'

interface DashData {
  month: string
  months: string[]
  totalStudents: number
  activeStudents: number
  inactiveStudents: number
  overdueStudents: number
  dueIn7Days: number
  paidThisMonth: number
  pendingThisMonth: number
  estimatedThisMonth: number
  paidCount: number
  pendingCount: number
  workoutUnlocked: number
  workoutLocked: number
  studentsWithWorkout: number
  studentsWithoutWorkout: number
}

function fmt(val: number) {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function monthLabel(m: string) {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function Card({ icon: Icon, label, value, sub, color, onClick, active }: any) {
  return (
    <div onClick={onClick} className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${active ? 'ring-2 ring-blue-500' : ''}`}>
      <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 leading-tight">{label}</p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardStats() {
  const [data, setData] = useState<DashData | null>(null)
  const [error, setError] = useState(false)
  const [month, setMonth] = useState('')
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  function load(m: string) {
    setData(null)
    fetch(`/api/dashboard${m ? `?month=${m}` : ''}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(true); return }
        setData(d)
        if (!month) setMonth(d.month)
      })
      .catch(() => setError(true))
  }

  useEffect(() => { load('') }, [])

  function selectMonth(m: string) {
    setMonth(m)
    setShowMonthPicker(false)
    load(m)
  }

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
      Erro ao carregar estatísticas.
    </div>
  )

  if (!data) return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-100 rounded-lg w-48 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── Alunos ── */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Alunos</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card icon={Users}     label="Total"          value={data.totalStudents}    color="bg-blue-500" />
          <Card icon={UserCheck} label="Ativos"         value={data.activeStudents}   color="bg-green-500" />
          <Card icon={AlertCircle} label="Inadimplentes" value={data.overdueStudents} color="bg-red-400" />
          <Card icon={UserX}     label="Inativos"       value={data.inactiveStudents} color="bg-gray-400"
            sub={data.dueIn7Days > 0 ? `⚠️ ${data.dueIn7Days} vencem em 7d` : undefined} />
        </div>
      </section>

      {/* ── Financeiro ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Financeiro</p>
          <div className="relative">
            <button
              onClick={() => setShowMonthPicker(v => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-white border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              {monthLabel(month)}
              <ChevronDown size={14} className={showMonthPicker ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            {showMonthPicker && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-10 overflow-hidden min-w-[180px]">
                {data.months.map(m => (
                  <button key={m} onClick={() => selectMonth(m)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors capitalize ${m === month ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                    {monthLabel(m)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Pago */}
          <div className="bg-white rounded-xl border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500 rounded-xl"><TrendingUp className="w-4 h-4 text-white" /></div>
              <p className="text-xs text-gray-500">Recebido em {monthLabel(month)}</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">R$ {fmt(data.paidThisMonth)}</p>
            <p className="text-xs text-gray-400">{data.paidCount} pagamento(s) confirmado(s)</p>
          </div>

          {/* Pendente */}
          <div className="bg-white rounded-xl border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-400 rounded-xl"><Clock className="w-4 h-4 text-white" /></div>
              <p className="text-xs text-gray-500">Pendente / Vencido</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">R$ {fmt(data.pendingThisMonth)}</p>
            <p className="text-xs text-gray-400">{data.pendingCount} cobrança(s) em aberto</p>
          </div>

          {/* Estimativa */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500 rounded-xl"><TrendingUp className="w-4 h-4 text-white" /></div>
              <p className="text-xs text-blue-600">Estimativa do mês</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">R$ {fmt(data.estimatedThisMonth)}</p>
            <p className="text-xs text-blue-400">Pago + pendente = total esperado</p>
            {data.estimatedThisMonth > 0 && (
              <div className="mt-2">
                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (data.paidThisMonth / data.estimatedThisMonth) * 100).toFixed(1)}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {((data.paidThisMonth / data.estimatedThisMonth) * 100).toFixed(0)}% recebido
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Treinos ── */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Treinos</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card icon={Dumbbell} label="Com treino criado"    value={data.studentsWithWorkout}    color="bg-indigo-500"
            sub={`${data.studentsWithoutWorkout} sem treino`} />
          <Card icon={UserX}   label="Sem treino ainda"     value={data.studentsWithoutWorkout}  color="bg-gray-400" />
          <Card icon={Dumbbell} label="Treino liberado"     value={data.workoutUnlocked}         color="bg-green-500"
            sub="story confirmado" />
          <Card icon={Lock}    label="Treino bloqueado"     value={data.workoutLocked}           color="bg-red-400"
            sub="aguarda story" />
        </div>
      </section>

    </div>
  )
}
