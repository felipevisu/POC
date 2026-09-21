const assert = require('node:assert');
const { validate } = require('./index');

const ok = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  documentNumber: '123.456.789-09',
  email: 'ada@example.com',
  birthdate: '1990-12-10',
  phoneNumber: '+55 11 99999-9999',
  password: 'correct horse',
};

assert.deepStrictEqual(validate(ok), []);
assert.deepStrictEqual(validate(undefined), Object.keys(ok));
assert.deepStrictEqual(validate({ ...ok, email: 'nope' }), ['email']);
assert.deepStrictEqual(validate({ ...ok, birthdate: '2023-02-30' }), ['birthdate']);
assert.deepStrictEqual(validate({ ...ok, birthdate: '2999-01-01' }), ['birthdate']);
assert.deepStrictEqual(validate({ ...ok, password: 'short' }), ['password']);
assert.deepStrictEqual(validate({ ...ok, phoneNumber: 123 }), ['phoneNumber']);
console.log('ok');
