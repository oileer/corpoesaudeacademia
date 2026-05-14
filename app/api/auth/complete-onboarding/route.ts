import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { cpfToEmail } from '@/lib/auth'
import { getIdToken, signInWithEmailAndPassword } from 'firebase/auth'

export async function POST(req: NextRequest) {
  try {
    const { userId, cpf, birthdate, password, instagram } = await req.json()

    if (!userId || !cpf || !birthdate || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const cpfDigits = String(cpf).replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }

    const docRef = adminDb.collection('users').doc(userId)
    const doc = await docRef.get()
    if (!doc.exists || doc.data()?.role !== 'aluno') {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const email = cpfToEmail(cpfDigits)

    // Cria o usuário no Firebase Auth (ou atualiza se já existir)
    try {
      await adminAuth.createUser({
        uid: userId,
        email,
        password,
        displayName: doc.data()!.name,
      })
    } catch (err: any) {
      if (err.code === 'auth/uid-already-exists' || err.code === 'auth/email-already-exists') {
        await adminAuth.updateUser(userId, { email, password })
      } else {
        throw err
      }
    }

    // Atualiza Firestore
    await docRef.update({
      cpf: cpfDigits,
      email,
      birthdate,
      ...(instagram ? { instagramHandle: String(instagram).replace('@', '').trim() } : {}),
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, email })
  } catch (err) {
    console.error('[complete-onboarding]', err)
    return NextResponse.json({ error: 'Erro ao completar cadastro' }, { status: 500 })
  }
}
