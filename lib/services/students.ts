import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { Student, PlanType } from '@/types'
import { cpfToEmail, planDueDateFromStart } from '@/lib/auth'

export async function listStudents(): Promise<Student[]> {
  const snap = await adminDb.collection('users')
    .where('role', '==', 'aluno')
    .get()
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Student))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export async function getStudent(id: string): Promise<Student | null> {
  const doc = await adminDb.collection('users').doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as Student
}

interface CreateStudentInput {
  name: string
  cpf?: string
  phone: string
  birthdate?: string
  plan: PlanType
  planValue: number
  startDate: string
  password?: string
}

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const now = new Date().toISOString()
  const onboardingComplete = !!(input.cpf && input.password && input.birthdate)
  const dueDate = planDueDateFromStart(input.startDate, input.plan)

  let uid: string
  let email: string | undefined

  if (input.cpf && input.password) {
    email = cpfToEmail(input.cpf)
    const firebaseUser = await adminAuth.createUser({
      email,
      password: input.password,
      displayName: input.name,
    })
    uid = firebaseUser.uid
  } else {
    // Cadastro rápido: só Firestore, sem Firebase Auth ainda
    const ref = adminDb.collection('users').doc()
    uid = ref.id
  }

  const studentData = {
    name: input.name,
    ...(input.cpf ? { cpf: input.cpf, email: email ?? cpfToEmail(input.cpf) } : {}),
    phone: input.phone,
    ...(input.birthdate ? { birthdate: input.birthdate } : {}),
    plan: input.plan,
    planValue: input.planValue,
    startDate: input.startDate,
    dueDate,
    status: 'active' as const,
    role: 'aluno' as const,
    onboardingComplete,
    createdAt: now,
    updatedAt: now,
  }

  await adminDb.collection('users').doc(uid).set(studentData)
  return { id: uid, ...studentData } as Student
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<void> {
  // Prevent privilege escalation — never allow overwriting identity fields
  const { role, email, cpf, createdAt, ...safe } = data as Record<string, unknown>
  void role; void email; void cpf; void createdAt
  const update: Record<string, unknown> = { ...safe, updatedAt: new Date().toISOString() }
  if (data.plan || data.startDate) {
    const docSnap = await adminDb.collection('users').doc(id).get()
    const current = docSnap.data() as Student
    update.dueDate = planDueDateFromStart(
      (data.startDate ?? current.startDate) as string,
      (data.plan ?? current.plan) as string
    )
  }
  await adminDb.collection('users').doc(id).update(update)
}

export async function deleteStudent(id: string): Promise<void> {
  // Deleta subcoleções em batch
  const batch = adminDb.batch()

  const workoutsSnap = await adminDb.collection('users').doc(id).collection('workouts').get()
  workoutsSnap.docs.forEach(d => batch.delete(d.ref))

  const paymentsSnap = await adminDb.collection('users').doc(id).collection('payments').get()
  paymentsSnap.docs.forEach(d => batch.delete(d.ref))

  batch.delete(adminDb.collection('users').doc(id))
  await batch.commit()

  // Remove do Firebase Auth (ignora se não existir)
  try { await adminAuth.deleteUser(id) } catch {}
}
