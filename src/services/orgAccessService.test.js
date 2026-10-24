import test from 'node:test';
import assert from 'node:assert/strict';
import { orgAccessService } from './orgAccessService.js';

test('staff update sends a scoped PUT payload to the numeric user endpoint', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.sessionStorage;
  const originalWindow = globalThis.window;
  globalThis.sessionStorage = { getItem: () => 'header.eyJleHAiOjQxMDI0NDQ4MDB9.signature' };
  globalThis.window = { dispatchEvent: () => {} };
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ id: 21, username: 'staff', email: 'staff@example.com' }), { status: 200 });
  };
  try {
    await orgAccessService.updateUser(21, {
      name: 'Staff Name', email: 'staff@example.com', mobile: '1234567890', role: 'location-admin',
      location: 'Hyderabad', status: 'Active', password: 'should-not-be-sent', organizationId: 'untrusted-org',
    });
    assert.match(request.url, /\/api\/users\/21$/);
    assert.equal(request.options.method, 'PUT');
    assert.deepEqual(JSON.parse(request.options.body), {
      name: 'Staff Name', email: 'staff@example.com', mobile: '1234567890', role: 'LOCATION_ADMIN',
      status: 'Active', location: 'hyderabad',
    });
  } finally { globalThis.fetch = originalFetch; globalThis.sessionStorage = originalStorage; globalThis.window = originalWindow; }
});

test('staff update rejects an invalid ID before making a request', async () => {
  await assert.rejects(orgAccessService.updateUser('not-a-database-id', {}), /valid staff account ID/);
});

test('Super Admin profile update sends only the authenticated user name', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.sessionStorage;
  const originalWindow = globalThis.window;
  globalThis.sessionStorage = { getItem: () => 'header.eyJleHAiOjQxMDI0NDQ4MDB9.signature' };
  globalThis.window = { dispatchEvent: () => {} };
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ id: '1', username: 'root-admin', name: 'Root Admin', role: 'super-admin' }), { status: 200 });
  };
  try {
    const response = await orgAccessService.updateMyName(' Root Admin ');
    assert.match(request.url, /\/api\/users\/me\/profile\/name$/);
    assert.equal(request.options.method, 'PUT');
    assert.deepEqual(JSON.parse(request.options.body), { name: 'Root Admin' });
    assert.equal(response.name, 'Root Admin');
  } finally { globalThis.fetch = originalFetch; globalThis.sessionStorage = originalStorage; globalThis.window = originalWindow; }
});

test('staff update surfaces validation and permission errors from the API', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.sessionStorage;
  const originalWindow = globalThis.window;
  globalThis.sessionStorage = { getItem: () => 'header.eyJleHAiOjQxMDI0NDQ4MDB9.signature' };
  globalThis.window = { dispatchEvent: () => {} };
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Forbidden by staff policy' }), { status: 403 });
  try {
    await assert.rejects(orgAccessService.updateUser(21, { name: 'x' }), /Forbidden by staff policy/);
  } finally { globalThis.fetch = originalFetch; globalThis.sessionStorage = originalStorage; globalThis.window = originalWindow; }
});
