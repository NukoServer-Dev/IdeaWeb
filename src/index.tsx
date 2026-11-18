import { Hono } from 'hono'
import { useSession } from '@hono/session';

import Index from './page/index.js';
import Login from "./page/login.js"
import addIdea from "./api/addIdea.js"
import deleteIdea from "./api/deleteIdea.js"
import search from "./api/search.js"
import login from "./api/login.js"
import logout from "./api/logout.js"
import CreateAccount from "./page/createAccount.js"
import createAccount from "./api/createAccount.js"

import { initDB } from './db.js';
import type { SessionData } from './types/session.js';

import { config } from "dotenv";
import { setCookie } from 'hono/cookie';

config();

const app = new Hono();

if (process.env.NODE_ENV === 'production' && (!process.env.AUTH_SECRET || Buffer.byteLength(process.env.AUTH_SECRET) < 32)) {
  throw new Error('本番環境では32バイト以上のAUTH_SECRETが必要です');
}

app.use(
  '*',
  useSession<SessionData>({
    secret: process.env.AUTH_SECRET!,
    setCookie: (c, name, value, options) => setCookie(c, name, value, { ...options, secure: process.env.NODE_ENV === 'production' }),
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
    CreateAccount(app);
    
    addIdea(app);
    deleteIdea(app);
    search(app);
    login(app);
    createAccount(app);
    logout(app);
}

await registerStart();

export default app
