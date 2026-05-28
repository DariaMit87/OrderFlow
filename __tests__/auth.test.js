const request = require('supertest');
const bcrypt  = require('bcrypt');
const app     = require('../src/app');

jest.mock('../src/config/prisma', () => ({
  user:            { findUnique: jest.fn() },
  restaurantTable: { findMany: jest.fn() },
}));

const prisma = require('../src/config/prisma');

describe('Authentication', () => {
  let hash;
  let waiterUser;
  let cookUser;

  beforeAll(async () => {
    hash       = await bcrypt.hash('password123', 1);
    waiterUser = { id: 1, username: 'waiter1', name: 'James Wilson', password: hash, role: 'WAITER' };
    cookUser   = { id: 3, username: 'cook1',   name: 'Oliver Smith', password: hash, role: 'COOK'   };
  });

  beforeEach(() => jest.clearAllMocks());

  // Login page 

  test('GET /login renders the login page', async () => {
    const res = await request(app).get('/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Login');
  });

  // Login form submission
  test('POST /login with valid credentials redirects to /dashboard', async () => {
    prisma.user.findUnique.mockResolvedValue(waiterUser);

    const res = await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'waiter1', password: 'password123' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
  });

  test('POST /login with wrong password redirects back to /login', async () => {
    prisma.user.findUnique.mockResolvedValue(waiterUser);

    const res = await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'waiter1', password: 'wrongpassword' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  // Access control 

  test('unauthenticated request to /waiter redirects to /login', async () => {
    const res = await request(app).get('/waiter');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('unauthenticated request to /kitchen redirects to /login', async () => {
    const res = await request(app).get('/kitchen');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('cook accessing a waiter route receives 403', async () => {
    prisma.user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(where.id === cookUser.id || where.username === cookUser.username ? cookUser : null)
    );

    const agent = request.agent(app);
    await agent.post('/login').type('form').send({ username: 'cook1', password: 'password123' });

    const res = await agent.get('/waiter');
    expect(res.status).toBe(403);
  });

  test('waiter accessing a kitchen route receives 403', async () => {
    prisma.user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(where.id === waiterUser.id || where.username === waiterUser.username ? waiterUser : null)
    );

    const agent = request.agent(app);
    await agent.post('/login').type('form').send({ username: 'waiter1', password: 'password123' });

    const res = await agent.get('/kitchen');
    expect(res.status).toBe(403);
  });
});
