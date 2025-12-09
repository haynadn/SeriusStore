import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout, isAdmin, isSeller, isPendingSeller } = useAuth();
    const { itemCount } = useCart();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    return (
        <>
            <nav className="navbar">
                <div className="container navbar-container">
                    <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="/logo.png" alt="SeriusStore" style={{ width: '28px', height: '28px' }} />
                        SeriusStore
                    </Link>

                    <ul className="navbar-nav">
                        <li>
                            <Link to="/" className="navbar-link">
                                Produk
                            </Link>
                        </li>

                        {user ? (
                            <>
                                <li>
                                    <Link to="/cart" className="navbar-link cart-badge">
                                        🛒 Keranjang
                                        {itemCount > 0 && <span className="count">{itemCount}</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/orders" className="navbar-link">
                                        Pesanan
                                    </Link>
                                </li>
                                {(isSeller || isPendingSeller) && (
                                    <li>
                                        <Link to="/seller" className="navbar-link">
                                            {isPendingSeller ? '⏳ Toko Saya' : '🏪 Toko Saya'}
                                        </Link>
                                    </li>
                                )}
                                {isAdmin && (
                                    <li>
                                        <Link to="/admin" className="navbar-link">
                                            Admin
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <span className="navbar-link" style={{ cursor: 'default' }}>
                                        Halo, {user.name}
                                    </span>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        Keluar
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/login" className="navbar-link">
                                        Masuk
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="btn btn-primary btn-sm">
                                        Daftar
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Konfirmasi Keluar</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowLogoutModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                                🚪 Yakin ingin keluar dari akun Anda?
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="btn btn-ghost"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn btn-danger"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
