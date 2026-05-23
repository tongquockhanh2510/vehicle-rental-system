@echo off

echo Starting all services...

start cmd /k "cd /d config-service && pnpm run dev"
start cmd /k "cd /d user-service && pnpm run dev"
start cmd /k "cd /d vehicle-service && pnpm run dev"
start cmd /k "cd /d rental-service && pnpm run dev"
start cmd /k "cd /d contract-service && pnpm run dev"
start cmd /k "cd /d payment-service && pnpm run dev"
start cmd /k "cd /d tracking-service && pnpm run dev"
start cmd /k "cd /d inspection-service && pnpm run dev"
start cmd /k "cd /d dispute-service && pnpm run dev"
start cmd /k "cd /d review-service && pnpm run dev"
start cmd /k "cd /d notification-service && pnpm run dev"
start cmd /k "cd /d statistic-service && pnpm run dev"
start cmd /k "cd /d api-gateway && pnpm run dev"
start cmd /k "cd /d web && pnpm run dev"

echo.
echo All services started!
echo Frontend: http://localhost:5173
echo API Gateway: http://localhost:8000

pause