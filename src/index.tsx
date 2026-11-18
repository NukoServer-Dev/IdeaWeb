import { Hono } from 'hono'
import { useSession } from '@hono/session';

import Index from './page/index.js';
import Login from "./page/login.js"
import addIdea from "./api/addIdea.js"
import deleteIdea from "./api/deleteIdea.js"
import search from "./api/search.js"
import login from "./api/login.js"
import logout from "./api/logout.js"

import { initDB } from './db.js';
import type { SessionData } from './types/session.js';

import { config } from "dotenv";

config();

const app = new Hono();

app.use(
  '*',
  useSession<SessionData>({
    secret: process.env.AUTH_SECRET!,
    duration: {
      absolute: 60 * 60 * 24,
      inactivity: 60 * 30,
    },
  })
)

async function registerStart() {
    initDB();

    Index(app);
    Login(app);
    
    addIdea(app);
    deleteIdea(app);
    search(app);
    login(app);
    logout(app);
}

await registerStart();

export default app