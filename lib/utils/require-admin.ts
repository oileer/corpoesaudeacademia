import { NextRequest } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function requireAdmin(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  if (!session) return null
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (userDoc.data()?.role !== 'admin') return null
    return decoded
  } catch {
    return null
  }
}
