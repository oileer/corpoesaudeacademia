'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import WorkoutForm from '@/components/admin/WorkoutForm'
import AISuggestForm from '@/components/admin/AISuggestForm'
import { Workout } from '@/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function NewWorkoutPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [suggested, setSuggested] = useState<Omit<Workout, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>[] | null>(null)
  const [saving, setSaving] = useState(false)

  async function saveAllSuggested() {
    if (!suggested) return
    setSaving(true)

    // Apaga todos os treinos existentes primeiro
    const delRes = await fetch(`/api/students/${id}/workouts`, { method: 'DELETE' })
    if (!delRes.ok) {
      toast.error('Erro ao substituir treinos antigos')
      setSaving(false)
      return
    }

    // Cria os novos
    const results = await Promise.all(
      suggested.map(workout =>
        fetch(`/api/students/${id}/workouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...workout, active: true }),
        })
      )
    )

    const failed = results.filter(r => !r.ok).length
    setSaving(false)

    if (failed > 0) {
      toast.error(`${failed} treino(s) não foram salvos`)
    } else {
      toast.success(`${suggested.length} treino(s) salvos com sucesso!`)
      router.push(`/admin/students/${id}/workouts`)
      router.refresh()
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Novo Treino</h1>

      <AISuggestForm studentId={id} onSuggest={setSuggested} />

      {suggested && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Treinos sugeridos pela IA</h2>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Os treinos atuais do aluno serão <strong>substituídos</strong> pelos novos abaixo.</span>
          </div>

          {suggested.map((w, i) => (
            <div key={i} className="border rounded-lg p-4">
              <p className="font-medium">{w.name}</p>
              <p className="text-sm text-gray-500">{w.exercises.length} exercícios · {(w.weekDays || []).join(', ')}</p>
            </div>
          ))}

          <Button onClick={saveAllSuggested} disabled={saving} className="w-full">
            {saving ? 'Salvando...' : 'Substituir treinos do aluno'}
          </Button>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-lg mb-4">Ou crie manualmente</h2>
        <WorkoutForm studentId={id} mode="create" />
      </div>
    </div>
  )
}
