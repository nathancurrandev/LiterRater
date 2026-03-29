import { EntityManager } from '@mikro-orm/core';
import { List, ListVisibility } from '../entities/List';
import { ListItem } from '../entities/ListItem';
import { User } from '../entities/User';
import { Book } from '../entities/Book';

interface CreateListData {
  title: string;
  description?: string | null;
  isRanked?: boolean;
  visibility?: ListVisibility;
}

type UpdateListData = Partial<CreateListData>;

export class ListService {
  constructor(private readonly em: EntityManager) {}

  async create(ownerId: number, data: CreateListData): Promise<List> {
    const owner = await this.em.findOneOrFail(User, ownerId);
    const list = this.em.create(List, {
      owner,
      title: data.title,
      description: data.description ?? null,
      isRanked: data.isRanked ?? false,
      visibility: data.visibility ?? ListVisibility.PUBLIC,
    });
    await this.em.persistAndFlush(list);
    return list;
  }

  async getById(listId: number, requestingUserId?: number): Promise<List> {
    const list = await this.em.findOneOrFail(List, listId, {
      populate: ['owner', 'items', 'items.book', 'items.book.authors'],
      failHandler: () => new Error('List not found'),
    });

    if (list.visibility === ListVisibility.PRIVATE && list.owner.id !== requestingUserId) {
      throw new Error('Forbidden');
    }

    return list;
  }

  async update(listId: number, ownerId: number, data: UpdateListData): Promise<List> {
    const list = await this.em.findOneOrFail(List, listId, { populate: ['owner'] });
    if (list.owner.id !== ownerId) throw new Error('Forbidden');

    if (data.title !== undefined) list.title = data.title;
    if (data.description !== undefined) list.description = data.description ?? null;
    if (data.isRanked !== undefined) list.isRanked = data.isRanked;
    if (data.visibility !== undefined) list.visibility = data.visibility;

    await this.em.flush();
    return list;
  }

  async delete(listId: number, ownerId: number): Promise<void> {
    const list = await this.em.findOneOrFail(List, listId, { populate: ['owner'] });
    if (list.owner.id !== ownerId) throw new Error('Forbidden');
    await this.em.removeAndFlush(list);
  }

  async addItem(
    listId: number,
    ownerId: number,
    bookId: number,
    position?: number | null,
    notes?: string | null,
  ): Promise<ListItem> {
    const list = await this.em.findOneOrFail(List, listId, { populate: ['owner'] });
    if (list.owner.id !== ownerId) throw new Error('Forbidden');

    const existing = await this.em.findOne(ListItem, { list: { id: listId }, book: { id: bookId } });
    if (existing) throw new Error('Book already in list');

    const book = await this.em.findOneOrFail(Book, bookId, { failHandler: () => new Error('Book not found') });
    const item = this.em.create(ListItem, {
      list,
      book,
      position: position ?? null,
      notes: notes ?? null,
    });
    await this.em.persistAndFlush(item);
    return item;
  }

  async updateItem(
    listId: number,
    ownerId: number,
    bookId: number,
    data: { position?: number | null; notes?: string | null },
  ): Promise<ListItem> {
    const list = await this.em.findOneOrFail(List, listId, { populate: ['owner'] });
    if (list.owner.id !== ownerId) throw new Error('Forbidden');

    const item = await this.em.findOneOrFail(ListItem, { list: { id: listId }, book: { id: bookId } });
    if ('position' in data) item.position = data.position ?? null;
    if ('notes' in data) item.notes = data.notes ?? null;
    await this.em.flush();
    return item;
  }

  async removeItem(listId: number, ownerId: number, bookId: number): Promise<void> {
    const list = await this.em.findOneOrFail(List, listId, { populate: ['owner'] });
    if (list.owner.id !== ownerId) throw new Error('Forbidden');

    const item = await this.em.findOneOrFail(ListItem, { list: { id: listId }, book: { id: bookId } });
    await this.em.removeAndFlush(item);
  }

  async getForUser(userId: number, requestingUserId?: number): Promise<List[]> {
    const where =
      requestingUserId === userId
        ? { owner: { id: userId } }
        : { owner: { id: userId }, visibility: ListVisibility.PUBLIC };

    return this.em.find(List, where, {
      populate: ['owner'],
      orderBy: { createdAt: 'DESC' },
    });
  }
}
