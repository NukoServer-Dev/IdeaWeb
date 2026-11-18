import { Hono } from 'hono'

import Index from './page/index.js';
import addIdea from "./api/addIdea.js"
import { initDB } from './db.js';

const app = new Hono();

async function registerStart() {
    initDB();

    Index(app);
    addIdea(app);
}

await registerStart();

export default app