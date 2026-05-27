import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Menu, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🚗 RentCar
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/vehicles" className="hover:text-blue-200">Xe cho thuê</Link>
              <Link to="/my-rentals" className="hover:text-blue-200">Yêu cầu thuê</Link>
              <Link to="/my-contracts" className="hover:text-blue-200">Hợp đồng</Link>
              <Link to="/my-vehicles" className="hover:text-blue-200">Xe của tôi</Link>
              <Link to="/disputes" className="hover:text-blue-200 flex items-center gap-1">
                <AlertCircle size={18} />
                Khiếu nại
              </Link>
              <Link to="/notifications" className="hover:text-blue-200">
                <Bell size={20} />
              </Link>
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                <LogOut size={18} className="inline mr-1" />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Đăng nhập</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100">
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-blue-700 p-4 rounded">
          {user ? (
            <div className="flex flex-col gap-3">
              <Link to="/vehicles" className="hover:text-blue-200">Xe cho thuê</Link>
              <Link to="/my-rentals" className="hover:text-blue-200">Yêu cầu thuê</Link>
              <Link to="/my-contracts" className="hover:text-blue-200">Hợp đồng</Link>
              <Link to="/my-vehicles" className="hover:text-blue-200">Xe của tôi</Link>
              <Link to="/disputes" className="hover:text-blue-200">Khiếu nại</Link>
              <Link to="/notifications" className="hover:text-blue-200">Thông báo</Link>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="hover:text-blue-200">Đăng nhập</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
