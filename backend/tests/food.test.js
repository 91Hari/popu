'use strict';

jest.mock('../src/config/db');
jest.mock('../src/services/foodEventService');
jest.mock('../src/services/auditService');
jest.mock('../src/services/notificationService');

const pool               = require('../src/config/db');
const { recordFoodEvent, EVENT_TYPES } = require('../src/services/foodEventService');
const { recordAudit }    = require('../src/services/auditService');
const { notifyAllCustomers, notifyInterestedCustomers } = require('../src/services/notificationService');
const foodService        = require('../src/services/foodService');

const CATERER_ID = 'caterer-uuid-001';
const FOOD_ID    = 'food-uuid-001';

const mockFood = {
  id:           FOOD_ID,
  caterer_id:   CATERER_ID,
  food_name:    'Veg Biryani',
  description:  'Aromatic rice',
  price:        '180.00',
  is_available: true,
  category:     'Rice',
  image_url:    null,
  created_at:   new Date(),
  updated_at:   new Date(),
};

beforeEach(() => jest.clearAllMocks());

// ─── createFood ──────────────────────────────────────────────────────────────

describe('createFood', () => {
  it('inserts the food item and returns it', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [mockFood] })         // INSERT
      .mockResolvedValueOnce({ rows: [{ name: 'Satvik Foods' }] }); // caterer name

    const result = await foodService.createFood({
      caterer_id:   CATERER_ID,
      food_name:    'Veg Biryani',
      description:  'Aromatic rice',
      price:        180,
      is_available: true,
    });

    expect(result).toEqual(mockFood);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO food_items'),
      expect.arrayContaining([CATERER_ID, 'Veg Biryani', 180])
    );
  });

  it('schedules event, audit, and notification side-effects', async () => {
    jest.useFakeTimers();
    pool.query
      .mockResolvedValueOnce({ rows: [mockFood] })
      .mockResolvedValueOnce({ rows: [{ name: 'Satvik Foods' }] });

    recordFoodEvent.mockResolvedValue();
    recordAudit.mockResolvedValue();
    notifyAllCustomers.mockResolvedValue();

    await foodService.createFood({
      caterer_id: CATERER_ID, food_name: 'Veg Biryani', price: 180, is_available: true,
    });

    jest.runAllImmediates();
    await Promise.resolve();

    expect(recordFoodEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: EVENT_TYPES.FOOD_CREATED })
    );
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: EVENT_TYPES.FOOD_CREATED, performed_by: CATERER_ID })
    );
    expect(notifyAllCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Item Added 🍽️' })
    );
    jest.useRealTimers();
  });

  it('does not notify customers if item is unavailable', async () => {
    jest.useFakeTimers();
    pool.query
      .mockResolvedValueOnce({ rows: [{ ...mockFood, is_available: false }] })
      .mockResolvedValueOnce({ rows: [{ name: 'Satvik Foods' }] });

    recordFoodEvent.mockResolvedValue();
    recordAudit.mockResolvedValue();

    await foodService.createFood({
      caterer_id: CATERER_ID, food_name: 'Veg Biryani', price: 180, is_available: false,
    });

    jest.runAllImmediates();
    await Promise.resolve();

    expect(notifyAllCustomers).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});

// ─── updateFood ──────────────────────────────────────────────────────────────

describe('updateFood', () => {
  it('throws 404 when food not found or not owned', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await expect(foodService.updateFood(FOOD_ID, CATERER_ID, { price: 200 }))
      .rejects.toMatchObject({ status: 404 });
  });

  it('throws 400 when no valid fields provided', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockFood] });
    await expect(foodService.updateFood(FOOD_ID, CATERER_ID, { invalid_field: 'x' }))
      .rejects.toMatchObject({ status: 400 });
  });

  it('updates price and schedules PRICE_CHANGED + PRICE_DROP notifications', async () => {
    jest.useFakeTimers();
    const updatedFood = { ...mockFood, price: '150.00' };
    pool.query
      .mockResolvedValueOnce({ rows: [mockFood] })   // SELECT existing
      .mockResolvedValueOnce({ rows: [updatedFood] }); // UPDATE

    recordFoodEvent.mockResolvedValue();
    recordAudit.mockResolvedValue();
    notifyInterestedCustomers.mockResolvedValue();

    await foodService.updateFood(FOOD_ID, CATERER_ID, { price: 150 });

    jest.runAllImmediates();
    await Promise.resolve();

    expect(recordFoodEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: EVENT_TYPES.PRICE_CHANGED })
    );
    expect(notifyInterestedCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ notification_type: 'PRICE_DROP' })
    );
    jest.useRealTimers();
  });

  it('schedules BACK_IN_STOCK notification when item becomes available', async () => {
    jest.useFakeTimers();
    const unavailable = { ...mockFood, is_available: false };
    pool.query
      .mockResolvedValueOnce({ rows: [unavailable] })
      .mockResolvedValueOnce({ rows: [mockFood] });

    recordFoodEvent.mockResolvedValue();
    recordAudit.mockResolvedValue();
    notifyInterestedCustomers.mockResolvedValue();

    await foodService.updateFood(FOOD_ID, CATERER_ID, { is_available: true });

    jest.runAllImmediates();
    await Promise.resolve();

    expect(notifyInterestedCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ notification_type: 'BACK_IN_STOCK' })
    );
    jest.useRealTimers();
  });
});

// ─── deleteFood ──────────────────────────────────────────────────────────────

describe('deleteFood', () => {
  it('throws 404 when food not owned', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await expect(foodService.deleteFood(FOOD_ID, CATERER_ID))
      .rejects.toMatchObject({ status: 404 });
  });

  it('throws 409 on FK constraint violation', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [mockFood] })
      .mockRejectedValueOnce({ code: '23503' });
    await expect(foodService.deleteFood(FOOD_ID, CATERER_ID))
      .rejects.toMatchObject({ status: 409 });
  });

  it('deletes successfully and schedules FOOD_DELETED event', async () => {
    jest.useFakeTimers();
    pool.query
      .mockResolvedValueOnce({ rows: [mockFood] })
      .mockResolvedValueOnce({});

    recordFoodEvent.mockResolvedValue();
    recordAudit.mockResolvedValue();

    await expect(foodService.deleteFood(FOOD_ID, CATERER_ID)).resolves.toBeUndefined();

    jest.runAllImmediates();
    await Promise.resolve();

    expect(recordFoodEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: EVENT_TYPES.FOOD_DELETED })
    );
    jest.useRealTimers();
  });
});

// ─── searchCustomerFoods ─────────────────────────────────────────────────────

describe('searchCustomerFoods', () => {
  it('returns results using ILIKE for case-insensitive foodName match', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ foodId: FOOD_ID, foodName: 'Veg Biryani' }] });
    const results = await foodService.searchCustomerFoods({ foodName: 'biryani' });
    expect(results).toHaveLength(1);
    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain('ILIKE');
    expect(params).toContain('%biryani%');
  });

  it('filters by price range', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await foodService.searchCustomerFoods({ minPrice: 100, maxPrice: 200 });
    const [, params] = pool.query.mock.calls[0];
    expect(params).toContain(100);
    expect(params).toContain(200);
  });

  it('returns all foods when no filters given', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockFood] });
    const results = await foodService.searchCustomerFoods({});
    expect(results).toHaveLength(1);
    const [query] = pool.query.mock.calls[0];
    expect(query).not.toContain('ILIKE');
  });
});
