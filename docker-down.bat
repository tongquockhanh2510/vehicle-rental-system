@echo off
setlocal

echo Stopping Docker Compose services...
docker compose -f docker-compose.yml -f docker-compose.app.yml down

echo Done.
