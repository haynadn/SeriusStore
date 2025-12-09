import { useState, useEffect } from 'react';
import { productAPI, categoryAPI, uploadAPI } from '../../api';
import Loading from '../../components/Loading';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:8080';

export default function AdminProducts() {
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
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await productAPI.getAll();
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
            alert('Gagal menyimpan produk');
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
            alert('Gagal menghapus produk');
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

    if (loading) return <Loading />;

    return (
        <div>
            <div className="flex justify-between items-center mb-xl">
                <h1>Kelola Produk</h1>
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

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Gambar</th>
                            <th>Nama</th>
                            <th>Kategori</th>
                            <th>Harga</th>
                            <th>Stok</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <img
                                        src={product.image ? `${API_URL}${product.image}` : 'https://via.placeholder.com/50'}
                                        alt={product.name}
                                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.category?.name || '-'}</td>
                                <td>{formatPrice(product.price)}</td>
                                <td>{product.stock}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => handleEdit(product)} className="btn btn-ghost btn-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-sm">
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
    );
}
