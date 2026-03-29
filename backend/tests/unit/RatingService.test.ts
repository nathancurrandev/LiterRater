import { RatingService } from '../../src/services/RatingService';

function makeRating(score: number) {
  return { id: 1, score, book: { id: 2 }, user: { id: 3 }, createdAt: new Date(), updatedAt: new Date() };
}

function makeEm(existingRating: ReturnType<typeof makeRating> | null = null) {
  const rating = existingRating ?? makeRating(3);
  return {
    findOneOrFail: jest.fn().mockResolvedValue({ id: rating.user.id }),
    findOne: jest.fn().mockResolvedValue(existingRating),
    create: jest.fn().mockReturnValue(rating),
    persistAndFlush: jest.fn().mockResolvedValue(undefined),
    removeAndFlush: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
  };
}

describe('RatingService', () => {
  describe('upsert', () => {
    it('creates a new rating when none exists', async () => {
      const em = makeEm(null);
      const service = new RatingService(em as never);
      await service.upsert(3, 2, 4);
      expect(em.persistAndFlush).toHaveBeenCalled();
    });

    it('updates existing rating without creating a new one', async () => {
      const existing = makeRating(2);
      const em = makeEm(existing);
      const service = new RatingService(em as never);
      await service.upsert(3, 2, 5);
      expect(existing.score).toBe(5);
      expect(em.flush).toHaveBeenCalled();
      expect(em.persistAndFlush).not.toHaveBeenCalled();
    });

    it('throws on invalid score', async () => {
      const em = makeEm(null);
      const service = new RatingService(em as never);
      await expect(service.upsert(3, 2, 6)).rejects.toThrow('Score must be an integer between 1 and 5');
      await expect(service.upsert(3, 2, 0)).rejects.toThrow('Score must be an integer between 1 and 5');
    });
  });

  describe('delete', () => {
    it('removes the rating', async () => {
      const existing = makeRating(3);
      const em = makeEm(existing);
      const service = new RatingService(em as never);
      await service.delete(3, 2);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });

    it('throws when rating does not exist', async () => {
      const em = makeEm(null);
      const service = new RatingService(em as never);
      await expect(service.delete(3, 2)).rejects.toThrow('Rating not found');
    });
  });
});
