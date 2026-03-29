import { ReviewService } from '../../src/services/ReviewService';

function makeReview(overrides = {}) {
  return {
    id: 1,
    content: 'Great book',
    containsSpoilers: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 3, username: 'user', displayName: 'User', avatarUrl: null, role: 'member' },
    book: { id: 2 },
    ...overrides,
  };
}

function makeEm(existingReview: ReturnType<typeof makeReview> | null = null) {
  const review = existingReview ?? makeReview();
  return {
    findOneOrFail: jest.fn().mockImplementation((_, id) => Promise.resolve(typeof id === 'number' ? { id } : { id: 3 })),
    findOne: jest.fn().mockResolvedValue(existingReview),
    create: jest.fn().mockReturnValue(review),
    persistAndFlush: jest.fn().mockResolvedValue(undefined),
    removeAndFlush: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
    findAndCount: jest.fn().mockResolvedValue([[review], 1]),
  };
}

describe('ReviewService', () => {
  describe('upsert', () => {
    it('creates a new review when none exists', async () => {
      const em = makeEm(null);
      const service = new ReviewService(em as never);
      await service.upsert(3, { bookId: 2, content: 'Good book' });
      expect(em.persistAndFlush).toHaveBeenCalled();
    });

    it('updates existing review content in-place', async () => {
      const existing = makeReview();
      const em = makeEm(existing);
      const service = new ReviewService(em as never);
      await service.upsert(3, { bookId: 2, content: 'Updated review' });
      expect(existing.content).toBe('Updated review');
      expect(em.flush).toHaveBeenCalled();
    });

    it('throws on empty content', async () => {
      const em = makeEm(null);
      const service = new ReviewService(em as never);
      await expect(service.upsert(3, { bookId: 2, content: '   ' })).rejects.toThrow('cannot be empty');
    });
  });

  describe('delete', () => {
    it('removes the review', async () => {
      const existing = makeReview();
      const em = makeEm(existing);
      const service = new ReviewService(em as never);
      await service.delete(3, 2);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });

    it('throws when review not found', async () => {
      const em = makeEm(null);
      const service = new ReviewService(em as never);
      await expect(service.delete(3, 2)).rejects.toThrow('not found');
    });
  });

  describe('listForBook', () => {
    it('returns reviews and count', async () => {
      const em = makeEm(makeReview());
      const service = new ReviewService(em as never);
      const result = await service.listForBook(2);
      expect(result.reviews).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
