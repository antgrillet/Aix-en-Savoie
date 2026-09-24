import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'

// Origin and callback checks must never need a database connection.
process.env.DATABASE_URL = 'postgresql://test@127.0.0.1:1/hbc_auth_tests'
process.env.BETTER_AUTH_SECRET = 'hbc-auth-regression-test-secret-not-for-production'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'

const { auth: appAuth } = await import('../src/lib/auth')
const { betterAuth } = await import('better-auth/minimal')
// Better Auth otherwise skips its origin checks automatically in test mode.
const auth = betterAuth({
  ...appAuth.options,
  advanced: { ...appAuth.options.advanced, disableOriginCheck: false, disableCSRFCheck: false },
})
const { proxy } = await import('../proxy')
const signInBody = JSON.stringify({
  email: 'test@example.invalid',
  password: 'unused-test-password',
  callbackURL: 'https://untrusted.example',
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

for (const cookieName of ['better-auth.session_token', '__Secure-better-auth.session_token']) {
  test(`allows the admin layout to validate ${cookieName}`, async () => {
    const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/admin', {
      headers: { Cookie: `${cookieName}=test-session` },
    }))

    assert.equal(response.headers.get('location'), null)
    assert.equal(response.headers.get('x-middleware-next'), '1')
  })

  test(`keeps login accessible with an expired ${cookieName}`, async () => {
    const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/login', {
      headers: { Cookie: `${cookieName}=expired-session` },
    }))

    assert.equal(response.headers.get('location'), null)
  })
}

test('redirects anonymous admin requests to login', async () => {
  const response = await proxy(new NextRequest('https://www.hbcaixensavoie.fr/admin/articles'))

  assert.equal(response.status, 307)
  assert.equal(response.headers.get('location'), 'https://www.hbcaixensavoie.fr/login?from=%2Fadmin%2Farticles')
})
