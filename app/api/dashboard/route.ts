import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const studentsSnap = await adminDb.collection('students').get()
  const students = studentsSnap.docs.map(d => d.data())

  const totalStudents = students.length
  const activeStudents = students.filter(s => s.status === 'active').length
  const inactiveStudents = students.filter(s => s.status === 'inactive').length

  const today = new Date()
  const dueIn7 = students.filter(s => {
    if (!s.dueDate) return false
    const due = new Date(s.dueDate)
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }).length

  const paymentsSnap = await adminDb.collectionGroup('payments').get()
  const payments = paymentsSnap.docs.map(d => d.data())
  const monthlyRevenue = payments
    .filter(p => p.status === 'paid' && p.paidAt?.startsWith(today.toISOString().substring(0, 7)))
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const overduePayments = payments.filter(p => p.status === 'overdue').length

  return NextResponse.json({
    totalStudents,
    activeStudents,
    inactiveStudents,
    dueIn7Days: dueIn7,
    monthlyRevenue,
    pendingPayments,
    overduePayments,
  })
}
