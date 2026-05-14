import * as admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const sdk = JSON.parse(process.env.FIREBASE_ADMIN_SDK!)

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sdk) })
}

const auth = admin.auth()
const db = admin.firestore()

async function upsertUser(email: string, password: string, displayName: string, firestoreData: Record<string, unknown>) {
  let uid: string
  try {
    const existing = await auth.getUserByEmail(email)
    uid = existing.uid
    await auth.updateUser(uid, { password, displayName, disabled: false })
    console.log(`✓ Atualizado: ${email}`)
  } catch {
    const created = await auth.createUser({ email, password, displayName })
    uid = created.uid
    console.log(`✓ Criado: ${email} (uid: ${uid})`)
  }
  await db.collection('users').doc(uid).set({ ...firestoreData, updatedAt: new Date().toISOString() }, { merge: true })
  return uid
}

async function main() {
  // Admin
  await upsertUser(
    'admin@estacao.app',
    'Admin@123',
    'Administrador',
    {
      name: 'Administrador',
      email: 'admin@estacao.app',
      role: 'admin',
      createdAt: new Date().toISOString(),
    }
  )

  // Aluno teste — CPF fictício 000.000.000-01 → email: 00000000001@estacao.app
  const cpf = '00000000001'
  const email = `${cpf}@estacao.app`
  const uid = await upsertUser(
    email,
    'Teste@123',
    'Aluno Teste',
    {
      name: 'Aluno Teste',
      email,
      cpf,
      phone: '49999999999',
      birthdate: '1990-01-01',
      plan: 'mensal',
      planValue: 100,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      role: 'aluno',
      createdAt: new Date().toISOString(),
    }
  )

  // Criar também em /students/<uid> para o portal funcionar
  await db.collection('students').doc(uid).set({
    name: 'Aluno Teste',
    email,
    cpf,
    role: 'aluno',
    status: 'active',
    updatedAt: new Date().toISOString(),
  }, { merge: true })

  console.log('\n--- Credenciais ---')
  console.log('Admin  → admin@estacao.app  /  Admin@123')
  console.log('Aluno  → CPF: 000.000.000-01  /  Teste@123')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
