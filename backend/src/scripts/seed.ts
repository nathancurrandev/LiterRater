import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { Author } from '../entities/Author';
import { Tag } from '../entities/Tag';
import { Book } from '../entities/Book';
import { ReadingEntry, ReadingStatus } from '../entities/ReadingEntry';
import { Rating } from '../entities/Rating';
import { Review } from '../entities/Review';
import { List, ListVisibility } from '../entities/List';
import { ListItem } from '../entities/ListItem';
import { Follow } from '../entities/Follow';
import { Activity, ActivityType } from '../entities/Activity';
import { User } from '../entities/User';

async function seed(): Promise<void> {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  // Require at least one existing user — create users via `npm run seed:admin` first
  const users = await em.findAll(User, { limit: 5 });
  if (users.length === 0) {
    console.error('No users found. Create at least one user first (e.g. npm run seed:admin).');
    await orm.close();
    process.exit(1);
  }

  const user1 = users[0];
  const user2 = users.length > 1 ? users[1] : users[0];

  // ── Authors ──────────────────────────────────────────────────────────────
  const authors = [
    em.create(Author, { name: 'George Orwell',              bio: 'English novelist and essayist.',                           birthYear: 1903, nationality: 'British'    }),
    em.create(Author, { name: 'J.K. Rowling',               bio: 'British author of the Harry Potter series.',              birthYear: 1965, nationality: 'British'    }),
    em.create(Author, { name: 'Haruki Murakami',            bio: 'Japanese author known for surrealist fiction.',           birthYear: 1949, nationality: 'Japanese'   }),
    em.create(Author, { name: 'Toni Morrison',              bio: 'Nobel Prize-winning American novelist.',                  birthYear: 1931, nationality: 'American'   }),
    em.create(Author, { name: 'Gabriel García Márquez',     bio: 'Colombian author, pioneer of magical realism.',          birthYear: 1927, nationality: 'Colombian'  }),
  ];
  await em.persistAndFlush(authors);
  console.log(`Seeded ${authors.length} authors`);

  const [orwell, rowling, murakami, morrison, marquez] = authors;

  // ── Tags ─────────────────────────────────────────────────────────────────
  const tags = [
    em.create(Tag, { name: 'Fiction',          slug: 'fiction'          }),
    em.create(Tag, { name: 'Classic',          slug: 'classic'          }),
    em.create(Tag, { name: 'Dystopian',        slug: 'dystopian'        }),
    em.create(Tag, { name: 'Fantasy',          slug: 'fantasy'          }),
    em.create(Tag, { name: 'Literary Fiction', slug: 'literary-fiction' }),
    em.create(Tag, { name: 'Magical Realism',  slug: 'magical-realism'  }),
    em.create(Tag, { name: 'Science Fiction',  slug: 'science-fiction'  }),
    em.create(Tag, { name: 'Historical Fiction', slug: 'historical-fiction' }),
  ];
  await em.persistAndFlush(tags);
  console.log(`Seeded ${tags.length} tags`);

  const [fiction, classic, dystopian, fantasy, literary, magicalRealism] = tags;

  // ── Books (+ pivot associations) ─────────────────────────────────────────
  const nineteenEightyFour = em.create(Book, {
    title: 'Nineteen Eighty-Four',
    isbn: '9780451524935',
    publicationYear: 1949,
    description: 'A dystopian social science fiction novel about a totalitarian society under constant surveillance.',
    pageCount: 328,
    language: 'en',
  });
  nineteenEightyFour.authors.add(orwell);
  nineteenEightyFour.tags.add(dystopian, classic, fiction);

  const philosophersStone = em.create(Book, {
    title: "Harry Potter and the Philosopher's Stone",
    isbn: '9780747532699',
    publicationYear: 1997,
    description: 'A young boy discovers he is a wizard and embarks on his first year at Hogwarts.',
    pageCount: 223,
    language: 'en',
  });
  philosophersStone.authors.add(rowling);
  philosophersStone.tags.add(fantasy, fiction);

  const norwegianWood = em.create(Book, {
    title: 'Norwegian Wood',
    isbn: '9780375704024',
    publicationYear: 1987,
    description: 'A nostalgic story of loss, sexuality, and melancholy set in 1960s Tokyo.',
    pageCount: 296,
    language: 'en',
  });
  norwegianWood.authors.add(murakami);
  norwegianWood.tags.add(literary, fiction);

  const beloved = em.create(Book, {
    title: 'Beloved',
    isbn: '9781400033416',
    publicationYear: 1987,
    description: 'A haunting novel exploring the psychological trauma of slavery in post-Civil War America.',
    pageCount: 324,
    language: 'en',
  });
  beloved.authors.add(morrison);
  beloved.tags.add(literary, classic, fiction);

  const hundredYears = em.create(Book, {
    title: 'One Hundred Years of Solitude',
    isbn: '9780060883287',
    publicationYear: 1967,
    description: 'A landmark of magical realism tracing seven generations of the Buendía family.',
    pageCount: 417,
    language: 'en',
  });
  hundredYears.authors.add(marquez);
  hundredYears.tags.add(magicalRealism, literary, fiction);

  const books = [nineteenEightyFour, philosophersStone, norwegianWood, beloved, hundredYears];
  await em.persistAndFlush(books);
  console.log(`Seeded ${books.length} books`);

  // ── Reading Entries ───────────────────────────────────────────────────────
  const now = new Date();
  const readingEntries = [
    em.create(ReadingEntry, {
      user: user1,
      book: nineteenEightyFour,
      status: ReadingStatus.FINISHED,
      startDate: new Date('2025-01-01'),
      finishDate: new Date('2025-01-10'),
      isReread: false,
      notes: 'Chilling and brilliant.',
      createdAt: now,
      updatedAt: now,
    }),
    em.create(ReadingEntry, {
      user: user1,
      book: philosophersStone,
      status: ReadingStatus.FINISHED,
      startDate: new Date('2025-02-01'),
      finishDate: new Date('2025-02-05'),
      isReread: true,
      createdAt: now,
      updatedAt: now,
    }),
    em.create(ReadingEntry, {
      user: user2,
      book: norwegianWood,
      status: ReadingStatus.READING,
      startDate: new Date('2025-03-01'),
      isReread: false,
      createdAt: now,
      updatedAt: now,
    }),
    em.create(ReadingEntry, {
      user: user2,
      book: hundredYears,
      status: ReadingStatus.FINISHED,
      startDate: new Date('2024-12-01'),
      finishDate: new Date('2024-12-20'),
      isReread: false,
      createdAt: now,
      updatedAt: now,
    }),
  ];
  await em.persistAndFlush(readingEntries);
  console.log(`Seeded ${readingEntries.length} reading entries`);

  // ── Ratings ───────────────────────────────────────────────────────────────
  const ratings = [
    em.create(Rating, { user: user1, book: nineteenEightyFour, score: 5, createdAt: now, updatedAt: now }),
    em.create(Rating, { user: user1, book: philosophersStone,  score: 4, createdAt: now, updatedAt: now }),
    em.create(Rating, { user: user2, book: norwegianWood,      score: 4, createdAt: now, updatedAt: now }),
    em.create(Rating, { user: user2, book: hundredYears,       score: 5, createdAt: now, updatedAt: now }),
  ];
  await em.persistAndFlush(ratings);
  console.log(`Seeded ${ratings.length} ratings`);

  // ── Reviews ───────────────────────────────────────────────────────────────
  const review1 = em.create(Review, {
    user: user1,
    book: nineteenEightyFour,
    content: "A masterpiece of dystopian fiction. Orwell's vision feels increasingly relevant in the modern world.",
    containsSpoilers: false,
    createdAt: now,
    updatedAt: now,
  });
  const review2 = em.create(Review, {
    user: user2,
    book: hundredYears,
    content: 'One of the greatest novels ever written. García Márquez weaves generations together with effortless magic.',
    containsSpoilers: false,
    createdAt: now,
    updatedAt: now,
  });
  await em.persistAndFlush([review1, review2]);
  console.log('Seeded 2 reviews');

  // ── Lists & List Items ────────────────────────────────────────────────────
  const list1 = em.create(List, {
    owner: user1,
    title: 'My Favourite Classics',
    description: 'Books that have stood the test of time.',
    isRanked: true,
    visibility: ListVisibility.PUBLIC,
    createdAt: now,
    updatedAt: now,
  });
  const list2 = em.create(List, {
    owner: user2,
    title: 'Books to Read in 2026',
    description: 'My reading goals for 2026.',
    isRanked: false,
    visibility: ListVisibility.PUBLIC,
    createdAt: now,
    updatedAt: now,
  });
  await em.persistAndFlush([list1, list2]);

  const listItems = [
    em.create(ListItem, { list: list1, book: nineteenEightyFour, position: 1, notes: 'Absolute must-read.' }),
    em.create(ListItem, { list: list1, book: hundredYears,       position: 2 }),
    em.create(ListItem, { list: list1, book: beloved,            position: 3 }),
    em.create(ListItem, { list: list2, book: norwegianWood }),
    em.create(ListItem, { list: list2, book: philosophersStone }),
  ];
  await em.persistAndFlush(listItems);
  console.log(`Seeded 2 lists with ${listItems.length} items`);

  // ── Follows ───────────────────────────────────────────────────────────────
  if (users.length >= 2) {
    const follows = [
      em.create(Follow, { follower: user1, following: user2, createdAt: now }),
      em.create(Follow, { follower: user2, following: user1, createdAt: now }),
    ];
    await em.persistAndFlush(follows);
    console.log(`Seeded ${follows.length} follows`);
  } else {
    console.log('Skipping follows seed — need at least 2 users');
  }

  // ── Activities ────────────────────────────────────────────────────────────
  const activities = [
    em.create(Activity, { actor: user1, type: ActivityType.BOOK_FINISHED,     book: nineteenEightyFour,  createdAt: now }),
    em.create(Activity, { actor: user1, type: ActivityType.BOOK_RATED,        book: nineteenEightyFour,  createdAt: now }),
    em.create(Activity, { actor: user1, type: ActivityType.REVIEW_PUBLISHED,  book: nineteenEightyFour,  review: review1, createdAt: now }),
    em.create(Activity, { actor: user1, type: ActivityType.LIST_CREATED,      list: list1,               createdAt: now }),
    em.create(Activity, { actor: user2, type: ActivityType.BOOK_FINISHED,     book: hundredYears,        createdAt: now }),
    em.create(Activity, { actor: user2, type: ActivityType.REVIEW_PUBLISHED,  book: hundredYears,        review: review2, createdAt: now }),
  ];
  await em.persistAndFlush(activities);
  console.log(`Seeded ${activities.length} activities`);

  await orm.close();
  console.log('\nSeeding complete!');
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
