import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { listStudents, createStudent } from '@/lib/services/students'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2),
  cpf: z.string().regex(/^\d{11}$/),
  phone: z.string().min(10),
  birthdate: z.string(),
  plan: z.enum(['mensal', 'trimestral', 'semestral', 'anual']),
  planValue: z.number().positive(),
  startDate: z.string(),
  password: z.string().min(6),
})

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const students = await listStudents()
  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const student = await createStudent(parsed.data)
  return NextResponse.json(student, { status: 201 })
}
