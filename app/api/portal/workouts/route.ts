import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const snap = await adminDb.collection('students').doc(decoded.uid).collection('workouts').where('active', '==', true).get()
    return NextResponse.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
