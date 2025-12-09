import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8080';

export default function ProductCard({ product }) {
    const imageUrl = product.image
        ? `${API_URL}${product.image}`
        : 'https://via.placeholder.com/300x300?text=No+Image';

    const getStockStatus = () => {
        if (product.stock === 0) return { text: 'Stok habis', class: 'out' };
        if (product.stock < 5) return { text: `Sisa ${product.stock}`, class: 'low' };
        return { text: `Stok: ${product.stock}`, class: '' };
    };

    const stockStatus = getStockStatus();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Link to={`/product/${product.id}`} className="card product-card">
            <div className="product-card-image">
                <img src={imageUrl} alt={product.name} />
            </div>
            <div className="product-card-content">
                {product.category && (
                    <div className="product-card-category">{product.category.name}</div>
                )}
                <h3 className="product-card-name">{product.name}</h3>
                <div className="product-card-price">{formatPrice(product.price)}</div>
                <div className={`product-card-stock ${stockStatus.class}`}>
                    {stockStatus.text}
                </div>
            </div>
        </Link>
    );
}
