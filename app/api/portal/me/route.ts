import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const ref = adminDb.collection('users').doc(decoded.uid)
    const doc = await ref.get()
    if (!doc.exists) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const data = doc.data()!

    // Auto-marca onboardingComplete para alunos antigos que já têm cpf + birthdate
    if (!data.onboardingComplete && data.cpf && data.birthdate) {
      await ref.update({ onboardingComplete: true })
      data.onboardingComplete = true
    }

    return NextResponse.json({ id: doc.id, ...data })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
