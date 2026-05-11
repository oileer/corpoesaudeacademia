import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { listAllPayments } from '@/lib/services/payments'

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const payments = await listAllPayments({ status })
  return NextResponse.json(payments)
}
