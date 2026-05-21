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

    // Divisão exata de dias por tipo de treino conforme gênero
    const focusCountMap: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 3 }
    const focusDays = focusCountMap[daysPerWeek] ?? Math.ceil(daysPerWeek * 0.6)
    const complementDays = daysPerWeek - focusDays

    const isFeminino = gender === 'feminino'
    const focusLabel = isFeminino ? 'INFERIOR (glúteos, posterior de coxa, quadríceps, panturrilha, abdômen)' : 'SUPERIOR (peito, costas, ombros, bíceps, tríceps, abdômen)'
    const complementLabel = isFeminino ? 'SUPERIOR (peito, costas, ombros, bíceps, tríceps)' : 'INFERIOR (glúteos, posterior de coxa, quadríceps, panturrilha)'

    const splitInstruction = complementDays > 0
      ? `- ${focusDays} treino(s) de foco ${focusLabel}\n- ${complementDays} treino(s) de foco ${complementLabel}`
      : `- ${focusDays} treino(s) de foco ${focusLabel}`

    const prompt = `Você é um personal trainer experiente. Crie um plano de treino personalizado em JSON.

Dados do aluno:
- Objetivo: ${objective}
- Nível: ${level}
- Sexo: ${gender}
- Restrições/lesões: ${restrictions || 'nenhuma'}
- Dias disponíveis por semana: ${daysPerWeek} (${diasDisponiveis.join(', ')})

DIVISÃO OBRIGATÓRIA DOS TREINOS:
${splitInstruction}

ATENÇÃO: cada treino é um dia COMPLETO de academia. Mesmo nos dias de foco inferior, pode incluir 1-2 exercícios de superior como complemento, e vice-versa. O que muda é o FOCO PRINCIPAL de cada dia, não a exclusão total do outro grupo.

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
