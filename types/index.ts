export type UserRole = 'admin' | 'aluno'
export type StudentStatus = 'active' | 'inactive' | 'overdue'
export type PlanType = 'monthly' | 'quarterly' | 'semiannual' | 'annual'
export type PaymentMethod = 'pix' | 'cash' | 'card'
export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export interface Student {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  birthdate: string
  plan: PlanType
  planValue: number
  startDate: string
  dueDate: string
  status: StudentStatus
  role: 'aluno'
  createdAt: string
  updatedAt: string
}

export interface Exercise {
  name: string
  sets: number
  reps: string
  load?: string
  notes?: string
}

export interface Workout {
  id: string
  userId: string
  name: string
  weekDays: string[]
  exercises: Exercise[]
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  referenceMonth: string
  amount: number
  paidAt: string
  method: PaymentMethod
  notes?: string
  status: PaymentStatus
  createdAt: string
}

export interface DashboardStats {
  activeStudents: number
  monthRevenue: number
  dueSoon: Student[]
  overdue: Student[]
  recentPayments: Payment[]
}
