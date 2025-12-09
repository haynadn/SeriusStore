import { useState, useEffect } from 'react';
import { sellerAPI } from '../../api';
import Loading from '../../components/Loading';

export default function SellerApproval() {
    const [pendingSellers, setPendingSellers] = useState([]);
    const [activeSellers, setActiveSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pending, active] = await Promise.all([
                sellerAPI.getPending(),
                sellerAPI.getAll(),
            ]);
            setPendingSellers(pending.data || []);
            setActiveSellers(active.data || []);
        } catch (error) {
            console.error('Failed to fetch sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (sellerId) => {
        if (!confirm('Yakin ingin menyetujui seller ini?')) return;

        try {
            setProcessing(sellerId);
            await sellerAPI.approve(sellerId);
            fetchData();
        } catch (error) {
            console.error('Failed to approve seller:', error);
            alert('Gagal menyetujui seller');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (sellerId) => {
        if (!confirm('Yakin ingin menolak seller ini? Akun akan menjadi customer biasa.')) return;

        try {
            setProcessing(sellerId);
            await sellerAPI.reject(sellerId);
            fetchData();
        } catch (error) {
            console.error('Failed to reject seller:', error);
            alert('Gagal menolak seller');
        } finally {
            setProcessing(null);
        }
    };

    const handleDeactivate = async (sellerId) => {
        if (!confirm('Yakin ingin menonaktifkan seller ini? Akun akan menjadi customer biasa dan tidak bisa berjualan lagi.')) return;

        try {
            setProcessing(sellerId);
            await sellerAPI.deactivate(sellerId);
            fetchData();
        } catch (error) {
            console.error('Failed to deactivate seller:', error);
            alert('Gagal menonaktifkan seller');
        } finally {
            setProcessing(null);
        }
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

    if (loading) return <Loading />;

    return (
        <div>
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Manajemen Penjual</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                >
                    ⏳ Menunggu Persetujuan ({pendingSellers.length})
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                >
                    ✅ Seller Aktif ({activeSellers.length})
                </button>
            </div>

            {/* Pending Sellers Tab */}
            {activeTab === 'pending' && (
                <>
                    {pendingSellers.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">✅</div>
                            <h3 className="empty-state-title">Tidak ada pendaftaran seller yang menunggu</h3>
                            <p className="empty-state-text">Semua pendaftaran sudah diproses</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Email</th>
                                        <th>Tanggal Daftar</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingSellers.map((seller) => (
                                        <tr key={seller.id}>
                                            <td>{seller.name}</td>
                                            <td>{seller.email}</td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                {formatDate(seller.created_at)}
                                            </td>
                                            <td>
                                                <span className="badge badge-warning">Menunggu</span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        onClick={() => handleApprove(seller.id)}
                                                        className="btn btn-success btn-sm"
                                                        disabled={processing === seller.id}
                                                    >
                                                        {processing === seller.id ? '...' : '✓ Setujui'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(seller.id)}
                                                        className="btn btn-danger btn-sm"
                                                        disabled={processing === seller.id}
                                                    >
                                                        {processing === seller.id ? '...' : '✕ Tolak'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Active Sellers Tab */}
            {activeTab === 'active' && (
                <>
                    {activeSellers.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🏪</div>
                            <h3 className="empty-state-title">Belum ada seller aktif</h3>
                            <p className="empty-state-text">Seller yang disetujui akan muncul di sini</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nama</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Tanggal Bergabung</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeSellers.map((seller) => (
                                        <tr key={seller.id}>
                                            <td>
                                                <code style={{ fontSize: '0.8rem' }}>
                                                    {seller.id.slice(0, 8)}
                                                </code>
                                            </td>
                                            <td>
                                                <strong>{seller.name}</strong>
                                            </td>
                                            <td>{seller.email}</td>
                                            <td>
                                                <span className="badge badge-success">Aktif</span>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                {formatDate(seller.created_at)}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeactivate(seller.id)}
                                                    className="btn btn-danger btn-sm"
                                                    disabled={processing === seller.id}
                                                >
                                                    {processing === seller.id ? '...' : '⛔ Nonaktifkan'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
