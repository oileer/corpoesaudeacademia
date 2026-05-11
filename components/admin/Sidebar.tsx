'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, LogOut } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Alunos', icon: Users },
  { href: '/admin/payments', label: 'Pagamentos', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-blue-700 text-white">
      <div className="px-6 py-6 border-b border-blue-600">
        <h2 className="font-bold text-lg leading-tight">Estação Corpo e Saúde</h2>
        <p className="text-blue-200 text-xs mt-1">Painel Admin</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === href ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-600'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-8 py-4 text-blue-200 hover:text-white hover:bg-blue-600 text-sm"
      >
        <LogOut size={18} /> Sair
      </button>
    </aside>
  )
}
