import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Safe date formatting helper
const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    let date;
    if (typeof dateValue === 'string') {
      date = parseISO(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return 'N/A';
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Date format error:', error, 'Value:', dateValue);
    return 'N/A';
  }
};

export default function MyContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('renter'); // renter or owner
  const [selectedContract, setSelectedContract] = useState(null);
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [pickupData, setPickupData] = useState({
    odometer_reading: '',
    fuel_level: '',
  });
  const [returnData, setReturnData] = useState({
    odometer_reading: '',
    fuel_level: '',
    damage_report: '',
  });

  useEffect(() => {
    loadContracts();
  }, [activeTab]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = activeTab === 'renter' 
        ? '/api/contracts/renter/my-contracts' 
        : '/api/contracts/owner/my-contracts';
      const response = await api.get(endpoint);
      console.log('Contracts API response:', response.data);
      
      // Handle different response formats
      let contractList = [];
      if (Array.isArray(response.data)) {
        contractList = response.data;
      } else if (response.data.contracts && Array.isArray(response.data.contracts)) {
        contractList = response.data.contracts;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        contractList = response.data.data;
      }
      
      setContracts(contractList);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setError(error.response?.data?.error || error.message || 'Lỗi tải danh sách hợp đồng');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/contracts/${selectedContract._id}/pickup`, pickupData);
      alert('Nhập xe thành công!');
      setShowPickupForm(false);
      setPickupData({ odometer_reading: '', fuel_level: '' });
      loadContracts();
    } catch (error) {
      console.error('Pickup error:', error);
      alert(error.response?.data?.error || 'Lỗi khi nhập xe');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/contracts/${selectedContract._id}/return`, returnData);
      alert('Trả xe thành công!');
      setShowReturnForm(false);
      setReturnData({ odometer_reading: '', fuel_level: '', damage_report: '' });
      loadContracts();
    } catch (error) {
      console.error('Return error:', error);
      alert(error.response?.data?.error || 'Lỗi khi trả xe');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><Clock size={16} className="mr-1" /> Chờ xử lý</span>,
      'ACTIVE': <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><CheckCircle size={16} className="mr-1" /> Đang thuê</span>,
      'COMPLETED': <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><CheckCircle size={16} className="mr-1" /> Hoàn tất</span>,
      'CANCELLED': <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">Đã hủy</span>,
    };
    return badges[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Hợp Đồng Thuê Xe</h1>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
            <p className="font-bold">Lỗi</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('renter')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'renter'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Hợp đồng thuê của tôi
          </button>
          <button
            onClick={() => setActiveTab('owner')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'owner'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Hợp đồng cho thuê của tôi
          </button>
        </div>

        {/* Contracts List */}
        {contracts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <AlertCircle size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Không có hợp đồng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map(contract => (
              <div key={contract._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">ID Hợp đồng</p>
                    <p className="font-bold truncate">{contract._id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Từ ngày</p>
                    <p className="font-semibold">{formatDate(contract.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Đến ngày</p>
                    <p className="font-semibold">{formatDate(contract.end_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Trạng thái</p>
                    <div>{getStatusBadge(contract.status)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {activeTab === 'renter' && contract.status === 'ACTIVE' && !contract.pickup_confirmed && (
                    <button
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowPickupForm(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-bold"
                    >
                      Nhập Xe
                    </button>
                  )}
                  {activeTab === 'renter' && contract.status === 'ACTIVE' && contract.pickup_confirmed && !contract.return_confirmed && (
                    <button
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowReturnForm(true);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-bold"
                    >
                      Trả Xe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pickup Modal */}
      {showPickupForm && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Nhập Xe</h2>
            <form onSubmit={handlePickupSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Số km hiện tại</label>
                <input
                  type="number"
                  value={pickupData.odometer_reading}
                  onChange={(e) => setPickupData({ ...pickupData, odometer_reading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Mức xăng (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pickupData.fuel_level}
                  onChange={(e) => setPickupData({ ...pickupData, fuel_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Xác nhận nhập xe
                </button>
                <button
                  type="button"
                  onClick={() => setShowPickupForm(false)}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnForm && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Trả Xe</h2>
            <form onSubmit={handleReturnSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Số km hiện tại</label>
                <input
                  type="number"
                  value={returnData.odometer_reading}
                  onChange={(e) => setReturnData({ ...returnData, odometer_reading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Mức xăng (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={returnData.fuel_level}
                  onChange={(e) => setReturnData({ ...returnData, fuel_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Báo cáo hư hỏng (nếu có)</label>
                <textarea
                  value={returnData.damage_report}
                  onChange={(e) => setReturnData({ ...returnData, damage_report: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Xác nhận trả xe
                </button>
                <button
                  type="button"
                  onClick={() => setShowReturnForm(false)}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
