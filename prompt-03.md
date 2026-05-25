Chỉnh sửa trong user-service
Xóa các file BankVerification.js, IdentityVerification.js, LicenseVerification.js, BankVerificationRepository.js, IdentityVerificationRepository.js, LicenseVerificationRepository.js

Sửa lại các endpoint:
:userId/identity-verification
:userId/license-verification
:userId/bank-verification
các endpoint này nều có nghiệp vụ nằm trong UserRepository.js, các endpoint này đều có tác dụng cập nhật thông tin của thông tin của user không tạo thêm đối tượng mới

Yêu cầu này không yêu cầu bất kì file mới nào, không tạo thêm bất kì collection nào trong csdl. chỉ cập nhật thông tin tron users

Các ảnh sử dụng image-service đã hoàn thiện bên trên để lưu, csdl mongodb chỉ lưu đường dẫn