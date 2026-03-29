import { FollowService } from '../../src/services/FollowService';

function makeEm(existingFollow: { id: number } | null = null) {
  const follow = { id: 1, follower: { id: 1 }, following: { id: 2 }, createdAt: new Date() };
  return {
    findOneOrFail: jest.fn().mockResolvedValue({ id: 1 }),
    findOne: jest.fn().mockResolvedValue(existingFollow),
    find: jest.fn().mockResolvedValue([follow]),
    create: jest.fn().mockReturnValue(follow),
    persistAndFlush: jest.fn().mockResolvedValue(undefined),
    removeAndFlush: jest.fn().mockResolvedValue(undefined),
  };
}

describe('FollowService', () => {
  describe('follow', () => {
    it('throws when user tries to follow themselves', async () => {
      const em = makeEm();
      const service = new FollowService(em as never);
      await expect(service.follow(1, 1)).rejects.toThrow('Cannot follow yourself');
    });

    it('creates a follow relationship', async () => {
      const em = makeEm(null);
      const service = new FollowService(em as never);
      await service.follow(1, 2);
      expect(em.persistAndFlush).toHaveBeenCalled();
    });

    it('is idempotent — does not duplicate if already following', async () => {
      const em = makeEm({ id: 1 });
      const service = new FollowService(em as never);
      await service.follow(1, 2);
      expect(em.persistAndFlush).not.toHaveBeenCalled();
    });
  });

  describe('unfollow', () => {
    it('is idempotent when not following', async () => {
      const em = makeEm(null);
      const service = new FollowService(em as never);
      await expect(service.unfollow(1, 2)).resolves.toBeUndefined();
      expect(em.removeAndFlush).not.toHaveBeenCalled();
    });

    it('removes an existing follow', async () => {
      const follow = { id: 1 };
      const em = makeEm(follow);
      const service = new FollowService(em as never);
      await service.unfollow(1, 2);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });
  });
});
