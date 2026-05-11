'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Loader2 } from 'lucide-react'
import { Workout } from '@/types'

interface Props {
  studentId: string
  onSuggest: (workouts: Omit<Workout, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>[]) => void
}

export default function AISuggestForm({ studentId, onSuggest }: Props) {
  const [loading, setLoading] = useState(false)
  const [objective, setObjective] = useState('')
  const [level, setLevel] = useState('iniciante')
  const [restrictions, setRestrictions] = useState('')
  const [daysPerWeek, setDaysPerWeek] = useState('3')

  async function handleSuggest() {
    if (!objective) { toast.error('Informe o objetivo do aluno'); return }
    setLoading(true)
    const res = await fetch('/api/ai/suggest-workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective, level, restrictions, daysPerWeek: Number(daysPerWeek) }),
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      onSuggest(data.workouts)
      toast.success(`IA gerou ${data.workouts.length} treino(s)!`)
    } else {
      toast.error('Erro ao gerar sugestão')
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50 space-y-4">
      <div className="flex items-center gap-2 text-blue-700 font-semibold">
        <Sparkles className="w-5 h-5" />
        Sugestão com IA (Gemini)
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Objetivo do aluno</Label>
          <Input value={objective} onChange={e => setObjective(e.target.value)} placeholder="ex: emagrecer, ganhar massa, definir" />
        </div>
        <div>
          <Label>Nível</Label>
          <Select value={level} onValueChange={(v) => v && setLevel(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="iniciante">Iniciante</SelectItem>
              <SelectItem value="intermediario">Intermediário</SelectItem>
              <SelectItem value="avancado">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Dias por semana</Label>
          <Select value={daysPerWeek} onValueChange={(v) => v && setDaysPerWeek(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2,3,4,5,6].map(d => <SelectItem key={d} value={String(d)}>{d}x</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label>Restrições / lesões</Label>
          <Input value={restrictions} onChange={e => setRestrictions(e.target.value)} placeholder="ex: problema no joelho, hérnia de disco" />
        </div>
      </div>
      <Button onClick={handleSuggest} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</> : <><Sparkles className="w-4 h-4 mr-2" /> Gerar Treino com IA</>}
      </Button>
    </div>
  )
}
