import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    try {
        const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;

        if (!(date instanceof Date) || isNaN(date.getTime())) {
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

    const [activeTab, setActiveTab] = useState('renter');
    const [selectedContract, setSelectedContract] = useState(null);

    const [showPickupForm, setShowPickupForm] = useState(false);
    const [showReturnForm, setShowReturnForm] = useState(false);

    const [pickupData, setPickupData] = useState({
        description: '',
        pickup_images: [],
    });

    const [returnData, setReturnData] = useState({
        description: '',
        return_images: [],
    });

    const [showDisputeForm, setShowDisputeForm] = useState(false);

    const [disputeData, setDisputeData] = useState({
        claimed_amount: '',
        description: '',
    });

    const closeDisputeForm = () => {
        setShowDisputeForm(false);
        setSelectedContract(null);

        setDisputeData({
            claimed_amount: '',
            description: '',
        });
    };

    const handleDisputeSubmit = async (e) => {
        e.preventDefault();

        if (!selectedContract?._id) {
            alert('Không tìm thấy hợp đồng');
            return;
        }

        if (!disputeData.claimed_amount) {
            alert('Vui lòng nhập số tiền bồi thường');
            return;
        }

        if (!disputeData.description.trim()) {
            alert('Vui lòng nhập mô tả bồi thường');
            return;
        }

        try {
            await api.post('/api/disputes', {
                contract_id: selectedContract._id,
                claimed_amount: Number(disputeData.claimed_amount),
                description: disputeData.description,
            });

            alert('Yêu cầu bồi thường thành công!');
            closeDisputeForm();
        } catch (error) {
            console.error('Dispute error:', error);

            alert(
                error.response?.data?.error ||
                'Lỗi khi gửi yêu cầu bồi thường'
            );
        }
    };

    useEffect(() => {
        loadContracts();
    }, [activeTab]);

    const resetPickupForm = () => {
        setPickupData({
            description: '',
            pickup_images: [],
        });
    };

    const resetReturnForm = () => {
        setReturnData({
            description: '',
            return_images: [],
        });
    };

    const closePickupForm = () => {
        setShowPickupForm(false);
        setSelectedContract(null);
        resetPickupForm();
    };

    const closeReturnForm = () => {
        setShowReturnForm(false);
        setSelectedContract(null);
        resetReturnForm();
    };

    const loadContracts = async () => {
        try {
            setLoading(true);
            setError('');

            const endpoint =
                activeTab === 'renter'
                    ? '/api/contracts/renter/my-contracts'
                    : '/api/contracts/owner/my-contracts';

            const response = await api.get(endpoint);

            let contractList = [];

            if (Array.isArray(response.data)) {
                contractList = response.data;
            } else if (Array.isArray(response.data?.contracts)) {
                contractList = response.data.contracts;
            } else if (Array.isArray(response.data?.data)) {
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

    const handlePickupImagesChange = (e) => {
        setPickupData({
            ...pickupData,
            pickup_images: Array.from(e.target.files || []),
        });
    };

    const handleReturnImagesChange = (e) => {
        setReturnData({
            ...returnData,
            return_images: Array.from(e.target.files || []),
        });
    };

    const handlePickupSubmit = async (e) => {
        e.preventDefault();

        if (!selectedContract?._id) {
            alert('Không tìm thấy hợp đồng');
            return;
        }

        if (!pickupData.description.trim()) {
            alert('Vui lòng nhập mô tả xe khi nhận');
            return;
        }

        if (!pickupData.pickup_images || pickupData.pickup_images.length === 0) {
            alert('Vui lòng chọn ít nhất 1 ảnh xe khi nhận');
            return;
        }

        try {
            const formData = new FormData();

            formData.append('description', pickupData.description);

            pickupData.pickup_images.forEach((file) => {
                formData.append('pickup_images', file);
            });

            await api.put(`/api/contracts/${selectedContract._id}/pickup`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Nhận xe thành công!');
            closePickupForm();
            loadContracts();
        } catch (error) {
            console.error('Pickup error:', error);
            alert(error.response?.data?.error || 'Lỗi khi nhận xe');
        }
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();

        if (!selectedContract?._id) {
            alert('Không tìm thấy hợp đồng');
            return;
        }

        if (!returnData.description.trim()) {
            alert('Vui lòng nhập mô tả xe khi trả');
            return;
        }

        if (!returnData.return_images || returnData.return_images.length === 0) {
            alert('Vui lòng chọn ít nhất 1 ảnh xe khi trả');
            return;
        }

        try {
            const formData = new FormData();

            formData.append('description', returnData.description);

            returnData.return_images.forEach((file) => {
                formData.append('return_images', file);
            });

            await api.put(`/api/contracts/${selectedContract._id}/return`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Trả xe thành công!');
            closeReturnForm();
            loadContracts();
        } catch (error) {
            console.error('Return error:', error);
            alert(error.response?.data?.error || 'Lỗi khi trả xe');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center w-fit">
                    <Clock size={16} className="mr-1" />
                    Chờ xử lý
                </span>
            ),
            ACTIVE: (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center w-fit">
                    <CheckCircle size={16} className="mr-1" />
                    Đang thuê
                </span>
            ),
            COMPLETED: (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center w-fit">
                    <CheckCircle size={16} className="mr-1" />
                    Hoàn tất
                </span>
            ),
            CANCELLED: (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                    Đã hủy
                </span>
            ),
        };

        return badges[status] || (
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                {status || 'N/A'}
            </span>
        );
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

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <p className="font-bold">Lỗi</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('renter')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'renter'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Hợp đồng thuê của tôi
                    </button>

                    <button
                        onClick={() => setActiveTab('owner')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'owner'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Hợp đồng cho thuê của tôi
                    </button>
                </div>

                {contracts.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <AlertCircle size={40} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg">Không có hợp đồng nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contracts.map((contract) => (
                            <div key={contract._id} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-gray-600 text-sm">ID Hợp đồng</p>
                                        <p className="font-bold truncate">{contract._id}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-600 text-sm">Từ ngày</p>
                                        <p className="font-semibold">{formatDate(contract.rental_start_date)}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-600 text-sm">Đến ngày</p>
                                        <p className="font-semibold">{formatDate(contract.rental_end_date)}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-600 text-sm">Trạng thái</p>
                                        {getStatusBadge(contract.status)}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <p className="text-gray-600 text-sm mb-2">
                                        Ảnh xe khi nhận
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                        {contract.pickup_images?.map((image, index) => (
                                            <div
                                                key={index}
                                                className="border rounded-lg overflow-hidden shadow-sm"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`pickup-${index}`}
                                                    className="w-full h-40 object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <p className="text-gray-600 text-sm mb-2">
                                        Ảnh xe khi trả
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                        {contract.return_images?.map((image, index) => (
                                            <div
                                                key={index}
                                                className="border rounded-lg overflow-hidden shadow-sm"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`pickup-${index}`}
                                                    className="w-full h-40 object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    {activeTab === 'renter' &&
                                        !contract.pickup_time && (
                                            <button
                                                onClick={() => {
                                                    setSelectedContract(contract);
                                                    setShowPickupForm(true);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-bold"
                                            >
                                                Nhận xe
                                            </button>
                                        )}

                                    {activeTab === 'renter' &&
                                        contract.pickup_time && !contract.return_time && (
                                            <button
                                                onClick={() => {
                                                    setSelectedContract(contract);
                                                    setShowReturnForm(true);
                                                }}
                                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-bold"
                                            >
                                                Trả xe
                                            </button>
                                        )}
                                    {activeTab === 'owner' &&
                                        contract.return_time && (
                                            <button
                                                onClick={() => {
                                                    setSelectedContract(contract);
                                                    setShowDisputeForm(true);
                                                }}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-bold"
                                            >
                                                Yêu cầu bồi thường
                                            </button>
                                        )}

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showPickupForm && selectedContract && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Nhận xe</h2>

                        <form onSubmit={handlePickupSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Ảnh xe khi nhận
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePickupImagesChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Đã chọn: {pickupData.pickup_images.length} ảnh
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Mô tả xe khi nhận
                                </label>
                                <textarea
                                    value={pickupData.description}
                                    onChange={(e) =>
                                        setPickupData({
                                            ...pickupData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4"
                                    placeholder="Ví dụ: xe còn mới, có vài vết xước nhỏ bên hông trái..."
                                    required
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Xác nhận nhận xe
                                </button>

                                <button
                                    type="button"
                                    onClick={closePickupForm}
                                    className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showReturnForm && selectedContract && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Trả xe</h2>

                        <form onSubmit={handleReturnSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Ảnh xe khi trả
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleReturnImagesChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Đã chọn: {returnData.return_images.length} ảnh
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Mô tả xe khi trả
                                </label>
                                <textarea
                                    value={returnData.description}
                                    onChange={(e) =>
                                        setReturnData({
                                            ...returnData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    rows="4"
                                    placeholder="Ví dụ: xe trả nguyên trạng, không phát sinh hư hỏng..."
                                    required
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
                                    onClick={closeReturnForm}
                                    className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDisputeForm && selectedContract && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">
                            Yêu cầu bồi thường
                        </h2>

                        <form onSubmit={handleDisputeSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Số tiền yêu cầu bồi thường
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={disputeData.claimed_amount}
                                    onChange={(e) =>
                                        setDisputeData({
                                            ...disputeData,
                                            claimed_amount: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Ví dụ: 2000000"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Mô tả thiệt hại
                                </label>

                                <textarea
                                    value={disputeData.description}
                                    onChange={(e) =>
                                        setDisputeData({
                                            ...disputeData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    rows="4"
                                    placeholder="Ví dụ: Bể kính chiếu hậu bên trái"
                                    required
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                                >
                                    Gửi yêu cầu
                                </button>

                                <button
                                    type="button"
                                    onClick={closeDisputeForm}
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