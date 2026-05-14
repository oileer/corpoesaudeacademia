import { Clock, Dumbbell } from 'lucide-react'

export default function AguardandoPage() {
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
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-9 h-9 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cadastro em análise</h2>
            <p className="text-gray-500 text-sm mt-2">
              Seu cadastro foi recebido! Em breve a equipe da academia vai confirmar seu plano e liberar seu acesso ao portal.
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            Qualquer dúvida, entre em contato diretamente com a academia.
          </div>
        </div>
      </div>
    </div>
  )
}
