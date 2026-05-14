import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { listWorkouts, createWorkout, deleteAllWorkouts } from '@/lib/services/workouts'
import { z } from 'zod'

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().min(1),
  reps: z.string().min(1),
  rest: z.string().optional(),
  notes: z.string().optional(),
})

const workoutSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1),
  weekDays: z.array(z.string()).optional(),
  active: z.boolean().default(true),
})

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteAllWorkouts(id)
  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const workouts = await listWorkouts(id)
  return NextResponse.json(workouts)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const parsed = workoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  if (data.weekDays) data.weekDays = [...new Set(data.weekDays)]
  const workout = await createWorkout(id, data)
  return NextResponse.json(workout, { status: 201 })
}
