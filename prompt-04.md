Hãy hoàn thành các chức năng trong vehicle-service
Trong file .env của vehicle-service có biến IMAGE_SERVICE_URL liên kết với image-service để lưu trữ ảnh. image-service có 2 endpoint là /api/images/upload và /api/images/delete

Hãy hoàn thiện tất cả chức năng trong vehicle-service, cố định model Vehicle.js. Các enpoint trả vế danh sách thì phải dưới dạng phân trang (enpoint phải có thêm 3 params là page, limit, sort)