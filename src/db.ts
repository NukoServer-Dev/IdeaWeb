import { DatabaseSync } from 'node:sqlite';

export const db = new DatabaseSync('database.db');

export function initDB() {
    db.exec(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY,
            author TEXT NOT NULL,
            idea TEXT NOT NULL,
            description TEXT,
            createdAt TEXT DEFAULT (DATETIME('now', 'localtime'))
        )
        ;
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
        );
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS auth_attempts (
            attempt_key TEXT NOT NULL,
            attempted_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS idea_likes (
            idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
            PRIMARY KEY (idea_id, user_id)
        );
        CREATE TABLE IF NOT EXISTS idea_replies (
            id INTEGER PRIMARY KEY,
            idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL,
            username TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
        );
        CREATE INDEX IF NOT EXISTS idea_replies_idea ON idea_replies(idea_id, id);
        CREATE INDEX IF NOT EXISTS auth_attempts_time ON auth_attempts(attempted_at);
    `);

    // Older versions constrained interaction authors to numeric users-table IDs.
    // Admin sessions use the stable string ID "admin", so preserve existing rows
    // while removing that constraint and using text identity keys.
    const likeForeignKeys = db.prepare('PRAGMA foreign_key_list(idea_likes)').all() as { table: string }[];
    const replyForeignKeys = db.prepare('PRAGMA foreign_key_list(idea_replies)').all() as { table: string }[];
    if (likeForeignKeys.some((fk) => fk.table === 'users') || replyForeignKeys.some((fk) => fk.table === 'users')) {
        db.exec(`
            PRAGMA foreign_keys = OFF;
            BEGIN;
            CREATE TABLE idea_likes_new (
                idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
                PRIMARY KEY (idea_id, user_id)
            );
            INSERT INTO idea_likes_new SELECT idea_id, CAST(user_id AS TEXT), created_at FROM idea_likes;
            DROP TABLE idea_likes;
            ALTER TABLE idea_likes_new RENAME TO idea_likes;
            CREATE TABLE idea_replies_new (
                id INTEGER PRIMARY KEY,
                idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                username TEXT NOT NULL,
                body TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
            );
            INSERT INTO idea_replies_new SELECT id, idea_id, CAST(user_id AS TEXT), username, body, created_at FROM idea_replies;
            DROP TABLE idea_replies;
            ALTER TABLE idea_replies_new RENAME TO idea_replies;
            CREATE INDEX IF NOT EXISTS idea_replies_idea ON idea_replies(idea_id, id);
            COMMIT;
            PRAGMA foreign_keys = ON;
        `);
    }
}
