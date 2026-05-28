const request = require('supertest');
const bcrypt  = require('bcrypt');
const app     = require('../src/app');

jest.mock('../src/config/prisma', () => ({
  user:      { findUnique: jest.fn() },
  order:     { findMany: jest.fn(), update: jest.fn() },
  orderItem: { update: jest.fn(), findMany: jest.fn() },
}));

const prisma = require('../src/config/prisma');

const COOK = { id: 3, username: 'cook1', name: 'Oliver Smith', role: 'COOK' };

// Handles login 
function mockCookAuth() {
  prisma.user.findUnique.mockImplementation(({ where }) =>
    Promise.resolve(where.id === COOK.id || where.username === COOK.username ? COOK : null)
  );
}

describe('Kitchen Flow', () => {
  let cookAgent;

  beforeAll(async () => {
    COOK.password = await bcrypt.hash('password123', 1);
    mockCookAuth();
    cookAgent = request.agent(app);
    await cookAgent.post('/login').type('form').send({ username: 'cook1', password: 'password123' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookAuth(); // restore after clearAllMocks
  });

  test('GET /kitchen shows active orders with item names and table numbers', async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        id: 1, status: 'PENDING', createdAt: new Date(),
        table:  { tableNumber: 5 },
        waiter: { name: 'James Wilson' },
        orderItems: [
          { id: 1, quantity: 1, status: 'NEW', notes: null, menuItem: { name: 'Garlic Bread' } },
          { id: 2, quantity: 2, status: 'NEW', notes: null, menuItem: { name: 'Coffee' } },
        ],
      },
    ]);

    const res = await cookAgent.get('/kitchen');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Garlic Bread');
    expect(res.text).toContain('Coffee');
    expect(res.text).toContain('Table 5');
  });

  test('POST /kitchen/item/1/status with COOKING advances item to cooking and redirects', async () => {
    prisma.orderItem.update.mockResolvedValue({ id: 1, orderId: 1, status: 'COOKING', order: { id: 1 } });
    prisma.orderItem.findMany.mockResolvedValue([{ status: 'COOKING' }]);
    prisma.order.update.mockResolvedValue({});

    const res = await cookAgent
      .post('/kitchen/item/1/status')
      .type('form')
      .send({ status: 'COOKING' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/kitchen');
    expect(prisma.orderItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'COOKING' } })
    );
  });

  test('POST /kitchen/item/1/status with READY marks item as ready and redirects', async () => {
    prisma.orderItem.update.mockResolvedValue({ id: 1, orderId: 1, status: 'READY', order: { id: 1 } });
    prisma.orderItem.findMany.mockResolvedValue([{ status: 'READY' }]);
    prisma.order.update.mockResolvedValue({});

    const res = await cookAgent
      .post('/kitchen/item/1/status')
      .type('form')
      .send({ status: 'READY' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/kitchen');
    expect(prisma.orderItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'READY' } })
    );
  });

  test('POST /kitchen/item/1/status with an invalid status returns 400', async () => {
    const res = await cookAgent
      .post('/kitchen/item/1/status')
      .type('form')
      .send({ status: 'INVALID' });

    expect(res.status).toBe(400);
  });
});
