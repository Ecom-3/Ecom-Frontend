import test from 'node:test';
import assert from 'node:assert/strict';
import { getAuditLogs } from './adminAuditApi.js';

test('audit client sends bounded paging, filters, and allowlisted sort selection', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.sessionStorage;
  globalThis.fetch = async (url) => {
    const parsed = new URL(url, 'http://localhost');
    assert.match(parsed.pathname, /\/org-access\/api\/audit-logs$/);
    assert.equal(parsed.searchParams.get('page'), '2');
    assert.equal(parsed.searchParams.get('size'), '25');
    assert.equal(parsed.searchParams.get('actor'), 'qa actor');
    assert.equal(parsed.searchParams.get('action'), 'PROFILE_UPDATED');
    assert.equal(parsed.searchParams.get('from'), '2026-10-01T00:00:00Z');
    assert.equal(parsed.searchParams.get('sortBy'), 'createdAt');
    assert.equal(parsed.searchParams.get('direction'), 'desc');
    return new Response(JSON.stringify({ content: [], page: 2, size: 25, totalElements: 0, totalPages: 0 }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  };
  globalThis.sessionStorage = { getItem: () => 'e30.eyJleHAiOjQwMDAwMDAwMDB9.sig' };
  try {
    await getAuditLogs({ page: 2, size: 25, actor: ' qa actor ', action: 'PROFILE_UPDATED', from: '2026-10-01T00:00:00Z', sortBy: 'createdAt', direction: 'desc' });
  } finally { globalThis.fetch = originalFetch; globalThis.sessionStorage = originalStorage; }
});
