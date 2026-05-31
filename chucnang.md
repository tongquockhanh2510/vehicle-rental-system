You are working on an existing Vehicle Rental System microservice project.

Current architecture includes:

* api-gateway
* user-service
* vehicle-service
* rental-service
* contract-service
* payment-service
* review-service
* notification-service
* statistic-service
* inspection-service
* image-service
* RabbitMQ or HTTP communication between services
* Frontend: React + Vite

Your task is to implement AI-related features in a clean microservice architecture without breaking existing features.

==================================================
PART 1: ai-service - Dynamic Vehicle Pricing
============================================

Create a new service named `ai-service`.

Purpose:
Provide smart rental price suggestions for vehicles based on market demand, time, vehicle type, historical rental data, and statistics.

Required features:

1. Create API endpoint:

POST /api/ai/pricing/suggest

Request body example:
{
"vehicleId": "...",
"vehicleType": "7_SEATS",
"location": "Ea Súp, Đắk Lắk",
"basePrice": 800000,
"startDate": "2026-06-05",
"endDate": "2026-06-07",
"smartPricingEnabled": true
}

2. The service must calculate suggested prices using rule-based ML-like logic first.
   Do not require real model training yet, but design the code so it can be replaced by a real Regression model later.

Pricing factors:

* Weekday vs weekend
* Holiday or Tet season
* High-demand area
* Vehicle type: 4 seats, 7 seats, pickup, luxury
* Historical average booking price from statistic-service
* Rental frequency of similar vehicles
* Supply and demand in the same area

3. The response should be:

{
"vehicleId": "...",
"basePrice": 800000,
"suggestedPrice": 1100000,
"normalDayPrice": 800000,
"weekendPrice": 1100000,
"confidence": 0.82,
"reason": "Weekend demand is high in Ea Súp and similar 7-seat cars are frequently rented at around 1,000,000 - 1,200,000 VND/day."
}

4. Integrate with vehicle-service:

* When an owner creates a vehicle or enables Smart Pricing, vehicle-service should call ai-service.
* Store suggested price in vehicle database.
* Add fields:

  * smartPricingEnabled
  * suggestedPrice
  * suggestedPriceReason
  * aiPricingUpdatedAt

5. Integrate with statistic-service:

* ai-service should call statistic-service to get:

  * average price by location and vehicle type
  * booking count
  * cancellation rate
  * peak demand date ranges

6. Add RabbitMQ event support if the project already uses RabbitMQ:

* vehicle.smart_pricing.requested
* ai.smart_pricing.generated

7. Add error handling:

* If ai-service fails, vehicle-service must continue using base price.
* Log the error clearly.
* Do not crash the vehicle creation flow.

==================================================
PART 2: ai-agent-service - Natural Language Booking Assistant
=============================================================

Create a new service named `ai-agent-service`.

Purpose:
Allow users to search and book vehicles through natural language chat.

Example user message:
"Find me a spacious 7-seat car for my family in Ea Súp from Friday morning to Sunday afternoon this week, budget under 1.5 million."

Required features:

1. Create API endpoint:

POST /api/ai-agent/chat

Request:
{
"userId": "...",
"message": "Find me a spacious 7-seat car for my family in Ea Súp from Friday morning to Sunday afternoon this week, budget under 1.5 million."
}

2. Implement Intent & Slot Filling.

Extract:
{
"intent": "SEARCH_VEHICLE",
"vehicleType": "7_SEATS",
"location": "Ea Súp, Đắk Lắk",
"startDate": "2026-06-05T08:00:00",
"endDate": "2026-06-07T17:00:00",
"maxPrice": 1500000,
"passengerPurpose": "family trip"
}

3. The agent must understand Vietnamese and English.

Vietnamese example:
"Kiếm giùm anh chiếc xe 7 chỗ rộng rãi đi gia đình ở Ea Súp từ sáng thứ 6 đến chiều Chủ Nhật tuần này, giá tầm 1 triệu rưỡi đổ lại."

4. Implement date normalization:

* "this Friday"
* "Sunday afternoon"
* "cuối tuần này"
* "sáng thứ 6"
* "chiều Chủ Nhật tuần này"

Use server timezone Asia/Ho_Chi_Minh.

5. After extracting slots, call vehicle-service:

GET /api/vehicles/search?type=7_SEATS&location=Ea%20Súp&startDate=...&endDate=...&maxPrice=1500000

6. Decision logic:

* If vehicles are found:
  Return the best 2-3 vehicles based on:

  * price
  * rating
  * trust score
  * availability
  * distance/location
* If no vehicles are found:
  Suggest alternatives:

  * same location but higher budget
  * different vehicle type
  * nearby location
  * different date range

7. Response example:

{
"message": "I found 3 suitable 7-seat cars in Ea Súp for your family trip.",
"intent": "SEARCH_VEHICLE",
"slots": {...},
"vehicles": [
{
"id": "...",
"name": "Toyota Innova 2022",
"pricePerDay": 1200000,
"rating": 4.8,
"trustScore": 92,
"imageUrl": "...",
"bookingUrl": "/vehicles/.../booking"
}
],
"actions": [
{
"type": "BOOK_NOW",
"label": "Confirm booking",
"vehicleId": "..."
}
]
}

8. Frontend:
   Create an AI Booking Assistant chat UI.
   Location:

* Add button in vehicle search page
* Add route: /ai-assistant
* Chat interface should show:

  * user messages
  * AI messages
  * vehicle cards
  * Confirm Booking button

