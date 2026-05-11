'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'

const exerciseSchema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  sets: z.coerce.number().min(1),
  reps: z.string().min(1, 'Obrigatório'),
  rest: z.string().optional(),
  notes: z.string().optional(),
})

const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  description: z.string().optional(),
  weekDays: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'Adicione ao menos 1 exercício'),
})

type FormData = z.infer<typeof schema>

interface Props {
  studentId: string
  defaultValues?: Partial<FormData> & { id?: string }
  mode: 'create' | 'edit'
}

export default function WorkoutForm({ studentId, defaultValues, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues || { exercises: [{ name: '', sets: 3, reps: '10-12', rest: '60s', notes: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const payload = {
      ...data,
      weekDays: data.weekDays ? data.weekDays.split(',').map(d => d.trim()) : [],
      active: true,
    }

    const url = mode === 'create'
      ? `/api/students/${studentId}/workouts`
      : `/api/students/${studentId}/workouts/${defaultValues?.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setLoading(false)
    if (res.ok) {
      toast.success(mode === 'create' ? 'Treino criado!' : 'Treino atualizado!')
      router.push(`/admin/students/${studentId}`)
      router.refresh()
    } else {
      toast.error('Erro ao salvar treino')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Nome do Treino</Label>
          <Input {...register('name')} placeholder="ex: Treino A — Peito e Tríceps" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div className="col-span-2">
          <Label>Descrição (opcional)</Label>
          <Input {...register('description')} placeholder="Foco em hipertrofia" />
        </div>
        <div className="col-span-2">
          <Label>Dias da semana (separados por vírgula)</Label>
          <Input {...register('weekDays')} placeholder="segunda, quarta, sexta" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Exercícios</Label>
          <Button type="button" size="sm" variant="outline" onClick={() => append({ name: '', sets: 3, reps: '10-12', rest: '60s', notes: '' })}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>
        {errors.exercises && <p className="text-red-500 text-sm mb-2">{errors.exercises.message as string}</p>}

        <div className="space-y-4">
          {fields.map((field, i) => (
            <div key={field.id} className="border rounded-lg p-4 relative">
              <button type="button" onClick={() => remove(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Exercício</Label>
                  <Input {...register(`exercises.${i}.name`)} placeholder="Supino Reto" />
                </div>
                <div>
                  <Label>Séries</Label>
                  <Input type="number" {...register(`exercises.${i}.sets`)} />
                </div>
                <div>
                  <Label>Repetições</Label>
                  <Input {...register(`exercises.${i}.reps`)} placeholder="8-12" />
                </div>
                <div>
                  <Label>Descanso</Label>
                  <Input {...register(`exercises.${i}.rest`)} placeholder="90s" />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input {...register(`exercises.${i}.notes`)} placeholder="Controle a descida" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : mode === 'create' ? 'Criar Treino' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
