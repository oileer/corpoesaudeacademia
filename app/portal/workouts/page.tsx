'use client'
import { useEffect, useState } from 'react'
import { Workout } from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function PortalWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/workouts').then(r => r.json()).then(d => { setWorkouts(d); setLoading(false) })
  }, [])

  if (loading) return <div className="p-6 text-center">Carregando treinos...</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Meus Treinos</h1>
      {workouts.length === 0 && <p className="text-gray-400">Nenhum treino cadastrado ainda.</p>}
      {workouts.map(w => (
        <div key={w.id} className="bg-white border rounded-xl overflow-hidden">
          <button className="w-full p-4 flex items-center justify-between" onClick={() => setOpen(open === w.id ? null : w.id)}>
            <div className="text-left">
              <p className="font-semibold">{w.name}</p>
              <p className="text-sm text-gray-400">{(w.weekDays || []).join(', ') || 'Dias não definidos'}</p>
            </div>
            {open === w.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {open === w.id && (
            <div className="border-t divide-y">
              {w.exercises.map((ex, i) => (
                <div key={i} className="p-4">
                  <p className="font-medium">{ex.name}</p>
                  <p className="text-sm text-gray-500">{ex.sets} séries × {ex.reps} {ex.rest ? `· descanso ${ex.rest}` : ''}</p>
                  {ex.notes && <p className="text-xs text-gray-400 mt-1">{ex.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
