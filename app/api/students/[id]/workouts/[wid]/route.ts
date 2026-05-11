import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { getWorkout, updateWorkout, deleteWorkout } from '@/lib/services/workouts'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; wid: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, wid } = await params
  const workout = await getWorkout(id, wid)
  if (!workout) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(workout)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; wid: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, wid } = await params
  const body = await req.json()
  await updateWorkout(id, wid, body)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; wid: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, wid } = await params
  await deleteWorkout(id, wid)
  return NextResponse.json({ success: true })
}
