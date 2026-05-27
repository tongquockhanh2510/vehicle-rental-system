Nhiệm vụ 1: hãy đọc kỹ các thư mục service có trong project thật kĩ, để hiểu về hệ thống space-based và event-driven. Đọc kỹ để biết từng enpoint của từng service yêu cầu thuộc tính như thế nào để truyền cho phù hợp

Nhiệm vụ 2: xây dựng trang web
Trong thư mục web hãy xây dựng giao diện cho hệ thông cho thuê xe
Yêu cầu: dùng react vite tailwind, giao diện đơn giản đẹp, sử dụng các icon

enpoint được lấy từ api gateway có dạng: http://localhost:8000

Dựa vào các service có sẵn hãy hoàn thiện trang web cho tôi

Bao gồm các enpoint sau: 
api-gateway: dùng để điều hướng thông qua http://localhost:8000
user-service: 
    POST /api/users/register dùng để đăng kí tài khoản. body gồm: email, first_name, last_name, phone, password
    POST /api/users/login dùng để đăng nhập. body gồm: email, password trả về dạng {"token": "..."}
    GET /api/users/profile lấy thông tin tài khoản. body: không có
    PUT /api/users/verify-personal-information xác thực thông tin cá nhân: body gồm: id_number, id_image_front, id_image_back (id_image_front, id_image_back là ảnh)

vehicle-service: 
    POST /api/vehicles dùng để thêm xe cho thuê.
    GET /api/vehicles/:vehicleId lấy thông tin xe
    PUT /api/vehicles/:vehicleId cập nhật thông tin xe
    GET /api/vehicles/owner/:ownerId/list lấy thông tin xe theo người sở hữu
    GET /api/vehicles/available/list (lưu ý endpoint này có phân trang, đọc trong vehicle-service để biết rõ)
    DELETE /api/vehicles/:vehicleId xóa xe

rental-service: 
    POST /api/rentals/request gửi yêu cầu cho thuê xe cho chủ xe
    GET /api/rentals/:rentalId lấy thông tin của yêu cầu
    PUT /api/rentals/:rentalId/confirm chấp nhận yêu cầu từ chủ xe
    PUT /api/rentals/:rentalId/reject từ chối yêu cầu từ chủ xe
    PUT /api/rentals/:rentalId/cancel hủy yêu cầu từ người gửi yêu cầu (người thuê xe)
    GET /api/rentals/renter/my-rentals danh sách yêu cầu (của người cho thuê)
    GET /api/rentals/owner/my-rentals danh sách yêu cầu (của người thuê)

contract-service:
    GET /api/contracts/:contractId lấy thông tin hợp đồng
    PUT /api/contracts/:contractId/pickup người thuê nhận xe
    PUT /api/contracts/:contractId/return người thuê trả xe
    PUT /api/contracts/:contractId/cancel người thuê hoặc người cho thuê hủy hợp đồng
    GET /api/contracts/renter/my-contracts danh sách hợp động thuê xe
    GET /api/contracts/owner/my-contracts danh sách hợp động cho thuê xe

dispute-service: 
    POST /api/disputes yêu cầu bồi thường từ người cho thuê
    GET /api/disputes/:disputeId lấy danh sách yêu cầu bồi thường
    PUT /api/disputes/:disputeId/approve admin chấp nhận
    PUT /api/disputes/:disputeId/reject admin từ chối
    GET /api/disputes/pending/list danh sách chờ duyệt
    GET /api/disputes/approved/list danh sách đã chấp nhận
    GET /api/disputes/rejected/list danh sách đã từ chối

notification-service: 
    GET /api/notifications/my-notifications lấy danh sách thông báo của chính mình

image-service: để các service khác gọi để tải ảnh lện s3 aws thôi, không có endpoint cho người dùng

các endpoint của các service tôi đề cập phía bên trên có thể không chính xác, đọc lại trong từng service tương ứng để đảm bảo. Các service không được đề cập thì tạm thời bỏ qua

Mô tả nghiệp vụ chính
(1) Người dùng đăng nhập vào tài khoản của mình
(2) Người dùng thuê xe, gửi yêu cầu thuê xe
(3) Người cho thuê xe xác nhận hoặc từ chối
(4) Sau khi người cho thuê xe xác nhận thì hệ thống tự động tạo hợp đồng (event-driven)
(5) Người thuê xe nhập xe
(6) Người thuê xe trả xe
(7) Nếu có hư hỏng thì người cho thuê xe gửi yêu cầu bồi thường
(8) adim xác nhận hoặc từ chối

Hãy xây dựng trạng web theo các yêu cầu trên: Yếu tố quan trong là nghiệp vụ phải hoạt động được