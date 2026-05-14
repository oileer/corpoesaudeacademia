import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { cpfToEmail } from '@/lib/auth'
import { rateLimit } from '@/lib/utils/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const rl = rateLimit(`register:${ip}`, 5, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Muitas tentativas. Aguarde.' }, { status: 429 })

  try {
    const { name, cpf, phone, birthdate, instagram, password } = await req.json()

    if (!name || !cpf || !phone || !birthdate || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const cpfDigits = String(cpf).replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 })
    }

    // Verifica se CPF já está cadastrado
    const existing = await adminDb.collection('users')
      .where('cpf', '==', cpfDigits)
      .limit(1)
      .get()
    if (!existing.empty) {
      return NextResponse.json({ error: 'CPF já cadastrado. Faça login.' }, { status: 409 })
    }

    const email = cpfToEmail(cpfDigits)
    const now = new Date().toISOString()

    // Cria no Firebase Auth
    const firebaseUser = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })

    // Cria no Firestore como inactive (aguarda admin ativar)
    await adminDb.collection('users').doc(firebaseUser.uid).set({
      name: name.trim(),
      cpf: cpfDigits,
      email,
      phone: String(phone).replace(/\D/g, ''),
      birthdate,
      ...(instagram ? { instagramHandle: String(instagram).replace('@', '').trim() } : {}),
      role: 'aluno',
      status: 'inactive',
      onboardingComplete: true,
      pendingActivation: true,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'CPF já cadastrado. Faça login.' }, { status: 409 })
    }
    console.error('[register]', err)
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
  }
}
