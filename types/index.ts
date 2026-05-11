export type UserRole = 'admin' | 'aluno'
export type StudentStatus = 'active' | 'inactive' | 'overdue'
export type PlanType = 'mensal' | 'trimestral' | 'semestral' | 'anual'
export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'boleto'
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled'

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
  rest?: string
  notes?: string
}

export interface Workout {
  id: string
  studentId: string
  name: string
  description?: string
  weekDays?: string[]
  exercises: Exercise[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  studentId: string
  reference: string
  amount: number
  dueDate: string
  status: PaymentStatus
  paymentMethod?: PaymentMethod
  paidAt?: string
  notes?: string
  createdAt: string
}

export interface DashboardStats {
  totalStudents: number
  activeStudents: number
  inactiveStudents: number
  dueIn7Days: number
  monthlyRevenue: number
  pendingPayments: number
  overduePayments: number
}
