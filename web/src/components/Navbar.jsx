import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, AlertCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
        <Link to="/" className="text-2xl font-bold">RentCar</Link>

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/vehicles" className="hover:text-blue-200">Xe cho thue</Link>
              <Link to="/my-rentals" className="hover:text-blue-200">Yeu cau thue</Link>
              <Link to="/my-contracts" className="hover:text-blue-200">Hop dong</Link>
              <Link to="/my-vehicles" className="hover:text-blue-200">Xe cua toi</Link>
              <Link to="/disputes" className="hover:text-blue-200 flex items-center gap-1">
                <AlertCircle size={18} />
                Khieu nai
              </Link>
              <Link to="/statistics" className="hover:text-blue-200 flex items-center gap-1">
                <BarChart3 size={18} />
                Thong ke
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
                Dang xuat
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Dang nhap</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100">
                Dang ky
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
              <Link to="/vehicles" className="hover:text-blue-200">Xe cho thue</Link>
              <Link to="/my-rentals" className="hover:text-blue-200">Yeu cau thue</Link>
              <Link to="/my-contracts" className="hover:text-blue-200">Hop dong</Link>
              <Link to="/my-vehicles" className="hover:text-blue-200">Xe cua toi</Link>
              <Link to="/disputes" className="hover:text-blue-200">Khieu nai</Link>
              <Link to="/statistics" className="hover:text-blue-200">Thong ke</Link>
              <Link to="/notifications" className="hover:text-blue-200">Thong bao</Link>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                Dang xuat
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="hover:text-blue-200">Dang nhap</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100">
                Dang ky
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}