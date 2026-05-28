const request = require('supertest');
const bcrypt  = require('bcrypt');
const app     = require('../src/app');

jest.mock('../src/config/prisma', () => ({
  user:            { findUnique: jest.fn() },
  restaurantTable: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  menuItem:        { findMany: jest.fn() },
  order:           { create: jest.fn(), findMany: jest.fn() },
  $transaction:    jest.fn(),
}));

const prisma = require('../src/config/prisma');

const WAITER = { id: 1, username: 'waiter1', name: 'James Wilson', role: 'WAITER' };

// Handles both login (by username) and session restore (by id)
function mockWaiterAuth() {
  prisma.user.findUnique.mockImplementation(({ where }) =>
    Promise.resolve(where.id === WAITER.id || where.username === WAITER.username ? WAITER : null)
  );
}

describe('Waiter Flow', () => {
  let waiterAgent;

  beforeAll(async () => {
    WAITER.password = await bcrypt.hash('password123', 1);
    mockWaiterAuth();
    waiterAgent = request.agent(app);
    await waiterAgent.post('/login').type('form').send({ username: 'waiter1', password: 'password123' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockWaiterAuth(); // restore after clearAllMocks
  });

  test('GET /waiter shows the table overview with table numbers', async () => {
    prisma.restaurantTable.findMany.mockResolvedValue([
      { id: 1, tableNumber: 1, isOccupied: false, orders: [] },
      { id: 2, tableNumber: 2, isOccupied: true,  orders: [{ id: 1 }] },
    ]);

    const res = await waiterAgent.get('/waiter');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Table 1');
    expect(res.text).toContain('Table 2');
  });

  test('GET /waiter/table/1/order shows the create order form with menu items', async () => {
    prisma.restaurantTable.findUnique.mockResolvedValue({ id: 1, tableNumber: 1, isOccupied: false });
    prisma.menuItem.findMany.mockResolvedValue([
      { id: 14, name: 'Coffee',      description: 'Espresso', price: 3.00, category: 'Drinks'   },
      { id: 1,  name: 'Garlic Bread', description: 'Ciabatta', price: 5.50, category: 'Starters' },
    ]);

    const res = await waiterAgent.get('/waiter/table/1/order');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Coffee');
    expect(res.text).toContain('Garlic Bread');
  });

  test('POST /waiter/table/1/order with items creates the order and redirects to /waiter/orders', async () => {
    prisma.$transaction.mockImplementation(async (cb) => cb(prisma));
    prisma.order.create.mockResolvedValue({ id: 10 });
    prisma.restaurantTable.update.mockResolvedValue({});

    const res = await waiterAgent
      .post('/waiter/table/1/order')
      .type('form')
      .send({ qty_14: '2', notes_14: '', qty_1: '1', notes_1: 'no butter' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/waiter/orders');
  });

  test('POST /waiter/table/1/order with no items redirects back with an error', async () => {
    const res = await waiterAgent
      .post('/waiter/table/1/order')
      .type('form')
      .send({ qty_14: '0', notes_14: '', qty_1: '0', notes_1: '' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/waiter/table/1/order');
  });

  test('GET /waiter/orders shows the order status page with item names', async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        id: 1, status: 'PENDING', createdAt: new Date(),
        table: { tableNumber: 3 },
        orderItems: [
          {
            id: 1, quantity: 2, status: 'NEW', notes: null, createdAt: new Date(),
            menuItem: { name: 'Coffee', price: 3.00 },
          },
        ],
      },
    ]);

    const res = await waiterAgent.get('/waiter/orders');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Coffee');
    expect(res.text).toContain('Table 3');
  });
});
