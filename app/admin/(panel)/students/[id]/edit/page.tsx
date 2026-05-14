'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { StudentForm } from '@/components/admin/StudentForm'
import { Student } from '@/types'

function EditStudentContent() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const isActivation = searchParams.get('activate') === '1'
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => { fetch(`/api/students/${id}`).then((r) => r.json()).then(setStudent) }, [id])

  if (!student) return <p className="p-6 text-gray-400">Carregando...</p>
  return (
    <div>
      {isActivation && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 font-medium">
          Defina o plano e ative o aluno para liberar o acesso ao portal.
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">{isActivation ? 'Ativar Aluno' : 'Editar Aluno'}</h1>
      <StudentForm student={student} mode="edit" isActivation={isActivation} />
    </div>
  )
}

export default function EditStudentPage() {
  return (
    <Suspense>
      <EditStudentContent />
    </Suspense>
  )
}
