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
        CREATE TABLE IF NOT EXISTS auth_attempts (
            attempt_key TEXT NOT NULL,
            attempted_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS auth_attempts_time ON auth_attempts(attempted_at);
    `);
}
