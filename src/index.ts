import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { middlewareLogResponses, middlewareMetricsInc, middlewareHandleError } from './app/middleware/index.js'
import {
    handlerReadiness, handlerMetrics, handlerReset, handlerChirpsValidate,
    handlerCreateUser, handlerCreateChirp, handlerGetChirps,
    handlerGetChirp, handlerLogin, handlerRefresh, handlerRevoke, handlerUpdateUser, handlerPolkaWebhook, handlerDeleteChirp
} from './app/api/index.js'
import postgres from 'postgres'
import { config } from './config.js'
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app = express()
const PORT = 8080

const migrationsClient = postgres(config.db.url, { max: 1 })
await migrate(drizzle(migrationsClient), config.db.migrationConfig)

app.use(middlewareLogResponses)
app.use(cors())
app.use(express.json())
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpID", handlerGetChirp);

app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", handlerChirpsValidate);
app.post("/api/users", handlerCreateUser)
app.post("/api/chirps", handlerCreateChirp)
app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);           // New refresh endpoint
app.post("/api/revoke", handlerRevoke);
app.post("/api/polka/webhooks", handlerPolkaWebhook); // Add this new route
app.put("/api/users", handlerUpdateUser)

app.delete("/api/chirps/:chirpID", handlerDeleteChirp)
app.use(middlewareHandleError)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;