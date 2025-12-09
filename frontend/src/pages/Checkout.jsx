import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../api';

export default function Checkout() {
    const navigate = useNavigate();
    const { items, total, fetchCart } = useCart();
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await orderAPI.create({ address, phone });
            await fetchCart();
            navigate('/orders', { state: { success: true } });
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal membuat pesanan');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Checkout</h1>
                    <p className="page-subtitle">Lengkapi data pengiriman Anda</p>
                </div>

                <div className="checkout-layout">
                    {/* Checkout Form */}
                    <div>
                        <div className="card">
                            <div className="card-header">
                                <h3>Informasi Pengiriman</h3>
                            </div>
                            <div className="card-body">
                                {error && <div className="alert alert-danger">{error}</div>}

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Alamat Lengkap</label>
                                        <textarea
                                            className="form-textarea"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Masukkan alamat lengkap termasuk kode pos..."
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Nomor Telepon</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            required
                                        />
                                    </div>

                                    <div className="alert alert-warning">
                                        💳 Pembayaran dapat dilakukan melalui transfer bank. Detail akan dikirim setelah pesanan dibuat.
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-full btn-lg mt-lg"
                                        disabled={loading}
                                    >
                                        {loading ? 'Memproses...' : 'Buat Pesanan'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="card order-summary">
                            <div className="card-header">
                                <h3>Ringkasan Pesanan</h3>
                            </div>
                            <div className="card-body">
                                {items.map((item) => (
                                    <div key={item.id} className="order-summary-item">
                                        <span>
                                            {item.product?.name} x{item.quantity}
                                        </span>
                                        <span>{formatPrice(item.product?.price * item.quantity)}</span>
                                    </div>
                                ))}
                                <div className="order-summary-total">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
