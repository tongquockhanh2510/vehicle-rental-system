#!/bin/bash

# Script to stop all services

echo "Stopping all services..."

services=(
  "config-service"
  "user-service"
  "vehicle-service"
  "rental-service"
  "contract-service"
  "payment-service"
  "tracking-service"
  "inspection-service"
  "dispute-service"
  "review-service"
  "notification-service"
  "statistic-service"
  "api-gateway"
  "web"
)

for service in "${services[@]}"
do
  if [ -f "$service.pid" ]; then
    kill $(cat "$service.pid")
    rm "$service.pid"
    echo "Stopped $service"
  fi
done

echo "All services stopped!"
