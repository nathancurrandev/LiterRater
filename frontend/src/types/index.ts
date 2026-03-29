export interface UserSummary {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'member' | 'admin';
}

export interface UserProfile extends UserSummary {
  bio: string | null;
  booksLoggedCount: number;
  averageRating: number | null;
  followersCount: number;
  followingCount: number;
  isFollowedByMe: boolean;
}

export interface BookSummary {
  id: number;
  title: string;
  coverImageUrl: string | null;
  authors: Array<{ id: number; name: string }>;
  averageRating: number | null;
  ratingCount: number;
}

export interface BookDetail extends BookSummary {
  isbn: string | null;
  publicationYear: number | null;
  description: string | null;
  pageCount: number | null;
  language: string;
  tags: Tag[];
  myRating: number | null;
  myReview: Review | null;
}

export interface AuthorDetail {
  id: number;
  name: string;
  bio: string | null;
  birthYear: number | null;
  nationality: string | null;
}

export interface ReadingEntry {
  id: number;
  bookId: number;
  status: 'reading' | 'finished' | 'abandoned';
  startDate: string | null;
  finishDate: string | null;
  isReread: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: number;
  bookId: number;
  score: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  bookId: number;
  author: UserSummary;
  content: string;
  containsSpoilers: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListSummary {
  id: number;
  title: string;
  description: string | null;
  isRanked: boolean;
  visibility: 'public' | 'private';
  itemCount: number;
  owner: UserSummary;
  createdAt: string;
}

export interface ListDetail extends ListSummary {
  items: ListItem[];
}

export interface ListItem {
  bookId: number;
  book: BookSummary;
  position: number | null;
  notes: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface ActivityEvent {
  id: number;
  type: 'book_finished' | 'book_rated' | 'review_published' | 'list_created';
  actor: UserSummary;
  book?: BookSummary;
  review?: Review;
  list?: ListSummary;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
