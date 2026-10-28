import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStaffPasswordChange } from './staffPasswordValidation.js';

test('dedicated password page requires current and new passwords', () => {
  assert.deepEqual(validateStaffPasswordChange({ required: true }), {
    currentPassword: 'Enter your current password.',
    newPassword: 'Enter a new password.',
  });
});

test('password change rejects fewer than eight characters and a missing current password', () => {
  assert.deepEqual(validateStaffPasswordChange({
    newPassword: '1234567', confirmPassword: '1234567',
  }), {
    currentPassword: 'Enter your current password to change it.',
    newPassword: 'New password must contain at least 8 characters.',
  });
});

test('password change validates confirmation and accepts a matching eight-character password', () => {
  assert.deepEqual(validateStaffPasswordChange({
    currentPassword: 'current', newPassword: '12345678', confirmPassword: 'different',
  }), { confirmPassword: 'New passwords do not match.' });
  assert.deepEqual(validateStaffPasswordChange({
    currentPassword: 'current', newPassword: '12345678', confirmPassword: '12345678',
  }), {});
});
