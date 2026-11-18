import app from "./index.js";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";

config();

const port = Number(process.env.PORT) ?? 3000;

app.use(
    "/assets/*",
    serveStatic({
        root: "./dist/client",
    })
);

serve({
    fetch: app.fetch,
    port: port,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});