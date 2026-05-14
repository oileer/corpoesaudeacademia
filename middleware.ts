import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('host') ?? ''
  const isAdminHost = hostname.startsWith('admin.')

  // Bloqueia /admin em domínios que não sejam admin.*
  if (pathname.startsWith('/admin') && !isAdminHost && !hostname.includes('localhost')) {
    return NextResponse.redirect(new URL('/login', req.url))
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
  matcher: ['/admin/:path*', '/portal/:path*', '/login', '/admin/login'],
}
