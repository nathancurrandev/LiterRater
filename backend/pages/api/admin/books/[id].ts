import { NextApiResponse } from 'next';
import { requireAdmin, AuthenticatedRequest } from '../../../../src/middleware/auth';
import { getOrm } from '../../../../src/lib/orm';
import { Book } from '../../../../src/entities/Book';
import { Author } from '../../../../src/entities/Author';
import { Tag } from '../../../../src/entities/Tag';
import { sendSuccess, sendError } from '../../../../src/lib/response';

export default requireAdmin(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  const bookId = parseInt(typeof req.query['id'] === 'string' ? req.query['id'] : '', 10);
  if (isNaN(bookId)) {
    sendError(res, 'Invalid id', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();

  if (req.method === 'PATCH') {
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

    try {
      const book = await em.findOneOrFail(Book, bookId, { populate: ['authors', 'tags'] });

      if (typeof body.title === 'string') book.title = body.title;
      if ('isbn' in body) book.isbn = typeof body.isbn === 'string' ? body.isbn : null;
      if ('publicationYear' in body) book.publicationYear = typeof body.publicationYear === 'number' ? body.publicationYear : null;
      if ('description' in body) book.description = typeof body.description === 'string' ? body.description : null;
      if ('coverImageUrl' in body) book.coverImageUrl = typeof body.coverImageUrl === 'string' ? body.coverImageUrl : null;
      if ('pageCount' in body) book.pageCount = typeof body.pageCount === 'number' ? body.pageCount : null;
      if (typeof body.language === 'string') book.language = body.language;

      if (Array.isArray(body.authorIds)) {
        book.authors.removeAll();
        const authors = await Promise.all((body.authorIds as number[]).map((id) => em.findOneOrFail(Author, id)));
        authors.forEach((a) => book.authors.add(a));
      }
      if (Array.isArray(body.tagIds)) {
        book.tags.removeAll();
        const tags = await Promise.all((body.tagIds as number[]).map((id) => em.findOneOrFail(Tag, id)));
        tags.forEach((t) => book.tags.add(t));
      }

      await em.flush();
      sendSuccess(res, {
        id: book.id,
        title: book.title,
        isbn: book.isbn,
        publicationYear: book.publicationYear,
        coverImageUrl: book.coverImageUrl,
        language: book.language,
        authors: book.authors.getItems().map((a: Author) => ({ id: a.id, name: a.name })),
        averageRating: null,
        ratingCount: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      sendError(res, message, message.includes('not found') ? 404 : 500);
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const book = await em.findOneOrFail(Book, bookId);
      await em.removeAndFlush(book);
      sendSuccess(res, { ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      sendError(res, message, message.includes('not found') ? 404 : 500);
    }
    return;
  }

  sendError(res, 'Method not allowed', 405);
});
