import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('application startup preserves existing browser storage', () => {
  const entrypoint = readFileSync(new URL('./main.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(entrypoint, /localStorage\s*\.\s*clear\s*\(/);
  assert.doesNotMatch(entrypoint, /sessionStorage\s*\.\s*removeItem\s*\(/);
});
