import { NextApiResponse } from 'next';
import { requireAdmin, AuthenticatedRequest } from '../../../../src/middleware/auth';
import { getOrm } from '../../../../src/lib/orm';
import { BookService } from '../../../../src/services/BookService';
import { Book } from '../../../../src/entities/Book';
import { Author } from '../../../../src/entities/Author';
import { Tag } from '../../../../src/entities/Tag';
import { sendSuccess, sendError } from '../../../../src/lib/response';

function toBookSummary(book: Book) {
  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    publicationYear: book.publicationYear,
    coverImageUrl: book.coverImageUrl,
    language: book.language,
    authors: book.authors.isInitialized()
      ? book.authors.getItems().map((a: Author) => ({ id: a.id, name: a.name }))
      : [],
    averageRating: null,
    ratingCount: 0,
  };
}

export default requireAdmin(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  const orm = await getOrm();
  const em = orm.em.fork();

  if (req.method === 'GET') {
    const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
    const page = parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10) || 1;
    const limit = Math.min(50, parseInt(typeof req.query['limit'] === 'string' ? req.query['limit'] : '20', 10) || 20);
    const bookService = new BookService(em);
    const { books, total } = await bookService.search(q, page, limit);
    res.status(200).json({
      data: books.map(toBookSummary),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
    return;
  }

  if (req.method === 'POST') {
    const body = req.body as {
      title?: unknown;
      isbn?: unknown;
      publicationYear?: unknown;
      description?: unknown;
      coverImageUrl?: unknown;
      pageCount?: unknown;
      language?: unknown;
      authorIds?: unknown;
      tagIds?: unknown;
    };

    if (typeof body.title !== 'string' || !body.title.trim()) {
      sendError(res, 'title is required', 400);
      return;
    }

    try {
      const authorIds = Array.isArray(body.authorIds) ? (body.authorIds as number[]) : [];
      const tagIds = Array.isArray(body.tagIds) ? (body.tagIds as number[]) : [];
      const authors = await Promise.all(authorIds.map((id) => em.findOneOrFail(Author, id)));
      const tags = await Promise.all(tagIds.map((id) => em.findOneOrFail(Tag, id)));

      const book = em.create(Book, {
        title: body.title,
        isbn: typeof body.isbn === 'string' ? body.isbn : null,
        publicationYear: typeof body.publicationYear === 'number' ? body.publicationYear : null,
        description: typeof body.description === 'string' ? body.description : null,
        coverImageUrl: typeof body.coverImageUrl === 'string' ? body.coverImageUrl : null,
        pageCount: typeof body.pageCount === 'number' ? body.pageCount : null,
        language: typeof body.language === 'string' ? body.language : 'en',
      });

      authors.forEach((a) => book.authors.add(a));
      tags.forEach((t) => book.tags.add(t));

      await em.persistAndFlush(book);
      sendSuccess(res, toBookSummary(book), 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      sendError(res, message, 500);
    }
    return;
  }

  sendError(res, 'Method not allowed', 405);
});
