#!/bin/bash

# Script to start all services

echo "Starting all services..."

# Function to run service in background
run_service() {
  cd "$1"
  echo "Starting $1 on port $2..."
  npm run dev > ../"$1.log" 2>&1 &
  echo $! > ../"$1.pid"
  cd ..
}

# Run all services
run_service "config-service" 3000
run_service "user-service" 3001
run_service "vehicle-service" 3002
run_service "rental-service" 3003
run_service "contract-service" 3004
run_service "image-service" 3005
run_service "payment-service" 3006
run_service "tracking-service" 3007
run_service "inspection-service" 3008
run_service "dispute-service" 3009
run_service "review-service" 3010
run_service "notification-service" 3011
run_service "statistic-service" 3012
run_service "api-gateway" 8000
run_service "web" 5173

echo "All services started!"
echo "Check .log files for detailed output"
echo ""
echo "Accessible at:"
echo "- Frontend: http://localhost:5173"
echo "- API Gateway: http://localhost:8000"
echo "- RabbitMQ: http://localhost:15672"
