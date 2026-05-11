'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import WorkoutForm from '@/components/admin/WorkoutForm'
import AISuggestForm from '@/components/admin/AISuggestForm'
import { Workout } from '@/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function NewWorkoutPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [suggested, setSuggested] = useState<Omit<Workout, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>[] | null>(null)

  async function saveSuggested(workout: Omit<Workout, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>) {
    const res = await fetch(`/api/students/${id}/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...workout, active: true }),
    })
    if (res.ok) {
      toast.success(`Treino "${workout.name}" salvo!`)
    } else {
      toast.error(`Erro ao salvar "${workout.name}"`)
    }
  }

  async function saveAllSuggested() {
    if (!suggested) return
    await Promise.all(suggested.map(saveSuggested))
    router.push(`/admin/students/${id}`)
    router.refresh()
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Novo Treino</h1>

      <AISuggestForm studentId={id} onSuggest={setSuggested} />

      {suggested && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Treinos sugeridos pela IA</h2>
          {suggested.map((w, i) => (
            <div key={i} className="border rounded-lg p-4">
              <p className="font-medium">{w.name}</p>
              <p className="text-sm text-gray-500">{w.exercises.length} exercícios · {(w.weekDays || []).join(', ')}</p>
            </div>
          ))}
          <Button onClick={saveAllSuggested} className="w-full">Salvar todos os treinos</Button>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-lg mb-4">Ou crie manualmente</h2>
        <WorkoutForm studentId={id} mode="create" />
      </div>
    </div>
  )
}
