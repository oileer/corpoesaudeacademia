'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
  amount: z.coerce.number().positive('Valor inválido'),
  dueDate: z.string().min(1, 'Obrigatório'),
  reference: z.string().min(1, 'ex: Maio/2025'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PaymentForm({ studentId }: { studentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { dueDate: new Date().toISOString().split('T')[0] },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const res = await fetch(`/api/students/${studentId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: 'pending' }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Cobrança criada!')
      router.push(`/admin/students/${studentId}`)
      router.refresh()
    } else {
      toast.error('Erro ao criar cobrança')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <Label>Valor (R$)</Label>
        <Input type="number" step="0.01" {...register('amount')} placeholder="120.00" />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
      </div>
      <div>
        <Label>Referência</Label>
        <Input {...register('reference')} placeholder="Maio/2025" />
        {errors.reference && <p className="text-red-500 text-sm mt-1">{errors.reference.message}</p>}
      </div>
      <div>
        <Label>Vencimento</Label>
        <Input type="date" {...register('dueDate')} />
        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
      </div>
      <div>
        <Label>Observações</Label>
        <Input {...register('notes')} placeholder="Opcional" />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Criar Cobrança'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
