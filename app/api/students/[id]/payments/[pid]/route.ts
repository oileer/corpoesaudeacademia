import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { updatePayment, markPaid } from '@/lib/services/payments'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; pid: string }> }) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, pid } = await params
  const body = await req.json()
  if (body.action === 'mark_paid') {
    await markPaid(id, pid, body.paymentMethod || 'pix')
  } else {
    await updatePayment(id, pid, body)
  }
  return NextResponse.json({ success: true })
}
