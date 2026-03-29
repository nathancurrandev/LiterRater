import { NextApiRequest, NextApiResponse } from 'next';
import { getOrm } from '../../../src/lib/orm';
import { BookService } from '../../../src/services/BookService';
import { AuthService } from '../../../src/services/AuthService';
import { sendSuccess, sendError } from '../../../src/lib/response';
import { Book } from '../../../src/entities/Book';
import { Author } from '../../../src/entities/Author';
import { Tag } from '../../../src/entities/Tag';

interface AuthorSummary {
  id: number;
  name: string;
  nationality: string | null;
}

interface TagSummary {
  id: number;
  name: string;
  slug: string;
}

interface BookDetail {
  id: number;
  title: string;
  isbn: string | null;
  publicationYear: number | null;
  description: string | null;
  coverImageUrl: string | null;
  pageCount: number | null;
  language: string;
  createdAt: string;
  updatedAt: string;
  authors: AuthorSummary[];
  tags: TagSummary[];
  averageRating: number | null;
  ratingCount: number;
  myRating?: number | null;
  myReview?: string | null;
}

function toAuthorSummary(author: Author): AuthorSummary {
  return { id: author.id, name: author.name, nationality: author.nationality };
}

function toTagSummary(tag: Tag): TagSummary {
  return { id: tag.id, name: tag.name, slug: tag.slug };
}

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const pair of cookieHeader.split(';')) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) continue;
    const key = pair.slice(0, eqIndex).trim();
    const value = decodeURIComponent(pair.slice(eqIndex + 1).trim());
    if (key) result[key] = value;
  }
  return result;
}

function toBookDetail(
  book: Book,
  averageRating: number | null,
  ratingCount: number,
  myRating?: number | null,
  myReview?: string | null,
): BookDetail {
  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    publicationYear: book.publicationYear,
    description: book.description,
    coverImageUrl: book.coverImageUrl,
    pageCount: book.pageCount,
    language: book.language,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    authors: book.authors.isInitialized() ? book.authors.getItems().map(toAuthorSummary) : [],
    tags: book.tags.isInitialized() ? book.tags.getItems().map(toTagSummary) : [],
    averageRating,
    ratingCount,
    ...(myRating !== undefined ? { myRating } : {}),
    ...(myReview !== undefined ? { myReview } : {}),
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
    sendError(res, 'Invalid book id', 400);
    return;
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const bookService = new BookService(em);

    const book = await bookService.getById(id);
    if (!book) {
      sendError(res, 'Book not found', 404);
      return;
    }

    const { average, count } = await bookService.getAverageRating(id);

    // Optionally resolve authenticated user's rating/review
    let myRating: number | null | undefined;
    let myReview: string | null | undefined;

    const cookies = parseCookieHeader(req.headers.cookie);
    const token = cookies['token'];

    if (token) {
      try {
        const authService = new AuthService(em);
        const payload = authService.verifyToken(token);
        const userId = payload.userId;

        // Query for the user's rating row if it exists
        interface RatingRow {
          score: number;
          review: string | null;
        }
        const rows = await em.getConnection().execute<RatingRow[]>(
          'SELECT score, review FROM ratings WHERE book_id = ? AND user_id = ? LIMIT 1',
          [id, userId],
        );
        if (rows.length > 0 && rows[0]) {
          myRating = rows[0].score;
          myReview = rows[0].review;
        } else {
          myRating = null;
          myReview = null;
        }
      } catch {
        // Invalid token — just omit myRating/myReview
      }
    }

    sendSuccess(res, toBookDetail(book, average, count, myRating, myReview));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
}
