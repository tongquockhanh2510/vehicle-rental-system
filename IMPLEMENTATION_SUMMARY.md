# Implementation Summary

## Nhiệm vụ 1: Image Service (Dịch vụ quản lý ảnh)

### Mô tả
Đã hoàn thành dịch vụ quản lý ảnh (image-service) sử dụng AWS S3, có 3 endpoint chính:
1. **Upload ảnh** - POST /api/images/upload
2. **Xóa ảnh** - DELETE /api/images/:imageId
3. **Lấy thông tin ảnh** - GET /api/images/:imageId

### Cấu trúc thư mục
```
image-service/
├── src/
│   ├── config/
│   │   └── awsConfig.js          # Cấu hình AWS S3
│   ├── models/
│   │   └── Image.js              # Schema MongoDB cho ảnh
│   ├── repositories/
│   │   └── ImageRepository.js    # Database operations
│   ├── services/
│   │   └── ImageService.js       # Business logic
│   ├── routes/
│   │   └── imageRoutes.js        # API endpoints
│   ├── middlewares/
│   │   ├── auth.js               # JWT authentication
│   │   └── upload.js             # Multer file upload
│   └── index.js                  # Main server
├── package.json
└── .env.example
```

### Các Endpoint của Image Service

#### 1. Upload Image
```
POST /api/images/upload
Headers: Authorization: Bearer <token>
Body: form-data
  - file: <image file> (required)
  - service_type: 'USER_VERIFICATION' | 'VEHICLE_IMAGE' | 'CONTRACT' | 'OTHER' (required)
  - reference_id: <id> (required)

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image_id": "uuid",
    "original_filename": "file.jpg",
    "file_type": "image/jpeg",
    "file_size": 1024000,
    "s3_url": "https://...",
    "service_type": "USER_VERIFICATION",
    "reference_id": "userId",
    "uploaded_by": "userId",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 2. Get Image Info
```
GET /api/images/:imageId

Response:
{
  "success": true,
  "data": { /* image metadata */ }
}
```

#### 3. Get Images by Reference
```
GET /api/images/reference/:referenceId

Response:
{
  "success": true,
  "data": [{ /* image1 */ }, { /* image2 */ }]
}
```

#### 4. Delete Image
```
DELETE /api/images/:imageId
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Image deleted successfully",
  "data": { /* image metadata */ }
}
```

#### 5. Get Presigned URL
```
GET /api/images/:imageId/presigned-url?expiresIn=3600
```

### Tính năng chính
- ✅ Upload ảnh lên AWS S3
- ✅ Lưu metadata ảnh trong MongoDB
- ✅ Xóa ảnh từ S3 và đánh dấu không hoạt động trong MongoDB
- ✅ Hỗ trợ nhiều loại ảnh (USER_VERIFICATION, VEHICLE_IMAGE, CONTRACT, OTHER)
- ✅ Xác thực JWT token
- ✅ Hỗ trợ presigned URL
- ✅ Giới hạn kích thước file (10MB)
- ✅ Tái sử dụng cho các service khác

---

## Nhiệm vụ 2: User Service - Verification Endpoints

### Mô tả
Đã hoàn thành 3 verification endpoints trong user-service:
1. **Identity Verification** - Xác minh danh tính
2. **License Verification** - Xác minh bằng lái xe
3. **Bank Verification** - Xác minh tài khoản ngân hàng

### Các Model mới

#### 1. IdentityVerification Model
```javascript
{
  user_id: ObjectId,
  id_number: String,
  id_type: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVER_LICENSE',
  id_image_front: String (S3 URL),
  id_image_back: String (S3 URL),
  full_name: String,
  date_of_birth: Date,
  gender: 'MALE' | 'FEMALE' | 'OTHER',
  nationality: String,
  address: String,
  issued_date: Date,
  expiry_date: Date,
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT',
  rejection_reason: String,
  verified_at: Date,
  verified_by: String
}
```

#### 2. LicenseVerification Model
```javascript
{
  user_id: ObjectId,
  license_number: String (unique),
  license_type: 'A' | 'B' | 'B1' | 'C' | 'D' | 'E',
  license_image_front: String (S3 URL),
  license_image_back: String (S3 URL),
  full_name: String,
  date_of_birth: Date,
  issued_date: Date,
  expiry_date: Date,
  issued_country: String,
  driving_class: String,
  restrictions: String,
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT' | 'EXPIRED',
  rejection_reason: String,
  verified_at: Date,
  verified_by: String
}
```

#### 3. BankVerification Model
```javascript
{
  user_id: ObjectId,
  bank_account_number: String (unique),
  bank_name: String,
  account_holder_name: String,
  account_type: 'SAVINGS' | 'CHECKING' | 'BUSINESS',
  bank_code: String,
  branch_name: String,
  bank_statement_image: String (S3 URL),
  id_card_image: String (S3 URL),
  verification_method: 'MANUAL' | 'AUTOMATIC',
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT',
  rejection_reason: String,
  verified_at: Date,
  verified_by: String,
  is_default: Boolean
}
```

### Các Endpoint của User Service

#### Identity Verification Endpoints

##### 1. Submit Identity Verification
```
POST /api/users/:userId/identity-verification
Headers: Authorization: Bearer <token>
Body: form-data
  - id_number: string (required)
  - id_type: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVER_LICENSE' (required)
  - full_name: string (required)
  - date_of_birth: date (optional)
  - gender: 'MALE' | 'FEMALE' | 'OTHER' (optional)
  - nationality: string (optional)
  - address: string (optional)
  - issued_date: date (optional)
  - expiry_date: date (optional)
  - id_image_front: file (required)
  - id_image_back: file (optional)

