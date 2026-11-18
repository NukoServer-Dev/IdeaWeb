import { Hono } from 'hono'

import Index from './page/index.js';
import addIdea from "./api/addIdea.js"
import search from "./api/search.js"
import { initDB } from './db.js';

const app = new Hono();

async function registerStart() {
    initDB();

    Index(app);
    addIdea(app);
    search(app);
}

await registerStart();

export default app