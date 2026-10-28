import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOtpInput, orderedTrackingEvents, passwordChangeErrors } from './deliveryWorkspacePolicy.js';

test('OTP input keeps digits only and caps the value at six characters', () => {
  assert.equal(normalizeOtpInput('12a-345678'), '123456');
  assert.equal(normalizeOtpInput('12345'), '12345');
  assert.equal(normalizeOtpInput(''), '');
});

test('password form follows the backend current/new password length and confirmation rules', () => {
  assert.deepEqual(passwordChangeErrors({}), {});
  assert.match(passwordChangeErrors({ next: 'short', confirm: 'short' }).current, /current password/i);
  assert.match(passwordChangeErrors({ current: 'current8', next: 'short', confirm: 'short' }).next, /8 characters/i);
  assert.match(passwordChangeErrors({ current: 'current8', next: 'newpassword', confirm: 'different' }).confirm, /match/i);
  assert.deepEqual(passwordChangeErrors({ current: 'current8', next: 'newpass8', confirm: 'newpass8' }), {});
  assert.match(passwordChangeErrors({ current: 'x'.repeat(101), next: 'newpass8', confirm: 'newpass8' }).current, /too long/i);
});

test('delivery tracking history is shown in event-time order without mutating API data', () => {
  const latest = { id: 'latest', eventTime: '2026-10-26T10:00:00Z' };
  const earliest = { id: 'earliest', eventTime: '2026-10-26T09:00:00Z' };
  const events = [latest, earliest];
  assert.deepEqual(orderedTrackingEvents(events), [earliest, latest]);
  assert.deepEqual(events, [latest, earliest]);
  assert.deepEqual(orderedTrackingEvents(null), []);
});
