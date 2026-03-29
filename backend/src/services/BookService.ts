import { EntityManager } from '@mikro-orm/core';
import { Book } from '../entities/Book';

interface RatingStats {
  average: number | null;
  count: number;
}

interface RatingRow {
  average: string | null;
  count: string;
}

interface BookIdRow {
  id: number;
}

interface CountRow {
  total: number;
}

export class BookService {
  constructor(private readonly em: EntityManager) {}

  async search(
    query: string,
    page: number,
    limit: number,
  ): Promise<{ books: Book[]; total: number }> {
    const offset = (page - 1) * limit;

    if (query.trim()) {
      // Sanitise the query for BOOLEAN MODE: strip characters that could break syntax
      const sanitised = query.replace(/[+\-><()~*"@]/g, ' ').trim();
      const booleanQuery = sanitised
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => `+${word}*`)
        .join(' ');

      const [rawRows, [countRow]] = await Promise.all([
        this.em.getConnection().execute<BookIdRow[]>(
          `SELECT b.id
           FROM books b
           WHERE MATCH(b.title, b.description) AGAINST (? IN BOOLEAN MODE)
           ORDER BY b.title
           LIMIT ? OFFSET ?`,
          [booleanQuery, limit, offset],
        ),
        this.em.getConnection().execute<[CountRow]>(
          `SELECT COUNT(*) AS total
           FROM books b
           WHERE MATCH(b.title, b.description) AGAINST (? IN BOOLEAN MODE)`,
          [booleanQuery],
        ),
      ]);

      // Re-fetch as proper entities with authors populated
      const ids = rawRows.map((r) => r.id);
      if (ids.length === 0) return { books: [], total: 0 };
      const total = Number(countRow.total);

      const entities = await this.em.find(
        Book,
        { id: { $in: ids } },
        { populate: ['authors'] },
      );

      return { books: entities, total };
    }

    const [books, total] = await this.em.findAndCount(
      Book,
      {},
      {
        populate: ['authors'],
        orderBy: { title: 'ASC' },
        limit,
        offset,
      },
    );

    return { books, total };
  }

  async getById(id: number): Promise<Book | null> {
    const book = await this.em.findOne(
      Book,
      { id },
      { populate: ['authors', 'tags'] },
    );
    return book ?? null;
  }

  async getAverageRating(bookId: number): Promise<RatingStats> {
    const rows = await this.em.getConnection().execute<RatingRow[]>(
      'SELECT AVG(score) AS average, COUNT(*) AS count FROM ratings WHERE book_id = ?',
      [bookId],
    );

    const row = rows[0];
    if (!row) return { average: null, count: 0 };

    const count = Number(row.count);
    const average = row.average !== null ? Number(row.average) : null;

    return { average, count };
  }
}
