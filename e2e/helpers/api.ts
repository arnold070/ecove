import { APIRequestContext } from '@playwright/test'

export async function apiPost(
  request: APIRequestContext,
  path: string,
  body: Record<string, unknown>,
  token?: string
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return request.post(`/api${path}`, { data: body, headers })
}

export async function apiGet(
  request: APIRequestContext,
  path: string,
  token?: string
) {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return request.get(`/api${path}`, { headers })
}

export async function getAuthToken(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string | null> {
  const res = await apiPost(request, '/auth/login', { email, password })
  if (!res.ok()) return null
  const body = await res.json()
  return body?.data?.token || null
}
