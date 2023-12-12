import { it, beforeAll, afterAll, describe, assert } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';
import { knex } from '../src/database';

describe('Users routes', () => {
  beforeAll(async () => {
    // Configuração inicial
    await app.ready();
  });

  afterAll(async () => {
    // Limpeza após todos os testes
    await app.close();
  });

  it('should be able to create a new account', async () => {
    const timestamp = Date.now();
    const testEmail = `email${timestamp}@example.com`

    // Dados de teste centralizados
    const testData = {
      name: 'testeUser',
      email: testEmail,
      address: 'Endereço de teste, 999',
      weight: 64.3,
      height: 170,
    };

    // Executando a requisição
    const response = await supertest(app.server)
      .post('/users')
      .send(testData)
      .expect(201);

    // Assert para verificar se a resposta contém o sessionId no cookie
    const sessionIdCookie = response.headers['set-cookie'][0];
    assert(sessionIdCookie.includes('sessionId'), 'sessionId should be set in the cookie');

    // Assert para verificar se o usuário foi criado no banco de dados
    const createdUser = await findUserByEmail(testData.email);
    assert.isNotNull(createdUser, 'User should be created in the database');

    if (createdUser) {
      assert.equal(createdUser.name, testData.name, 'User name should match');
      assert.equal(createdUser.email, testData.email, 'User email should match');
      assert.equal(createdUser.address, testData.address, 'User address should match');
      assert.equal(createdUser.weight, testData.weight, 'User weight should match');
      assert.equal(createdUser.height, testData.height, 'User height should match');
    }
  });
});

async function findUserByEmail(email: string) {

  return knex.select('*').from('users').where({ email }).first();
}
