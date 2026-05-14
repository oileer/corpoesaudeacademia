'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCPF, formatPhone } from '@/lib/auth'
import { Dumbbell, ArrowLeft } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [instagram, setInstagram] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) errs.name = 'Nome obrigatório'
    if (cpf.replace(/\D/g, '').length !== 11) errs.cpf = 'CPF inválido'
    if (phone.replace(/\D/g, '').length < 10) errs.phone = 'Telefone inválido'
    if (!birthdate) errs.birthdate = 'Data de nascimento obrigatória'
    if (password.length < 6) errs.password = 'Mínimo 6 caracteres'
    if (password !== confirmPassword) errs.confirmPassword = 'Senhas não coincidem'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cpf, phone, birthdate, instagram, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) setErrors({ cpf: data.error })
        else toast.error(data.error ?? 'Erro ao criar conta')
        return
      }
      router.push('/cadastro/sucesso')
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Estação Corpo e Saúde</h1>
          <p className="text-gray-500 text-sm">Crie sua conta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome completo</Label>
              <Input placeholder="Seu nome" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label>CPF</Label>
              <Input placeholder="000.000.000-00" value={cpf} inputMode="numeric"
                onChange={e => { setCpf(formatCPF(e.target.value)); setErrors(p => ({ ...p, cpf: '' })) }} />
              {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
            </div>

            <div>
              <Label>Telefone / WhatsApp</Label>
              <Input placeholder="(48) 99999-9999" value={phone} inputMode="tel"
                onChange={e => { setPhone(formatPhone(e.target.value)); setErrors(p => ({ ...p, phone: '' })) }} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label>Data de nascimento</Label>
              <Input type="date" value={birthdate}
                onChange={e => { setBirthdate(e.target.value); setErrors(p => ({ ...p, birthdate: '' })) }} />
              {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate}</p>}
            </div>

            <div>
              <Label>Instagram <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                <Input className="pl-7" placeholder="seu_usuario" value={instagram}
                  onChange={e => setInstagram(e.target.value.replace('@', '').replace(/\s/g, ''))} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Necessário para liberar seus treinos mensalmente</p>
            </div>

            <div>
              <Label>Senha</Label>
              <Input type="password" placeholder="Mínimo 6 caracteres" value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label>Confirmar senha</Label>
              <Input type="password" placeholder="Repita a senha" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })) }} />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
