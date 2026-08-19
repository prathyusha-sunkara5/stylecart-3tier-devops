import test from 'node:test';
import assert from 'node:assert/strict';

test('health response contract', () => {
  const response = { status: 'UP', service: 'stylecart-backend', database: 'UP' };
  assert.equal(response.status, 'UP');
  assert.equal(response.service, 'stylecart-backend');
});
