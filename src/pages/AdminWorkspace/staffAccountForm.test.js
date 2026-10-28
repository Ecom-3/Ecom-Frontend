import test from 'node:test';
import assert from 'node:assert/strict';
import { staffUsernameFrom } from './staffAccountForm.js';

test('staff account creation preserves an explicitly entered login username', () => {
  assert.equal(staffUsernameFrom({ username: ' qa-e2e01-global-admin ' }), 'qa-e2e01-global-admin');
});

test('staff account creation derives a readable username from email when none is entered', () => {
  assert.equal(staffUsernameFrom({ email: 'qa-e2e01-global-admin@example.test' }), 'qa-e2e01-global-admin');
});

test('staff account creation falls back to a name when no username or email is supplied', () => {
  assert.equal(staffUsernameFrom({ name: 'QA Global Admin' }), 'qa-global-admin');
});
