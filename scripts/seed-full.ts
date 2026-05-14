import * as admin from 'firebase-admin'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const sdk = JSON.parse(process.env.FIREBASE_ADMIN_SDK!)
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sdk) })
const auth = admin.auth()
const db = admin.firestore()

const students = [
  { name: 'Carlos Silva',    cpf: '11122233344', phone: '49991111111', birthdate: '1992-03-15', plan: 'mensal',    planValue: 120, payment: 'paid'    },
  { name: 'Ana Souza',       cpf: '22233344455', phone: '49992222222', birthdate: '1988-07-22', plan: 'trimestral', planValue: 320, payment: 'pending' },
  { name: 'Pedro Oliveira',  cpf: '33344455566', phone: '49993333333', birthdate: '1995-11-08', plan: 'mensal',    planValue: 120, payment: 'overdue'  },
  { name: 'Juliana Costa',   cpf: '44455566677', phone: '49994444444', birthdate: '1990-05-30', plan: 'semestral', planValue: 650, payment: 'paid'    },
]

async function main() {
  for (const s of students) {
    const email = `${s.cpf}@estacao.app`
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (s.payment === 'overdue' ? -5 : 10))
    const now = new Date().toISOString()

    let uid: string
    try {
      const existing = await auth.getUserByEmail(email)
      uid = existing.uid
      await auth.updateUser(uid, { password: 'Teste@123', displayName: s.name, disabled: false })
      console.log(`↺ Atualizado: ${s.name}`)
    } catch {
      const created = await auth.createUser({ email, password: 'Teste@123', displayName: s.name })
      uid = created.uid
      console.log(`✓ Criado: ${s.name} (${uid})`)
    }

    await db.collection('users').doc(uid).set({
      name: s.name, email, cpf: s.cpf, phone: s.phone, birthdate: s.birthdate,
      plan: s.plan, planValue: s.planValue,
      startDate: startDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: s.payment === 'overdue' ? 'overdue' : 'active',
      role: 'aluno', createdAt: now, updatedAt: now,
    })

    // Criar pagamento
    const payRef = db.collection('users').doc(uid).collection('payments').doc()
    await payRef.set({
      studentId: uid,
      amount: s.planValue,
      reference: `Maio/2026`,
      dueDate: dueDate.toISOString().split('T')[0],
      status: s.payment,
      paymentMethod: s.payment === 'paid' ? 'pix' : null,
      paidAt: s.payment === 'paid' ? now : null,
      createdAt: now,
    })
    console.log(`  → Pagamento: ${s.payment}`)
  }

  console.log('\n✅ Seed concluído!')
  console.log('Senha de todos os alunos: Teste@123')
  console.log('Login: CPF (sem pontos/traços) + @estacao.app é o email interno')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
