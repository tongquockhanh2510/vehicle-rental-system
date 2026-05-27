import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, MapPin, Calendar, Users } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">🚗 Cho Thuê Xe Hàng Ngày</h1>
          <p className="text-xl mb-8">Tìm xe, đặt xe, và lưu hành dễ dàng</p>
          {!user && (
            <div className="space-x-4">
              <Link
                to="/login"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600"
              >
                Đăng Ký
              </Link>
            </div>
          )}
          {user && (
            <Link
              to="/vehicles"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100"
            >
              Xem Xe Cho Thuê
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Car className="mx-auto mb-3 text-blue-600" size={40} />
              <h3 className="font-bold text-lg mb-2">Đa dạng xe</h3>
              <p className="text-gray-600">Hàng trăm chiếc xe từ các chủ sở hữu tin cậy</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Calendar className="mx-auto mb-3 text-blue-600" size={40} />
              <h3 className="font-bold text-lg mb-2">Linh hoạt</h3>
              <p className="text-gray-600">Đặt xe theo ngày, tuần hoặc tháng</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <MapPin className="mx-auto mb-3 text-blue-600" size={40} />
              <h3 className="font-bold text-lg mb-2">Dễ tìm kiếm</h3>
              <p className="text-gray-600">Lọc theo loại xe, giá, địa điểm</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Users className="mx-auto mb-3 text-blue-600" size={40} />
              <h3 className="font-bold text-lg mb-2">An toàn</h3>
              <p className="text-gray-600">Xác thực tài xế, hợp đồng an toàn</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {user && (
        <section className="bg-blue-600 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng cho chuyến đi tiếp theo?</h2>
            <p className="text-lg mb-6">Duyệt danh sách xe có sẵn hoặc tạo lệnh cho thuê mới</p>
            <div className="space-x-4">
              <Link
                to="/vehicles"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100"
              >
                Xem Xe
              </Link>
              <Link
                to="/my-rentals"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
              >
                Yêu cầu Thuê của tôi
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
