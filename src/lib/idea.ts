import { db } from "../db.js";
import type { Idea } from "../types/idea.js";

const ITEMS_PER_PAGE = 10;

export function getIdeas(page = 1) {
    page = Math.max(1, Math.floor(Number(page) || 1));

    const offset = (page - 1) * ITEMS_PER_PAGE;

    const ideas = db.prepare(`
        SELECT *
        FROM ideas
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `).all(ITEMS_PER_PAGE, offset);

    const total = db.prepare(`
        SELECT COUNT(*) AS count
        FROM ideas
    `).get()?.count ?? 0;

    const ideasType: Idea[] = [];
    for (const idea of ideas) {
        ideasType.push({
            Author: idea.author as string,
            Idea: idea.idea as string,
            Description: idea.description as string,
            CreatedAt: idea.createdAt as string,
        })
    }

    return {
        data: ideasType,
        pagination: {
            currentPage: page,
            perPage: ITEMS_PER_PAGE,
            total,
            totalPages: Math.ceil(Number(total) / ITEMS_PER_PAGE),
            hasNextPage: offset + ITEMS_PER_PAGE < Number(total),
            hasPreviousPage: page > 1
        }
    };
}

export function addIdea(author: string, idea: string, description: string) {
    const result = db.prepare(`
        INSERT INTO ideas (author, idea, description)
        VALUES (?, ?, ?)
    `).run(author, idea, description);

    return {
        success: true,
        id: Number(result.lastInsertRowid),
        changes: Number(result.changes)
    };
}