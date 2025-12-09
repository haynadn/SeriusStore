import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productAPI, categoryAPI, uploadAPI } from '../../api';
import Loading from '../../components/Loading';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:8080';

export default function SellerDashboard() {
    const { user, isSeller, isPendingSeller, loading: authLoading } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: '',
    });

    useEffect(() => {
        if (isSeller) {
            fetchProducts();
            fetchCategories();
        }
    }, [isSeller]);

    const fetchProducts = async () => {
        try {
            const res = await productAPI.getMyProducts();
            setProducts(res.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadAPI.uploadImage(file);
            setForm({ ...form, image: res.data.url });
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Gagal upload gambar');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.stock),
            };

            if (editingProduct) {
                await productAPI.update(editingProduct.id, data);
            } else {
                await productAPI.create(data);
            }

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert(error.response?.data?.error || 'Gagal menyimpan produk');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            category_id: product.category_id,
            image: product.image || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            await productAPI.delete(id);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert(error.response?.data?.error || 'Gagal menghapus produk');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setForm({
            name: '',
            description: '',
            price: '',
            stock: '',
            category_id: '',
            image: '',
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (authLoading) return <Loading />;

    // User is pending seller
    if (isPendingSeller) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">⏳</div>
                        <h3 className="empty-state-title">Menunggu Persetujuan</h3>
                        <p className="empty-state-text">
                            Pendaftaran seller Anda sedang menunggu persetujuan dari admin.
                            <br />
                            Silakan cek kembali nanti.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Not a seller
    if (!isSeller) {
        return <Navigate to="/" replace />;
    }

    if (loading) return <Loading />;

    return (
        <div className="page">
            <div className="container">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1 className="page-title">Dashboard Penjual</h1>
                        <p className="page-subtitle">Kelola produk Anda</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="btn btn-primary"
                    >
                        + Tambah Produk
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3 className="empty-state-title">Belum ada produk</h3>
                        <p className="empty-state-text">Mulai tambahkan produk untuk dijual</p>
                        <button onClick={() => setShowModal(true)} className="btn btn-primary">
                            Tambah Produk Pertama
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {products.map((product) => (
                            <div key={product.id} className="card">
                                <img
                                    src={product.image ? `${API_URL}${product.image}` : 'https://via.placeholder.com/300x200'}
                                    alt={product.name}
                                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    <h4>{product.name}</h4>
                                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                        {product.category?.name || 'Tanpa Kategori'}
                                    </p>
                                    <div className="flex justify-between items-center mt-md">
                                        <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                                            {formatPrice(product.price)}
                                        </span>
                                        <span className="text-muted">Stok: {product.stock}</span>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="table-actions">
                                        <button onClick={() => handleEdit(product)} className="btn btn-ghost btn-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-sm">
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                                </h3>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label className="form-label">Nama Produk</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Kategori</label>
                                        <select
                                            className="form-select"
                                            value={form.category_id}
                                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Deskripsi</label>
                                        <textarea
                                            className="form-textarea"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Harga (Rp)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={form.price}
                                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Stok</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={form.stock}
                                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Gambar</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="form-input"
                                        />
                                        {uploading && <p className="text-muted mt-sm">Mengupload...</p>}
                                        {form.image && (
                                            <img
                                                src={`${API_URL}${form.image}`}
                                                alt="Preview"
                                                style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                                        Batal
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingProduct ? 'Simpan' : 'Tambah'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
