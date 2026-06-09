'use strict';

jest.mock('../src/config/db');
const pool                = require('../src/config/db');
const notificationService = require('../src/services/notificationService');

const USER_A = 'user-uuid-a';
const USER_B = 'user-uuid-b';
const NOTIF_ID = 'notif-uuid-001';

beforeEach(() => jest.clearAllMocks());

// ─── notifyAllCustomers ───────────────────────────────────────────────────────

describe('notifyAllCustomers', () => {
  it('inserts one notification per active customer', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: USER_A }, { id: USER_B }] }) // SELECT customers
      .mockResolvedValueOnce({});                                          // INSERT

    await notificationService.notifyAllCustomers({
      notification_type: 'NEW_FOOD_ITEM',
      title:   'New Item Added 🍽️',
      message: 'Veg Biryani is now available from Satvik Foods.',
    });

    const insertCall = pool.query.mock.calls[1];
    expect(insertCall[0]).toContain('INSERT INTO notifications');
    expect(insertCall[1]).toContain(USER_A);
    expect(insertCall[1]).toContain(USER_B);
  });

  it('does nothing when no active customers exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await notificationService.notifyAllCustomers({
      notification_type: 'NEW_FOOD_ITEM', title: 'test', message: 'test',
    });

    expect(pool.query).toHaveBeenCalledTimes(1);
  });
});

// ─── notifyInterestedCustomers ────────────────────────────────────────────────

describe('notifyInterestedCustomers', () => {
  it('only notifies customers who have favorited the item', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: USER_A }] }) // favorites query
      .mockResolvedValueOnce({});                          // INSERT

    await notificationService.notifyInterestedCustomers({
      food_id:           'food-uuid-001',
      notification_type: 'PRICE_DROP',
      title:   'Price Drop! 🎉',
      message: 'Veg Biryani dropped to ₹150.',
    });

    const insertCall = pool.query.mock.calls[1];
    expect(insertCall[1]).toContain(USER_A);
    expect(insertCall[1]).not.toContain(USER_B);
  });

  it('skips insert when no favorites exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await notificationService.notifyInterestedCustomers({
      food_id: 'food-uuid-001', notification_type: 'PRICE_DROP', title: 't', message: 'm',
    });

    expect(pool.query).toHaveBeenCalledTimes(1);
  });
});

// ─── getNotificationsForUser ──────────────────────────────────────────────────

describe('getNotificationsForUser', () => {
  it('returns notifications list and unread count', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: NOTIF_ID, is_read: false }] })
      .mockResolvedValueOnce({ rows: [{ count: '3' }] });

    const result = await notificationService.getNotificationsForUser(USER_A);
    expect(result.notifications).toHaveLength(1);
    expect(result.unread_count).toBe(3);
  });
});

// ─── markAsRead ───────────────────────────────────────────────────────────────

describe('markAsRead', () => {
  it('marks a single notification as read', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    await expect(notificationService.markAsRead(NOTIF_ID, USER_A)).resolves.toBeUndefined();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE notifications SET is_read = TRUE'),
      [NOTIF_ID, USER_A]
    );
  });

  it('throws 404 when notification not found or not owned', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    await expect(notificationService.markAsRead(NOTIF_ID, USER_A))
      .rejects.toMatchObject({ status: 404 });
  });
});

// ─── markAllAsRead ────────────────────────────────────────────────────────────

describe('markAllAsRead', () => {
  it('bulk updates all unread for the user', async () => {
    pool.query.mockResolvedValueOnce({});
    await notificationService.markAllAsRead(USER_A);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE notifications SET is_read = TRUE'),
      [USER_A]
    );
  });
});
