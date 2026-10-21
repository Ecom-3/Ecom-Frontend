import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest } from './apiClient.js';

test('401 with a fresh token does not expire the customer session', async () => {
  const previous = { fetch: globalThis.fetch, window: globalThis.window, sessionStorage: globalThis.sessionStorage };
  let event;
  const sessionToken = `test.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString('base64url')}.test`;
  globalThis.sessionStorage = { getItem: () => sessionToken };
  globalThis.window = { dispatchEvent: (value) => { event = value.type; } };
  globalThis.fetch = async () => new Response('', { status: 401 });
  try {
    await assert.rejects(apiRequest('/customer-profile', '/api/v1/profiles/me/addresses', { method: 'POST', body: '{}' }), (error) => error.status === 401 && /permission/.test(error.message));
    assert.equal(event, undefined);
    event = undefined;
    globalThis.fetch = async () => new Response('', { status: 403 });
    await assert.rejects(apiRequest('/customer-profile', '/api/v1/profiles/me/addresses'), (error) => error.status === 403 && /permission/.test(error.message));
    assert.equal(event, undefined);
    globalThis.fetch = async () => new Response('', { status: 401 });
    await assert.rejects(apiRequest('/customer-profile', '/api/v1/profiles/me', { expireSession: false }));
    assert.equal(event, undefined);
    let token = 'old-session';
    globalThis.sessionStorage = { getItem: () => token };
    globalThis.fetch = async () => { token = 'new-session'; return new Response('', { status: 401 }); };
    await assert.rejects(apiRequest('/customer-profile', '/api/v1/profiles/me'));
    assert.equal(event, undefined);
  } finally { Object.assign(globalThis, previous); }
});

test('401 with a stale token expires the customer session', async () => {
  const previous = { fetch: globalThis.fetch, window: globalThis.window, sessionStorage: globalThis.sessionStorage };
  let event;
  const expiredToken = `test.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 - 60 })).toString('base64url')}.test`;
  globalThis.sessionStorage = { getItem: () => expiredToken };
  globalThis.window = { dispatchEvent: (value) => { event = value.type; } };
  globalThis.fetch = async () => new Response('', { status: 401 });
  try {
    await assert.rejects(apiRequest('/customer-profile', '/api/v1/profiles/me/addresses'), (error) => error.status === 401 && /session is no longer valid/.test(error.message));
    assert.equal(event, 'customer-session-expired');
  } finally { Object.assign(globalThis, previous); }
});

test('simultaneous identical GETs share one in-flight request', async () => {
  const previous = { fetch: globalThis.fetch, sessionStorage: globalThis.sessionStorage };
  globalThis.sessionStorage = { getItem: () => 'dedupe-read-session' };
  let calls = 0;
  let resolveFetch;
  globalThis.fetch = () => {
    calls += 1;
    return new Promise((resolve) => { resolveFetch = resolve; });
  };
  try {
    const first = apiRequest('/catalog', '/api/v1/products?status=ACTIVE');
    const second = apiRequest('/catalog', '/api/v1/products?status=ACTIVE');
    assert.equal(calls, 1);
    resolveFetch(new Response(JSON.stringify([{ id: 'product-1' }]), { status: 200 }));
    assert.deepEqual(await Promise.all([first, second]), [[{ id: 'product-1' }], [{ id: 'product-1' }]]);
  } finally { Object.assign(globalThis, previous); }
});

test('failed GETs are not cached and mutations are never deduplicated', async () => {
  const previous = { fetch: globalThis.fetch, sessionStorage: globalThis.sessionStorage };
  globalThis.sessionStorage = { getItem: () => 'dedupe-failure-session' };
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls += 1;
    return options.method === 'POST'
      ? new Response('{}', { status: 200 })
      : calls === 1
        ? new Response('{"message":"temporary failure"}', { status: 500 })
        : new Response('{"ok":true}', { status: 200 });
  };
  try {
    await assert.rejects(apiRequest('/catalog', '/api/v1/retry'), (error) => error.status === 500);
    assert.deepEqual(await apiRequest('/catalog', '/api/v1/retry'), { ok: true });
    const first = apiRequest('/cart', '/api/v1/carts', { method: 'POST', body: '{}' });
    const second = apiRequest('/cart', '/api/v1/carts', { method: 'POST', body: '{}' });
    await Promise.all([first, second]);
    assert.equal(calls, 4);
  } finally { Object.assign(globalThis, previous); }
});
import { Buffer } from 'node:buffer';
