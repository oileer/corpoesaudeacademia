import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { objective, level, restrictions, daysPerWeek } = await req.json()

  const prompt = `Você é um personal trainer experiente. Crie um plano de treino personalizado em JSON.

Dados do aluno:
- Objetivo: ${objective}
- Nível: ${level}
- Restrições/lesões: ${restrictions || 'nenhuma'}
- Dias disponíveis por semana: ${daysPerWeek || 3}

Retorne APENAS JSON válido no seguinte formato (sem markdown, sem texto extra):
{
  "workouts": [
    {
      "name": "Treino A — Peito e Tríceps",
      "description": "Foco em hipertrofia",
      "weekDays": ["segunda", "quinta"],
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

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  try {
    const json = JSON.parse(text)
    return NextResponse.json(json)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return NextResponse.json(JSON.parse(match[0]))
    return NextResponse.json({ error: 'AI response parse error', raw: text }, { status: 500 })
  }
}
