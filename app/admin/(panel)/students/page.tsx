'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudentCard, workoutStatus } from '@/components/admin/StudentCard'
import { Student, StudentStatus } from '@/types'
import { UserPlus, Search } from 'lucide-react'

type FilterStatus = StudentStatus | 'all'
type WorkoutFilter = 'all' | 'unlocked' | 'locked'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [workoutFilter, setWorkoutFilter] = useState<WorkoutFilter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/students')
      .then((r) => r.json())
      .then((data) => { setStudents(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = students.filter((s) => {
    const q = search.replace(/\D/g, '') || search.toLowerCase()
    const matchSearch = !search
      || s.name.toLowerCase().includes(search.toLowerCase())
      || (s.cpf ?? '').replace(/\D/g, '').includes(q)
      || (s.phone ?? '').replace(/\D/g, '').includes(q)
    const matchStatus = filter === 'all' || s.status === filter
    const ws = workoutStatus(s)
    const matchWorkout = workoutFilter === 'all'
      || (workoutFilter === 'unlocked' && (ws === 'unlocked' || ws === 'expiring'))
      || (workoutFilter === 'locked' && ws === 'locked')
    return matchSearch && matchStatus && matchWorkout
  })

  const counts = {
    locked: students.filter(s => workoutStatus(s) === 'locked').length,
    expiring: students.filter(s => workoutStatus(s) === 'expiring').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
        <Link href="/admin/students/new">
          <Button className="bg-blue-600 hover:bg-blue-700"><UserPlus size={16} className="mr-2" /> Novo Aluno</Button>
        </Link>
      </div>

      {/* Alertas rápidos */}
      {(counts.locked > 0 || counts.expiring > 0) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {counts.locked > 0 && (
            <button onClick={() => setWorkoutFilter(workoutFilter === 'locked' ? 'all' : 'locked')}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${workoutFilter === 'locked' ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
              🔒 {counts.locked} sem treino liberado
            </button>
          )}
          {counts.expiring > 0 && (
            <button onClick={() => setWorkoutFilter(workoutFilter === 'expiring' as any ? 'all' : 'expiring' as any)}
              className="text-xs px-3 py-1.5 rounded-full border font-medium bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
              ⚠️ {counts.expiring} expirando em breve
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar por nome, CPF ou telefone..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-8 max-w-xs" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'overdue', 'inactive'] as FilterStatus[]).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'overdue' ? 'Inadimplentes' : 'Inativos'}
            </button>
          ))}
          <div className="w-px bg-gray-200 self-stretch" />
          {(['all', 'unlocked', 'locked'] as WorkoutFilter[]).map((w) => (
            <button key={w} onClick={() => setWorkoutFilter(w)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${workoutFilter === w ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {w === 'all' ? 'Treino: todos' : w === 'unlocked' ? '🟢 Liberado' : '🔒 Bloqueado'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => <StudentCard key={s.id} student={s} />)}
          {filtered.length === 0 && <p className="text-gray-400 col-span-3 py-8 text-center">Nenhum aluno encontrado</p>}
        </div>
      )}
    </div>
  )
}
