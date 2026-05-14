import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  if (!session) return NextResponse.json({ error: 'No session' }, { status: 401 })

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    const role = userDoc.data()?.role
    return NextResponse.json({ uid: decoded.uid, role })
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  const { idToken } = await req.json()
  const expiresIn = 60 * 60 * 24 * 14 * 1000 // 14 days

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })
    const response = NextResponse.json({ ok: true })
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('session')
  return response
}
