import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function Navigation() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold">
          🚗 VehicleRent
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link to="/dashboard" className="hover:text-blue-200">
            Trang chủ
          </Link>
          <Link to="/rentals" className="hover:text-blue-200">
            Đơn thuê
          </Link>
          <Link to="/notifications" className="hover:text-blue-200">
            Thông báo
          </Link>
          
          {user?.email ? (
            <div className="flex gap-4 items-center">
              <span>{user.first_name}</span>
              <Link to="/profile" className="hover:text-blue-200">
                Hồ sơ
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
