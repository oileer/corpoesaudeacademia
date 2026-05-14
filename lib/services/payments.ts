import { adminDb } from '@/lib/firebase-admin'
import { Payment } from '@/types'
import { Timestamp } from 'firebase-admin/firestore'

export async function listPayments(studentId: string): Promise<Payment[]> {
  const snap = await adminDb
    .collection('users').doc(studentId)
    .collection('payments')
    .orderBy('dueDate', 'desc')
    .get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment))
}

export async function listAllPayments(filters?: { status?: string; month?: string }): Promise<Payment[]> {
  let query: FirebaseFirestore.Query = adminDb.collectionGroup('payments')
  if (filters?.status) query = query.where('status', '==', filters.status)
  const snap = await query.get()
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment))
  return docs.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
}

export async function createPayment(studentId: string, data: Omit<Payment, 'id' | 'studentId' | 'createdAt'>): Promise<Payment> {
  // Bloqueia cobrança duplicada para o mesmo mês (reference)
  const existing = await adminDb
    .collection('users').doc(studentId)
    .collection('payments')
    .where('reference', '==', data.reference)
    .limit(1)
    .get()
  if (!existing.empty) throw Object.assign(new Error('Já existe cobrança para este mês'), { code: 'DUPLICATE' })

  const now = new Date().toISOString()
  const ref = adminDb.collection('users').doc(studentId).collection('payments').doc()
  const payment: Omit<Payment, 'id'> = { ...data, studentId, createdAt: now }
  await ref.set(payment)
  return { id: ref.id, ...payment }
}

export async function updatePayment(studentId: string, paymentId: string, data: Partial<Payment>): Promise<void> {
  await adminDb.collection('users').doc(studentId).collection('payments').doc(paymentId).update(data)
}

export async function markPaid(studentId: string, paymentId: string, method: string): Promise<void> {
  const doc = await adminDb.collection('users').doc(studentId).collection('payments').doc(paymentId).get()
  if (!doc.exists) throw Object.assign(new Error('Pagamento não encontrado'), { code: 'NOT_FOUND' })
  if (doc.data()?.status === 'paid') throw Object.assign(new Error('Pagamento já confirmado'), { code: 'ALREADY_PAID' })

  await updatePayment(studentId, paymentId, {
    status: 'paid',
    paymentMethod: method as Payment['paymentMethod'],
    paidAt: new Date().toISOString(),
  })
  // Atualiza status do aluno para ativo automaticamente
  await adminDb.collection('users').doc(studentId).update({
    status: 'active',
    updatedAt: new Date().toISOString(),
  })
}
