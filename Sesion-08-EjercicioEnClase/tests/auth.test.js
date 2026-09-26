import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'secreto-de-prueba';

const { hashearPassword, verificarPassword } = await import('../src/auth/passwords.js');
const { firmarToken, verificarToken } = await import('../src/auth/jwt.js');

describe('passwords', () => {
  it('hashea y verifica la contraseña', async () => {
    const hash = await hashearPassword('demo1234');
    assert.ok(!hash.includes('demo1234'), '¡no guardes la clave en texto plano!');
    assert.equal(await verificarPassword('demo1234', hash), true);
    assert.equal(await verificarPassword('otra', hash), false);
  });
});

describe('jwt', () => {
  it('firma y verifica el payload', () => {
    const payload = verificarToken(firmarToken({ sub: 'u-1' }, '1h'));
    assert.equal(payload.sub, 'u-1');
    assert.ok(payload.exp, 'debe incluir expiración');
  });

  it('rechaza un token inválido', () => {
    assert.throws(() => verificarToken('no.es.un-token'));
  });
});
