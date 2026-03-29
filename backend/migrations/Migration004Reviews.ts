import { Migration } from '@mikro-orm/migrations';

export class Migration004Reviews extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`reviews\` (
        \`id\`                INT          NOT NULL AUTO_INCREMENT,
        \`content\`           TEXT         NOT NULL,
        \`contains_spoilers\` TINYINT(1)   NOT NULL DEFAULT 0,
        \`created_at\`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`user_id\`           INT          NOT NULL,
        \`book_id\`           INT          NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`reviews_user_book_unique\` (\`user_id\`, \`book_id\`),
        CONSTRAINT \`reviews_user_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`),
        CONSTRAINT \`reviews_book_fk\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS `reviews`;');
  }
}
