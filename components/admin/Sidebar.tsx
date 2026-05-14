'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Dumbbell, LogOut } from 'lucide-react'

const links = [
  { href: '/admin',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/students', label: 'Alunos',     icon: Users },
  { href: '/admin/payments', label: 'Pagamentos', icon: CreditCard },
  { href: '/admin/workouts', label: 'Treinos',    icon: Dumbbell },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      {/* Header fixo no topo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div>
          <p className="font-bold text-sm leading-tight">Estação Corpo e Saúde</p>
          <p className="text-blue-200 text-xs">Painel Admin</p>
        </div>
        <button onClick={handleLogout} className="p-2 text-blue-200 hover:text-white">
          <LogOut size={18} />
        </button>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
