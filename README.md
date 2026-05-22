# Hệ thống Cho Thuê Xe

Hệ thống cho thuê xe giữa người cho thuê và người thuê với kiến trúc microservices.

## Kiến trúc Hệ thống

Hệ thống sử dụng ba kiến trúc chính:
1. **Service-Based Architecture**: Mỗi dịch vụ là độc lập với database riêng
2. **Event-Driven Architecture**: Sử dụng RabbitMQ để giao tiếp giữa các services
3. **Layered Architecture**: Mỗi service có cấu trúc Route → Controller → Service → Repository

## Các Services

### Core Services
- **user-service** (Port 3001): Quản lý tài khoản người dùng
- **vehicle-service** (Port 3002): Quản lý xe và bài đăng
- **rental-service** (Port 3003): Xử lý yêu cầu thuê xe
- **contract-service** (Port 3004): Quản lý hợp đồng

### Supporting Services
- **payment-service** (Port 3005): Xử lý thanh toán
- **tracking-service** (Port 3006): Theo dõi vị trí xe (GPS)
- **inspection-service** (Port 3007): Kiểm tra xe lúc nhận/trả
- **dispute-service** (Port 3008): Xử lý tranh chấp
- **review-service** (Port 3009): Quản lý đánh giá
- **notification-service** (Port 3010): Gửi thông báo
- **statistic-service** (Port 3011): Thống kê doanh thu

### Infrastructure Services
- **api-gateway** (Port 8000): Điểm vào chính cho tất cả requests
- **config-service** (Port 3000): Quản lý cấu hình

### Frontend
- **web** (Port 5173): Giao diện React + Vite + Tailwind

## Công nghệ Sử dụng

- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Message Queue**: RabbitMQ
- **Cache**: Redis
- **Frontend**: React + Vite + Tailwind CSS
- **Package Manager**: pnpm

## Yêu cầu Hệ thống

- Docker & Docker Compose
- Node.js 16+
- pnpm

## Setup & Chạy

### 1. Khởi động Infrastructure (MongoDB, RabbitMQ, Redis)

```bash
docker-compose up -d
```

Xác nhận các services đang chạy:
```bash
docker-compose ps
```

### 2. Cài đặt Dependencies cho mỗi Service

```bash
# Config Service
cd config-service && npm install && cd ..

# User Service
cd user-service && npm install && cd ..

# Vehicle Service
cd vehicle-service && npm install && cd ..

# Rental Service
cd rental-service && npm install && cd ..

# Contract Service
cd contract-service && npm install && cd ..

# Payment Service
cd payment-service && npm install && cd ..

# Tracking Service
cd tracking-service && npm install && cd ..

# Inspection Service
cd inspection-service && npm install && cd ..

# Dispute Service
cd dispute-service && npm install && cd ..

# Review Service
cd review-service && npm install && cd ..

# Notification Service
cd notification-service && npm install && cd ..

# Statistic Service
cd statistic-service && npm install && cd ..

# API Gateway
cd api-gateway && npm install && cd ..

# Web Frontend
cd web && npm install && cd ..
```

### 3. Chạy các Services

Mở các terminal khác nhau và chạy từng service:

```bash
# Terminal 1: Config Service
cd config-service && npm run dev

# Terminal 2: User Service
cd user-service && npm run dev

# Terminal 3: Vehicle Service
cd vehicle-service && npm run dev

# Terminal 4: Rental Service
cd rental-service && npm run dev

# Terminal 5: Contract Service
cd contract-service && npm run dev

# Terminal 6: Payment Service
cd payment-service && npm run dev

# Terminal 7: Tracking Service
cd tracking-service && npm run dev

# Terminal 8: Inspection Service
cd inspection-service && npm run dev

# Terminal 9: Dispute Service
cd dispute-service && npm run dev

# Terminal 10: Review Service
cd review-service && npm run dev

# Terminal 11: Notification Service
cd notification-service && npm run dev

# Terminal 12: Statistic Service
cd statistic-service && npm run dev

# Terminal 13: API Gateway
cd api-gateway && npm run dev

# Terminal 14: Web Frontend
cd web && npm run dev
```

### 4. Truy cập Ứng dụng

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8000
- **RabbitMQ Management**: http://localhost:15672 (admin/password)

## Quy ước Cơ sở Dữ liệu

- **Collections**: Tên bảng kết thúc bằng `s` (VD: users, vehicles, rentals)
- **Fields**: Ngăn cách bằng `_` (VD: user_id, first_name, created_at)

## API Documentation

### Authentication
```
POST /api/users/register
POST /api/users/login
GET /api/users/profile (requires auth)
```

### Vehicles
```
GET /api/vehicles/available/list
GET /api/vehicles/:vehicleId
POST /api/vehicles (requires auth)
PUT /api/vehicles/:vehicleId (requires auth)
```

### Rentals
```
POST /api/rentals/request (requires auth)
GET /api/rentals/:rentalId
PUT /api/rentals/:rentalId/confirm
PUT /api/rentals/:rentalId/reject
GET /api/rentals/renter/my-rentals (requires auth)
GET /api/rentals/owner/my-rentals (requires auth)
```

### Payments
```
POST /api/payments
PUT /api/payments/:paymentId/process
GET /api/payments/renter/my-payments (requires auth)
```

### Disputes
```
POST /api/disputes
GET /api/disputes/:disputeId
PUT /api/disputes/:disputeId/approve (admin only)
```

### Statistics
```
GET /api/statistics/dashboard (admin only)
GET /api/statistics/revenue-by-month (admin only)
GET /api/statistics/top-vehicles (admin only)
```

## Công Việc Tiếp Theo

1. Thêm các page khác (Profile, Rentals, Payments, etc.)
2. Thêm file upload untuk images
3. Thêm real-time notifications với WebSocket
4. Thêm unit tests và integration tests
5. Thêm authentication token refresh
6. Thêm error handling toàn diện
7. Thêm validation bên client

## Notes

- Tất cả các services kết nối tới cùng một MongoDB database
- RabbitMQ được sử dụng cho event-driven communication
- Redis được sử dụng cho caching
- API Gateway xử lý authentication, rate limiting, và routing
- Mỗi service có file .env riêng
