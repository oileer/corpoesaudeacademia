'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import BottomNav from '@/components/portal/BottomNav'
import { Student } from '@/types'

function isProfileComplete(s: Student): boolean {
  // Considera completo se tiver a flag, ou se tiver cpf + birthdate + instagram
  if (s.onboardingComplete) return true
  return !!(s.cpf && s.birthdate && s.instagramHandle)
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const didCheck = useRef(false)

  useEffect(() => {
    // Só roda uma vez por montagem do layout
    if (didCheck.current) return
    didCheck.current = true

    // Se já está na tela de setup, libera direto
    if (pathname === '/portal/profile-setup') {
      setChecked(true)
      return
    }

    fetch('/api/portal/me')
      .then(r => r.json())
      .then((s: Student) => {
        if (!isProfileComplete(s)) {
          router.replace('/portal/profile-setup')
          // Deixa checked=false enquanto redireciona (mostra spinner)
        } else {
          setChecked(true)
        }
      })
      .catch(() => setChecked(true))
  }, [])

  // Quando já está em profile-setup e checked ainda é false, libera
  const isSetup = pathname === '/portal/profile-setup'

  if (!checked && !isSetup) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className={`min-h-screen bg-gray-50 ${!isSetup ? 'pb-20' : ''}`}>
      <main className="max-w-lg mx-auto">{children}</main>
      {!isSetup && <BottomNav />}
    </div>
  )
}
