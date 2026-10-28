import test from 'node:test';
import assert from 'node:assert/strict';
import { productImageForForm } from './adminProductData.js';

test('product form uses only a persisted image URL and leaves display fallbacks out of editable data', () => {
  assert.equal(productImageForForm({ name: 'Test pickle' }), '');
  assert.equal(productImageForForm({ image: 'https://cdn.example.test/product.png' }), 'https://cdn.example.test/product.png');
  assert.equal(productImageForForm({ images: [{ url: 'https://cdn.example.test/primary.png', primaryImage: true }] }), 'https://cdn.example.test/primary.png');
});
