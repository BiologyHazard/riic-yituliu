const ALLOWED_HOSTS = new Set([
  'monster-siren.hypergryph.com',
  'web.hycdn.cn',
  'res01.hycdn.cn',
  'res02.hycdn.cn',
  'res03.hycdn.cn',
  'res04.hycdn.cn',
]);

function buildCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type, Accept-Ranges',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export const onRequest: PagesFunction = async (context) => {
  const request = context.request;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(request) });
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: buildCorsHeaders(request),
    });
  }

  const url = new URL(request.url);
  const rawUrl = url.searchParams.get('url');

  if (!rawUrl) {
    return new Response('Missing url query parameter', {
      status: 400,
      headers: buildCorsHeaders(request),
    });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return new Response('Invalid url query parameter', {
      status: 400,
      headers: buildCorsHeaders(request),
    });
  }

  if (!ALLOWED_HOSTS.has(targetUrl.hostname)) {
    return new Response('Target host is not allowed', {
      status: 403,
      headers: buildCorsHeaders(request),
    });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: {
        Accept: request.headers.get('Accept') ?? '*/*',
        Range: request.headers.get('Range') ?? '',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const headers = new Headers(upstream.headers);
    for (const [key, value] of Object.entries(buildCorsHeaders(request))) {
      headers.set(key, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...buildCorsHeaders(request), 'Content-Type': 'application/json' },
    });
  }
};
