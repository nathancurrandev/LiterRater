import { NextApiRequest, NextApiResponse } from 'next';
import { getOrm } from '../../../src/lib/orm';
import { Author } from '../../../src/entities/Author';
import { Book } from '../../../src/entities/Book';
import { sendSuccess, sendError } from '../../../src/lib/response';

interface BookSummary {
  id: number;
  title: string;
  isbn: string | null;
  publicationYear: number | null;
  coverImageUrl: string | null;
  language: string;
}

interface AuthorDetail {
  id: number;
  name: string;
  bio: string | null;
  birthYear: number | null;
  nationality: string | null;
  books: BookSummary[];
}

function toBookSummary(book: Book): BookSummary {
  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    publicationYear: book.publicationYear,
    coverImageUrl: book.coverImageUrl,
    language: book.language,
  };
}

function toAuthorDetail(author: Author): AuthorDetail {
  return {
    id: author.id,
    name: author.name,
    bio: author.bio,
    birthYear: author.birthYear,
    nationality: author.nationality,
    books: author.books.isInitialized() ? author.books.getItems().map(toBookSummary) : [],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const rawId = req.query['id'];
  const id = parseInt(typeof rawId === 'string' ? rawId : '', 10);
  if (isNaN(id)) {
    sendError(res, 'Invalid author id', 400);
    return;
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();

    const author = await em.findOne(Author, { id }, { populate: ['books'] });
    if (!author) {
      sendError(res, 'Author not found', 404);
      return;
    }

    sendSuccess(res, toAuthorDetail(author));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
}
