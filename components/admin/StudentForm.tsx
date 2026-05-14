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

const quickSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  plan: z.enum(['mensal', 'trimestral', 'semestral', 'anual']),
  planValue: z.coerce.number().positive('Valor obrigatório'),
  startDate: z.string().min(1, 'Data obrigatória'),
})

const fullSchema = quickSchema.extend({
  cpf: z.string().min(14, 'CPF inválido'),
  birthdate: z.string().min(1, 'Data obrigatória'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const editSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  birthdate: z.string().optional(),
  plan: z.enum(['mensal', 'trimestral', 'semestral', 'anual']),
  planValue: z.coerce.number().positive('Valor obrigatório'),
  startDate: z.string().min(1, 'Data obrigatória'),
})

type QuickData = z.infer<typeof quickSchema>
type FullData = z.infer<typeof fullSchema>
type EditData = z.infer<typeof editSchema>

interface Props {
  student?: Student
  mode: 'create' | 'edit'
}

export function StudentForm({ student, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quickMode, setQuickMode] = useState(false)

  const schema = mode === 'edit' ? editSchema : quickMode ? quickSchema : fullSchema

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema) as any,
    defaultValues: student
      ? { name: student.name, cpf: student.cpf, phone: student.phone, birthdate: student.birthdate, plan: student.plan, planValue: student.planValue, startDate: student.startDate }
      : {},
  })

  async function onSubmit(data: QuickData | FullData | EditData) {
    setLoading(true)
    const payload = 'cpf' in data && data.cpf
      ? { ...data, cpf: data.cpf.replace(/\D/g, '') }
      : data

    const url = mode === 'create' ? '/api/students' : `/api/students/${student!.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setLoading(false)
    if (res.ok) {
      toast.success(mode === 'create' ? 'Aluno cadastrado!' : 'Aluno atualizado!')
      router.push('/admin/students')
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err?.error ?? 'Erro ao salvar')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 max-w-xl">
      {mode === 'create' && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <button
            type="button"
            onClick={() => setQuickMode(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!quickMode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Cadastro Completo
          </button>
          <button
            type="button"
            onClick={() => setQuickMode(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${quickMode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Cadastro Rápido
          </button>
        </div>
      )}

      {quickMode && mode === 'create' && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          O aluno receberá um link para completar o cadastro (CPF, data de nascimento e senha) no primeiro acesso.
        </p>
      )}

      <div>
        <Label>Nome completo</Label>
        <Input {...register('name')} />
        {(errors as any).name && <p className="text-red-500 text-xs mt-1">{(errors as any).name.message}</p>}
      </div>

      {!quickMode && mode === 'create' && (
        <div>
          <Label>CPF</Label>
          <Input placeholder="000.000.000-00" {...register('cpf')} onChange={(e) => setValue('cpf' as any, formatCPF(e.target.value))} />
          {(errors as any).cpf && <p className="text-red-500 text-xs mt-1">{(errors as any).cpf.message}</p>}
        </div>
      )}

      <div>
        <Label>WhatsApp</Label>
        <Input {...register('phone')} placeholder="(48) 99999-9999" />
        {(errors as any).phone && <p className="text-red-500 text-xs mt-1">{(errors as any).phone.message}</p>}
      </div>

      {(mode === 'edit' || !quickMode) && (
        <div>
          <Label>Data de nascimento{quickMode ? ' (opcional)' : ''}</Label>
          <Input type="date" {...register('birthdate')} />
        </div>
      )}

      <div>
        <Label>Plano</Label>
        <Select onValueChange={(v) => setValue('plan' as any, v)} defaultValue={student?.plan}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="trimestral">Trimestral</SelectItem>
            <SelectItem value="semestral">Semestral</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Valor do plano (R$)</Label>
        <Input type="number" step="0.01" {...register('planValue')} />
        {(errors as any).planValue && <p className="text-red-500 text-xs mt-1">{(errors as any).planValue.message}</p>}
      </div>

      <div>
        <Label>Data de início</Label>
        <Input type="date" {...register('startDate')} />
      </div>

      {!quickMode && mode === 'create' && (
        <div>
          <Label>Senha inicial</Label>
          <Input type="password" placeholder="Mínimo 6 caracteres" {...(register as any)('password')} />
          {(errors as any).password && <p className="text-red-500 text-xs mt-1">{(errors as any).password.message}</p>}
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
