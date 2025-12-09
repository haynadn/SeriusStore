import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const API_URL = 'http://localhost:8080';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await productAPI.getById(id);
            setProduct(res.data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setAdding(true);
            await addToCart(product.id, quantity);
            setMessage('Produk ditambahkan ke keranjang!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Gagal menambahkan ke keranjang');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setAdding(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) return <Loading />;

    if (!product) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">❌</div>
                        <h3 className="empty-state-title">Produk tidak ditemukan</h3>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const imageUrl = product.image
        ? `${API_URL}${product.image}`
        : 'https://via.placeholder.com/600x600?text=No+Image';

    return (
        <div className="page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="btn btn-ghost mb-lg">
                    ← Kembali
                </button>

                <div className="grid grid-2" style={{ gap: '3rem' }}>
                    {/* Product Image */}
                    <div className="card">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Product Info */}
                    <div>
                        {product.category && (
                            <span className="badge badge-default mb-md">{product.category.name}</span>
                        )}
                        <h1 style={{ marginBottom: 'var(--spacing-md)' }}>{product.name}</h1>
                        <p className="text-secondary mb-lg">{product.description}</p>

                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>
                            {formatPrice(product.price)}
                        </div>

                        {product.stock > 0 ? (
                            <>
                                <p className="mb-md" style={{ color: 'var(--color-success)' }}>
                                    ✓ Tersedia ({product.stock} tersisa)
                                </p>

                                <div className="flex items-center gap-md mb-lg">
                                    <span>Jumlah:</span>
                                    <div className="quantity-control">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span>{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            disabled={quantity >= product.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="btn btn-primary btn-lg"
                                    disabled={adding}
                                >
                                    {adding ? 'Menambahkan...' : '🛒 Tambah ke Keranjang'}
                                </button>

                                {message && (
                                    <div className={`alert ${message.includes('Gagal') ? 'alert-danger' : 'alert-success'} mt-lg`}>
                                        {message}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={{ color: 'var(--color-danger)' }}>✗ Stok habis</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
