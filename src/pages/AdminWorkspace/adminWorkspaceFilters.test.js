import assert from 'node:assert/strict';
import test from 'node:test';
import { applyStatusFilterChange } from './adminWorkspaceFilters.js';

test('Store Manager status changes reset pagination to the first page', () => {
  const calls = [];

  applyStatusFilterChange({
    value: 'CANCELLED',
    role: 'store-manager',
    setStatusFilter: value => calls.push(['status', value]),
    setPage: value => calls.push(['page', value]),
  });

  assert.deepEqual(calls, [['status', 'CANCELLED'], ['page', 1]]);
});

test('other roles retain their existing status-filter pagination behavior', () => {
  const calls = [];

  applyStatusFilterChange({
    value: 'CREATED',
    role: 'admin',
    setStatusFilter: value => calls.push(['status', value]),
    setPage: value => calls.push(['page', value]),
  });

  assert.deepEqual(calls, [['status', 'CREATED']]);
});
