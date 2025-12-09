import { useState, useEffect } from 'react';
import { userAPI } from '../../api';
import Loading from '../../components/Loading';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await userAPI.getAll();
            setUsers(res.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await userAPI.updateRole(userId, newRole);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update role:', error);
            alert(error.response?.data?.error || 'Gagal mengubah role');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Yakin ingin menghapus user ini?')) return;
        try {
            await userAPI.delete(userId);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(error.response?.data?.error || 'Gagal menghapus user');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) return <Loading />;

    return (
        <div>
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Kelola Pengguna</h1>

            {users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3 className="empty-state-title">Belum ada pengguna</h3>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Terdaftar</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'admin' ? 'badge-success' : 'badge-default'}`}>
                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="form-select"
                                                style={{ minWidth: '100px' }}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="btn btn-danger btn-sm"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
