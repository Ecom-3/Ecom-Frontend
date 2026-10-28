import test from 'node:test';
import assert from 'node:assert/strict';
import { updateStaffProfile } from './staffProfileUpdate.js';

test('Store Manager profile save does not call the Super Admin name endpoint', async () => {
  let nameCalls = 0;
  const user = { id: '42', role: 'store-manager', name: 'Store Manager', store: 'Assigned Store' };
  const saved = await updateStaffProfile({
    profile: { name: 'Updated Store Manager' }, authenticatedUser: user,
    changePassword: async () => {},
    updateMyName: async () => { nameCalls += 1; throw new Error('Unexpected name update'); },
  });
  assert.equal(nameCalls, 0);
  assert.equal(saved.name, 'Store Manager');
  assert.equal(saved.store, 'Assigned Store');
});

test('staff profile updates password but retains Store Manager identity name', async () => {
  const calls = [];
  const user = { id: '42', role: 'store-manager', name: 'Store Manager' };
  const saved = await updateStaffProfile({
    profile: { name: 'Store Contact', currentPassword: 'old-password', newPassword: 'new-password' },
    authenticatedUser: user,
    changePassword: async (request) => calls.push(['password', request]),
    updateMyName: async (name) => calls.push(['name', name]),
  });
  assert.deepEqual(calls, [['password', { currentPassword: 'old-password', newPassword: 'new-password' }]]);
  assert.equal(saved.name, 'Store Manager');
});

test('Global Admin can still update their own display name', async () => {
  const saved = await updateStaffProfile({
    profile: { name: 'New Global Name' },
    authenticatedUser: { id: '1', role: 'global-admin', name: 'Old Global Name' },
    changePassword: async () => {},
    updateMyName: async (name) => ({ name }),
  });
  assert.equal(saved.name, 'New Global Name');
});

test('Location Admin keeps the existing restricted-name behavior', async () => {
  await assert.rejects(updateStaffProfile({
    profile: { name: 'New Location Name' },
    authenticatedUser: { id: '2', role: 'location-admin', name: 'Old Location Name' },
    changePassword: async () => {},
    updateMyName: async () => { throw new Error('Forbidden by staff policy'); },
  }), /Forbidden by staff policy/);
});
