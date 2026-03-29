import { NextApiRequest, NextApiResponse } from 'next';
import { getOrm } from '../../../src/lib/orm';
import { BookService } from '../../../src/services/BookService';
import { sendError } from '../../../src/lib/response';
import { Book } from '../../../src/entities/Book';
import { Author } from '../../../src/entities/Author';

interface AuthorSummary {
  id: number;
  name: string;
}

interface BookSummary {
  id: number;
  title: string;
  isbn: string | null;
  publicationYear: number | null;
  coverImageUrl: string | null;
  language: string;
  authors: AuthorSummary[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function toAuthorSummary(author: Author): AuthorSummary {
  return { id: author.id, name: author.name };
}

function toBookSummary(book: Book): BookSummary {
  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    publicationYear: book.publicationYear,
    coverImageUrl: book.coverImageUrl,
    language: book.language,
    authors: book.authors.isInitialized() ? book.authors.getItems().map(toAuthorSummary) : [],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
  const page = Math.max(1, parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(typeof req.query['limit'] === 'string' ? req.query['limit'] : '20', 10) || 20));

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const bookService = new BookService(em);

    const { books, total } = await bookService.search(q, page, limit);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    res.status(200).json({ data: books.map(toBookSummary), meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
}
