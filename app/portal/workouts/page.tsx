'use client'
import { useEffect, useState } from 'react'
import { Workout, Student } from '@/types'
import { ChevronDown, ChevronUp, Lock, Camera } from 'lucide-react'

const ACADEMY_INSTAGRAM = process.env.NEXT_PUBLIC_ACADEMY_INSTAGRAM ?? 'estacaocorpoesaude'

export default function PortalWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/workouts').then(r => r.json()),
      fetch('/api/portal/me').then(r => r.json()),
    ]).then(([w, s]) => {
      setWorkouts(Array.isArray(w) ? w : [])
      setStudent(s)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6 text-center text-gray-400">Carregando...</div>

  const hasWorkouts = workouts.length > 0

  // Checa se o treino está liberado (workoutUnlockedUntil no futuro)
  const unlocked = student?.workoutUnlockedUntil
    ? new Date(student.workoutUnlockedUntil) > new Date()
    : false

  // Mostra gate só se tem treinos mas o unlock expirou/nunca foi feito
  // Se não tem treinos ainda, mostra gate para incentivar o story
  if (!hasWorkouts || (!unlocked && hasWorkouts)) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Meus Treinos</h1>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7 text-white" />
          </div>

          <div>
            <h2 className="font-bold text-gray-900 text-lg">Poste um story para liberar seus treinos!</h2>
            <p className="text-gray-500 text-sm mt-1">
              Uma vez por mês, poste um story no Instagram marcando a academia para ter acesso ao seu treino personalizado.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 space-y-2 text-sm text-left">
            <p className="font-medium text-gray-700">Como fazer:</p>
            <ol className="space-y-1.5 text-gray-500 list-decimal list-inside">
              <li>Abra o Instagram e poste um story</li>
              <li>Marque a academia: <span className="font-semibold text-purple-600">@{ACADEMY_INSTAGRAM}</span></li>
              <li>Aguarde a liberação do seu treino</li>
            </ol>
          </div>

          {student?.instagramHandle ? (
            <div className="bg-purple-50 rounded-lg px-4 py-2 text-sm text-purple-700">
              Seu Instagram: <span className="font-semibold">@{student.instagramHandle}</span>
            </div>
          ) : (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Você não cadastrou seu @Instagram. Fale com a academia para atualizar seu perfil.
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
            <Lock className="w-3.5 h-3.5" />
            {!hasWorkouts
              ? 'Seus treinos ainda não foram criados pela academia.'
              : 'Seu treino está bloqueado. Aguarde a liberação após o story.'}
          </div>
        </div>
      </div>
    )
  }

  const daysLeft = student?.workoutUnlockedUntil
    ? Math.ceil((new Date(student.workoutUnlockedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meus Treinos</h1>
        <span className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
          Liberado · {daysLeft}d restantes
        </span>
      </div>

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
                  <p className="text-sm text-gray-500">{ex.sets} séries × {ex.reps}{ex.rest ? ` · descanso ${ex.rest}` : ''}</p>
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
