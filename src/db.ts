import { DatabaseSync } from 'node:sqlite';

export const db = new DatabaseSync('database.db');

export function initDB() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY,
            author TEXT NOT NULL,
            idea TEXT NOT NULL,
            description TEXT,
            createdAt TEXT DEFAULT (DATETIME('now', 'localtime'))
        )
    `);
}