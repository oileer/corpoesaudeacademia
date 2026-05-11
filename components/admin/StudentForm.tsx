'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCPF } from '@/lib/auth'
import { Student } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  cpf: z.string().min(14, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  birthdate: z.string().min(1, 'Data obrigatória'),
  plan: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']),
  planValue: z.coerce.number().positive('Valor obrigatório'),
  startDate: z.string().min(1, 'Data obrigatória'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  student?: Student
  mode: 'create' | 'edit'
}

export function StudentForm({ student, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: student
      ? { name: student.name, cpf: student.cpf, phone: student.phone, birthdate: student.birthdate, plan: student.plan, planValue: student.planValue, startDate: student.startDate }
      : {},
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const cpfDigits = data.cpf.replace(/\D/g, '')
    const payload = { ...data, cpf: cpfDigits }
    const url = mode === 'create' ? '/api/students' : `/api/students/${student!.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setLoading(false)
    if (res.ok) {
      toast.success(mode === 'create' ? 'Aluno cadastrado!' : 'Aluno atualizado!')
      router.push('/admin/students')
    } else {
      toast.error('Erro ao salvar')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div>
        <Label>Nome completo</Label>
        <Input {...register('name')} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label>CPF</Label>
        <Input placeholder="000.000.000-00" {...register('cpf')} onChange={(e) => setValue('cpf', formatCPF(e.target.value))} />
        {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
      </div>
      <div>
        <Label>WhatsApp</Label>
        <Input {...register('phone')} />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>
      <div>
        <Label>Data de nascimento</Label>
        <Input type="date" {...register('birthdate')} />
      </div>
      <div>
        <Label>Plano</Label>
        <Select onValueChange={(v) => setValue('plan', v as FormData['plan'])} defaultValue={student?.plan}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
            <SelectItem value="semiannual">Semestral</SelectItem>
            <SelectItem value="annual">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Valor do plano (R$)</Label>
        <Input type="number" step="0.01" {...register('planValue')} />
        {errors.planValue && <p className="text-red-500 text-xs mt-1">{errors.planValue.message}</p>}
      </div>
      <div>
        <Label>Data de início</Label>
        <Input type="date" {...register('startDate')} />
      </div>
      {mode === 'create' && (
        <div>
          <Label>Senha inicial</Label>
          <Input type="password" {...register('password')} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? 'Salvando...' : mode === 'create' ? 'Cadastrar Aluno' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
