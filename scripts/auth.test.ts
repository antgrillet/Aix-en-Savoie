import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spyOn } from 'bun:test'
import { NextRequest } from 'next/server'

// Origin and callback checks must never need a database connection.
process.env.DATABASE_URL = 'postgresql://test@127.0.0.1:1/hbc_auth_tests'
process.env.BETTER_AUTH_SECRET = 'hbc-auth-regression-test-secret-not-for-production'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'

const { auth: appAuth } = await import('../src/lib/auth')
const { betterAuth } = await import('better-auth/minimal')
const { memoryAdapter } = await import('better-auth/adapters/memory')
const { getAuthTables } = await import('@better-auth/core/db')
const { prisma } = await import('../src/lib/prisma')
// Better Auth otherwise skips its origin checks automatically in test mode.
const auth = betterAuth({
  ...appAuth.options,
  // These in-process requests share no client IP, including during production builds.
  rateLimit: { enabled: false },
  advanced: { ...appAuth.options.advanced, disableOriginCheck: false, disableCSRFCheck: false },
})
const { proxy } = await import('../src/proxy')
const signInBody = JSON.stringify({
  email: 'test@example.invalid',
  password: 'unused-test-password',
  callbackURL: 'https://untrusted.example',
})

test('the generated Prisma client contains every column required by Better Auth', () => {
  // Inspect the same generated metadata that the Prisma adapter checks at startup.
  const models = (prisma as unknown as {
    _runtimeDataModel: { models: Record<string, { fields: { name: string }[] }> }
  })._runtimeDataModel.models
  const missing: string[] = []
  for (const table of Object.values(getAuthTables(appAuth.options))) {
    const model = Object.entries(models).find(([name]) => name.toLowerCase() === table.modelName.toLowerCase())?.[1]
    for (const [name, field] of Object.entries(table.fields)) {
      const column = field.fieldName || name
      if (!model?.fields.some(candidate => candidate.name === column)) missing.push(`${table.modelName}.${column}`)
    }
  }
  assert.deepEqual(missing, [])
})

for (const origin of ['https://hbcaixensavoie.fr', 'https://www.hbcaixensavoie.fr']) {
  test(`accepts sign-in requests from ${origin}`, async () => {
    const response = await auth.handler(new Request(`${origin}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin, Cookie: 'site-preference=test' },
      body: signInBody,
    }))

    // A rejected callback stops before the database, after accepting the origin.
    assert.equal(response.status, 403)
    assert.equal((await response.json()).code, 'INVALID_CALLBACK_URL')
  })
}

test('rejects sign-in requests from an unrelated origin', async () => {
  const response = await auth.handler(new Request('https://www.hbcaixensavoie.fr/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example', Cookie: 'site-preference=test' },
    body: signInBody,
  }))

  assert.equal(response.status, 403)
  assert.equal((await response.json()).code, 'INVALID_ORIGIN')
})

const now = new Date()
const adminSession = {
  user: { id: 'test-admin', name: 'Test admin', email: 'admin@example.invalid', emailVerified: true, createdAt: now, updatedAt: now, role: 'admin' },
  session: { id: 'test-session', userId: 'test-admin', token: 'fixture-session-token', createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 60_000) },
}

for (const cookieName of ['better-auth.session_token', '__Secure-better-auth.session_token']) {
  test(`allows a verified admin session with ${cookieName}`, async () => {
    const getSession = spyOn(appAuth.api, 'getSession').mockResolvedValue(adminSession)
    try {
      const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/admin', {
        headers: { Cookie: `${cookieName}=test-session` },
      }))

      assert.equal(getSession.mock.calls.length, 1)
      assert.equal(response.headers.get('location'), null)
      assert.equal(response.headers.get('x-middleware-next'), '1')
    } finally {
      getSession.mockRestore()
    }
  })

  test(`rejects an invalid ${cookieName} before rendering admin pages`, async () => {
    const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/admin', {
      headers: { Cookie: `${cookieName}=expired-session` },
    }))
    assert.equal(response.status, 307)
  })

  test(`keeps login accessible with an expired ${cookieName}`, async () => {
    const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/login', {
      headers: { Cookie: `${cookieName}=expired-session` },
    }))

    assert.equal(response.headers.get('location'), null)
  })
}

test('rejects authenticated users without the admin role', async () => {
  const getSession = spyOn(appAuth.api, 'getSession').mockResolvedValue({
    ...adminSession,
    user: { ...adminSession.user, role: 'user' },
  })
  try {
    const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/admin', {
      headers: { Cookie: '__Secure-better-auth.session_token=test-session' },
    }))
    assert.equal(response.status, 307)
  } finally {
    getSession.mockRestore()
  }
})

test('denies admin access when session verification fails', async () => {
  const getSession = spyOn(appAuth.api, 'getSession').mockRejectedValue(new Error('Unavailable session store'))
  try {
    const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/admin', {
      headers: { Cookie: '__Secure-better-auth.session_token=test-session' },
    }))
    assert.equal(response.status, 307)
  } finally {
    getSession.mockRestore()
  }
})

test('redirects anonymous admin requests to login', async () => {
  const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/admin/articles'))

  assert.equal(response.status, 307)
  assert.equal(response.headers.get('location'), 'https://www.hbcaixensavoie.fr/login?from=%2Fadmin%2Farticles')
})

test('signs in a credential account without an issuer column and validates its HTTPS session', async () => {
  const userId = 'existing-admin'
  const email = 'admin@example.invalid'
  const password = 'fixture-password-only'
  const now = new Date()
  const fixtureAuth = betterAuth({
    ...auth.options,
    baseURL: 'https://www.hbcaixensavoie.fr',
    database: memoryAdapter({
      user: [{ id: userId, email, name: 'Test admin', role: 'admin', emailVerified: true, createdAt: now, updatedAt: now }],
      account: [{ id: 'existing-account', userId, accountId: userId, providerId: 'credential', password: await auth.options.emailAndPassword!.password!.hash!(password), createdAt: now, updatedAt: now }],
      session: [],
    }),
  })
  const origin = 'https://www.hbcaixensavoie.fr'
  const response = await fixtureAuth.handler(new Request(`${origin}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email, password }),
  }))

  assert.equal(response.status, 200)
  assert.equal((await response.json()).user.role, 'admin')
  const cookies = response.headers.getSetCookie()
  const sessionCookie = cookies.find(cookie => cookie.startsWith('__Secure-better-auth.session_token='))
  assert.ok(sessionCookie?.includes('Secure'))
  assert.ok(sessionCookie?.includes('HttpOnly'))
  const cookie = cookies.map(value => value.split(';')[0]).join('; ')
  const sessionResponse = await fixtureAuth.handler(new Request(`${origin}/api/auth/get-session`, {
    headers: { Cookie: cookie },
  }))
  assert.equal((await sessionResponse.json()).user.id, userId)

  const invalidResponse = await fixtureAuth.handler(new Request(`${origin}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email, password: 'wrong-fixture-password' }),
  }))
  assert.equal(invalidResponse.status, 401)
  assert.equal((await invalidResponse.json()).code, 'INVALID_EMAIL_OR_PASSWORD')
})
