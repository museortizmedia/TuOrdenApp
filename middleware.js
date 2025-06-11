import { NextResponse } from 'next/server'

export function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  const host = request.headers.get('host') || ''
  const isBot = /googlebot|bingbot|facebookexternalhit|twitterbot/i.test(ua)
  const isMonster = host.includes('monstersburger.com.co')

  if (isBot && isMonster && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite('/monstersburger.com.co.html')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'], // Solo afecta a la página raíz
}
