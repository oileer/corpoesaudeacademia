import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/require-admin'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const today = new Date()
  const defaultMonth = today.toISOString().substring(0, 7) // "2026-05"
  const month = searchParams.get('month') ?? defaultMonth // "YYYY-MM"

  const [year, mon] = month.split('-').map(Number)

  const studentsSnap = await adminDb.collection('users').where('role', '==', 'aluno').get()
  const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any))

  const totalStudents = students.length
  const activeStudents = students.filter((s: any) => s.status === 'active').length
  const inactiveStudents = students.filter((s: any) => s.status === 'inactive').length
  const overdueStudents = students.filter((s: any) => s.status === 'overdue').length

  const dueIn7 = students.filter((s: any) => {
    if (!s.dueDate) return false
    const due = new Date(s.dueDate)
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }).length

  // Treinos
  const workoutUnlocked = students.filter((s: any) => {
    if (!s.workoutUnlockedUntil) return false
    return new Date(s.workoutUnlockedUntil) > today
  }).length
  const workoutLocked = totalStudents - workoutUnlocked

  // Conta alunos com pelo menos 1 treino criado (via subcollection)
  const workoutCounts = await Promise.all(
    students.map((s: any) =>
      adminDb.collection('users').doc(s.id).collection('workouts').limit(1).get()
        .then(snap => snap.size > 0)
    )
  )
  const studentsWithWorkout = workoutCounts.filter(Boolean).length
  const studentsWithoutWorkout = totalStudents - studentsWithWorkout

  // Pagamentos do mês selecionado
  const paymentsSnap = await adminDb.collectionGroup('payments').get()
  const allPayments = paymentsSnap.docs.map(d => d.data() as any)

  // Pagamentos do mês: filtra por dueDate ou paidAt dentro do mês
  const monthPayments = allPayments.filter(p => {
    const ref = p.paidAt ?? p.dueDate ?? ''
    return ref.startsWith(month)
  })

  const paidThisMonth = monthPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const pendingThisMonth = monthPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const estimatedThisMonth = paidThisMonth + pendingThisMonth

  const paidCount = monthPayments.filter(p => p.status === 'paid').length
  const pendingCount = monthPayments.filter(p => p.status === 'pending' || p.status === 'overdue').length

  // Lista últimos meses disponíveis (6 meses)
  const months: string[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push(d.toISOString().substring(0, 7))
  }

  return NextResponse.json({
    month,
    months,
    totalStudents,
    activeStudents,
    inactiveStudents,
    overdueStudents,
    dueIn7Days: dueIn7,
    // Receita do mês selecionado
    paidThisMonth,
    pendingThisMonth,
    estimatedThisMonth,
    paidCount,
    pendingCount,
    // Treinos
    workoutUnlocked,
    workoutLocked,
    studentsWithWorkout,
    studentsWithoutWorkout,
  })
}
