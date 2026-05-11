import { StudentForm } from '@/components/admin/StudentForm'

export default function NewStudentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Aluno</h1>
      <StudentForm mode="create" />
    </div>
  )
}
