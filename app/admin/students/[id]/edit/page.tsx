'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { StudentForm } from '@/components/admin/StudentForm'
import { Student } from '@/types'

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => { fetch(`/api/students/${id}`).then((r) => r.json()).then(setStudent) }, [id])

  if (!student) return <p className="p-6 text-gray-400">Carregando...</p>
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar Aluno</h1>
      <StudentForm student={student} mode="edit" />
    </div>
  )
}
