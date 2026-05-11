import { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function requireAdmin(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  if (!session) return null
  try {
    return await adminAuth.verifySessionCookie(session, true)
  } catch {
    return null
  }
}
