import { Migration } from '@mikro-orm/migrations';

export class Migration003ReadingRating extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`reading_entries\` (
        \`id\`          INT          NOT NULL AUTO_INCREMENT,
        \`status\`      ENUM('reading','finished','abandoned') NOT NULL,
        \`start_date\`  DATETIME     NULL,
        \`finish_date\` DATETIME     NULL,
        \`is_reread\`   TINYINT(1)   NOT NULL DEFAULT 0,
        \`notes\`       TEXT         NULL,
        \`created_at\`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`user_id\`     INT          NOT NULL,
        \`book_id\`     INT          NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`reading_entries_user_id_idx\` (\`user_id\`),
        INDEX \`reading_entries_book_id_idx\` (\`book_id\`),
        CONSTRAINT \`reading_entries_user_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`),
        CONSTRAINT \`reading_entries_book_fk\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    this.addSql(`
      CREATE TABLE \`ratings\` (
        \`id\`         INT       NOT NULL AUTO_INCREMENT,
        \`score\`      TINYINT   NOT NULL CHECK (\`score\` BETWEEN 1 AND 5),
        \`created_at\` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`user_id\`    INT       NOT NULL,
        \`book_id\`    INT       NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`ratings_user_book_unique\` (\`user_id\`, \`book_id\`),
        CONSTRAINT \`ratings_user_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`),
        CONSTRAINT \`ratings_book_fk\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS `ratings`;');
    this.addSql('DROP TABLE IF EXISTS `reading_entries`;');
  }
}
