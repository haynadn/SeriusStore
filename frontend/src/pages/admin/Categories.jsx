import { useState, useEffect } from 'react';
import { categoryAPI } from '../../api';
import Loading from '../../components/Loading';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryAPI.update(editingCategory.id, form);
            } else {
                await categoryAPI.create(form);
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Gagal menyimpan kategori');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setForm({
            name: category.name,
            description: category.description || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus kategori ini?')) return;
        try {
            await categoryAPI.delete(id);
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Gagal menghapus kategori');
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
        setForm({
            name: '',
            description: '',
        });
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="flex justify-between items-center mb-xl">
                <h1>Kelola Kategori</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn btn-primary"
                >
                    + Tambah Kategori
                </button>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Deskripsi</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>{category.description || '-'}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => handleEdit(category)} className="btn btn-ghost btn-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(category.id)} className="btn btn-danger btn-sm">
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nama Kategori</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Deskripsi</label>
                                    <textarea
                                        className="form-textarea"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'Simpan' : 'Tambah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