Response: 201 Created
{
  "success": true,
  "message": "Identity verification submitted successfully",
  "data": {
    "verification_id": "...",
    "user_id": "...",
    "id_number": "...",
    "id_type": "NATIONAL_ID",
    "id_image_front": "https://s3.../...",
    "id_image_back": "https://s3.../...",
    "verification_status": "PENDING",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

##### 2. Get Identity Verification
```
GET /api/users/:userId/identity-verification
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": { /* verification details */ }
}
```

#### License Verification Endpoints

##### 1. Submit License Verification
```
POST /api/users/:userId/license-verification
Headers: Authorization: Bearer <token>
Body: form-data
  - license_number: string (required)
  - license_type: 'A' | 'B' | ... (required)
  - full_name: string (required)
  - issued_date: date (required)
  - expiry_date: date (required)
  - date_of_birth: date (optional)
  - issued_country: string (optional)
  - driving_class: string (optional)
  - restrictions: string (optional)
  - license_image_front: file (required)
  - license_image_back: file (optional)

Response: 201 Created
{
  "success": true,
  "message": "License verification submitted successfully",
  "data": { /* license verification details */ }
}
```

##### 2. Get License Verification
```
GET /api/users/:userId/license-verification
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "verification_id": "...",
    "license_number": "...",
    "license_type": "B",
    "license_image_front": "https://s3.../...",
    "is_expired": false,
    "verification_status": "PENDING"
  }
}
```

#### Bank Verification Endpoints

##### 1. Submit Bank Verification
```
POST /api/users/:userId/bank-verification
Headers: Authorization: Bearer <token>
Body: form-data
  - bank_account_number: string (required)
  - bank_name: string (required)
  - account_holder_name: string (required)
  - account_type: 'SAVINGS' | 'CHECKING' | 'BUSINESS' (required)
  - bank_code: string (optional)
  - branch_name: string (optional)
  - verification_method: 'MANUAL' | 'AUTOMATIC' (optional, default: MANUAL)
  - is_default: boolean (optional)
  - bank_statement_image: file (required)
  - id_card_image: file (optional)

Response: 201 Created
{
  "success": true,
  "message": "Bank verification submitted successfully",
  "data": {
    "verification_id": "...",
    "bank_account_number": "****1234",
    "bank_name": "Vietcombank",
    "account_holder_name": "John Doe",
    "account_type": "SAVINGS",
    "is_default": false,
    "verification_status": "PENDING"
  }
}
```

##### 2. Get Bank Verification
```
GET /api/users/:userId/bank-verification
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": { /* default bank verification */ }
}
```

##### 3. Get All Bank Verifications
```
GET /api/users/:userId/bank-verifications
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    { /* bank verification 1 */ },
    { /* bank verification 2 */ }
  ]
}
```

### Cấu trúc file User Service

```
user-service/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── IdentityVerification.js      # NEW
│   │   ├── LicenseVerification.js       # NEW
│   │   └── BankVerification.js          # NEW
│   ├── repositories/
│   │   ├── UserRepository.js
│   │   ├── IdentityVerificationRepository.js    # NEW
│   │   ├── LicenseVerificationRepository.js     # NEW
│   │   └── BankVerificationRepository.js        # NEW
│   ├── services/
│   │   ├── UserService.js
│   │   ├── IdentityVerificationService.js       # NEW
│   │   ├── LicenseVerificationService.js        # NEW
│   │   └── BankVerificationService.js           # NEW
│   ├── routes/
│   │   └── userRoutes.js                # UPDATED
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── upload.js                    # NEW
│   └── index.js
├── package.json                          # UPDATED (added axios, multer)
└── .env.example                          # NEW
```

### Tính năng Implementation

#### Identity Verification Service
- ✅ Submit identity verification với hình ảnh
- ✅ Xác thực thông tin danh tính
- ✅ Lưu đường dẫn S3 trong MongoDB
- ✅ Cập nhật thông tin user sau khi approved

#### License Verification Service
- ✅ Submit bằng lái xe với hình ảnh
- ✅ Kiểm tra số bằng lái trùng lặp
- ✅ Kiểm tra hạn bằng lái
- ✅ Tự động cập nhật user info

#### Bank Verification Service
- ✅ Submit tài khoản ngân hàng
- ✅ Kiểm tra số tài khoản trùng lặp
- ✅ Hỗ trợ nhiều tài khoản ngân hàng
- ✅ Đặt tài khoản mặc định
- ✅ Xác thực tài khoản

### Security Features
- ✅ JWT Token Authentication
- ✅ User authorization (userId matching)
- ✅ File type validation
- ✅ File size limit (10MB)
- ✅ Rate limiting ready

---

## Environment Variables Required

### Image Service (.env)
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=vehicle-rental-images
IMAGE_SERVICE_PORT=3007
MONGODB_URI=mongodb://...
JWT_SECRET=...
SERVICE_TOKEN=...
```

### User Service (.env)
```
USER_SERVICE_PORT=3001
MONGODB_URI=mongodb://...
JWT_SECRET=...
IMAGE_SERVICE_URL=http://localhost:3007
SERVICE_TOKEN=...
```

---

## Installation & Running

### Image Service
```bash
cd image-service
npm install
# Set up .env file with AWS credentials
npm run dev
```

### User Service
```bash
cd user-service
npm install
# Set up .env file
npm run dev
```

---

## API Testing

### Test with cURL or Postman

#### Upload Image Example
```bash
curl -X POST http://localhost:3007/api/images/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "service_type=USER_VERIFICATION" \
  -F "reference_id=user123"
```

#### Submit Identity Verification
```bash
curl -X POST http://localhost:3001/api/users/user123/identity-verification \
  -H "Authorization: Bearer <token>" \
  -F "id_number=123456789" \
  -F "id_type=NATIONAL_ID" \
  -F "full_name=John Doe" \
  -F "id_image_front=@front.jpg" \
  -F "id_image_back=@back.jpg"
```

---

## Notes

1. **Reusability**: Image Service được thiết kế để có thể tái sử dụng bởi các service khác (vehicle-service, contract-service, etc.)

2. **Database**: Tất cả metadata được lưu trong MongoDB, chỉ lưu đường dẫn S3 (không lưu tệp nhị phân)

3. **AWS S3**: Cần cấu hình AWS credentials để upload/delete ảnh

4. **Service Communication**: User Service gọi Image Service để upload/delete ảnh

5. **Future Enhancement**:
   - Implement image compression
   - Add watermark support
   - Batch upload functionality
   - Image validation (OCR for ID, license)
   - Webhook notifications for verification status changes
