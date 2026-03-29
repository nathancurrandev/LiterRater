import { ActivityService } from '../../src/services/ActivityService';
import { ActivityType } from '../../src/entities/Activity';

function makeActivity(overrides = {}) {
  return {
    id: 1,
    type: ActivityType.BOOK_FINISHED,
    createdAt: new Date(),
    actor: { id: 3, username: 'u', displayName: 'U', avatarUrl: null, role: 'member' },
    book: { id: 2, title: 'Book', coverImageUrl: null, authors: [] },
    review: null,
    list: null,
    ...overrides,
  };
}

function makeEm(activities: ReturnType<typeof makeActivity>[] = []) {
  const activity = makeActivity();
  return {
    findOneOrFail: jest.fn().mockResolvedValue({ id: 3 }),
    find: jest.fn().mockResolvedValue([{ following: { id: 4 } }]),
    findAndCount: jest.fn().mockResolvedValue([activities, activities.length]),
    create: jest.fn().mockReturnValue(activity),
    persistAndFlush: jest.fn().mockResolvedValue(undefined),
    getReference: jest.fn().mockImplementation((_entity, id) => ({ id })),
  };
}

describe('ActivityService', () => {
  describe('createEvent', () => {
    it('persists a new activity', async () => {
      const em = makeEm();
      const service = new ActivityService(em as never);
      await service.createEvent({ actorId: 3, type: ActivityType.BOOK_FINISHED, bookId: 2 });
      expect(em.persistAndFlush).toHaveBeenCalled();
    });
  });

  describe('getFeedForUser', () => {
    it('returns only events from followed users', async () => {
      const activityFromFollowed = makeActivity({ actor: { id: 4, username: 'other', displayName: 'Other', avatarUrl: null, role: 'member' } });
      const em = makeEm([activityFromFollowed]);
      const service = new ActivityService(em as never);
      const result = await service.getFeedForUser(3);
      expect(result.activities).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('returns empty feed when user follows nobody', async () => {
      const em = makeEm([]);
      em.find.mockResolvedValue([]);
      const service = new ActivityService(em as never);
      const result = await service.getFeedForUser(3);
      expect(result.activities).toHaveLength(0);
    });
  });
});
