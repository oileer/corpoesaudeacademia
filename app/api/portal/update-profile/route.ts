import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function PUT(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)

    const body = await req.json()
    const allowed = ['cpf', 'birthdate', 'instagramHandle']
    const update: Record<string, unknown> = {}

    for (const key of allowed) {
      if (body[key] !== undefined && body[key] !== '') {
        update[key] = String(body[key]).trim()
      }
    }

    // Marca perfil como completo — impede loop de redirect
    update.onboardingComplete = true

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    update.updatedAt = new Date().toISOString()
    await adminDb.collection('users').doc(decoded.uid).update(update)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[portal/update-profile]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
