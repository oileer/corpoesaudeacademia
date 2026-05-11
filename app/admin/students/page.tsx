'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudentCard } from '@/components/admin/StudentCard'
import { Student, StudentStatus } from '@/types'
import { UserPlus } from 'lucide-react'

type FilterStatus = StudentStatus | 'all'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/students').then((r) => r.json()).then((data) => { setStudents(data); setLoading(false) })
  }, [])

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.cpf.includes(search)
    const matchFilter = filter === 'all' || s.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
        <Link href="/admin/students/new">
          <Button className="bg-blue-600 hover:bg-blue-700"><UserPlus size={16} className="mr-2" /> Novo Aluno</Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'overdue', 'inactive'] as FilterStatus[]).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'overdue' ? 'Inadimplentes' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>
      {loading && <p className="text-gray-400">Carregando...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => <StudentCard key={s.id} student={s} />)}
      </div>
    </div>
  )
}
