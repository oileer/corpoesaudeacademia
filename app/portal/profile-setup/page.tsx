'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCPF } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle, Dumbbell } from 'lucide-react'
import { Student } from '@/types'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [cpf, setCpf] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [instagram, setInstagram] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/portal/me').then(r => r.json()).then((s: Student) => {
      setStudent(s)
      if (s.cpf) setCpf(s.cpf)
      if (s.birthdate) setBirthdate(s.birthdate)
      if (s.instagramHandle) setInstagram(s.instagramHandle)
      setLoading(false)
    })
  }, [])

  if (loading || !student) return null

  const missingCpf = !student.cpf
  const missingBirthdate = !student.birthdate
  const missingInstagram = !student.instagramHandle

  function validate() {
    const errs: Record<string, string> = {}
    if (missingCpf && cpf.replace(/\D/g, '').length !== 11) errs.cpf = 'CPF inválido'
    if (missingBirthdate && !birthdate) errs.birthdate = 'Data de nascimento obrigatória'
    if (missingInstagram && !instagram.trim()) errs.instagram = 'Instagram obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)

    const payload: Record<string, string> = {}
    if (missingCpf) payload.cpf = cpf.replace(/\D/g, '')
    if (missingBirthdate) payload.birthdate = birthdate
    if (missingInstagram || instagram !== student.instagramHandle) {
      payload.instagramHandle = instagram.replace('@', '').trim()
    }

    const res = await fetch(`/api/portal/update-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)
    if (res.ok) {
      toast.success('Perfil atualizado!')
      router.push('/portal')
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? 'Erro ao salvar')
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
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold">Complete seu perfil</h2>
            <p className="text-gray-500 text-sm mt-1">Preencha as informações abaixo para acessar o portal.</p>
          </div>

          {missingCpf && (
            <div>
              <Label>CPF</Label>
              <Input
                placeholder="000.000.000-00"
                value={cpf}
                onChange={e => { setCpf(formatCPF(e.target.value)); setErrors(p => ({ ...p, cpf: '' })) }}
                inputMode="numeric"
              />
              {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
            </div>
          )}

          {missingBirthdate && (
            <div>
              <Label>Data de nascimento</Label>
              <Input
                type="date"
                value={birthdate}
                onChange={e => { setBirthdate(e.target.value); setErrors(p => ({ ...p, birthdate: '' })) }}
              />
              {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate}</p>}
            </div>
          )}

          <div>
            <Label>@ do Instagram {!missingInstagram && <span className="text-gray-400 font-normal">(atualizar)</span>}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
              <Input
                className="pl-7"
                placeholder="seu_usuario"
                value={instagram}
                onChange={e => { setInstagram(e.target.value.replace('@', '').replace(/\s/g, '')); setErrors(p => ({ ...p, instagram: '' })) }}
              />
            </div>
            {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>}
            <p className="text-xs text-gray-400 mt-1">Necessário para liberar seus treinos mensalmente</p>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar e continuar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
