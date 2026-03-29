import { Migration } from '@mikro-orm/migrations';

export class Migration002Catalog extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`authors\` (
        \`id\`          INT           NOT NULL AUTO_INCREMENT,
        \`name\`        VARCHAR(255)  NOT NULL,
        \`bio\`         TEXT          NULL,
        \`birth_year\`  INT           NULL,
        \`nationality\` VARCHAR(100)  NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    this.addSql(`
      CREATE TABLE \`tags\` (
        \`id\`   INT          NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(100) NOT NULL,
        \`slug\` VARCHAR(100) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`tags_name_unique\` (\`name\`),
        UNIQUE KEY \`tags_slug_unique\` (\`slug\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    this.addSql(`
      CREATE TABLE \`books\` (
        \`id\`               INT           NOT NULL AUTO_INCREMENT,
        \`title\`            VARCHAR(500)  NOT NULL,
        \`isbn\`             VARCHAR(20)   NULL,
        \`publication_year\` INT           NULL,
        \`description\`      TEXT          NULL,
        \`cover_image_url\`  VARCHAR(500)  NULL,
        \`page_count\`       INT           NULL,
        \`language\`         VARCHAR(10)   NOT NULL DEFAULT 'en',
        \`created_at\`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`books_isbn_unique\` (\`isbn\`),
        FULLTEXT KEY \`books_fulltext_title_description\` (\`title\`, \`description\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    this.addSql(`
      CREATE TABLE \`book_authors\` (
        \`book_id\`   INT NOT NULL,
        \`author_id\` INT NOT NULL,
        PRIMARY KEY (\`book_id\`, \`author_id\`),
        CONSTRAINT \`fk_book_authors_book\`   FOREIGN KEY (\`book_id\`)   REFERENCES \`books\`   (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_book_authors_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`authors\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    this.addSql(`
      CREATE TABLE \`book_tags\` (
        \`book_id\` INT NOT NULL,
        \`tag_id\`  INT NOT NULL,
        PRIMARY KEY (\`book_id\`, \`tag_id\`),
        CONSTRAINT \`fk_book_tags_book\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_book_tags_tag\`  FOREIGN KEY (\`tag_id\`)  REFERENCES \`tags\`  (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS `book_tags`;');
    this.addSql('DROP TABLE IF EXISTS `book_authors`;');
    this.addSql('DROP TABLE IF EXISTS `books`;');
    this.addSql('DROP TABLE IF EXISTS `tags`;');
    this.addSql('DROP TABLE IF EXISTS `authors`;');
  }
}
