import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  const { pathname } = req.nextUrl

  if (!session) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/portal')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  const verifyRes = await fetch(new URL('/api/auth/session', req.url), {
    headers: { Cookie: `session=${session}` },
  })

  if (!verifyRes.ok) {
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete('session')
    return response
  }

  const { role } = await verifyRes.json()

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/portal', req.url))
  }
  if (pathname.startsWith('/portal') && role !== 'aluno') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  if (pathname === '/login') {
    return NextResponse.redirect(
      new URL(role === 'admin' ? '/admin' : '/portal', req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*', '/login'],
}
