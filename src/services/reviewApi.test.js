import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminReviews, moderateReview } from './reviewApi.js';

const withFetch = async (fetchImpl, callback) => {
  const previous = { fetch: globalThis.fetch, sessionStorage: globalThis.sessionStorage };
  globalThis.fetch = fetchImpl;
  globalThis.sessionStorage = { getItem: () => 'test-token' };
  try { await callback(); } finally { Object.assign(globalThis, previous); }
};

test('admin review page sends status and paging to the order API', async () => {
  let request;
  await withFetch(async (url, options) => { request = { url, options }; return new Response(JSON.stringify({ content: [], totalPages: 0 }), { status: 200 }); }, async () => {
    await getAdminReviews({ status: 'pending', page: 2, size: 10 });
    assert.match(request.url, /\/api\/v1\/reviews\/admin\?page=2&size=10&status=PENDING/);
  });
});

test('moderation sends only the selected state and admin reply', async () => {
  let request;
  await withFetch(async (url, options) => { request = { url, options }; return new Response('{}', { status: 200 }); }, async () => {
    await moderateReview('review/1', { status: 'approved', adminReply: 'Thank you' });
    assert.match(request.url, /review%2F1$/);
    assert.deepEqual(JSON.parse(request.options.body), { status: 'APPROVED', adminReply: 'Thank you' });
  });
});
