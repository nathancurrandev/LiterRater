import { ListService } from '../../src/services/ListService';
import { ListVisibility } from '../../src/entities/List';

function makeList(overrides = {}) {
  return {
    id: 1,
    title: 'My List',
    description: null,
    isRanked: false,
    visibility: ListVisibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: { id: 3 },
    items: { isInitialized: () => false, count: () => 0 },
    ...overrides,
  };
}

function makeItem(overrides = {}) {
  return { id: 1, book: { id: 2 }, position: null, notes: null, ...overrides };
}

function makeEm(list = makeList(), existingItem: ReturnType<typeof makeItem> | null = null) {
  return {
    findOneOrFail: jest.fn().mockImplementation((_entity, id) => {
      if (typeof id === 'number') return Promise.resolve({ id });
      return Promise.resolve(list);
    }),
    findOne: jest.fn().mockResolvedValue(existingItem),
    find: jest.fn().mockResolvedValue([list]),
    create: jest.fn().mockImplementation((_entity, data) => ({ ...makeList(), ...data })),
    persistAndFlush: jest.fn().mockResolvedValue(undefined),
    removeAndFlush: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
  };
}

describe('ListService', () => {
  describe('create', () => {
    it('creates a list and persists it', async () => {
      const em = makeEm();
      const service = new ListService(em as never);
      await service.create(3, { title: 'My List' });
      expect(em.persistAndFlush).toHaveBeenCalled();
    });
  });

  describe('visibility gate', () => {
    it('throws Forbidden for private list when not owner', async () => {
      const privateList = makeList({ visibility: ListVisibility.PRIVATE, owner: { id: 99 } });
      const em = makeEm(privateList);
      em.findOneOrFail.mockResolvedValue(privateList);
      const service = new ListService(em as never);
      await expect(service.getById(1, 3)).rejects.toThrow('Forbidden');
    });

    it('returns private list to the owner', async () => {
      const privateList = makeList({ visibility: ListVisibility.PRIVATE, owner: { id: 3 } });
      const em = makeEm(privateList);
      em.findOneOrFail.mockResolvedValue(privateList);
      const service = new ListService(em as never);
      const result = await service.getById(1, 3);
      expect(result.visibility).toBe(ListVisibility.PRIVATE);
    });
  });

  describe('addItem', () => {
    it('throws when book already in list', async () => {
      const em = makeEm(makeList(), makeItem());
      const service = new ListService(em as never);
      await expect(service.addItem(1, 3, 2)).rejects.toThrow('already in list');
    });

    it('adds item when not already present', async () => {
      const em = makeEm(makeList(), null);
      em.create.mockReturnValue(makeItem());
      const service = new ListService(em as never);
      await service.addItem(1, 3, 2);
      expect(em.persistAndFlush).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws Forbidden when not owner', async () => {
      const list = makeList({ owner: { id: 99 } });
      const em = makeEm(list);
      em.findOneOrFail.mockResolvedValue(list);
      const service = new ListService(em as never);
      await expect(service.update(1, 3, { title: 'New' })).rejects.toThrow('Forbidden');
    });
  });
});
