'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { formatCPF } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle, User, Lock, Calendar, CreditCard, Dumbbell } from 'lucide-react'

interface OnboardingState {
  userId: string
  name: string
  phone: string
  cpf: string | null
  missingFields: string[]
}

const steps = ['Boas-vindas', 'Seus dados', 'Criar senha', 'Pronto!']

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [state, setState] = useState<OnboardingState | null>(null)
  const [loading, setLoading] = useState(false)

  const [cpf, setCpf] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [instagram, setInstagram] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const raw = searchParams.get('data')
    if (!raw) { router.push('/'); return }
    try {
      const parsed = JSON.parse(atob(raw))
      setState(parsed)
      if (parsed.cpf) setCpf(parsed.cpf)
    } catch {
      router.push('/')
    }
  }, [])

  if (!state) return null

  const needsCpf = state.missingFields.includes('cpf')

  function validateStep2() {
    const errs: Record<string, string> = {}
    if (needsCpf && cpf.replace(/\D/g, '').length !== 11) errs.cpf = 'CPF inválido'
    if (!birthdate) errs.birthdate = 'Data de nascimento obrigatória'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep3() {
    const errs: Record<string, string> = {}
    if (password.length < 6) errs.password = 'Mínimo 6 caracteres'
    if (password !== confirmPassword) errs.confirmPassword = 'Senhas não coincidem'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleComplete() {
    if (!validateStep3()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state!.userId, cpf, birthdate, instagram, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Faz login automático
      const credential = await signInWithEmailAndPassword(auth, data.email, password)
      const idToken = await getIdToken(credential.user)
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      setStep(3)
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao completar cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Estação Corpo e Saúde</h1>
        </div>

        {/* Progress */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`w-8 h-0.5 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Step 0 — Boas-vindas */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <User className="w-10 h-10 text-blue-600 mx-auto" />
                <h2 className="text-xl font-bold">Olá, {state.name.split(' ')[0]}! 👋</h2>
                <p className="text-gray-500 text-sm">Encontramos seu cadastro. Para acessar seu portal precisamos completar algumas informações.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-medium text-gray-700">O que vamos completar:</p>
                {needsCpf && <div className="flex items-center gap-2 text-gray-600"><CreditCard className="w-4 h-4 text-blue-500" /> CPF</div>}
                <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4 text-blue-500" /> Data de nascimento</div>
                <div className="flex items-center gap-2 text-gray-600"><span className="text-blue-500 font-bold text-sm">@</span> Instagram (para liberar treinos)</div>
                <div className="flex items-center gap-2 text-gray-600"><Lock className="w-4 h-4 text-blue-500" /> Criar sua senha</div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setStep(1)}>
                Vamos lá!
              </Button>
            </div>
          )}

          {/* Step 1 — Dados */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">Seus dados</h2>
                <p className="text-gray-500 text-sm">Preencha as informações abaixo</p>
              </div>

              {needsCpf && (
                <div>
                  <Label>CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={e => { setCpf(formatCPF(e.target.value)); setErrors(p => ({ ...p, cpf: '' })) }}
                  />
                  {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                </div>
              )}

              <div>
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={birthdate}
                  onChange={e => { setBirthdate(e.target.value); setErrors(p => ({ ...p, birthdate: '' })) }}
                />
                {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate}</p>}
              </div>

              <div>
                <Label>@ do Instagram <span className="text-gray-400 font-normal">(opcional)</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                  <Input
                    className="pl-7"
                    placeholder="seu_usuario"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value.replace('@', '').replace(/\s/g, ''))}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Necessário para liberar seus treinos mensalmente</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Voltar</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => { if (validateStep2()) setStep(2) }}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Senha */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">Criar senha</h2>
                <p className="text-gray-500 text-sm">Escolha uma senha para acessar seu portal</p>
              </div>

              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label>Confirmar senha</Label>
                <Input
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })) }}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading} onClick={handleComplete}>
                  {loading ? 'Salvando...' : 'Concluir'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Concluído */}
          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tudo certo! 🎉</h2>
                <p className="text-gray-500 text-sm mt-1">Seu cadastro está completo. Agora você pode acessar seu portal de treinos.</p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/portal')}>
                Acessar meu portal
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
