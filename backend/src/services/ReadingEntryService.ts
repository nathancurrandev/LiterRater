import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { ReadingEntry, ReadingStatus } from '../entities/ReadingEntry';
import { User } from '../entities/User';
import { Book } from '../entities/Book';

interface CreateReadingEntryData {
  bookId: number;
  status: ReadingStatus;
  startDate?: string | null;
  finishDate?: string | null;
  isReread?: boolean;
  notes?: string | null;
}

type UpdateReadingEntryData = Partial<CreateReadingEntryData>;

interface ListFilters {
  bookId?: number;
  status?: ReadingStatus;
  page?: number;
  limit?: number;
}

export class ReadingEntryService {
  constructor(private readonly em: EntityManager) {}

  async create(userId: number, data: CreateReadingEntryData): Promise<ReadingEntry> {
    const user = await this.em.findOneOrFail(User, userId);
    const book = await this.em.findOneOrFail(Book, data.bookId, { failHandler: () => new Error('Book not found') });

    const entry = this.em.create(ReadingEntry, {
      user,
      book,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : null,
      finishDate: data.finishDate ? new Date(data.finishDate) : null,
      isReread: data.isReread ?? false,
      notes: data.notes ?? null,
    });

    await this.em.persistAndFlush(entry);
    return entry;
  }

  async update(entryId: number, userId: number, data: UpdateReadingEntryData): Promise<ReadingEntry> {
    const entry = await this.em.findOneOrFail(ReadingEntry, entryId, { populate: ['user'] });

    if (entry.user.id !== userId) {
      throw new Error('Forbidden');
    }

    if (data.status !== undefined) entry.status = data.status;
    if (data.startDate !== undefined) entry.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.finishDate !== undefined) entry.finishDate = data.finishDate ? new Date(data.finishDate) : null;
    if (data.isReread !== undefined) entry.isReread = data.isReread;
    if (data.notes !== undefined) entry.notes = data.notes ?? null;

    await this.em.flush();
    return entry;
  }

  async delete(entryId: number, userId: number): Promise<void> {
    const entry = await this.em.findOneOrFail(ReadingEntry, entryId, { populate: ['user'] });

    if (entry.user.id !== userId) {
      throw new Error('Forbidden');
    }

    await this.em.removeAndFlush(entry);
  }

  async list(
    userId: number,
    filters: ListFilters,
  ): Promise<{ entries: ReadingEntry[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = Math.min(50, filters.limit ?? 20);
    const offset = (page - 1) * limit;

    const where: FilterQuery<ReadingEntry> = { user: { id: userId } };
    if (filters.bookId !== undefined) where.book = { id: filters.bookId };
    if (filters.status !== undefined) where.status = filters.status;

    const [entries, total] = await this.em.findAndCount(ReadingEntry, where, {
      populate: ['book', 'book.authors'],
      orderBy: { createdAt: 'DESC' },
      limit,
      offset,
    });

    return { entries, total };
  }
}
