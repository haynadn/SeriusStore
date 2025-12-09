import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, search]);

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory) params.category_id = selectedCategory;
            if (search) params.search = search;
            const res = await productAPI.getAll(params);
            setProducts(res.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Produk Kami</h1>
                    <p className="page-subtitle">Temukan produk berkualitas dengan harga terbaik</p>
                </div>

                {/* Search Box */}
                <div className="search-box mb-lg">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="category-filter">
                        <button
                            className={`category-filter-btn ${!selectedCategory ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('')}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`category-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <Loading />
                ) : products.length > 0 ? (
                    <div className="grid grid-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3 className="empty-state-title">Tidak ada produk</h3>
                        <p className="empty-state-text">
                            {search || selectedCategory
                                ? 'Tidak ada produk yang sesuai dengan filter Anda.'
                                : 'Belum ada produk tersedia.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
