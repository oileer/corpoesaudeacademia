import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { Student, PlanType } from '@/types'
import { cpfToEmail, planDueDateFromStart } from '@/lib/auth'

export async function listStudents(): Promise<Student[]> {
  const snap = await adminDb.collection('users')
    .where('role', '==', 'aluno')
    .orderBy('name')
    .get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Student))
}

export async function getStudent(id: string): Promise<Student | null> {
  const doc = await adminDb.collection('users').doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as Student
}

interface CreateStudentInput {
  name: string
  cpf: string
  phone: string
  birthdate: string
  plan: PlanType
  planValue: number
  startDate: string
  password: string
}

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const email = cpfToEmail(input.cpf)
  const dueDate = planDueDateFromStart(input.startDate, input.plan)
  const now = new Date().toISOString()

  const firebaseUser = await adminAuth.createUser({
    email,
    password: input.password,
    displayName: input.name,
  })

  const studentData: Omit<Student, 'id'> = {
    name: input.name,
    cpf: input.cpf,
    email,
    phone: input.phone,
    birthdate: input.birthdate,
    plan: input.plan,
    planValue: input.planValue,
    startDate: input.startDate,
    dueDate,
    status: 'active',
    role: 'aluno',
    createdAt: now,
    updatedAt: now,
  }

  await adminDb.collection('users').doc(firebaseUser.uid).set(studentData)
  return { id: firebaseUser.uid, ...studentData }
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<void> {
  const update: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() }
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

export async function deactivateStudent(id: string): Promise<void> {
  await adminDb.collection('users').doc(id).update({
    status: 'inactive',
    updatedAt: new Date().toISOString(),
  })
  await adminAuth.updateUser(id, { disabled: true })
}
