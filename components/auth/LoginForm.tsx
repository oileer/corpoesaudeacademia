'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { auth } from '@/lib/firebase'
import { cpfToEmail, formatCPF } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const adminSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const studentSchema = z.object({
  cpf: z.string().min(14, 'CPF inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type Mode = 'admin' | 'aluno'

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('admin')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const schema = mode === 'admin' ? adminSchema : studentSchema
  const { register, handleSubmit, setValue, formState: { errors: rawErrors }, reset } = useForm({
    resolver: zodResolver(schema),
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = rawErrors as any

  function switchMode(m: Mode) {
    setMode(m)
    reset()
  }

  async function onSubmit(data: any) {
    setLoading(true)
    try {
      const email = mode === 'admin' ? data.email : cpfToEmail(data.cpf)
      const credential = await signInWithEmailAndPassword(auth, email, data.password)
      const idToken = await getIdToken(credential.user)

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      router.push(mode === 'admin' ? '/admin' : '/portal')
    } catch {
      toast.error('Email/CPF ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-700">Estação Corpo e Saúde</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Gestão</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          {(['admin', 'aluno'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === m ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {m === 'admin' ? 'Sou Admin' : 'Sou Aluno'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'admin' ? (
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="admin@academia.com" {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
            </div>
          ) : (
            <div>
              <Label>CPF</Label>
              <Input
                placeholder="000.000.000-00"
                {...register('cpf')}
                onChange={(e) => setValue('cpf', formatCPF(e.target.value))}
              />
              {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message as string}</p>}
            </div>
          )}

          <div>
            <Label>Senha</Label>
            <Input type="password" placeholder="••••••" {...register('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
