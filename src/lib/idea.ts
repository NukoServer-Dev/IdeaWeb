import { db } from "../db.js";
import type { Idea } from "../types/idea.js";

const ITEMS_PER_PAGE = 10;

export function getIdeas(page = 1, search_word: string = "", userId: string | number = "") {
    page = Math.max(1, Math.floor(Number(page) || 1));

    const offset = (page - 1) * ITEMS_PER_PAGE;
    const keyword = search_word.trim();

    const where = keyword
        ? `WHERE author LIKE ? OR idea LIKE ? OR description LIKE ?`
        : "";

    const params = keyword
        ? Array(3).fill(`%${keyword}%`)
        : [];

    const ideas = db.prepare(`
        SELECT ideas.*,
            (SELECT COUNT(*) FROM idea_likes WHERE idea_id = ideas.id) AS likeCount,
            EXISTS(SELECT 1 FROM idea_likes WHERE idea_id = ideas.id AND user_id = ?) AS likedByMe
        FROM ideas
        ${where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `).all(userId, ...params, ITEMS_PER_PAGE, offset);

    const total = db.prepare(`
        SELECT COUNT(*) AS count
        FROM ideas
        ${where}
    `).get(...params)?.count ?? 0;

    const ideasType: Idea[] = [];

    for (const idea of ideas) {
        ideasType.push({
            Author: idea.author as string,
            Idea: idea.idea as string,
            Description: idea.description as string,
            CreatedAt: idea.createdAt as string,
            ID: idea.id as number
            ,LikeCount: Number(idea.likeCount), LikedByMe: Boolean(idea.likedByMe),
            Replies: db.prepare(`SELECT username, body, created_at FROM idea_replies WHERE idea_id = ? ORDER BY id ASC`).all(idea.id).map((reply: any) => ({ Author: reply.username as string, Body: reply.body as string, CreatedAt: reply.created_at as string }))
        });
    }

    return {
        data: ideasType,
        pagination: {
            currentPage: page,
            perPage: ITEMS_PER_PAGE,
            total: Number(total),
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

export function getIdea(id: number): Idea | null {
    const idea = db.prepare(`
        SELECT *
        FROM ideas
        WHERE id = ?
    `).get(id);

    if (!idea) return null;

    return {
        Author: idea.author as string,
        Idea: idea.idea as string,
        Description: idea.description as string,
        CreatedAt: idea.createdAt as string,
        ID: idea.id as number,
        LikeCount: 0, LikedByMe: false, Replies: []
    };
}

export function deleteIdea(id: number) {
    const result = db.prepare(`
        DELETE FROM ideas
        WHERE id = ?
    `).run(id);

    return {
        success: Number(result.changes) > 0,
        changes: Number(result.changes)
    };
}
