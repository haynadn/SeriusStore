import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const API_URL = 'http://localhost:8080';

export default function Cart() {
    const navigate = useNavigate();
    const { items, total, loading, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (!user) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔐</div>
                        <h3 className="empty-state-title">Silakan masuk terlebih dahulu</h3>
                        <p className="empty-state-text">
                            Anda perlu login untuk melihat keranjang belanja
                        </p>
                        <Link to="/login" className="btn btn-primary">
                            Masuk
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <Loading />;

    if (items.length === 0) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <h3 className="empty-state-title">Keranjang kosong</h3>
                        <p className="empty-state-text">
                            Anda belum menambahkan produk ke keranjang
                        </p>
                        <Link to="/" className="btn btn-primary">
                            Mulai Belanja
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Keranjang Belanja</h1>
                    <p className="page-subtitle">{items.length} produk dalam keranjang</p>
                </div>

                <div className="checkout-layout">
                    {/* Cart Items */}
                    <div>
                        {items.map((item) => {
                            const imageUrl = item.product?.image
                                ? `${API_URL}${item.product.image}`
                                : 'https://via.placeholder.com/100x100?text=No+Image';

                            return (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-image">
                                        <img src={imageUrl} alt={item.product?.name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name">{item.product?.name}</h4>
                                        <p className="cart-item-price">
                                            {formatPrice(item.product?.price)}
                                        </p>
                                        <div className="cart-item-actions">
                                            <div className="quantity-control">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product?.stock}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="btn btn-ghost btn-sm"
                                                style={{ color: 'var(--color-danger)' }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>
                                        {formatPrice(item.product?.price * item.quantity)}
                                    </div>
                                </div>
                            );
                        })}
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
                            <div className="card-footer">
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="btn btn-primary btn-full btn-lg"
                                >
                                    Lanjut ke Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
