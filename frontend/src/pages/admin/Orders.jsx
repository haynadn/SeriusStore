import { useState, useEffect } from 'react';
import { orderAPI } from '../../api';
import Loading from '../../components/Loading';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await orderAPI.getOrders();
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Gagal mengubah status');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Menunggu', class: 'badge-warning' },
            processing: { label: 'Diproses', class: 'badge-default' },
            shipped: { label: 'Dikirim', class: 'badge-default' },
            delivered: { label: 'Selesai', class: 'badge-success' },
            cancelled: { label: 'Dibatalkan', class: 'badge-danger' },
        };
        return statusMap[status] || { label: status, class: 'badge-default' };
    };

    if (loading) return <Loading />;

    return (
        <div>
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Kelola Pesanan</h1>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3 className="empty-state-title">Belum ada pesanan</h3>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Pelanggan</th>
                                <th>Produk</th>
                                <th>Total</th>
                                <th>Tanggal</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const statusInfo = getStatusBadge(order.status);
                                return (
                                    <tr key={order.id}>
                                        <td>
                                            <code style={{ fontSize: '0.8rem' }}>
                                                {order.id.slice(0, 8)}
                                            </code>
                                        </td>
                                        <td>
                                            <div>{order.user?.name || 'User'}</div>
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {order.phone}
                                            </div>
                                        </td>
                                        <td>
                                            {order.items?.map((item) => (
                                                <div key={item.id} style={{ fontSize: '0.85rem' }}>
                                                    {item.product?.name || 'Produk'} x{item.quantity}
                                                </div>
                                            ))}
                                        </td>
                                        <td>{formatPrice(order.total)}</td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td>
                                            <span className={`badge ${statusInfo.class}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="form-select"
                                                style={{ minWidth: '130px' }}
                                            >
                                                <option value="pending">Menunggu</option>
                                                <option value="processing">Diproses</option>
                                                <option value="shipped">Dikirim</option>
                                                <option value="delivered">Selesai</option>
                                                <option value="cancelled">Dibatalkan</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
