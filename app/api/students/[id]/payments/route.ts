import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { listPayments, createPayment } from '@/lib/services/payments'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive(),
  dueDate: z.string().min(1),
  reference: z.string().min(1),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).default('pending'),
  paymentMethod: z.enum(['pix', 'dinheiro', 'cartao', 'boleto']).optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const payments = await listPayments(id)
  return NextResponse.json(payments)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const payment = await createPayment(id, parsed.data)
  return NextResponse.json(payment, { status: 201 })
}
