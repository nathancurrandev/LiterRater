import { Migration } from '@mikro-orm/migrations';

export class Migration005Lists extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`lists\` (
        \`id\`          INT          NOT NULL AUTO_INCREMENT,
        \`title\`       VARCHAR(255) NOT NULL,
        \`description\` TEXT         NULL,
        \`is_ranked\`   TINYINT(1)   NOT NULL DEFAULT 0,
        \`visibility\`  ENUM('public','private') NOT NULL DEFAULT 'public',
        \`created_at\`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`owner_id\`    INT          NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`lists_owner_idx\` (\`owner_id\`),
        CONSTRAINT \`lists_owner_fk\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    this.addSql(`
      CREATE TABLE \`list_items\` (
        \`id\`       INT     NOT NULL AUTO_INCREMENT,
        \`position\` INT     NULL,
        \`notes\`    TEXT    NULL,
        \`list_id\`  INT     NOT NULL,
        \`book_id\`  INT     NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`list_items_list_book_unique\` (\`list_id\`, \`book_id\`),
        CONSTRAINT \`list_items_list_fk\` FOREIGN KEY (\`list_id\`) REFERENCES \`lists\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`list_items_book_fk\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS `list_items`;');
    this.addSql('DROP TABLE IF EXISTS `lists`;');
  }
}
