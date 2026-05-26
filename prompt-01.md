Xây dựng hệ thống cho thuê xe giữa người cho thuê xe, người thuê xe



Các actor có trong hệ thống: người cho thuê xe, người thuê xe và admin



Các chức năng chính trong hệ thống: 
- Đăng tải yêu cầu cho thuê xe (người cho thuê): người cho thuê xe cung cấp các thông tin về xe như loại xe, giá thuê theo ngày, thời gian thuê xe (từ ngày - đến ngày), hình ảnh xe, yêu cầu tiền đặt cọc, yêu cầu phạm vi thuê cho thuê xe (ví dụ chỉ cho xe di chuyển ở Việt Nam không cho ra khỏi biên giới),...

\- Thuê xe (người thuê - người cho thuê): người thuê xe gửi các yêu cầu bao gồm thời gian thuê (từ ngày - đến ngày), địa điểm giao xe, địa điểm nhận lại xe. Khi ngươi cho thuê xe xác nhận thì thành lập hợp động (có các thông tin giữa người cho thuê xe và người thuê xe).

\- Nhận xe (người thuê - người cho thuê): hệ thống yêu cầu người thuê xe khi nhận xe phải cung cấp hình anh xe khi nhận, ghi nhận lại chi tiết hư hỏng có từ trước (nếu có). Và trả tiền (bao gồm tiền đặt cọc và tiền thuê xe)

\- Theo dõi xe (người thuê - người cho thuê): người cho thuê xe có thể theo dõi vị trí của xe, lịch sử di chuyển của xe, cảnh báo nếu xe di chuyển qua ranh giới cho phép

\- Trả xe (người thuê - người cho thuê): hệ thống yêu cầu người thuê xe khi nhận xe phải cung cấp hình anh xe khi trả xe, khi người cho thuê xe xác nhận xe đúng nguyên hiện trạng lúc mới cho thuê thì người thuê cho xe trả tiền cọc lại. Nếu người cho thuê xác nhận xe không đúng như hiện trạng ban đầu thì người cho thuê gửi yêu cầu bồi thường đến admin bao gồm hình ảnh trước và sau khi cho thuê, mô tả chi tiết, chi phí sửa chửa dự kiến, admin sẽ phân tích giá trị hư hại và yêu cầu bên thuê xe phải bồi thường. Số tiền bồi thường sẽ được trừ vào phần tiền đặt cọc, nếu vượt quá số tiền đặt cọc thì yêu cầu người thuê xe trả thêm

\- Đánh giá (người thuê - người cho thuê): người thuê và người cho thuê có thể đánh giá lẫn nhau sau khi cho thuê xe.

\- Thống kê (admin): thống kê danh thu, lượt thuê xe...



Một số thông tin khác về hệ thống: hệ thống sẽ nhận 4% số tiền từ các giao dịch thuê xe chi phí này do người cho thuê xe trích ra để có thể đăng bài cho thuê xe



Xây dựng cho tôi hệ thống với yêu cầu như trên sử dụng 3 kiến trúc: Service-Based Architecture, Event-Driven Architecture, Layered Architecture



Công nghệ sử dụng: ngôn ngữ javascprit, express, Event-Driven dùng RabbitMQ để giao tiếp, cơ sở dữ liệu dùng MongoDB, dùng Redis để tăng tốc độ đọc. dùng API Gateway



Chia thành các module nhỏ bên dưới (mỗi module là 1 thư mục). Ngoài ra thêm 1 thư mục web bên trong là giao diện của hệ thống sử dụng react vite (javascript) và tailwind, yêu cầu giao diện đơn giản không quá cầu kì, dễ nhìn.


Các services gồm có:

\- user-service: Quản lý tài khoản trong hệ thống. Đăng ký, đăng nhập. Quản lý thông tin người thuê xe. Quản lý thông tin người cho thuê xe. Quản lý admin. Phân quyền theo role: USER, ADMIN

