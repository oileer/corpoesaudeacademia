import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { cpfToEmail } from '@/lib/auth'

async function findStudentByIdentifier(identifier: string) {
  const digits = identifier.replace(/\D/g, '')
  const snap = await adminDb.collection('users').where('role', '==', 'aluno').get()
  return snap.docs.find(d => {
    const data = d.data()
    const cpf = String(data.cpf ?? '').replace(/\D/g, '')
    const phone = String(data.phone ?? '').replace(/\D/g, '')
    return cpf === digits || phone === digits
  }) ?? null
}

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json()
    if (!identifier) return NextResponse.json({ error: 'identifier required' }, { status: 400 })

    const doc = await findStudentByIdentifier(identifier)
    if (!doc) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const data = doc.data()

    if (!data.onboardingComplete) {
      const missingFields: string[] = []
      if (!data.cpf) missingFields.push('cpf')
      if (!data.birthdate) missingFields.push('birthdate')
      if (!data.onboardingComplete) missingFields.push('password')

      return NextResponse.json({
        needsOnboarding: true,
        userId: doc.id,
        name: data.name,
        phone: data.phone,
        cpf: data.cpf ?? null,
        missingFields,
      })
    }

    const email = cpfToEmail(String(data.cpf).replace(/\D/g, ''))
    return NextResponse.json({ email })
  } catch (err) {
    console.error('[auth/lookup]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
