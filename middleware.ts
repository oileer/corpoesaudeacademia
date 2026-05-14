import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  const { pathname } = req.nextUrl
  const appMode = process.env.NEXT_PUBLIC_APP_MODE

  // Modo portal: bloqueia qualquer acesso a /admin
  if (appMode === 'portal' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Modo admin: bloqueia qualquer acesso a /portal, /login (aluno), /cadastro
  if (appMode === 'admin' && (pathname.startsWith('/portal') || pathname === '/login' || pathname === '/onboarding' || pathname.startsWith('/cadastro'))) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  const isAdminLogin = pathname === '/admin/login'
  const isStudentLogin = pathname === '/login'
  const isAdminArea = pathname.startsWith('/admin') && !isAdminLogin
  const isPortalArea = pathname.startsWith('/portal')

  if (!session) {
    if (isAdminArea) return NextResponse.redirect(new URL('/admin/login', req.url))
    if (isPortalArea) return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }

  const verifyRes = await fetch(new URL('/api/auth/session', req.url), {
    headers: { Cookie: `session=${session}` },
  })

  if (!verifyRes.ok) {
    const res = isAdminLogin || isAdminArea
      ? NextResponse.redirect(new URL('/admin/login', req.url))
      : NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('session')
    return res
  }

  const { role } = await verifyRes.json()

  if (isAdminArea && role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isPortalArea && role !== 'aluno') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  if (isAdminLogin) {
    return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/portal', req.url))
  }
  if (isStudentLogin) {
    return NextResponse.redirect(new URL(role === 'aluno' ? '/portal' : '/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*', '/login', '/admin/login', '/cadastro/:path*'],
}
