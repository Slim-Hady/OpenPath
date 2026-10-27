import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = sanitizeNext(request.nextUrl.searchParams.get('next'));
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=oauth', request.url));
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL('/login?error=oauth', request.url));
  }

  const providerToken = data.session?.provider_token;
  if (providerToken) {
    try {
      await fetch(`${API_URL.replace(/\/$/, '')}/github/connect`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerToken }),
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      // The user can reconnect from Settings; never block the sign-in.
    }
  }
  return NextResponse.redirect(new URL(next, request.url));
}

function sanitizeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/discover';
  return value;
}
