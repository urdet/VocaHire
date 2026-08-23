# Docker setup

## Start the application

1. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

2. Replace the placeholder values in `.env`. Speaker diarization and Gemini
   analysis require valid `HF_TOKEN` and `GOOGLE_API_KEY` values.

3. Build and start the stack:

   ```bash
   docker compose up --build -d
   ```

   For Docker installations with standalone Compose:

   ```bash
   docker-compose up --build -d
   ```

4. Open `http://localhost:8080`. API documentation is available at
   `http://localhost:8080/api-docs/` and the backend health endpoint is
   `http://localhost:8080/health`.

Set `APP_PORT` in `.env` to expose the application on a different port.

## Services

- `frontend`: production Vite bundle served by Nginx
- `backend`: FastAPI API with FFmpeg audio conversion support
- `db`: PostgreSQL database

PostgreSQL data, uploaded audio, and downloaded Hugging Face/Torch model files
use persistent Docker volumes. The initial backend build is large because it
installs the audio and machine-learning dependencies.

On the first database start, PostgreSQL imports the schema and seed data from
`vocahire_full.sql`. Existing database volumes are preserved on later starts.

## Useful commands

```bash
docker-compose ps
docker-compose logs -f backend
docker-compose down
```

`docker-compose down` stops the stack without deleting persistent data.

## Reload the SQL dump

Reloading the dump deletes the current database schema and data. Stop the app
services, recreate the schema, run the import wrapper, then start the stack:

```bash
docker-compose stop backend frontend
docker-compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public AUTHORIZATION $POSTGRES_USER;"
docker-compose exec -T db sh /docker-entrypoint-initdb.d/10-import-vocahire.sh
docker-compose up -d
```
