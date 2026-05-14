'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Workout } from '@/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function StudentWorkoutsPage() {
  const { id } = useParams<{ id: string }>()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/students/${id}/workouts`)
      .then(r => r.json())
      .then(data => { setWorkouts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handleDelete(wid: string, name: string) {
    if (!confirm(`Excluir treino "${name}"?`)) return
    const res = await fetch(`/api/students/${id}/workouts/${wid}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Treino excluído')
      setWorkouts(prev => prev.filter(w => w.id !== wid))
    } else {
      toast.error('Erro ao excluir treino')
    }
  }

  if (loading) return <div className="text-gray-400 p-4">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/admin/students/${id}`} className="text-sm text-blue-600 hover:underline">← Voltar ao aluno</Link>
          <h2 className="text-xl font-bold mt-1">Treinos</h2>
        </div>
        <Link href={`/admin/students/${id}/workouts/new`}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus size={14} className="mr-1" /> Novo Treino</Button>
        </Link>
      </div>

      {workouts.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhum treino cadastrado. Crie um treino ou use a IA para sugerir.</p>
      ) : (
        <div className="space-y-3">
          {workouts.map(w => (
            <div key={w.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{w.name}</p>
                  {w.description && <p className="text-sm text-gray-500 mt-0.5">{w.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {w.exercises?.length ?? 0} exercícios
                    {w.weekDays?.length ? ` · ${w.weekDays.join(', ')}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/students/${id}/workouts/${w.id}/edit`}>
                    <Button size="sm" variant="outline"><Pencil size={13} /></Button>
                  </Link>
                  <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => handleDelete(w.id, w.name)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
