import { ReadingEntryService } from '../../src/services/ReadingEntryService';
import { ReadingStatus } from '../../src/entities/ReadingEntry';

function makeEm(overrides: Record<string, jest.Mock> = {}) {
  const entry = {
    id: 1,
    status: ReadingStatus.FINISHED,
    startDate: null,
    finishDate: null,
    isReread: false,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    book: { id: 2 },
    user: { id: 3 },
  };

  return {
    findOneOrFail: jest.fn().mockResolvedValue(entry),
    findAndCount: jest.fn().mockResolvedValue([[entry], 1]),
    create: jest.fn().mockReturnValue(entry),
    persistAndFlush: jest.fn().mockResolvedValue(undefined),
    removeAndFlush: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ReadingEntryService', () => {
  describe('create', () => {
    it('creates and persists a reading entry', async () => {
      const em = makeEm();
      const service = new ReadingEntryService(em as never);
      await service.create(3, { bookId: 2, status: ReadingStatus.FINISHED });
      expect(em.persistAndFlush).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws Forbidden when user does not own the entry', async () => {
      const entry = { id: 1, user: { id: 99 }, book: { id: 2 }, status: ReadingStatus.READING, startDate: null, finishDate: null, isReread: false, notes: null, createdAt: new Date(), updatedAt: new Date() };
      const em = makeEm({ findOneOrFail: jest.fn().mockResolvedValue(entry) });
      const service = new ReadingEntryService(em as never);
      await expect(service.update(1, 3, { status: ReadingStatus.FINISHED })).rejects.toThrow('Forbidden');
    });
  });

  describe('delete', () => {
    it('removes the entry when user is the owner', async () => {
      const em = makeEm();
      const service = new ReadingEntryService(em as never);
      await service.delete(1, 3);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns entries and total count', async () => {
      const em = makeEm();
      const service = new ReadingEntryService(em as never);
      const result = await service.list(3, {});
      expect(result.entries).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