9. Do not directly create rental booking without user confirmation.
   The agent should only suggest vehicles first.
   When user clicks Confirm Booking, call existing rental-service booking API.

==================================================
PART 3: AI Review Summarizer
============================

Add AI review summary feature for vehicle detail page.

Required features:

1. In ai-service, create endpoint:

POST /api/ai/reviews/summarize

Request:
{
"vehicleId": "..."
}

2. ai-service calls review-service to fetch all reviews of that vehicle.

3. Generate summary:

* Pros
* Cons
* Common complaints
* Owner behavior
* Vehicle condition
* Short final recommendation

Response example:
{
"vehicleId": "...",
"summary": {
"pros": [
"The car runs smoothly.",
"Fuel consumption is low.",
"The owner delivers the car on time."
],
"cons": [
"The third-row air conditioner is slightly weak.",
"It takes around 10 minutes to cool the full cabin."
],
"recommendation": "Good choice for family trips if you do not require very strong rear air conditioning."
},
"updatedAt": "2026-05-31T10:00:00Z"
}

4. Cache summary:

* Store AI summary in vehicle-service or review-service.
* Re-generate only when new reviews are added or after 24 hours.

5. Frontend:
   On vehicle detail page, show:

AI Summary
Pros
Cons
Recommendation

Use clean UI with robot icon.

==================================================
PART 4: AI Trust Score
======================

Implement AI Trust Score for vehicle and owner.

Required features:

1. In ai-service, create endpoint:

POST /api/ai/trust-score/calculate

Request:
{
"vehicleId": "...",
"ownerId": "..."
}

2. Collect data from:

* review-service:

  * review rating
  * review text sentiment
  * review count
* rental-service:

  * completed trips
  * cancelled trips
  * late handovers
* inspection-service:

  * maintenance frequency
  * damage reports
  * inspection status
* user-service:

  * owner verification status

3. Calculate score from 1 to 100.

Suggested formula:

* Review sentiment: 35%
* Average rating: 20%
* Cancellation rate: 15%
* Maintenance / inspection condition: 15%
* Completed rental history: 10%
* Owner verification: 5%

4. Response example:
   {
   "vehicleId": "...",
   "ownerId": "...",
   "trustScore": 92,
   "level": "Excellent",
   "explanation": "High review sentiment, low cancellation rate, verified owner, and stable inspection history."
   }

5. Add database fields:
   Vehicle:

* trustScore
* trustScoreLevel
* trustScoreExplanation
* trustScoreUpdatedAt

Owner/User:

* ownerTrustScore
* ownerTrustScoreUpdatedAt

6. Update trust score when:

* new review is created
* rental is completed
* rental is cancelled
* inspection result is updated

Use RabbitMQ events if available:

* review.created
* rental.completed
* rental.cancelled
* inspection.updated
* ai.trust_score.updated

7. Frontend:
   Show trust score on:

* vehicle card
* vehicle detail page
* booking confirmation page

Example UI:
Trust Score: 92/100 - Excellent
Reason: Verified owner, high satisfaction, low cancellation rate.

==================================================
PART 5: General Technical Requirements
======================================

1. Follow the existing project structure and coding style.

2. Do not remove or break existing APIs.

3. Add environment variables:
   AI_SERVICE_URL=http://localhost:5010
   AI_AGENT_SERVICE_URL=http://localhost:5011
   STATISTIC_SERVICE_URL=[http://localhost:500x](http://localhost:500x)
   REVIEW_SERVICE_URL=[http://localhost:500x](http://localhost:500x)
   VEHICLE_SERVICE_URL=[http://localhost:500x](http://localhost:500x)
   RENTAL_SERVICE_URL=[http://localhost:500x](http://localhost:500x)
   INSPECTION_SERVICE_URL=[http://localhost:500x](http://localhost:500x)

4. Add Docker support:

* Dockerfile for ai-service
* Dockerfile for ai-agent-service
* Update docker-compose.yml if the project uses Docker Compose

5. Add API Gateway routing:

* /api/ai/*
* /api/ai-agent/*

6. Add validation:

* missing vehicleId
* invalid date range
* invalid max price
* empty message
* missing userId

7. Add fallback behavior:

* If LLM API is not configured, use local rule-based logic.
* Do not require OpenAI API to run the basic version.
* Keep AI logic inside separate utility files:

  * pricingEngine.js / pricingEngine.ts
  * intentExtractor.js / intentExtractor.ts
  * reviewSummarizer.js / reviewSummarizer.ts
  * trustScoreEngine.js / trustScoreEngine.ts

8. Add tests:

* smart pricing calculation
* Vietnamese intent extraction
* English intent extraction
* review summary with sample reviews
* trust score calculation
* no vehicle found fallback

9. Add README documentation:

* how to run ai-service
* how to run ai-agent-service
* API examples
* environment variables
* RabbitMQ events
* frontend usage

==================================================
Important
=========

Implement incrementally in this order:

Step 1:
Create ai-service with smart pricing, review summary, and trust score rule-based logic.

Step 2:
Integrate ai-service with vehicle-service, review-service, statistic-service, rental-service, and inspection-service.

Step 3:
Create ai-agent-service with natural language vehicle search.

Step 4:
Integrate ai-agent-service with api-gateway and frontend chat UI.

Step 5:
Add frontend display for:

* Smart price suggestion
* AI review summary
* Trust score
* AI booking assistant

Step 6:
Add tests and documentation.

Do not rewrite the whole system.
Only add new services and modify existing services where necessary.
Keep all existing features working.
