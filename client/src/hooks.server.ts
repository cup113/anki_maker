import type { Handle } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

/**
 * 页面的 SSR 归 Node，/api 与 /mcp 仍然归 FastAPI。
 * 这里只做一次同源的透明转发，所以浏览器侧的相对路径一个都不用改。
 */
const API_ORIGIN = env.API_INTERNAL_URL ?? 'http://127.0.0.1:4134'

const DROP_REQUEST = new Set(['host', 'connection', 'content-length', 'accept-encoding'])
const DROP_RESPONSE = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'content-encoding',
  'content-length',
])

function is_api(pathname: string): boolean {
  return pathname.startsWith('/api') || pathname.startsWith('/mcp')
}

async function proxy(event: Parameters<Handle>[0]['event']): Promise<Response> {
  const target = new URL(event.url.pathname + event.url.search, API_ORIGIN)

  const headers = new Headers()
  event.request.headers.forEach((value, key) => {
    if (!DROP_REQUEST.has(key)) headers.set(key, value)
  })

  const method = event.request.method
  const has_body = method !== 'GET' && method !== 'HEAD'

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: has_body ? await event.request.arrayBuffer() : undefined,
      redirect: 'manual',
    })
  } catch (error) {
    console.error('[proxy] FastAPI unreachable', target.href, error)
    return new Response(JSON.stringify({ detail: 'backend unreachable' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }

  const response_headers = new Headers()
  upstream.headers.forEach((value, key) => {
    if (!DROP_RESPONSE.has(key)) response_headers.set(key, value)
  })

  const location = response_headers.get('location')
  if (location?.startsWith(API_ORIGIN)) {
    response_headers.set('location', location.slice(API_ORIGIN.length) || '/')
  }

  // 直接转发 body 流：MCP 的 SSE 不能被缓冲，docx/apkg 也不该整包进内存。
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: response_headers,
  })
}

export const handle: Handle = async ({ event, resolve }) => {
  if (is_api(event.url.pathname)) {
    return proxy(event)
  }
  return resolve(event)
}
