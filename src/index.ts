import express from 'express'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import { middlewareLogResponses, middlewareMetricsInc } from './app/middleware/index.js'
import { config } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app = express()
const PORT = 8080


app.use(middlewareLogResponses)

// —— 1) Readiness endpoint via GET ——
app.get("/api/healthz", (req, res) => {
    res
        .set("Content-Type", "text/plain; charset=utf-8")
        .send("OK");
});

app.get("/api/metrics", (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8")
        .send(`Hits: ${config.fileserverHits}`);
})

app.get("/api/reset", (req, res) => {
    config.fileserverHits = 0;
    res.set("Content-Type", "text/plain;charset=utf-8")
        .send("Hits reset to 0")
})

app.use(
    "/app",
    middlewareMetricsInc,
    express.static("./src/app")
);


app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})
export default app;