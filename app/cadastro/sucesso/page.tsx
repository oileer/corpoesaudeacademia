import Link from 'next/link'
import { CheckCircle, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CadastroSucessoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Estação Corpo e Saúde</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cadastro realizado! 🎉</h2>
            <p className="text-gray-500 text-sm mt-2">
              Sua conta foi criada com sucesso. Aguarde a confirmação da academia para liberar seu acesso.
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            Em breve a equipe da Estação Corpo e Saúde entrará em contato para confirmar seu plano e liberar seu portal.
          </div>
          <Link href="/login">
            <Button variant="outline" className="w-full">Ir para o login</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
