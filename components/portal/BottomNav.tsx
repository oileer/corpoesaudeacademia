'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, CreditCard } from 'lucide-react'

const links = [
  { href: '/portal', icon: Home, label: 'Início' },
  { href: '/portal/workouts', icon: Dumbbell, label: 'Treinos' },
  { href: '/portal/payments', icon: CreditCard, label: 'Pagamentos' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
      {links.map(({ href, icon: Icon, label }) => {
        const active = path === href
        return (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-4 py-1 ${active ? 'text-blue-600' : 'text-gray-400'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