\- vehicle-service: Quản lý xe và bài đăng cho thuê xe. Người cho thuê đăng xe. Cập nhật thông tin xe. Thêm hình ảnh xe. Cấu hình giá thuê theo ngày. Cấu hình phần trăm đặt cọc. Cấu hình phạm vi được phép di chuyển

\- rental-service: Xử lý nghiệp vụ thuê xe chính. Người thuê gửi yêu cầu thuê xe. Người cho thuê xác nhận hoặc từ chối. Kiểm tra xe có còn trống trong thời gian thuê không. Quản lý trạng thái thuê xe

\- contract-service: Quản lý hợp đồng thuê xe. Tạo hợp đồng sau khi người cho thuê xác nhận. Lưu thông tin người thuê, người cho thuê, xe, thời gian thuê. Lưu điều khoản thuê xe. Lưu tiền đặt cọc, tiền thuê, phí hệ thống 4%. Xử lý yêu cầu hủy từ người cho thuê xe (hoàn trả lại tiền đặt cọc kem theo 20% giá trị hợp đồng). Xử lý yêu cầu hủy từ người thuê xe ( hoàn trả lại tiền đặt cọc đã trừ 20% giá trị hợp đồng). 

\- tracking-service: Lưu vị trí hiện tại của xe. Lưu lịch sử di chuyển. Kiểm tra xe có vượt phạm vi cho phép không. Gửi cảnh báo nếu xe ra khỏi khu vực được phép (có sử dụng Event-Driven Architecture)

\- inspection-service: Quản lý việc kiểm tra xe lúc nhận và trả xe. Người thuê upload hình ảnh xe khi nhận. Ghi nhận hư hỏng có sẵn. Người thuê upload hình ảnh xe khi trả. So sánh hiện trạng xe trước và sau khi thuê

\- payment-service: Quản lý thanh toán. Thanh toán tiền đặt cọc. Thanh toán phần tiền còn lại. Tính phí hệ thống 4%. Hoàn tiền đặt cọc nếu không có vi phạm trừ tiền bồi thường nếu có hư hỏng

\- dispute-service: Xử lý tranh chấp và bồi thường. Người cho thuê gửi yêu cầu bồi thường. Admin xem hình ảnh trước/sau. Admin xác định mức bồi thường. Người thuê thanh toán bồi thường. Cập nhật kết quả xử lý tranh chấp

\- review-service: Quản lý đánh giá sau giao dịch. Người thuê đánh giá người cho thuê. Người cho thuê đánh giá người thuê. Chấm điểm sao. Viết nhận xét

\- statistic-service: Dành cho admin. Thống kê doanh thu. Thống kê số lượt thuê xe. Thống kê xe được thuê nhiều. Thống kê doanh thu phí hệ thống 4%. Thống kê tranh chấp, bồi thường

\- notification-service: Quản lý thông báo. Thông báo có yêu cầu thuê mới. Thông báo hợp đồng được tạo. Thông báo đến lúc nhận xe. Thông báo xe vượt phạm vi. Thông báo yêu cầu bồi thường. Thông báo thanh toán thành công (có sử dụng Event-Driven Architecture)
\- api-gateway: Vai trò: route request, auth JWT, rate limiting, forward request đến service, central entry point
\- config-service: Chứa: DB config, JWT config, RabbitMQ config, môi trường dev/prod

Lưu ý: tôi đã tạo sẵn file docker-compose.yml và đã cài đặt và đang sử dụng các công cụ trong đó. DB sử dụng MongoDB có tên cơ sở dữ liệu là redis_vehicle_db. Tôi đã tạo sẵn các thư mục service. Sử dụng pnpm để sử dụng lại thư viện chung

Riêng cấu trúc csdl bạn hãy tự thiết kế cho phù hợp với các yêu cầu sau: tên collection phải có s ở cuối và ngăn cách bằng _, tên các thuộc tính ngăn cách bằng _


Với những mô tả và yêu cầu phía bên trên hãy hoàng thành project cho tôi

