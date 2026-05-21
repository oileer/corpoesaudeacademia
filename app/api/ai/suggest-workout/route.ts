import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const objective = String(body.objective ?? '').slice(0, 200)
    const level = String(body.level ?? '').slice(0, 50)
    const gender = String(body.gender ?? 'masculino') === 'feminino' ? 'feminino' : 'masculino'
    const restrictions = String(body.restrictions ?? '').slice(0, 300)
    const daysPerWeek = Math.min(5, Math.max(1, Number(body.daysPerWeek) || 3))

    const diasDisponiveis = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].slice(0, daysPerWeek)

    const genderFocus = gender === 'feminino'
      ? 'A aluna é do sexo feminino: priorize exercícios de membros inferiores (glúteos, posterior de coxa, quadríceps, panturrilha) na maioria dos dias. Inclua superiores apenas como complemento.'
      : 'O aluno é do sexo masculino: priorize exercícios de membros superiores (peito, costas, ombros, bíceps, tríceps) na maioria dos dias. Inclua inferiores como complemento.'

    const prompt = `Você é um personal trainer experiente. Crie um plano de treino personalizado em JSON.

Dados do aluno:
- Objetivo: ${objective}
- Nível: ${level}
- Sexo: ${gender}
- Restrições/lesões: ${restrictions || 'nenhuma'}
- Dias disponíveis por semana: ${daysPerWeek} (${diasDisponiveis.join(', ')})

Foco obrigatório por sexo: ${genderFocus}

REGRAS OBRIGATÓRIAS:
1. Crie exatamente ${daysPerWeek} treino(s), um para cada dia disponível.
2. CADA DIA deve aparecer em UM ÚNICO treino — NUNCA repita o mesmo dia em treinos diferentes.
3. Distribua os dias assim: cada treino recebe seu(s) próprio(s) dia(s) sem sobreposição.
4. Use apenas os dias: segunda, terça, quarta, quinta, sexta, sábado, domingo.

Retorne APENAS JSON válido (sem markdown, sem texto extra):
{
  "workouts": [
    {
      "name": "Treino A — Peito e Tríceps",
      "description": "Foco em hipertrofia",
      "weekDays": ["segunda"],
      "exercises": [
        {
          "name": "Supino Reto",
          "sets": 4,
          "reps": "8-12",
          "rest": "90s",
          "notes": "Controle a descida"
        }
      ]
    }
  ]
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text.trim()
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    try {
      return NextResponse.json(JSON.parse(cleaned))
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (match) return NextResponse.json(JSON.parse(match[0]))
      console.error('[suggest-workout] parse error, raw:', cleaned.slice(0, 300))
      return NextResponse.json({ error: 'Resposta da IA inválida, tente novamente.' }, { status: 422 })
    }
  } catch (err) {
    console.error('[suggest-workout] erro:', err)
    return NextResponse.json({ error: 'Erro interno ao gerar treino.' }, { status: 500 })
  }
}
