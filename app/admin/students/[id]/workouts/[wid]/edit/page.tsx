'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import WorkoutForm from '@/components/admin/WorkoutForm'
import { Workout } from '@/types'

export default function EditWorkoutPage() {
  const { id, wid } = useParams() as { id: string; wid: string }
  const [workout, setWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    fetch(`/api/students/${id}/workouts/${wid}`).then(r => r.json()).then(setWorkout)
  }, [id, wid])

  if (!workout) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Editar Treino</h1>
      <WorkoutForm
        studentId={id}
        mode="edit"
        defaultValues={{
          id: workout.id,
          name: workout.name,
          description: workout.description,
          weekDays: (workout.weekDays || []).join(', '),
          exercises: workout.exercises,
        }}
      />
    </div>
  )
}
