import { Migration } from '@mikro-orm/migrations';

export class Migration001Initial extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`users\` (
        \`id\`            INT            NOT NULL AUTO_INCREMENT,
        \`email\`         VARCHAR(255)   NOT NULL,
        \`password_hash\` VARCHAR(255)   NOT NULL,
        \`username\`      VARCHAR(100)   NOT NULL,
        \`display_name\`  VARCHAR(255)   NOT NULL,
        \`bio\`           TEXT           NULL,
        \`avatar_url\`    VARCHAR(500)   NULL,
        \`role\`          ENUM('member','admin') NOT NULL DEFAULT 'member',
        \`is_anonymised\` TINYINT(1)     NOT NULL DEFAULT 0,
        \`created_at\`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`deleted_at\`    DATETIME       NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`users_email_unique\` (\`email\`),
        UNIQUE KEY \`users_username_unique\` (\`username\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS `users`;');
  }
}
