'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth'
import { toast } from 'sonner'
import { auth } from '@/lib/firebase'
import { formatCPF, formatPhone } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

type Stage = 'identifier' | 'password'
type IdentifierType = 'cpf' | 'phone'

export function StudentLoginForm() {
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<Stage>('identifier')
  const [identifierType, setIdentifierType] = useState<IdentifierType>('cpf')
  const [identifier, setIdentifier] = useState('')
  const [emailFound, setEmailFound] = useState('')
  const [password, setPassword] = useState('')
  const [identifierError, setIdentifierError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const router = useRouter()

  function handleTypeChange(type: IdentifierType) {
    setIdentifierType(type)
    setIdentifier('')
    setIdentifierError('')
  }

  function handleIdentifierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const formatted = identifierType === 'cpf' ? formatCPF(raw) : formatPhone(raw)
    setIdentifier(formatted)
    setIdentifierError('')
  }

  async function handleIdentifierSubmit(e: React.FormEvent) {
    e.preventDefault()
    const digits = identifier.replace(/\D/g, '')
    if (digits.length < 10) { setIdentifierError('CPF ou telefone inválido'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })
      const data = await res.json()

      if (!res.ok) {
        setIdentifierError(data.error ?? 'Não encontrado. Verifique com a academia.')
        return
      }

      if (data.needsOnboarding) {
        const encoded = btoa(JSON.stringify(data))
        router.push(`/onboarding?data=${encoded}`)
        return
      }

      setEmailFound(data.email)
      setStage('password')
    } catch {
      setIdentifierError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setPasswordError('Mínimo 6 caracteres'); return }

    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, emailFound, password)
      const idToken = await getIdToken(credential.user)
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      router.push('/portal')
    } catch {
      setPasswordError('Senha incorreta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-700">Estação Corpo e Saúde</h1>
          <p className="text-gray-500 text-sm mt-1">Portal do Aluno</p>
        </div>

        {stage === 'identifier' ? (
          <form onSubmit={handleIdentifierSubmit} className="space-y-4">
            <div>
              <div className="flex rounded-lg border overflow-hidden mb-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('cpf')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${identifierType === 'cpf' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  CPF
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('phone')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${identifierType === 'phone' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  Telefone
                </button>
              </div>
              <Input
                placeholder={identifierType === 'cpf' ? '000.000.000-00' : '(48) 99999-9999'}
                value={identifier}
                onChange={handleIdentifierChange}
                autoFocus
                inputMode={identifierType === 'cpf' ? 'numeric' : 'tel'}
              />
              {identifierError && <p className="text-red-500 text-xs mt-1">{identifierError}</p>}
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Verificando...' : 'Continuar'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => { setStage('identifier'); setPassword(''); setPasswordError('') }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Trocar identificador
            </button>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                autoFocus
              />
              {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
