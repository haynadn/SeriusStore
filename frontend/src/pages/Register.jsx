import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        setLoading(true);

        try {
            const result = await register(name, email, password, role);

            if (role === 'seller') {
                setSuccess(result.message || 'Pendaftaran berhasil! Menunggu persetujuan admin.');
                // Don't navigate for sellers - they need approval
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registrasi gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <div className="card-body">
                    <div className="auth-header">
                        <h1 className="auth-title">Buat Akun</h1>
                        <p className="auth-subtitle">Daftar untuk mulai berbelanja atau berjualan</p>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Role Selection */}
                        <div className="form-group">
                            <label className="form-label">Daftar Sebagai</label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <label style={{
                                    flex: 1,
                                    padding: 'var(--spacing-md)',
                                    border: role === 'user' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    background: role === 'user' ? 'var(--color-primary-light)' : 'transparent'
                                }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={role === 'user'}
                                        onChange={(e) => setRole(e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🛒</div>
                                    <div style={{ fontWeight: '600' }}>Customer</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        Belanja produk
                                    </div>
                                </label>
                                <label style={{
                                    flex: 1,
                                    padding: 'var(--spacing-md)',
                                    border: role === 'seller' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    background: role === 'seller' ? 'var(--color-primary-light)' : 'transparent'
                                }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="seller"
                                        checked={role === 'seller'}
                                        onChange={(e) => setRole(e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏪</div>
                                    <div style={{ fontWeight: '600' }}>Penjual</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        Jual produk Anda
                                    </div>
                                </label>
                            </div>
                            {role === 'seller' && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-warning)', marginTop: 'var(--spacing-sm)' }}>
                                    ⚠️ Pendaftaran seller memerlukan persetujuan admin
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nama Lengkap</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@contoh.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Konfirmasi Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : role === 'seller' ? 'Daftar Sebagai Penjual' : 'Daftar'}
                        </button>
                    </form>

                    <p className="text-center mt-lg text-secondary">
                        Sudah punya akun?{' '}
                        <Link to="/login">Masuk</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
