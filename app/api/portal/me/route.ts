import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const doc = await adminDb.collection('students').doc(decoded.uid).get()
    if (!doc.exists) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    return NextResponse.json({ id: doc.id, ...doc.data() })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
