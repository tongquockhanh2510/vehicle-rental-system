# Cấu hình key và secret (local)

## 1) JWT key pair

- Tạo key pair local:
  - `user-service/private.key` (dùng để ký JWT)
  - `user-service/public.key` (dùng để verify JWT)
- Copy `public.key` sang các service verify token:
  - `vehicle-service/public.key`
  - `rental-service/public.key`
  - `image-service/public.key`

Biến môi trường:

- `user-service/.env`
  - `JWT_PRIVATE_KEY_PATH=./private.key`
  - `JWT_PUBLIC_KEY_PATH=./public.key`
- `vehicle-service/.env`
  - `JWT_PUBLIC_KEY_PATH=./public.key`
- `rental-service/.env`
  - `JWT_PUBLIC_KEY_PATH=./public.key`
- `image-service/.env`
  - `JWT_PUBLIC_KEY_PATH=./public.key`

## 2) AWS S3 cho image-service

File local: `image-service/.env`

- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `AWS_REGION=ap-southeast-2`
- `AWS_BUCKET_NAME=s3-bucket-vehicle-rental-system`
- `IMAGE_SERVICE_PORT=3007`

## 3) Lưu ý bảo mật

- Không commit file `.env` thật.
- Không commit `private.key`, `keys/private.key`, `*.pem`.
- Dùng các file mẫu đã thêm:
  - `image-service/.env.example`
  - `user-service/.env.example`
  - `vehicle-service/.env.example`
  - `rental-service/.env.example`
