# Cấu hình JWT key (local)

## 1) Vị trí key bắt buộc

### User service (ký JWT)

```text
user-service/
  keys/
    private.key
    public.key
```

### Các service verify JWT

```text
api-gateway/keys/public.key
contract-service/keys/public.key
dispute-service/keys/public.key
image-service/keys/public.key
notification-service/keys/public.key
payment-service/keys/public.key
rental-service/keys/public.key
review-service/keys/public.key
statistic-service/keys/public.key
tracking-service/keys/public.key
vehicle-service/keys/public.key
```

## 2) Biến môi trường chuẩn

### `user-service/.env`

```env
JWT_PUBLIC_KEY_PATH=./keys/public.key
JWT_PRIVATE_KEY_PATH=./keys/private.key
JWT_ALGORITHM=RS256
JWT_EXPIRES_IN=7d
```

### Các service verify (gateway, vehicle, rental, contract, payment, ...)

```env
JWT_PUBLIC_KEY_PATH=./keys/public.key
JWT_ALGORITHM=RS256
```

## 3) Format key hợp lệ

### Private key

```text
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

### Public key

```text
-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----
```

Không thêm dấu nháy quanh key, không đổi thành một dòng duy nhất.

## 4) Docker (nếu chạy container)

Hiện `docker-compose.yml` trong repo chỉ chạy hạ tầng (MongoDB, RabbitMQ, Redis).
Nếu sau này chạy service bằng container thì cần mount/copy thư mục `keys` vào container:

```yaml
volumes:
  - ./user-service/keys:/app/keys
```

hoặc:

```dockerfile
COPY keys ./keys
```

## 5) Bảo mật

- Không commit `.env` thật.
- Không commit `private.key`, `keys/private.key`, `*.pem`.
- Chỉ commit `.env.example`.
