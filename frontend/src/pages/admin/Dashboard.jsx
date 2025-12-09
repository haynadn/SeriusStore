import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, productAPI, categoryAPI, sellerAPI } from '../../api';

export default function AdminDashboard() {
    const location = useLocation();
    const { isAdmin, loading } = useAuth();
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        pendingOrders: 0,
        activeSellers: 0,
        pendingSellers: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [products, categories, orders, activeSellers, pendingSellers] = await Promise.all([
                productAPI.getAll(),
                categoryAPI.getAll(),
                orderAPI.getOrders(),
                sellerAPI.getAll(),
                sellerAPI.getPending(),
            ]);

            const ordersData = orders.data || [];
            setStats({
                products: products.data?.length || 0,
                categories: categories.data?.length || 0,
                orders: ordersData.length,
                pendingOrders: ordersData.filter((o) => o.status === 'pending').length,
                activeSellers: activeSellers.data?.length || 0,
                pendingSellers: pendingSellers.data?.length || 0,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    if (loading) return null;

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const isActive = (path) => location.pathname === path;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h3 style={{ marginBottom: 'var(--spacing-xl)' }}>Admin Panel</h3>
                <ul className="admin-nav">
                    <li className="admin-nav-item">
                        <Link
                            to="/admin"
                            className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
                        >
                            📊 Dashboard
                        </Link>
                    </li>
                    <li className="admin-nav-item">
                        <Link
                            to="/admin/products"
                            className={`admin-nav-link ${isActive('/admin/products') ? 'active' : ''}`}
                        >
                            📦 Produk
                        </Link>
                    </li>
                    <li className="admin-nav-item">
                        <Link
                            to="/admin/categories"
                            className={`admin-nav-link ${isActive('/admin/categories') ? 'active' : ''}`}
                        >
                            🏷️ Kategori
                        </Link>
                    </li>
                    <li className="admin-nav-item">
                        <Link
                            to="/admin/orders"
                            className={`admin-nav-link ${isActive('/admin/orders') ? 'active' : ''}`}
                        >
                            📋 Pesanan
                        </Link>
                    </li>
                    <li className="admin-nav-item">
                        <Link
                            to="/admin/users"
                            className={`admin-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
                        >
                            👥 Pengguna
                        </Link>
                    </li>
                    <li className="admin-nav-item">
                        <Link
                            to="/admin/seller-approval"
                            className={`admin-nav-link ${isActive('/admin/seller-approval') ? 'active' : ''}`}
                        >
                            ✅ Persetujuan Seller
                        </Link>
                    </li>
                </ul>
            </aside>

            <main className="admin-content">
                {location.pathname === '/admin' ? (
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Dashboard</h1>
                        <div className="grid grid-3">
                            <div className="card">
                                <div className="card-body text-center">
                                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>
                                        📦
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.products}</div>
                                    <div className="text-muted">Produk</div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body text-center">
                                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>
                                        🏷️
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.categories}</div>
                                    <div className="text-muted">Kategori</div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body text-center">
                                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>
                                        📋
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.orders}</div>
                                    <div className="text-muted">Total Pesanan</div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body text-center">
                                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>
                                        ⏳
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.pendingOrders}</div>
                                    <div className="text-muted">Menunggu Proses</div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body text-center">
                                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>
                                        🏪
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.activeSellers}</div>
                                    <div className="text-muted">Seller Aktif</div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body text-center">
                                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>
                                        📝
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: stats.pendingSellers > 0 ? 'var(--color-warning)' : 'inherit' }}>{stats.pendingSellers}</div>
                                    <div className="text-muted">Seller Menunggu</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Outlet />
                )}
            </main>
        </div>
    );
}
