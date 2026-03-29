# High-Level Specification: Letterboxd-Style App for Books

## Purpose

This document summarizes the core systems and architecture patterns
behind a Letterboxd-style platform, adapted for books. It is intended as
a high-level guide for developers designing a social cataloging and
review application.

------------------------------------------------------------------------

# 1. Core Concept

The application is a social cataloging platform where users: - Track
books they read - Rate and review books - Create curated lists - Follow
other readers - Discover books through social activity

The central object in the system is: Book (Primary Media Object)

------------------------------------------------------------------------

# 2. Core Domain Model

## Primary Entities

User Book Author Review Rating ReadingEntry (Diary/Log) List ListItem
Activity Follow Tag

## Entity Relationships

User - writes Reviews - gives Ratings - logs ReadingEntries - creates
Lists - follows Users - generates Activity events

Book - has Reviews - has Ratings - appears in Lists - appears in
ReadingEntries

List - contains Books

------------------------------------------------------------------------

# 3. Catalog System

The catalog system stores metadata about books and powers search and
discovery.

## Book Model

Fields: - id - title - author_id - publication_year - genres -
description - cover_image - ISBN - page_count - language - series_id
(optional)

## Author Model

Fields: - id - name - bio - birth_year - nationality

------------------------------------------------------------------------

# 4. Reading Log System (Core Feature)

Users record when they read a book.

## ReadingEntry Model

Fields: - id - user_id - book_id - start_date - finish_date - status
(reading / finished / abandoned) - rating_id - review_id - reread
(boolean) - notes

------------------------------------------------------------------------

# 5. Review & Rating System

Ratings and reviews should be separate objects.

## Rating Model

Fields: - user_id - book_id - score - created_at

## Review Model

Fields: - id - user_id - book_id - content - contains_spoilers -
likes_count - comments_count - created_at

------------------------------------------------------------------------

# 6. Lists (Community Curation)

Users create collections of books.

## List Model

Fields: - id - title - description - creator_id - is_ranked -
visibility - created_at

## ListItem Model

Fields: - list_id - book_id - position - notes

------------------------------------------------------------------------

# 7. Social System

## Follow Model

-   follower_id
-   following_id
-   created_at

## Activity Feed Event Types

-   UserReviewedBook
-   UserRatedBook
-   UserFinishedBook
-   UserStartedBook
-   UserCreatedList
-   UserLikedReview
-   UserFollowedUser

------------------------------------------------------------------------

# 8. Discovery System

Social discovery: - Friend activity - Popular books - Trending reviews -
Popular lists

Algorithmic discovery signals: - Similar users - Genre overlap - List
co-occurrence - Rating similarity - Author similarity

------------------------------------------------------------------------

# 9. Personal Analytics

Examples: - books_read_per_year - pages_read - average_rating -
favorite_genres - favorite_authors - reading_streak

------------------------------------------------------------------------

# 10. Gamification Layer

Examples: - yearly reading goals - reading challenges - badges - streak
tracking - annual recap

## ReadingGoal Model

Fields: - user_id - year - target_books - progress

------------------------------------------------------------------------

# 11. Suggested System Architecture

Services: - User Service - Book Catalog Service - Review Service -
Activity Feed Service - List Service - Recommendation Service -
Analytics Service

Data storage: - PostgreSQL (core data) - Elasticsearch (search) - Redis
(caching / feeds) - Object storage (images)

------------------------------------------------------------------------

# 12. Minimal MVP Scope

1.  User accounts
2.  Book database
3.  Ratings
4.  Reviews
5.  Reading log
6.  Lists
7.  Follow users
8.  Activity feed

Later: - recommendations - analytics dashboards - gamification

------------------------------------------------------------------------

# 13. Core Product Loop

Discover Book → Log Reading → Rate → Review → Share → Feed Visibility →
More Discovery

Target: logging a book in under 10 seconds.

------------------------------------------------------------------------

# 14. Example Database Tables

users books authors reviews ratings reading_entries lists list_items
follows activities tags book_tags
