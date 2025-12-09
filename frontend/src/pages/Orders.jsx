import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { orderAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function Orders() {
    const location = useLocation();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);
    const [message, setMessage] = useState('');
    const showSuccess = location.state?.success;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await orderAPI.getOrders();
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;

        try {
            setCancelling(orderId);
            await orderAPI.cancel(orderId);
            setMessage('Pesanan berhasil dibatalkan');
            fetchOrders();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to cancel order:', error);
            setMessage(error.response?.data?.error || 'Gagal membatalkan pesanan');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setCancelling(null);
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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Menunggu Pembayaran', class: 'badge-warning' },
            processing: { label: 'Diproses', class: 'badge-default' },
            shipped: { label: 'Dikirim', class: 'badge-default' },
            delivered: { label: 'Selesai', class: 'badge-success' },
            cancelled: { label: 'Dibatalkan', class: 'badge-danger' },
        };
        return statusMap[status] || { label: status, class: 'badge-default' };
    };

    if (!user) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔐</div>
                        <h3 className="empty-state-title">Silakan masuk terlebih dahulu</h3>
                        <Link to="/login" className="btn btn-primary">
                            Masuk
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <Loading />;

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Pesanan Saya</h1>
                    <p className="page-subtitle">Riwayat pesanan Anda</p>
                </div>

                {showSuccess && (
                    <div className="alert alert-success">
                        ✓ Pesanan berhasil dibuat! Silakan lakukan pembayaran.
                    </div>
                )}

                {message && (
                    <div className={`alert ${message.includes('Gagal') ? 'alert-danger' : 'alert-success'}`}>
                        {message}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3 className="empty-state-title">Belum ada pesanan</h3>
                        <p className="empty-state-text">Anda belum membuat pesanan apapun</p>
                        <Link to="/" className="btn btn-primary">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        {orders.map((order) => {
                            const statusInfo = getStatusBadge(order.status);
                            return (
                                <div key={order.id} className="card">
                                    <div className="card-header flex justify-between items-center">
                                        <div>
                                            <span className="text-muted">Order #{order.id.slice(0, 8)}</span>
                                            <span className="text-muted" style={{ marginLeft: 'var(--spacing-md)' }}>
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                        <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                                    </div>
                                    <div className="card-body">
                                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                            {order.items?.map((item) => (
                                                <div key={item.id} className="flex justify-between" style={{ padding: 'var(--spacing-sm) 0' }}>
                                                    <span>
                                                        {item.product?.name || 'Produk'} x{item.quantity}
                                                    </span>
                                                    <span>{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between" style={{ fontWeight: '600', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border-light)' }}>
                                            <span>Total</span>
                                            <span>{formatPrice(order.total)}</span>
                                        </div>
                                    </div>
                                    <div className="card-footer flex justify-between items-center">
                                        <div className="text-secondary">
                                            <strong>Alamat:</strong> {order.address}<br />
                                            <strong>Telepon:</strong> {order.phone}
                                        </div>
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="btn btn-danger btn-sm"
                                                disabled={cancelling === order.id}
                                            >
                                                {cancelling === order.id ? 'Membatalkan...' : 'Batalkan Pesanan'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
