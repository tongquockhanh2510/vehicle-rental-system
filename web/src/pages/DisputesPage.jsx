import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Loader, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'admin'
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalData, setApprovalData] = useState({
    admin_decision_amount: '',
    admin_notes: '',
  });

  useEffect(() => {
    loadDisputes();
  }, [activeTab]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/disputes/pending/list';
      if (activeTab === 'my') {
        // Load my disputes - would need a specific endpoint or filter
        endpoint = '/api/disputes/my-disputes';
      }
      const response = await api.get(endpoint);
      setDisputes(response.data || []);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    try {
      await api.put(`/api/disputes/${selectedDispute._id}/approve`, {
        admin_decision_amount: parseFloat(approvalData.admin_decision_amount),
        admin_notes: approvalData.admin_notes,
      });
      alert('Khiếu nại đã được chấp nhận!');
      setShowApprovalForm(false);
      setApprovalData({ admin_decision_amount: '', admin_notes: '' });
      loadDisputes();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to approve dispute');
    }
  };

  const handleReject = async (disputeId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối khiếu nại này?')) return;

    try {
      await api.put(`/api/disputes/${disputeId}/reject`, {
        admin_notes: 'Từ chối',
      });
      alert('Khiếu nại đã bị từ chối!');
      loadDisputes();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject dispute');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><Clock size={16} className="mr-1" /> Chờ xét duyệt</span>,
      'APPROVED': <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><CheckCircle size={16} className="mr-1" /> Đã chấp nhận</span>,
      'REJECTED': <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><XCircle size={16} className="mr-1" /> Đã từ chối</span>,
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
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Khiếu Nại & Bồi Thường</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Khiếu nại của tôi
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Chờ xét duyệt (Admin)
          </button>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <AlertCircle size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Không có khiếu nại nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map(dispute => (
              <div key={dispute._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Hợp đồng</p>
                    <p className="font-bold truncate">{dispute.contract_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Số tiền yêu cầu</p>
                    <p className="font-bold text-lg text-red-600">
                      {Number(dispute.claimed_amount).toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Mô tả</p>
                    <p className="font-semibold truncate">{dispute.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Trạng thái</p>
                    <div>{getStatusBadge(dispute.status)}</div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Ngày tạo</p>
                    <p className="font-semibold">{format(new Date(dispute.created_at), 'dd/MM/yyyy')}</p>
                  </div>
                </div>

                {activeTab === 'admin' && dispute.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowApprovalForm(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleReject(dispute._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold"
                    >
                      Từ chối
                    </button>
                  </div>
                )}

                {dispute.status === 'APPROVED' && dispute.admin_decision_amount && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold">
                      Đã chấp nhận bồi thường: {Number(dispute.admin_decision_amount).toLocaleString('vi-VN')} đ
                    </p>
                    {dispute.admin_notes && <p className="text-green-700 text-sm mt-1">Ghi chú: {dispute.admin_notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Form Modal */}
      {showApprovalForm && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Chấp Nhận Khiếu Nại</h2>
            <form onSubmit={handleApprove}>
              <div className="mb-4">
                <p className="text-gray-600 text-sm">Số tiền yêu cầu</p>
                <p className="text-2xl font-bold text-red-600 mb-4">
                  {Number(selectedDispute.claimed_amount).toLocaleString('vi-VN')} đ
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Số tiền bồi thường *</label>
                <input
                  type="number"
                  value={approvalData.admin_decision_amount}
                  onChange={(e) => setApprovalData({ ...approvalData, admin_decision_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  step="0.01"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Ghi chú</label>
                <textarea
                  value={approvalData.admin_notes}
                  onChange={(e) => setApprovalData({ ...approvalData, admin_notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-bold"
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setShowApprovalForm(false)}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-bold"
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
