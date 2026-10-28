import test from 'node:test';
import assert from 'node:assert/strict';
import { profileModeRequiresAssignedStore, profileModeWaitsForAssignedStore } from './storeManagerProfileMode.js';

test('password-only mode does not depend on an assigned Catalog store', () => {
  assert.equal(profileModeRequiresAssignedStore('change-password'), false);
  assert.equal(profileModeWaitsForAssignedStore('change-password', true, null), false);
  assert.equal(profileModeWaitsForAssignedStore('change-password', false, null), false);
});

test('store profile and delivery settings wait for the assigned store', () => {
  for (const mode of ['profile', 'delivery-settings']) {
    assert.equal(profileModeRequiresAssignedStore(mode), true);
    assert.equal(profileModeWaitsForAssignedStore(mode, true, null), true);
    assert.equal(profileModeWaitsForAssignedStore(mode, false, null), true);
    assert.equal(profileModeWaitsForAssignedStore(mode, false, { id: 'assigned-store' }), false);
  }
});
