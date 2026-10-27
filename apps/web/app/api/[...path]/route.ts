import { NextResponse, type NextRequest } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const FORWARDED_REQUEST_HEADERS = ['content-type', 'accept', 'accept-language', 'user-agent'];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

async function forward(request: NextRequest, segments: string[]) {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  let accessToken: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    accessToken = session?.access_token ?? null;
  } catch {
    accessToken = null;
  }

  const target = new URL(`${API_URL.replace(/\/$/, '')}/${segments.map(encodeURIComponent).join('/')}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);
  const requestId = request.headers.get('x-request-id');
  if (requestId) headers.set('x-request-id', requestId);

  const method = request.method;
  let body: ArrayBuffer | undefined;
  if (!['GET', 'HEAD'].includes(method)) {
    body = await request.arrayBuffer();
    if (body.byteLength === 0) body = undefined;
  }

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(120_000),
    });
    const responseHeaders = new Headers();
    const contentType = upstream.headers.get('content-type');
    if (contentType) responseHeaders.set('content-type', contentType);
    const upstreamRequestId = upstream.headers.get('x-request-id');
    if (upstreamRequestId) responseHeaders.set('x-request-id', upstreamRequestId);
    responseHeaders.set('cache-control', 'no-store');
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json(
      { statusCode: 503, code: 'API_UNAVAILABLE', message: 'The API is unreachable. Try again.' },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const dynamic = 'force-dynamic';
