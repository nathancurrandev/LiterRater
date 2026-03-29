import { Migration } from '@mikro-orm/migrations';

export class Migration006Social extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`follows\` (
        \`id\`           INT      NOT NULL AUTO_INCREMENT,
        \`created_at\`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`follower_id\`  INT      NOT NULL,
        \`following_id\` INT      NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`follows_unique\` (\`follower_id\`, \`following_id\`),
        CONSTRAINT \`follows_follower_fk\` FOREIGN KEY (\`follower_id\`) REFERENCES \`users\` (\`id\`),
        CONSTRAINT \`follows_following_fk\` FOREIGN KEY (\`following_id\`) REFERENCES \`users\` (\`id\`),
        CHECK (\`follower_id\` <> \`following_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    this.addSql(`
      CREATE TABLE \`activities\` (
        \`id\`         INT          NOT NULL AUTO_INCREMENT,
        \`type\`       ENUM('book_finished','book_rated','review_published','list_created') NOT NULL,
        \`created_at\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`actor_id\`   INT          NOT NULL,
        \`book_id\`    INT          NULL,
        \`review_id\`  INT          NULL,
        \`list_id\`    INT          NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`activities_actor_idx\` (\`actor_id\`),
        INDEX \`activities_created_at_idx\` (\`created_at\`),
        CONSTRAINT \`activities_actor_fk\` FOREIGN KEY (\`actor_id\`) REFERENCES \`users\` (\`id\`),
        CONSTRAINT \`activities_book_fk\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`activities_review_fk\` FOREIGN KEY (\`review_id\`) REFERENCES \`reviews\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`activities_list_fk\` FOREIGN KEY (\`list_id\`) REFERENCES \`lists\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS `activities`;');
    this.addSql('DROP TABLE IF EXISTS `follows`;');
  }
}
